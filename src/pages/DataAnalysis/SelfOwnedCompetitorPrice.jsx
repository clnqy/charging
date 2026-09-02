import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Clock, FileSpreadsheet, RefreshCw } from 'lucide-react'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import InlineEditableCell from './InlineEditableCell'
import FieldTooltip from '../../components/FieldTooltip'
import MonthPicker from './MonthPicker'
import { useStationBaseData } from '../../data/stationBaseData'

const DEFAULT_MONTH = '2026-05'
const MONTHLY_DATA_KEY = 'data-analysis:self-owned-competitor-price:data'
const PERIODS = [
  { key: 'sharp', title: '尖' },
  { key: 'peak', title: '峰' },
  { key: 'flat', title: '平' },
  { key: 'valley', title: '谷' },
]

const priceColumns = (period) => [
  {
    key: `${period.key}OurPrice`,
    title: '我方价格',
    width: 'w-24',
    type: 'price',
    source: 'auto',
    note: '系统自动填充，不支持手动修改。',
  },
  {
    key: `${period.key}CompetitorPrice`,
    title: '竞品价格',
    width: 'w-24',
    type: 'price',
    editable: true,
    source: 'manual',
  },
  {
    key: `${period.key}Difference`,
    title: '价差',
    width: 'w-24',
    type: 'difference',
    source: 'computed',
    note: '价差 = 我方价格 - 竞品价格。',
  },
]

const columnGroups = [
  {
    key: 'stationInfo',
    title: '站点信息',
    columns: [
      { key: 'code', title: '站点编码', width: 'w-28', type: 'text', source: 'base' },
      { key: 'name', title: '站点', width: 'w-40', type: 'text', source: 'base' },
    ],
  },
  ...PERIODS.map((period) => ({
    key: period.key,
    title: period.title,
    columns: priceColumns(period),
  })),
  {
    key: 'sample',
    title: '样本',
    columns: [
      {
        key: 'sampleCount',
        title: '样本数量',
        width: 'w-20',
        type: 'count',
        editable: true,
        source: 'manual',
      },
    ],
  },
]

const periodColumnKeys = new Set(
  PERIODS.flatMap((period) => priceColumns(period).map((column) => column.key)),
)

const getColumnWidth = (column) => {
  const match = typeof column?.width === 'string' ? column.width.match(/^w-(\d+)$/) : null
  return match ? `${Number(match[1]) / 4}rem` : undefined
}

const getColumnStyle = (column, left) => {
  const width = getColumnWidth(column)
  return {
    ...(width ? { width, minWidth: width } : {}),
    ...(left !== undefined ? { left } : {}),
  }
}

const getSeed = (value) => String(value).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

// Adapter boundary for the future pricing API. Current prototype values are deterministic by month.
export const getOurPriceByPeriod = (month, station) => {
  const monthSeed = getSeed(month)
  const stationSeed = getSeed(station.code)
  const monthAdjustment = month === DEFAULT_MONTH ? 0 : ((monthSeed + stationSeed) % 5 - 2) * 0.0025
  const basePrices = {
    sharp: 1.31,
    peak: 1.31,
    flat: 0.91,
    valley: 0.55,
  }

  return Object.fromEntries(
    PERIODS.map((period) => [
      `${period.key}OurPrice`,
      Number(Math.max(0, basePrices[period.key] + monthAdjustment).toFixed(4)),
    ]),
  )
}

const getDemoCompetitorPrice = (month, station, period, index) => {
  const seed = getSeed(`${month}-${station.code}-${period.key}`)
  const offsets = {
    sharp: [0.045, 0.060, 0.0625, 0.090, 0.0333],
    peak: [0.045, 0.060, 0.0625, 0.090, 0.0333],
    flat: [0.0875, 0.0675, 0.0800, 0.1100, 0.1667],
    valley: [0.0500, 0.0425, 0.0900, 0.0550, 0.2933],
  }
  const direction = (seed + index) % 7 === 0 ? -1 : 1
  const offset = offsets[period.key][(seed + index) % offsets[period.key].length]
  const basePrice = getOurPriceByPeriod(month, station)[`${period.key}OurPrice`]

  return Number(Math.max(0, basePrice + direction * offset).toFixed(4))
}

const getDemoSampleCount = (month, station, index) => (
  1 + ((getSeed(`${month}-${station.code}`) + index) % 5)
)

const calculateDifference = (ourPrice, competitorPrice) => {
  if (ourPrice === null || ourPrice === undefined || competitorPrice === null || competitorPrice === undefined) {
    return null
  }
  return Number((ourPrice - competitorPrice).toFixed(4))
}

const withDifferences = (row) => {
  const nextRow = { ...row }
  PERIODS.forEach((period) => {
    nextRow[`${period.key}Difference`] = calculateDifference(
      nextRow[`${period.key}OurPrice`],
      nextRow[`${period.key}CompetitorPrice`],
    )
  })
  return nextRow
}

const createMonthData = (month, stations, previousRows = []) => {
  const previousByCode = new Map(previousRows.map((row) => [row.code, row]))

  return stations.map((station, index) => {
    const previous = previousByCode.get(station.code)
    const autoPrices = getOurPriceByPeriod(month, station)
    const row = {
      ...station,
      ...autoPrices,
      ...Object.fromEntries(
        PERIODS.map((period) => [
          `${period.key}CompetitorPrice`,
          previous?.[`${period.key}CompetitorPrice`] ?? getDemoCompetitorPrice(month, station, period, index),
        ]),
      ),
      sampleCount: previous?.sampleCount ?? getDemoSampleCount(month, station, index),
    }
    return withDifferences(row)
  })
}

const readMonthlyData = () => {
  try {
    const saved = window.localStorage.getItem(MONTHLY_DATA_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
    }
  } catch {
    // Use the in-memory prototype data when storage is unavailable or invalid.
  }
  return null
}

const persistMonthlyData = (monthlyData) => {
  try {
    window.localStorage.setItem(MONTHLY_DATA_KEY, JSON.stringify(monthlyData))
  } catch {
    // Keep edits in memory when browser storage is unavailable.
  }
}

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return Number(value).toFixed(4)
}

const formatDifference = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const numericValue = Number(value)
  return `${numericValue > 0 ? '+' : ''}${numericValue.toFixed(4)}`
}

const formatCount = (value) => (
  value === null || value === undefined || value === '' ? '-' : String(value)
)

const SelfOwnedCompetitorPrice = () => {
  const [stationData] = useStationBaseData()
  const selfOwnedStations = useMemo(
    () => stationData
      .filter((station) => station.coopMode === '自营站')
      .map(({ code, name }) => ({ code, name })),
    [stationData],
  )
  const [selectedMonth, setSelectedMonth] = useState(DEFAULT_MONTH)
  const [monthlyData, setMonthlyData] = useState(() => {
    const saved = readMonthlyData()
    return saved || { [DEFAULT_MONTH]: [] }
  })

  const reportFields = useReportFields({
    storageKey: 'data-analysis:self-owned-competitor-price',
    groups: columnGroups,
    fixedKeys: ['code', 'name'],
  })

  const currentData = useMemo(
    () => monthlyData[selectedMonth] || createMonthData(selectedMonth, selfOwnedStations),
    [monthlyData, selectedMonth, selfOwnedStations],
  )

  const visibleGroups = useMemo(() => {
    const visibleSet = new Set(reportFields.visibleKeys)
    return reportFields.groups
      .map((group) => ({
        ...group,
        columns: group.columns.filter((column) => visibleSet.has(column.key)),
      }))
      .filter((group) => group.columns.length > 0)
  }, [reportFields.groups, reportFields.visibleKeys])

  const fixedColumns = reportFields.visibleColumns.filter((column) => ['code', 'name'].includes(column.key))
  const trailingColumns = reportFields.visibleColumns.filter(
    (column) => !periodColumnKeys.has(column.key) && !['code', 'name'].includes(column.key),
  )
  const codeColumnWidth = getColumnWidth(fixedColumns.find((column) => column.key === 'code')) || '7rem'
  const visiblePeriodGroups = visibleGroups.filter((group) => periodColumnKeys.has(group.columns[0]?.key))
  const visiblePeriodColumns = visiblePeriodGroups.flatMap((group) => group.columns)

  useEffect(() => {
    setMonthlyData((previous) => {
      const next = { ...previous }
      let changed = false

      Object.entries(previous).forEach(([month, rows]) => {
        const nextRows = createMonthData(month, selfOwnedStations, rows)
        next[month] = nextRows
        if (JSON.stringify(nextRows) !== JSON.stringify(rows)) changed = true
      })

      if (!next[DEFAULT_MONTH]) {
        next[DEFAULT_MONTH] = createMonthData(DEFAULT_MONTH, selfOwnedStations)
        changed = true
      }

      if (changed) persistMonthlyData(next)
      return changed ? next : previous
    })
  }, [selfOwnedStations])

  const updateMonthlyData = (updater) => {
    setMonthlyData((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater
      persistMonthlyData(next)
      return next
    })
  }

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    if (!monthlyData[month]) {
      updateMonthlyData((previous) => ({
        ...previous,
        [month]: createMonthData(month, selfOwnedStations),
      }))
    }
  }

  const saveManualCell = (rowCode, columnKey, nextValue) => {
    const isSampleCount = columnKey === 'sampleCount'
    const numericValue = nextValue === null || nextValue === '' ? null : Number(nextValue)

    if (numericValue !== null && (!Number.isFinite(numericValue) || numericValue < 0)) {
      alert(isSampleCount ? '样本数量请输入非负整数' : '竞品价格请输入非负数字')
      return
    }
    if (isSampleCount && numericValue !== null && !Number.isInteger(numericValue)) {
      alert('样本数量请输入非负整数')
      return
    }

    updateMonthlyData((previous) => {
      const rows = previous[selectedMonth] || createMonthData(selectedMonth, selfOwnedStations)
      const nextRows = rows.map((row) => {
        if (row.code !== rowCode) return row
        return withDifferences({ ...row, [columnKey]: numericValue })
      })
      return { ...previous, [selectedMonth]: nextRows }
    })
  }

  const renderCell = (row, column) => {
    const value = row[column.key]
    const isEditable = column.editable
    const isDifference = column.type === 'difference'
    const isPositive = isDifference && Number(value) > 0
    const isNegative = isDifference && Number(value) < 0

    if (isEditable) {
      return (
        <InlineEditableCell
          value={value}
          displayValue={column.type === 'count' ? formatCount(value) : formatPrice(value)}
          placeholder="待填写"
          inputType="number"
          numeric
          step={column.type === 'count' ? 1 : 0.0001}
          min={0}
          onSave={(nextValue) => saveManualCell(row.code, column.key, nextValue)}
          inputClassName="text-right"
        />
      )
    }

    return (
      <span className={`font-medium ${
        isPositive ? 'text-red-600' : isNegative ? 'text-green-600' : 'text-gray-800'
      }`}>
        {isDifference ? formatDifference(value) : formatPrice(value)}
      </span>
    )
  }

  return (
    <div className="page-container h-full flex flex-col min-w-0 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">统计月份</label>
            <MonthPicker value={selectedMonth} onChange={handleMonthChange} />
          </div>
          <div className="flex items-center gap-1 text-xs text-primary bg-blue-50 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>每月自动生成</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3 h-3" />
            <span>我方价格自动填充</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ReportFieldControls
            fields={reportFields}
            onExport={(keys) => void keys}
            exportFileName={`自营竞品价格表_${selectedMonth}.xlsx`}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">自营竞品价格表</h2>
        </div>
        <span className="text-sm text-gray-500">当前统计月份：{selectedMonth}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1">
          <table className="text-sm border-collapse min-w-max">
            <thead className="sticky top-0 z-20">
              <tr className="bg-blue-100">
                {fixedColumns.map((column) => (
                  <th
                    key={column.key}
                    rowSpan={3}
                    className={`px-3 py-2 border border-blue-200 text-center text-sm font-semibold text-blue-900 whitespace-nowrap ${
                      column.key === 'code' ? 'sticky left-0 z-30 bg-blue-100' : column.key === 'name' ? 'sticky z-30 bg-blue-100' : ''
                    }`}
                    style={getColumnStyle(column, column.key === 'name' ? codeColumnWidth : undefined)}
                  >
                    <FieldTooltip content={column.note}>
                      {column.title}
                    </FieldTooltip>
                  </th>
                ))}
                {visiblePeriodColumns.length > 0 && (
                  <th
                    colSpan={visiblePeriodColumns.length}
                    className="px-3 py-2 border border-blue-200 text-center text-base font-bold text-blue-900 bg-blue-100"
                  >
                    {selectedMonth}（当月）
                  </th>
                )}
                {trailingColumns.map((column) => (
                  <th
                    key={column.key}
                    rowSpan={3}
                    className="px-3 py-2 border border-blue-200 text-center text-sm font-semibold text-blue-900 whitespace-nowrap"
                    style={getColumnStyle(column)}
                  >
                    <FieldTooltip content={column.note}>
                      {column.title}
                    </FieldTooltip>
                  </th>
                ))}
              </tr>
              <tr className="bg-blue-50">
                {visiblePeriodGroups.map((group) => (
                  <th
                    key={group.key}
                    colSpan={group.columns.length}
                    className="px-3 py-2 border border-blue-200 text-center text-sm font-semibold text-blue-900"
                  >
                    {group.title}
                  </th>
                ))}
              </tr>
              <tr className="bg-blue-50">
                {visiblePeriodColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-2 border border-blue-200 text-center text-sm font-medium text-blue-900 whitespace-nowrap"
                    style={getColumnStyle(column)}
                  >
                    <FieldTooltip content={column.note}>
                      {column.title}
                      {column.note && <AlertCircle className="inline-block ml-1 w-3 h-3 text-gray-400" />}
                    </FieldTooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((row) => (
                <tr key={row.code} className="hover:bg-gray-50">
                  {reportFields.visibleColumns.map((column) => {
                    const isAuto = column.source === 'auto'
                    const isDifference = column.type === 'difference'
                    const cellClass = isAuto
                      ? 'bg-blue-50/80'
                      : isDifference
                        ? 'bg-gray-50'
                        : column.editable
                          ? 'bg-white'
                          : 'bg-white'

                    return (
                      <td
                        key={column.key}
                        className={`px-3 py-2 border border-gray-200 text-right whitespace-nowrap ${cellClass} ${
                          column.key === 'code' ? 'sticky left-0 z-10 text-left font-medium bg-white' : ''
                        } ${
                          column.key === 'name' ? 'sticky z-10 text-left bg-white' : ''
                        }`}
                        style={getColumnStyle(column, column.key === 'name' ? codeColumnWidth : undefined)}
                      >
                        {column.type === 'text' ? (
                          <span className="text-gray-800">{row[column.key]}</span>
                        ) : (
                          renderCell(row, column)
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={reportFields.visibleColumns.length} className="px-3 py-10 text-center text-gray-500">
                    暂无自营站点数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 flex-shrink-0">
        <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 leading-relaxed">
          站点编码、站点来自站点基础表；我方价格由系统自动填充；竞品价格和样本数量支持表格内直接录入，价差自动计算。
        </div>
      </div>
    </div>
  )
}

export default SelfOwnedCompetitorPrice
