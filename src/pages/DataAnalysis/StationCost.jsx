import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, RefreshCw, Clock, Edit3 } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'

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
    return min + val * (max - min)
  }

  return baseStationData.map((station) => {
    // 手动录入字段
    const totalPowerConsumption = Math.round(getRandom(500000, 2000000))
    const electricityBill = Math.round(totalPowerConsumption * getRandom(0.6, 0.9))
    const powerFactor = (getRandom(0.85, 0.95)).toFixed(2)
    const reactivePowerFee = Math.round(getRandom(-5000, 5000))
    const totalCharging = Math.round(totalPowerConsumption * getRandom(0.88, 0.95))
    
    // 自动计算字段
    const electricityLoss = ((totalPowerConsumption - totalCharging) / totalPowerConsumption * 100).toFixed(1)
    
    // 电费分摊
    const busElectricityCost = Math.round(electricityBill * getRandom(0.5, 0.7))
    const socialElectricityCost = electricityBill - busElectricityCost
    
    // 其他成本科目
    const busServiceFee = Math.round(getRandom(20000, 80000))
    const socialServiceFee = Math.round(getRandom(10000, 50000))
    const siteRent = Math.round(getRandom(30000, 100000))
    const marketingCost = Math.round(getRandom(5000, 30000))
    const signCost = Math.round(getRandom(2000, 15000))
    const interestExpense = Math.round(getRandom(3000, 20000))
    const depreciation = Math.round(getRandom(20000, 80000))
    const laborCost = Math.round(getRandom(8000, 30000))
    const engineeringRepair = Math.round(getRandom(5000, 40000))
    const operationCost = Math.round(getRandom(10000, 50000))
    const equipmentInsurance = Math.round(getRandom(3000, 20000))
    const safetyFacility = Math.round(getRandom(5000, 25000))
    const platformMaintenance = Math.round(getRandom(8000, 35000))
    const networkFee = Math.round(getRandom(2000, 10000))
    const itEquipmentRepair = Math.round(getRandom(3000, 15000))

    // 总成�?= 所有成本科目合�?
    const totalCost = electricityBill + 
                     busServiceFee + 
                     socialServiceFee + 
                     siteRent + 
                     marketingCost + 
                     signCost + 
                     interestExpense + 
                     depreciation + 
                     laborCost + 
                     engineeringRepair + 
                     operationCost + 
                     equipmentInsurance + 
                     safetyFacility + 
                     platformMaintenance + 
                     networkFee + 
                     itEquipmentRepair +
                     (reactivePowerFee > 0 ? reactivePowerFee : 0)

    return {
      ...station,
      month,
      totalCost,
      totalPowerConsumption,
      electricityBill,
      powerFactor,
      reactivePowerFee,
      totalCharging,
      electricityLoss: `${electricityLoss}%`,
      busElectricityCost,
      socialElectricityCost,
      busServiceFee,
      socialServiceFee,
      siteRent,
      marketingCost,
      signCost,
      interestExpense,
      depreciation,
      laborCost,
      engineeringRepair,
      operationCost,
      equipmentInsurance,
      safetyFacility,
      platformMaintenance,
      networkFee,
      itEquipmentRepair,
    }
  })
}

// ==================== 列定义（含口径说明）====================
// 标记是否可内联编�?
const columns = [
  { key: 'code', title: '站点编码', width: 'w-24' },
  { key: 'name', title: '站点', width: 'w-40' },
  { key: 'month', title: '月份', width: 'w-20' },
  { key: 'totalCost', title: '总成本(元)', width: 'w-24' },
  { key: 'totalPowerConsumption', title: '供电电量(kWh)', width: 'w-28', inlineEdit: true },
  { key: 'electricityBill', title: '缴纳电费(元)', width: 'w-28', inlineEdit: true },
  { key: 'powerFactor', title: '功率因数', width: 'w-16', inlineEdit: true },
  { key: 'reactivePowerFee', title: '力调电费(元)', width: 'w-20', inlineEdit: true },
  { key: 'totalCharging', title: '总充电量(kWh)', width: 'w-28', inlineEdit: true },
  { key: 'electricityLoss', title: '电损比', width: 'w-16' },
  { key: 'busElectricityCost', title: '其中:公交电费成本(元)', width: 'w-32' },
  { key: 'socialElectricityCost', title: '其中:社会电费成本(元)', width: 'w-32' },
  { key: 'siteRentUnit', title: '站点租赁单位电费成本(元)', width: 'w-24', inlineEdit: true },
  { key: 'partnerUnit', title: '支付合作单位分成成本(元)', width: 'w-24', inlineEdit: true },
  { key: 'busServiceFee', title: '公交充电现场服务费(元)', width: 'w-32', inlineEdit: true },
  { key: 'socialServiceFee', title: '社会充电现场服务费(元)', width: 'w-32', inlineEdit: true },
  { key: 'siteRent', title: '场地租金(元)', width: 'w-20', inlineEdit: true },
  { key: 'marketingCost', title: '营销成本(元)', width: 'w-20', inlineEdit: true },
  { key: 'signCost', title: '标识标牌成本(元)', width: 'w-24', inlineEdit: true },
  { key: 'interestExpense', title: '财务费用-利息(元)', width: 'w-24', inlineEdit: true },
  { key: 'depreciation', title: '折旧(元)', width: 'w-16', inlineEdit: true },
  { key: 'laborCost', title: '劳务费(元)', width: 'w-16', inlineEdit: true },
  { key: 'engineeringRepair', title: '工程维修成本(元)', width: 'w-28', inlineEdit: true },
  { key: 'operationCost', title: '运维成本(元)', width: 'w-20', inlineEdit: true },
  { key: 'equipmentInsurance', title: '设备保险(元)', width: 'w-20', inlineEdit: true },
  { key: 'safetyFacility', title: '安环设施成本(元)', width: 'w-28', inlineEdit: true },
  { key: 'platformMaintenance', title: '平台运维(元)', width: 'w-20', inlineEdit: true },
  { key: 'networkFee', title: '网卡通讯费(元)', width: 'w-24', inlineEdit: true },
  { key: 'itEquipmentRepair', title: '信息设备维修(元)', width: 'w-28', inlineEdit: true },
]
// ==================== 格式化函�?====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationCost = () => {
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-cost',
    groups: [{ title: '成本统计', columns }],
    fixedKeys: ['code', 'name', 'month'],
  })
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [editingStation, setEditingStation] = useState(null)
  
  // 内联编辑状�?
  const [editingCell, setEditingCell] = useState(null) // { rowCode, colKey }
  const [editValue, setEditValue] = useState('')
  
  // 手动录入表单（仅包含可编辑字段）
  const [manualForm, setManualForm] = useState({
    totalPowerConsumption: '',
    electricityBill: '',
    powerFactor: '',
    reactivePowerFee: '',
    totalCharging: '',
    siteRentUnit: '',
    partnerUnit: '',
    busServiceFee: '',
    socialServiceFee: '',
    siteRent: '',
    marketingCost: '',
    signCost: '',
    interestExpense: '',
    depreciation: '',
    laborCost: '',
    engineeringRepair: '',
    operationCost: '',
    equipmentInsurance: '',
    safetyFacility: '',
    platformMaintenance: '',
    networkFee: '',
    itEquipmentRepair: '',
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
      totalPowerConsumption: station.totalPowerConsumption !== null ? station.totalPowerConsumption : '',
      electricityBill: station.electricityBill !== null ? station.electricityBill : '',
      powerFactor: station.powerFactor || '',
      reactivePowerFee: station.reactivePowerFee !== null ? station.reactivePowerFee : '',
      totalCharging: station.totalCharging !== null ? station.totalCharging : '',
      siteRentUnit: station.siteRentUnit || '',
      partnerUnit: station.partnerUnit || '',
      busServiceFee: station.busServiceFee !== null ? station.busServiceFee : '',
      socialServiceFee: station.socialServiceFee !== null ? station.socialServiceFee : '',
      siteRent: station.siteRent !== null ? station.siteRent : '',
      marketingCost: station.marketingCost !== null ? station.marketingCost : '',
      signCost: station.signCost !== null ? station.signCost : '',
      interestExpense: station.interestExpense !== null ? station.interestExpense : '',
      depreciation: station.depreciation !== null ? station.depreciation : '',
      laborCost: station.laborCost !== null ? station.laborCost : '',
      engineeringRepair: station.engineeringRepair !== null ? station.engineeringRepair : '',
      operationCost: station.operationCost !== null ? station.operationCost : '',
      equipmentInsurance: station.equipmentInsurance !== null ? station.equipmentInsurance : '',
      safetyFacility: station.safetyFacility !== null ? station.safetyFacility : '',
      platformMaintenance: station.platformMaintenance !== null ? station.platformMaintenance : '',
      networkFee: station.networkFee !== null ? station.networkFee : '',
      itEquipmentRepair: station.itEquipmentRepair !== null ? station.itEquipmentRepair : '',
    })
    setManualModalOpen(true)
  }

  // 保存手动录入
  const handleManualSave = () => {
    if (!editingStation) return
    
    // 解析数�?
    const parseNum = (val) => {
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }

    const totalPowerConsumption = parseNum(manualForm.totalPowerConsumption)
    const electricityBill = parseNum(manualForm.electricityBill)
    const powerFactor = manualForm.powerFactor ? parseFloat(manualForm.powerFactor) : null
    const reactivePowerFee = parseNum(manualForm.reactivePowerFee)
    const totalCharging = parseNum(manualForm.totalCharging)
    
    const busServiceFee = parseNum(manualForm.busServiceFee)
    const socialServiceFee = parseNum(manualForm.socialServiceFee)
    const siteRent = parseNum(manualForm.siteRent)
    const marketingCost = parseNum(manualForm.marketingCost)
    const signCost = parseNum(manualForm.signCost)
    const interestExpense = parseNum(manualForm.interestExpense)
    const depreciation = parseNum(manualForm.depreciation)
    const laborCost = parseNum(manualForm.laborCost)
    const engineeringRepair = parseNum(manualForm.engineeringRepair)
    const operationCost = parseNum(manualForm.operationCost)
    const equipmentInsurance = parseNum(manualForm.equipmentInsurance)
    const safetyFacility = parseNum(manualForm.safetyFacility)
    const platformMaintenance = parseNum(manualForm.platformMaintenance)
    const networkFee = parseNum(manualForm.networkFee)
    const itEquipmentRepair = parseNum(manualForm.itEquipmentRepair)

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(station => {
        if (station.code !== editingStation.code) return station
        
        const updated = {
          ...station,
          totalPowerConsumption,
          electricityBill,
          powerFactor,
          reactivePowerFee,
          totalCharging,
          siteRentUnit: manualForm.siteRentUnit || station.siteRentUnit,
          partnerUnit: manualForm.partnerUnit || station.partnerUnit,
          busServiceFee,
          socialServiceFee,
          siteRent,
          marketingCost,
          signCost,
          interestExpense,
          depreciation,
          laborCost,
          engineeringRepair,
          operationCost,
          equipmentInsurance,
          safetyFacility,
          platformMaintenance,
          networkFee,
          itEquipmentRepair,
        }

        // 自动计算电损�?
        if (totalPowerConsumption && totalCharging) {
          const loss = ((totalPowerConsumption - totalCharging) / totalPowerConsumption * 100).toFixed(1)
          updated.electricityLoss = `${loss}%`
        }

        // 自动计算总成�?
        const sum = (electricityBill || 0) +
                   (busServiceFee || 0) +
                   (socialServiceFee || 0) +
                   (siteRent || 0) +
                   (marketingCost || 0) +
                   (signCost || 0) +
                   (interestExpense || 0) +
                   (depreciation || 0) +
                   (laborCost || 0) +
                   (engineeringRepair || 0) +
                   (operationCost || 0) +
                   (equipmentInsurance || 0) +
                   (safetyFacility || 0) +
                   (platformMaintenance || 0) +
                   (networkFee || 0) +
                   (itEquipmentRepair || 0) +
                   (reactivePowerFee > 0 ? reactivePowerFee : 0)
        updated.totalCost = sum

        return updated
      })
      return newData
    })

    setManualModalOpen(false)
    setEditingStation(null)
    alert('保存成功！')
  }

  // ==================== 内联编辑逻辑 ====================
  // 开始编辑单元格
  const startInlineEdit = (rowCode, colKey) => {
    const station = currentData.find(s => s.code === rowCode)
    if (!station) return
    
    const value = station[colKey]
    setEditingCell({ rowCode, colKey })
    setEditValue(value !== null && value !== undefined ? String(value) : '')
  }

  // 停止编辑
  const stopInlineEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  // 处理编辑值变�?
  const handleEditValueChange = (e) => {
    setEditValue(e.target.value)
  }

  // 键盘事件处理（Enter提交，Esc取消�?
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveInlineEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      stopInlineEdit()
    }
  }

  // 保存内联编辑
  const saveInlineEdit = () => {
    if (!editingCell) return
    
    const { rowCode, colKey } = editingCell
    const station = currentData.find(s => s.code === rowCode)
    if (!station) return

    // 解析数�?
    let numValue = null
    const val = editValue.trim()
    
    // 判断该字段是否为数值类�?
    const colDef = columns.find(c => c.key === colKey)
    const isNumeric = ['totalPowerConsumption', 'electricityBill', 'reactivePowerFee', 
                       'totalCharging', 'busServiceFee', 'socialServiceFee', 'siteRent',
                       'marketingCost', 'signCost', 'interestExpense', 'depreciation',
                       'laborCost', 'engineeringRepair', 'operationCost', 'equipmentInsurance',
                       'safetyFacility', 'platformMaintenance', 'networkFee', 'itEquipmentRepair'].includes(colKey)
    const isFloat = ['powerFactor'].includes(colKey)
    
    if (val !== '') {
      numValue = isFloat ? parseFloat(val) : parseInt(val, 10)
      if (isNaN(numValue)) {
        alert('请输入有效的数字')
        return
      }
    }

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(s => {
        if (s.code !== rowCode) return s
        
        const updated = { ...s }
        
        // 设置字段�?
        if (numValue === null) {
          delete updated[colKey]
        } else {
          updated[colKey] = numValue
        }

        // 自动计算电损�?
        if (colKey === 'totalPowerConsumption' || colKey === 'totalCharging') {
          const totalPower = updated.totalPowerConsumption || 0
          const totalCharge = updated.totalCharging || 0
          if (totalPower > 0) {
            const loss = ((totalPower - totalCharge) / totalPower * 100).toFixed(1)
            updated.electricityLoss = `${loss}%`
          }
        }

        // 自动计算总成�?
        const sum = (updated.electricityBill || 0) +
                   (updated.busServiceFee || 0) +
                   (updated.socialServiceFee || 0) +
                   (updated.siteRent || 0) +
                   (updated.marketingCost || 0) +
                   (updated.signCost || 0) +
                   (updated.interestExpense || 0) +
                   (updated.depreciation || 0) +
                   (updated.laborCost || 0) +
                   (updated.engineeringRepair || 0) +
                   (updated.operationCost || 0) +
                   (updated.equipmentInsurance || 0) +
                   (updated.safetyFacility || 0) +
                   (updated.platformMaintenance || 0) +
                   (updated.networkFee || 0) +
                   (updated.itEquipmentRepair || 0) +
                   (updated.reactivePowerFee > 0 ? updated.reactivePowerFee : 0)
        updated.totalCost = sum

        return updated
      })
      return newData
    })

    stopInlineEdit()
  }

  // 导出
  const handleExport = (keys) => {
    alert(`导出成功（已选择${keys.length}个字段，前端原型模拟）`)
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
          <h2 className="text-lg font-bold text-gray-800">站点月度成本明细表</h2>
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
                    const isInlineEditable = col.inlineEdit
                    const isNull = value === null || value === undefined
                    const isEditing = editingCell?.rowCode === row.code && editingCell?.colKey === col.key
                    
                    // 获取数值用于预警判�?
                    const numValue = parseFloat(value)
                    const isElectricityLoss = col.key === 'electricityLoss'
                    
                    // 电损比过高预警（超过合理阈�?5%标橙红色�?
                    const isHighLoss = isElectricityLoss && !isNaN(numValue) && numValue > 15
                    
                    // 可内联编辑的字段显示白色背景
                    const isEditableField = isInlineEditable && !isEditing
                    
                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          isElectricityLoss && isHighLoss ? 'text-orange-500 font-semibold' : ''
                        } ${
                          isEditing ? 'bg-blue-50' : ''
                        } ${
                          isEditableField ? 'cursor-text hover:bg-blue-50/30' : ''
                        }`}
                        onClick={() => isInlineEditable && startInlineEdit(row.code, col.key)}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={handleEditValueChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-1 py-0.5 text-sm border border-primary bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            style={{ maxWidth: '150px' }}
                          />
                        ) : (
                          <span>{typeof value === 'number' ? formatNumber(value) : (isNull ? '-' : value)}</span>
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
                id="cost-import-file"
              />
              <label
                htmlFor="cost-import-file"
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
              <li>�밴ģ���ֶε�������</li>
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
            <div className="grid grid-cols-4 gap-2 text-xs">
              <p>站点编码：{editingStation?.code}</p>
              <p>站点：{editingStation?.name}</p>              <p>统计月份：{editingStation?.month}</p>
            </div>
          </div>

          {/* 第一部分：电费清单数�?*/}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2 pb-1 border-b">电费清单数据</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    总用电量(kWh)
                  </label>
                  <input
                    type="number"
                    value={manualForm.totalPowerConsumption}
                    onChange={(e) => setManualForm(prev => ({ ...prev, totalPowerConsumption: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ①缴纳电�?�?
                  </label>
                  <input
                    type="number"
                    value={manualForm.electricityBill}
                    onChange={(e) => setManualForm(prev => ({ ...prev, electricityBill: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    功率因素
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.powerFactor}
                    onChange={(e) => setManualForm(prev => ({ ...prev, powerFactor: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    力调电费(�?
                  </label>
                  <input
                    type="number"
                    value={manualForm.reactivePowerFee}
                    onChange={(e) => setManualForm(prev => ({ ...prev, reactivePowerFee: e.target.value }))}
                    placeholder="负数代表奖励"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总充电量(kWh)
                </label>
                <input
                  type="number"
                  value={manualForm.totalCharging}
                  onChange={(e) => setManualForm(prev => ({ ...prev, totalCharging: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 第二部分：合作方与租�?*/}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2 pb-1 border-b">合作方与租金</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    站场租赁单位
                  </label>
                  <input
                    type="text"
                    value={manualForm.siteRentUnit}
                    onChange={(e) => setManualForm(prev => ({ ...prev, siteRentUnit: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    支付合作单位
                  </label>
                  <input
                    type="text"
                    value={manualForm.partnerUnit}
                    onChange={(e) => setManualForm(prev => ({ ...prev, partnerUnit: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  场地租金(�?
                </label>
                <input
                  type="number"
                  value={manualForm.siteRent}
                  onChange={(e) => setManualForm(prev => ({ ...prev, siteRent: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* 第三部分：现场服务费 */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2 pb-1 border-b">�ֳ������</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公交充电现场服务�?�?
                  </label>
                  <input
                    type="number"
                    value={manualForm.busServiceFee}
                    onChange={(e) => setManualForm(prev => ({ ...prev, busServiceFee: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    社会充电现场服务�?�?
                  </label>
                  <input
                    type="number"
                    value={manualForm.socialServiceFee}
                    onChange={(e) => setManualForm(prev => ({ ...prev, socialServiceFee: e.target.value }))}
                    placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 第四部分：其他成本科�?*/}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2 pb-1 border-b">其他成本科目</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">营销成本(�?</label>
                <input
                  type="number"
                  value={manualForm.marketingCost}
                  onChange={(e) => setManualForm(prev => ({ ...prev, marketingCost: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标识标牌成本(�?</label>
                <input
                  type="number"
                  value={manualForm.signCost}
                  onChange={(e) => setManualForm(prev => ({ ...prev, signCost: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">财务费用-利息(�?</label>
                <input
                  type="number"
                  value={manualForm.interestExpense}
                  onChange={(e) => setManualForm(prev => ({ ...prev, interestExpense: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">折旧(�?</label>
                <input
                  type="number"
                  value={manualForm.depreciation}
                  onChange={(e) => setManualForm(prev => ({ ...prev, depreciation: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">劳务�?�?</label>
                <input
                  type="number"
                  value={manualForm.laborCost}
                  onChange={(e) => setManualForm(prev => ({ ...prev, laborCost: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工程维修成本(�?</label>
                <input
                  type="number"
                  value={manualForm.engineeringRepair}
                  onChange={(e) => setManualForm(prev => ({ ...prev, engineeringRepair: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">运维成本(�?</label>
                <input
                  type="number"
                  value={manualForm.operationCost}
                  onChange={(e) => setManualForm(prev => ({ ...prev, operationCost: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">设备保险(�?</label>
                <input
                  type="number"
                  value={manualForm.equipmentInsurance}
                  onChange={(e) => setManualForm(prev => ({ ...prev, equipmentInsurance: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">安环设施成本(�?</label>
                <input
                  type="number"
                  value={manualForm.safetyFacility}
                  onChange={(e) => setManualForm(prev => ({ ...prev, safetyFacility: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">平台运维(�?</label>
                <input
                  type="number"
                  value={manualForm.platformMaintenance}
                  onChange={(e) => setManualForm(prev => ({ ...prev, platformMaintenance: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网卡通讯�?�?</label>
                <input
                  type="number"
                  value={manualForm.networkFee}
                  onChange={(e) => setManualForm(prev => ({ ...prev, networkFee: e.target.value }))}
                  placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">信息设备维修(�?</label>
                <input
                  type="number"
                  value={manualForm.itEquipmentRepair}
                  onChange={(e) => setManualForm(prev => ({ ...prev, itEquipmentRepair: e.target.value }))}
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

export default StationCost




















