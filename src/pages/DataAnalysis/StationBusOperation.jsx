import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, RefreshCw, Clock, Edit3 } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import InlineEditableCell from './InlineEditableCell'

// ==================== 基础站点数据 ====================
const baseStationData = [
  { code: 'YIM00100', name: '沙坪坝区陈家桥公交充电站' },
  { code: 'YIM00200', name: '北区光亮天润城公交充电站' },
  { code: 'YIM00300', name: '福佑路公交枢纽站' },
  { code: 'YIM00301', name: '福佑路公交充电站扩建项目（V2G）' },
  { code: 'YIM00302', name: '福佑路公交枢纽站二期' },
  { code: 'YIM00400', name: '碚都佳园首末站' },
  { code: 'YIM00500', name: '五里店公交站' },
  { code: 'YIM00600', name: '渝中区菜园坝公交充电站' },
  { code: 'YIM00700', name: '江北区观音桥公交充电站' },
  { code: 'YIM00800', name: '南岸区南坪公交充电站' },
]
// ==================== 生成某月模拟数据 ====================
const generateMonthData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return Math.floor(min + val * (max - min))
  }

  return baseStationData.map((station) => {
    // 手动录入字段（初始为空）
    const totalBusCount = null
    const plannedMoveCount = null

    // 场站资产总功率（模拟值）
    const totalPower = getRandom(500, 2000)
    // 最大充电产�?= 场站资产总功�?× 744h × 85%
    const maxChargingCapacity = Math.round(totalPower * 744 * 0.85)

    // 充电车台数（归属本站4518档案的公交车辆数量）
    const chargingBusCount = getRandom(30, 80)

    // 实际充电车台�?平台VIN)（当月在本站产生充电记录的车辆数�?
    const actualChargingBusCount = getRandom(20, chargingBusCount)

    // 总公交充电量(kWh)
    const totalBusCharging = getRandom(50000, 300000)

    // 单车日均充电�?= 总公交充电量 ÷ 实际充电车台�?÷ 31
    const dailyPerBusCharging = actualChargingBusCount > 0
      ? (totalBusCharging / actualChargingBusCount / 31).toFixed(2)
      : '0.00'

    return {
      ...station,
      month,
      totalBusCount,
      maxChargingCapacity,
      chargingBusCount,
      plannedMoveCount,
      actualChargingBusCount,
      totalBusCharging,
      dailyPerBusCharging,
    }
  })
}

// ==================== 列定�?====================
const columns = [
  { key: 'code', title: '站点编码', width: 'w-24' },
  { key: 'name', title: '站点', width: 'w-48' },
  { key: 'month', title: '月份', width: 'w-20' },
  { key: 'totalBusCount', title: '总车台数', width: 'w-20', editable: true },
  { key: 'maxChargingCapacity', title: '最大充电产能(kWh/月)', width: 'w-32' },
  { key: 'chargingBusCount', title: '充电车台数', width: 'w-20' },
  { key: 'plannedMoveCount', title: '计划挪车车台数', width: 'w-24', editable: true },
  { key: 'actualChargingBusCount', title: '实际充电车台数(平台VIN)', width: 'w-36' },
  { key: 'totalBusCharging', title: '总公交充电量(kWh)', width: 'w-28' },
  { key: 'dailyPerBusCharging', title: '单车日均充电量(kWh)', width: 'w-28' },
]
// ==================== 格式化函�?====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationBusOperation = () => {
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-bus-operation',
    groups: [{ title: '公交运营', columns }],
    fixedKeys: ['code', 'name', 'month'],
  })
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [editingStation, setEditingStation] = useState(null)
  const [manualForm, setManualForm] = useState({ totalBusCount: '', plannedMoveCount: '' })

  // 月度数据存储
  const [monthlyData, setMonthlyData] = useState(() => {
    const initial = {}
    initial['2026-05'] = generateMonthData('2026-05')
    initial['2026-06'] = generateMonthData('2026-06')
    initial['2026-07'] = generateMonthData('2026-07')
    return initial
  })

  // 月份列表
  const monthList = useMemo(() => Object.keys(monthlyData).sort(), [monthlyData])

  // 当前月份数据
  const currentData = useMemo(() => {
    return monthlyData[selectedMonth] || generateMonthData(selectedMonth)
  }, [selectedMonth, monthlyData])

  // 打开手动录入弹窗
  const openManualModal = (station) => {
    setEditingStation(station)
    setManualForm({
      totalBusCount: station.totalBusCount !== null ? station.totalBusCount : '',
      plannedMoveCount: station.plannedMoveCount !== null ? station.plannedMoveCount : '',
    })
    setManualModalOpen(true)
  }

  // 保存手动录入
  const handleManualSave = () => {
    if (!editingStation) return
    const totalBus = parseFloat(manualForm.totalBusCount)
    const plannedMove = parseFloat(manualForm.plannedMoveCount)

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(station => {
        if (station.code !== editingStation.code) return station
        return {
          ...station,
          totalBusCount: isNaN(totalBus) ? null : totalBus,
          plannedMoveCount: isNaN(plannedMove) ? null : plannedMove,
        }
      })
      return newData
    })

    setManualModalOpen(false)
    setEditingStation(null)
    alert('保存成功！')
  }

  // 导出
  const handleExport = (keys) => {
    alert(`导出成功（已选择${keys.length}个字段，前端原型模拟）`)
  }

  const saveCellValue = (rowCode, colKey, nextValue) => {
    setMonthlyData(prev => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].map(station => (
        station.code === rowCode
          ? { ...station, [colKey]: nextValue }
          : station
      ))
    }))
  }

  // 切换月份
  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    if (!monthlyData[month]) {
      setMonthlyData(prev => ({
        ...prev,
        [month]: generateMonthData(month)
      }))
    }
  }

  return (
    <div className="page-container h-full flex flex-col min-w-0 overflow-hidden">
      {/* ========== 顶部操作筛选栏（占主内容高�?2%�?========= */}
      <div
        className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between"
        style={{ height: '12%', minHeight: '80px' }}
      >
        <div className="flex items-center gap-6 flex-wrap">
          {/* 月份选择 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">统计月份</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white"
            >
              {monthList.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* 状态提�?*/}
          <div className="flex items-center gap-1 text-xs text-primary bg-blue-50 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>每月自动生成</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>自动统计字段实时更新</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => openManualModal(currentData[0])}
            className="bg-primary text-white px-4 py-2 rounded text-sm flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            <Edit3 className="w-4 h-4" />
            手动录入
          </button>
          <button
            onClick={() => { setImportMonth(''); setImportModalOpen(true) }}
            className="bg-primary text-white px-4 py-2 rounded text-sm flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Excel导入
          </button>
          <ReportFieldControls fields={reportFields} onExport={handleExport} />
        </div>
      </div>

      {/* ========== 页面标题�?========== */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">单站公交运营明细表</h2>
        </div>
        <span className="text-sm text-gray-500">统计月份：{selectedMonth}</span>
      </div>

      {/* ========== 主表格区域（占剩余主内容高度86%�?========= */}
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1"
        style={{ height: '86%' }}
      >
        <div className="overflow-x-auto overflow-y-auto flex-1 w-full">
          <table className="text-sm min-w-max">
            <thead className="sticky top-0 z-10">
              <tr>
                {reportFields.visibleColumns.map(col => (
                  <th
                    key={col.key}
                    className="px-2 py-2 border-b border-r border-gray-200 text-left text-sm font-medium text-gray-500 whitespace-nowrap min-w-[160px]"
                  >
                    <div className="group relative inline-flex items-center gap-1">
                      {col.title}
                      {col.tip && (
                        <div className="relative inline-block">
                          <AlertCircle className="w-3 h-3 text-gray-400 cursor-help" />
                          <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-normal w-40 leading-relaxed text-left shadow-lg max-w-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {col.tip}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((row) => (
                <tr key={row.code} className="hover:bg-gray-50 transition-colors">
                  {reportFields.visibleColumns.map(col => {
                    const value = row[col.key]
                    const isEditable = col.editable
                    const isNull = value === null || value === undefined
                    const isDailyCharging = col.key === 'dailyPerBusCharging'
                    const numValue = parseFloat(value)
                    const isHigh = isDailyCharging && !isNaN(numValue) && numValue > 150

                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          isEditable
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } ${isHigh ? 'text-orange-500 font-semibold' : ''}`}
                      >
                        {isEditable ? (
                          <InlineEditableCell
                            value={value}
                            displayValue={formatNumber(value, 0)}
                            placeholder="待填写"
                            inputType="number"
                            numeric
                            onSave={(nextValue) => saveCellValue(row.code, col.key, nextValue)}
                          />
                        ) : (
                          <span>{typeof value === 'number' ? formatNumber(value) : value}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== Excel导入弹窗 ========== */}
      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportFile(null) }} title="Excel批量导入">
        <div className="space-y-4">
          {/* 月份选择（强制） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              统计自然月<span className="text-red-500">*</span>
            </label>
            <select
              value={importMonth}
              onChange={(e) => setImportMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="">请选择月份</option>
              {monthList.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">上传文件</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">拖拽文件到此处，或点击上传</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="hidden"
                id="bus-op-import-file"
              />
              <label
                htmlFor="bus-op-import-file"
                className="bg-white text-primary border border-primary px-4 py-2 rounded text-sm cursor-pointer inline-block hover:opacity-90 transition-opacity"
              >
                选择文件
              </label>
              {importFile && (
                <p className="text-sm text-primary mt-2">已选择：{importFile.name}</p>
              )}
            </div>
          </div>

          {/* 导入说明 */}
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            <p className="text-sm text-gray-500 mb-2">拖拽文件到此处，或点击上传</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>文件格式：.xlsx, .xls, .csv</li>
              <li>必须包含列：站点编码、总车台数、计划挪车车台数</li>
              <li>站点编码用于匹配数据</li>
              <li>导入数据将绑定所选统计自然月存档</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* ========== 手动录入弹窗 ========== */}
      <Modal isOpen={manualModalOpen} onClose={() => { setManualModalOpen(false); setEditingStation(null) }} title={`手动录入 - ${editingStation?.name || ''}`}>
        <div className="space-y-4">
          {/* 只读字段展示 */}
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
            <p className="font-medium mb-1 text-gray-800">站点信息</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>站点编码：{editingStation?.code}</p>
              <p>统计月份：{editingStation?.month}</p>
            </div>
          </div>

          {/* 可编辑字�?*/}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                总车台数
              </label>
              <input
                type="number"
                value={manualForm.totalBusCount}
                onChange={(e) => setManualForm(prev => ({ ...prev, totalBusCount: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                计划挪车车台�?
              </label>
              <input
                type="number"
                value={manualForm.plannedMoveCount}
                onChange={(e) => setManualForm(prev => ({ ...prev, plannedMoveCount: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
            <p className="text-sm text-gray-500 mb-2">拖拽文件到此处，或点击上传</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setManualModalOpen(false); setEditingStation(null) }}
              className="bg-white text-primary border border-primary px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
            >
              取消
            </button>
            <button
              onClick={handleManualSave}
              className="bg-primary text-white px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StationBusOperation



















