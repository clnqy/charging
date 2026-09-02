import React, { useState, useMemo } from 'react'
import { Info, Car } from 'lucide-react'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import FieldTooltip from '../../components/FieldTooltip'
import MonthPicker from './MonthPicker'

// ==================== 模拟公交线路数据 ====================
const generateBusLineData = (startDate, endDate) => {
  // 计算时间段天数
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  
  // 使用时间戳作为种子，保证数据一致
  const seed = startDate.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                endDate.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return min + val * (max - min)
  }

  const busLines = [
    '101', '28', '345', '454', '858',
    '105', '11', '128', '151', '166',
    '235', '211', '226', '825', '326',
    '305', '831', '325', '339', '435',
  ]

  return busLines.map((line) => {
    // 车台数：该线路运营车辆数
    const vehicles = Math.round(getRandom(8, 30))
    
    // 运营里程(km) - 按天数比例调整
    const routeKm = Math.round(getRandom(30000, 120000) * (daysDiff / 30))
    
    // 平均里程(km/车日) = 运营里程 ÷ 线路总出勤车日
    const workDays = Math.round(daysDiff * getRandom(0.7, 1.0))
    const avgKm = routeKm / (vehicles * workDays)
    
    // 驿满充电车台数
    const chargedVehicles = Math.round(vehicles * getRandom(0.6, 0.95))
    
    // 驿满充电里程(km)
    const chargedKm = Math.round(routeKm * getRandom(0.7, 0.95))
    
    // 驿满充电平均里程(km/车日)
    const chargedWorkDays = Math.round(workDays * getRandom(0.8, 1.0))
    const chargedAvgKm = chargedKm / (chargedVehicles * chargedWorkDays)
    
    // 驿满充电电量(kWh)
    const chargedKwh = Math.round(chargedKm * getRandom(0.6, 1.2))
    
    // 平均能耗(kWh/km) = 驿满充电电量 ÷ 驿满充电里程
    const avgEnergy = chargedKm > 0 ? chargedKwh / chargedKm : 0

    return {
      line,
      vehicles,
      routeKm,
      avgKm,
      chargedVehicles,
      chargedKm,
      chargedAvgKm,
      chargedKwh,
      avgEnergy,
    }
  })
}

// ==================== 列定义====================
const columns = [
  { key: 'line', title: '线路', width: 'w-20', frozen: true, note: '公交线路名称。' },
  { key: 'vehicles', title: '车台数', width: 'w-16', note: '该线路统计时段内参与运营的车辆数量。', decimals: 0 },
  { key: 'routeKm', title: '运营里程(km)', width: 'w-28', note: '该线路在统计时段内的总运营里程。', decimals: 2 },
  { key: 'avgKm', title: '平均里程(km/车日)', width: 'w-28', note: '运营里程 ÷ 线路总出勤车日。', decimals: 2 },
  { key: 'chargedVehicles', title: '充电车台数', width: 'w-28', note: '统计时段内在驿满站点充电的车辆数量。', decimals: 0 },
  { key: 'chargedKm', title: '充电里程(km)', width: 'w-28', note: '使用充电服务后对应的车辆运营里程。', decimals: 2 },
  { key: 'chargedAvgKm', title: '充电平均里程(km/车日)', width: 'w-32', note: '充电里程 ÷ 充电车辆出勤车日。', decimals: 2 },
  { key: 'chargedKwh', title: '充电量(kWh)', width: 'w-28', note: '统计时段内该线路在驿满站点的总充电电量。', decimals: 2 },
  { key: 'avgEnergy', title: '平均能耗(kWh/km)', width: 'w-28', highlighted: true, note: '充电电量 ÷ 充电里程，用于判断线路能耗水平。', decimals: 4 },
]
// ==================== 表头悬浮说明 ====================
const columnTips = Object.fromEntries(columns.map((col) => [col.key, col.note || col.title]))

// ==================== 格式化函数====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

const formatCellValue = (value, column) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value !== 'number') return value
  return formatNumber(value, column.decimals ?? 2)
}

// ==================== 能耗预警颜色====================
const getEnergyColor = (avgEnergy) => {
  if (avgEnergy === null || avgEnergy === undefined || avgEnergy === 0) return ''
  if (avgEnergy > 0.9) return 'text-orange-600 font-semibold'
  if (avgEnergy < 0.5) return 'text-blue-600 font-semibold'
  return ''
}

// ==================== 数据异常检测====================
const isDataAbnormal = (row) => {
  return row.chargedKm === 0 && row.chargedKwh > 0
}

// ==================== 月份工具函数====================
const getCurrentMonth = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const getMonthStartDate = (monthValue) => `${monthValue}-01`

const getMonthEndDate = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

const formatMonthDisplay = (monthValue) => monthValue.replace('-', '年') + '月'

// ==================== 组件 ====================
const BusLineEnergy = () => {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth(today))
  const startDate = useMemo(() => getMonthStartDate(selectedMonth), [selectedMonth])
  const endDate = useMemo(() => getMonthEndDate(selectedMonth), [selectedMonth])
  const reportFields = useReportFields({
    storageKey: 'data-analysis:bus-line-energy',
    groups: [{ title: '能耗统计', columns }],
    fixedKeys: ['line'],
  })

  // 当前时段数据
  const currentData = useMemo(() => {
    return generateBusLineData(startDate, endDate)
  }, [startDate, endDate])

  const exportFileName = useMemo(() => {
    return `公交线路用能明细表_${startDate}_${endDate}.xlsx`
  }, [startDate, endDate])

  // 汇总行数据
  const summaryRow = useMemo(() => {
    return {
      line: '汇总',
      vehicles: currentData.reduce((sum, r) => sum + r.vehicles, 0),
      routeKm: currentData.reduce((sum, r) => sum + r.routeKm, 0),
      avgKm: 0,
      chargedVehicles: currentData.reduce((sum, r) => sum + r.chargedVehicles, 0),
      chargedKm: currentData.reduce((sum, r) => sum + r.chargedKm, 0),
      chargedAvgKm: 0,
      chargedKwh: currentData.reduce((sum, r) => sum + r.chargedKwh, 0),
      avgEnergy: 0,
    }
  }, [currentData])

  // 导出
  const handleExport = (keys) => {
    void keys
  }

  return (
    <div className="page-container h-full flex flex-col min-w-0 overflow-hidden">
      {/* ========== 顶部操作筛选栏（占主内容高度12%）========= */}
      <div
        className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between"
        style={{ height: '12%', minHeight: '80px' }}
      >
        <div className="flex items-center gap-6 flex-wrap">
          {/* 月份筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">统计月份</label>
            <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>

          {/* 只读提示 */}
          <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            <Info className="w-3 h-3" />
            <span>每月自动生成</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ReportFieldControls fields={reportFields} onExport={handleExport} exportFileName={exportFileName} />
        </div>
      </div>

      {/* ========== 页面标题========== */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">公交单线能耗表</h2>
        </div>
        <span className="text-sm text-gray-500">
          统计月份：{formatMonthDisplay(selectedMonth)}
        </span>
      </div>

      {/* ========== 主表格区域（占剩余主内容高度86%）========= */}
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1"
        style={{ height: '86%' }}
      >
        <div className="overflow-x-auto overflow-y-auto flex-1 w-full" style={{ overflow: 'visible auto', position: 'relative' }}>
          <table className="text-sm min-w-max">
            <thead className="sticky top-0 z-10" style={{ zIndex: 20, backgroundColor: '#fff' }}>
              {/* 单层表头 */}
              <tr>
                {reportFields.visibleColumns.map(col => (
                  <th
                    key={col.key}
                    className={`px-2 py-2 border-b border-r border-gray-300 text-left text-sm font-medium text-gray-700 whitespace-nowrap ${
                      col.frozen ? 'bg-blue-50 sticky left-0 z-20' : col.highlighted ? 'bg-yellow-50' : 'bg-gray-50'
                    } align-middle`}
                    style={{ textAlign: 'center',minWidth: col.frozen ? '100px' : undefined, zIndex: col.frozen ? 20 : 10 }}
                  >
                    <FieldTooltip content={columnTips[col.key]}>
                      {col.title}
                      <Info className="w-3 h-3 text-gray-400 cursor-help hover:text-gray-600" />
                    </FieldTooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* 明细行*/}
              {currentData.map((row, index) => {
                const abnormal = isDataAbnormal(row)
                
                return (
                  <tr 
                    key={index} 
                    className={`transition-colors ${
                      abnormal ? 'bg-red-50 hover:bg-red-100' : 
                      'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {reportFields.visibleColumns.map(col => {
                      const value = row[col.key]
                      
                      // 平均能耗列特殊样式
                      let cellStyle = ''
                      if (col.key === 'avgEnergy') {
                        const energyColor = getEnergyColor(value)
                        cellStyle = energyColor || 'bg-yellow-50'
                      }
                      
                      return (
                        <td
                          key={col.key}
                          className={`px-2 py-2 border-r border-gray-200 text-sm whitespace-nowrap align-middle ${cellStyle}`}
                        >
                          {formatCellValue(value, col)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              
              {/* 汇总行 */}
              <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                {reportFields.visibleColumns.map(col => {
                  const value = summaryRow[col.key]
                  
                  // 汇总行平均能耗列
                  let cellStyle = ''
                  if (col.key === 'avgEnergy') {
                    cellStyle = 'bg-yellow-100'
                  } else if (['vehicles', 'routeKm', 'chargedVehicles', 'chargedKm', 'chargedKwh'].includes(col.key)) {
                    cellStyle = 'text-blue-600'
                  }
                  
                  return (
                    <td
                      key={col.key}
                      className={`px-2 py-2 border-r border-gray-300 text-sm whitespace-nowrap align-middle ${cellStyle}`}
                    >
                      {formatCellValue(value, col)}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BusLineEnergy















