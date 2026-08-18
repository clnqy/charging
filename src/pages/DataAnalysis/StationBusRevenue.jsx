import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, RefreshCw, Clock, Edit3 } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import InlineEditableCell from './InlineEditableCell'
import FieldTooltip from '../../components/FieldTooltip'

// ==================== 基础站点数据 ====================
const baseStationData = [
  { code: 'YIM00100', name: '沙坪坝区陈家桥公交充电站', pattern: '自营', manager: '重庆公交集团' },
  { code: 'YIM00200', name: '北区光亮天润城公交充电站', pattern: '自营', manager: '重庆公交集团' },
  { code: 'YIM00300', name: '福佑路公交枢纽站', pattern: '合建', manager: '两江公交公司' },
  { code: 'YIM00301', name: '福佑路公交充电站扩建项目（V2G）', pattern: '自营', manager: '重庆公交集团' },
  { code: 'YIM00302', name: '福佑路公交枢纽站二期', pattern: '统协', manager: '南岸公交公司' },
  { code: 'YIM00400', name: '碚都佳园首末站', pattern: '自营', manager: '北碚公交公司' },
  { code: 'YIM00500', name: '五里店公交站', pattern: '合建', manager: '重庆公交集团' },
  { code: 'YIM00600', name: '渝中区菜园坝公交充电站', pattern: '自营', manager: '渝中公交公司' },
  { code: 'YIM00700', name: '江北区观音桥公交充电站', pattern: '统协', manager: '江北公交公司' },
  { code: 'YIM00800', name: '南岸区南坪公交充电站', pattern: '自营', manager: '南岸公交公司' },
]
// ==================== 生成某月模拟数据 ====================
const generateMonthData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return min + val * (max - min)
  }

  return baseStationData.map((station) => {
    // 手动录入字段
    const pattern = station.pattern
    const manager = station.manager
    const commissionTime = '2024-01'
    const researchIncome = Math.round(getRandom(500000, 2000000))
    const targetIncome = Math.round(researchIncome * getRandom(0.9, 1.1))
    const struggleIncome = Math.round(targetIncome * getRandom(1.03, 1.05))
    const busChargingIncome = Math.round(getRandom(300000, 1500000))
    const partnerShareIncome = Math.round(getRandom(50000, 300000))
    const agentServiceIncome = Math.round(getRandom(30000, 200000))

    // 系统自动计算字段
    const gunCount = Math.floor(getRandom(8, 32))
    const cycle = '月'
    const busSubtotal = busChargingIncome + partnerShareIncome + agentServiceIncome

    // 历史数据
    const lastMonthIncome = Math.round(busSubtotal * getRandom(0.85, 0.95))
    const samePeriodLastYear = Math.round(busSubtotal * getRandom(0.75, 0.90))
    
    // 累计数（当年1月至当前月份累加）
    const monthNum = parseInt(month.split('-')[1])
    const cumulative = Math.round(busSubtotal * monthNum * getRandom(0.95, 1.05))
    const lastYearCumulative = Math.round(samePeriodLastYear * monthNum * getRandom(0.90, 1.0))

    return {
      ...station,
      month,
      pattern,
      manager,
      gunCount,
      commissionTime,
      cycle,
      researchIncome,
      targetIncome,
      struggleIncome,
      busChargingIncome,
      partnerShareIncome,
      agentServiceIncome,
      busSubtotal,
      lastMonthIncome,
      samePeriodLastYear,
      cumulative,
      lastYearCumulative,
    }
  })
}

// ==================== 列定义（含分组、口径说明）====================
const columns = [
  { key: 'code', title: '站点编码', width: 'w-24' },
  { key: 'name', title: '站点', width: 'w-48' },
  { key: 'pattern', title: '运营模式', width: 'w-20', editable: true },
  { key: 'manager', title: '现场管理单位', width: 'w-24', editable: true },
  { key: 'gunCount', title: '枪数量', width: 'w-16' },
  { key: 'commissionTime', title: '投运时间', width: 'w-20', editable: true },
  { key: 'cycle', title: '周期', width: 'w-16' },
  { key: 'researchIncome', title: '可研收入(公交)', width: 'w-24', editable: true },
  { key: 'targetIncome', title: '目标收入', width: 'w-20', editable: true },
  { key: 'struggleIncome', title: '奋斗收入', width: 'w-20', editable: true },
  { key: 'busChargingIncome', title: '公交充电收入', width: 'w-24', editable: true },
  { key: 'partnerShareIncome', title: '合作站充电分成收入', width: 'w-28', editable: true },
  { key: 'agentServiceIncome', title: '代管站公交服务平台服务费收入', width: 'w-36', editable: true },
  { key: 'busSubtotal', title: '公交小计', width: 'w-20' },
  { key: 'lastMonthIncome', title: '上月收入', width: 'w-16' },
  { key: 'samePeriodLastYear', title: '去年同期收入', width: 'w-20' },
  { key: 'cumulative', title: '累计收入', width: 'w-16' },
  { key: 'lastYearCumulative', title: '去年累计收入', width: 'w-20' },
]
// ==================== 格式化函数====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

const numericEditableFields = new Set([
  'researchIncome',
  'targetIncome',
  'struggleIncome',
  'busChargingIncome',
  'partnerShareIncome',
  'agentServiceIncome',
])

// ==================== 组件 ====================
const StationBusRevenue = () => {
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-bus-revenue',
    groups: [{ title: '公交收入', columns }],
    fixedKeys: ['code', 'name'],
  })
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [editingStation, setEditingStation] = useState(null)
  
  // 手动录入表单（仅包含可编辑字段）
  const [manualForm, setManualForm] = useState({
    pattern: '',
    manager: '',
    commissionTime: '',
    researchIncome: '',
    targetIncome: '',
    struggleIncome: '',
    busChargingIncome: '',
    partnerShareIncome: '',
    agentServiceIncome: '',
  })

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
      pattern: station.pattern || '',
      manager: station.manager || '',
      commissionTime: station.commissionTime || '',
      researchIncome: station.researchIncome !== null ? station.researchIncome : '',
      targetIncome: station.targetIncome !== null ? station.targetIncome : '',
      struggleIncome: station.struggleIncome !== null ? station.struggleIncome : '',
      busChargingIncome: station.busChargingIncome !== null ? station.busChargingIncome : '',
      partnerShareIncome: station.partnerShareIncome !== null ? station.partnerShareIncome : '',
      agentServiceIncome: station.agentServiceIncome !== null ? station.agentServiceIncome : '',
    })
    setManualModalOpen(true)
  }

  // 保存手动录入
  const handleManualSave = () => {
    if (!editingStation) return
    
    const researchIncome = parseFloat(manualForm.researchIncome)
    const targetIncome = parseFloat(manualForm.targetIncome)
    const struggleIncome = parseFloat(manualForm.struggleIncome)
    const busChargingIncome = parseFloat(manualForm.busChargingIncome)
    const partnerShareIncome = parseFloat(manualForm.partnerShareIncome)
    const agentServiceIncome = parseFloat(manualForm.agentServiceIncome)

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(station => {
        if (station.code !== editingStation.code) return station
        
        const updated = {
          ...station,
          pattern: manualForm.pattern || station.pattern,
          manager: manualForm.manager || station.manager,
          commissionTime: manualForm.commissionTime || station.commissionTime,
          researchIncome: isNaN(researchIncome) ? null : researchIncome,
          targetIncome: isNaN(targetIncome) ? null : targetIncome,
          struggleIncome: isNaN(struggleIncome) ? null : struggleIncome,
          busChargingIncome: isNaN(busChargingIncome) ? null : busChargingIncome,
          partnerShareIncome: isNaN(partnerShareIncome) ? null : partnerShareIncome,
          agentServiceIncome: isNaN(agentServiceIncome) ? null : agentServiceIncome,
        }
        
        // 自动计算公交小计
        updated.busSubtotal = (updated.busChargingIncome || 0) + 
                             (updated.partnerShareIncome || 0) + 
                             (updated.agentServiceIncome || 0)
        
        return updated
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
      [selectedMonth]: prev[selectedMonth].map(station => {
        if (station.code !== rowCode) return station
        const updated = { ...station, [colKey]: nextValue }
        updated.busSubtotal = (updated.busChargingIncome || 0) +
          (updated.partnerShareIncome || 0) +
          (updated.agentServiceIncome || 0)
        return updated
      })
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
      {/* ========== 顶部操作筛选栏（占主内容高度12%）========= */}
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

          {/* 状态提示*/}
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

      {/* ========== 页面标题========== */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">站点公交收入明细表</h2>
        </div>
        <span className="text-sm text-gray-500">统计月份：{selectedMonth}</span>
      </div>

      {/* ========== 主表格区域（占剩余主内容高度86%）========= */}
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
                    <FieldTooltip content={col.tip}>
                      {col.title}
                      {col.tip && (
                        <AlertCircle className="w-3 h-3 text-gray-400 cursor-help" />
                      )}
                    </FieldTooltip>
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
                    const numValue = parseFloat(value)
                    
                    // 高亮规则：奋斗收入 > 目标收入标橙色
                    const isHighLight = col.key === 'struggleIncome' && !isNaN(numValue) && 
                                       parseFloat(row.targetIncome) > 0 && numValue > row.targetIncome
                    
                    // 高亮规则：公交小计同比下降标红色预警
                    const isWarnRed = col.key === 'busSubtotal' && 
                                     parseFloat(row.samePeriodLastYear) > 0 && 
                                     !isNaN(numValue) && numValue < row.samePeriodLastYear

                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          isEditable
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } ${isHighLight ? 'text-orange-500 font-semibold' : ''} ${
                          isWarnRed ? 'text-red-600 font-semibold' : ''
                        }`}
                      >
                        {isEditable ? (
                          <InlineEditableCell
                            value={value}
                            displayValue={numericEditableFields.has(col.key) ? formatNumber(value) : value}
                            placeholder="待填写"
                            inputType={numericEditableFields.has(col.key) ? 'number' : 'text'}
                            numeric={numericEditableFields.has(col.key)}
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
                id="bus-revenue-import-file"
              />
              <label
                htmlFor="bus-revenue-import-file"
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
              <li>必须包含列：站点编码、可研收入(公交)、目标收入、奋斗收入、公交充电收入等</li>
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
            <p className="font-medium mb-1 text-gray-800">站点信息（只读）</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <p>站点编码：{editingStation?.code}</p>
              <p>站点：{editingStation?.name}</p>
              <p>统计月份：{editingStation?.month}</p>
              <p>枪数量：{editingStation?.gunCount}</p>
              <p>周期：{editingStation?.cycle}</p>
              <p>公交小计①：{editingStation ? formatNumber(editingStation.busSubtotal) : '-'}</p>
            </div>
          </div>

          {/* 可编辑字段*/}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                运营模式
              </label>
              <input
                type="text"
                value={manualForm.pattern}
                onChange={(e) => setManualForm(prev => ({ ...prev, pattern: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                现场管理单位
              </label>
              <input
                type="text"
                value={manualForm.manager}
                onChange={(e) => setManualForm(prev => ({ ...prev, manager: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投运时间
              </label>
              <input
                type="month"
                value={manualForm.commissionTime}
                onChange={(e) => setManualForm(prev => ({ ...prev, commissionTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  可研收入(公交)
                </label>
                <input
                  type="number"
                  value={manualForm.researchIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, researchIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标收入
                </label>
                <input
                  type="number"
                  value={manualForm.targetIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, targetIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  奋斗收入
                </label>
                <input
                  type="number"
                  value={manualForm.struggleIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, struggleIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公交充电收入
                </label>
                <input
                  type="number"
                  value={manualForm.busChargingIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, busChargingIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  合作站充电分成收入
                </label>
                <input
                  type="number"
                  value={manualForm.partnerShareIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, partnerShareIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  外协站公交充电平台服务费收入
                </label>
                <input
                  type="number"
                  value={manualForm.agentServiceIncome}
                  onChange={(e) => setManualForm(prev => ({ ...prev, agentServiceIncome: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 提示 */}
          <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
            <p className="text-sm text-gray-500 mb-2">拖拽文件到此处，或点击上传</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StationBusRevenue




















