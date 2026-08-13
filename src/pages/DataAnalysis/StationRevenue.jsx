import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, RefreshCw, Clock, Edit3 } from 'lucide-react'
import Modal from '../../components/Modal'
import InlineEditableCell from './InlineEditableCell'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'

// ==================== 基础站点数据 ====================
const baseStationData = [
  { code: 'YIM00100', name: '沙坪坝区陈家桥公交充电站', type: '自营站' },
  { code: 'YIM00200', name: '北区光亮天润城公交充电站', type: '自营站' },
  { code: 'YIM00300', name: '福佑路公交枢纽站', type: '自营站' },
  { code: 'YIM00301', name: '福佑路公交充电站扩建项目（V2G）', type: '自营站' },
  { code: 'YIM00302', name: '福佑路公交枢纽站二期', type: '自营站' },
  { code: 'YIM00400', name: '碚都佳园首末站', type: '自营站' },
  { code: 'YIM00500', name: '五里店公交站', type: '自营站' },
  { code: 'YIM00600', name: '渝中区菜园坝公交充电站', type: '自营站' },
  { code: 'YIM00700', name: '江北区观音桥公交充电站', type: '自营站' },
  { code: 'YIM00800', name: '南岸区南坪公交充电站', type: '自营站' },
]
// ==================== 生成某月模拟数据 ====================
const generateMonthData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return min + val * (max - min)
  }

  return baseStationData.map((station) => {
    const socialPower = Math.round(getRandom(10000, 200000))
    const busPower = Math.round(getRandom(50000, 300000))

    const socialIncome = Math.round(socialPower * getRandom(0.6, 0.9))
    const socialAvgPrice = socialPower > 0 ? (socialIncome / socialPower).toFixed(4) : '0.0000'
    const socialServiceFee = 0

    const busIncome = Math.round(busPower * getRandom(0.8, 1.1))
    const busAvgPrice = busPower > 0 ? (busIncome / busPower).toFixed(4) : '0.0000'
    const busServiceFee = 0

    const totalBus = busPower
    const busSharp = Math.round(totalBus * getRandom(0.05, 0.15))
    const busPeak = Math.round(totalBus * getRandom(0.25, 0.35))
    const busFlat = Math.round(totalBus * getRandom(0.25, 0.35))
    const busValley = totalBus - busSharp - busPeak - busFlat
    const valleyRatio = totalBus > 0 ? ((busValley / totalBus) * 100).toFixed(1) : '0.0'

    const powerCost = Math.round(getRandom(50000, 200000))

    const partnerBusCost = null
    const partnerSocialCost = null

    const grossProfit = socialIncome + busIncome - powerCost - (partnerBusCost || 0) - (partnerSocialCost || 0)

    return {
      ...station,
      month,
      socialPower,
      socialIncome,
      socialAvgPrice,
      socialServiceFee,
      busPower,
      busIncome,
      busAvgPrice,
      busServiceFee,
      powerCost,
      partnerBusCost,
      partnerSocialCost,
      grossProfit,
      remark: '',
      busSharp,
      busPeak,
      busFlat,
      busValley,
      valleyRatio: `${valleyRatio}%`,
    }
  })
}

// ==================== 列定义（含分组、公式、统计口径）====================
const columnGroups = [
  { key: 'siteInfo', title: '站点信息', colSpan: 4, bgColor: 'bg-blue-50', columns: [
    { key: 'code', title: '站点编码', width: 'w-24' },
    { key: 'name', title: '站点', width: 'w-48' },
    { key: 'type', title: '经营类型', width: 'w-16' },
    { key: 'month', title: '月份', width: 'w-20' },
  ] },
  { key: 'social', title: '社会充电', colSpan: 4, bgColor: 'bg-green-50', columns: [
    { key: 'socialPower', title: '社会结算电量(kWh)', width: 'w-28' },
    { key: 'socialIncome', title: '社会充电收入(元)', width: 'w-28' },
    { key: 'socialAvgPrice', title: '社会平均结算单价(元/kWh)', width: 'w-32' },
    { key: 'socialServiceFee', title: '社会平台服务费(元)', width: 'w-28' },
  ] },
  { key: 'bus', title: '公交充电', colSpan: 4, bgColor: 'bg-yellow-50', columns: [
    { key: 'busPower', title: '公交结算电量(kWh)', width: 'w-28' },
    { key: 'busIncome', title: '公交充电收入(元)', width: 'w-28' },
    { key: 'busAvgPrice', title: '公交平均结算单价(元/kWh)', width: 'w-32' },
    { key: 'busServiceFee', title: '公交平台服务费(元)', width: 'w-28' },
  ] },
  { key: 'cost', title: '成本', colSpan: 3, bgColor: 'bg-red-50', columns: [
    { key: 'powerCost', title: '缴纳供电电费成本(元，估)', width: 'w-32' },
    { key: 'partnerBusCost', title: '支付合作单位公交充电成本(元)', width: 'w-36', editable: true },
    { key: 'partnerSocialCost', title: '支付合作单位社会充电成本(元)', width: 'w-36', editable: true },
  ] },
  { key: 'profit', title: '毛利', colSpan: 1, bgColor: 'bg-purple-50', columns: [
    { key: 'grossProfit', title: '单站充电毛利(元)', width: 'w-28' },
  ] },
  { key: 'remark', title: '备注', colSpan: 1, bgColor: 'bg-gray-50', columns: [
    { key: 'remark', title: '备注', width: 'w-20' },
  ] },
  { key: 'timePower', title: '公交分时段电量明细', colSpan: 5, bgColor: 'bg-orange-50', columns: [
    { key: 'busSharp', title: '公交尖电量', width: 'w-20' },
    { key: 'busPeak', title: '公交峰电量', width: 'w-20' },
    { key: 'busFlat', title: '公交平电量', width: 'w-20' },
    { key: 'busValley', title: '公交谷电量', width: 'w-20' },
    { key: 'valleyRatio', title: '谷电占比', width: 'w-20' },
  ] },
]
// 扁平化列
const flatColumns = columnGroups.flatMap(g => g.columns)

// ==================== 格式化函�?====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationRevenue = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [manualForm, setManualForm] = useState({ partnerBusCost: '', partnerSocialCost: '' })
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-revenue',
    groups: columnGroups,
    fixedKeys: ['code', 'name', 'month'],
  })
  const visibleGroups = useMemo(() => {
    const visibleSet = new Set(reportFields.visibleKeys)
    return reportFields.groups
      .map(group => ({
        ...group,
        columns: group.columns.filter(col => visibleSet.has(col.key)),
      }))
      .filter(group => group.columns.length > 0)
  }, [reportFields.groups, reportFields.visibleKeys])

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

  // 计算毛利
  const calcGrossProfit = (station) => {
    return station.socialIncome + station.busIncome - station.powerCost - (station.partnerBusCost || 0) - (station.partnerSocialCost || 0)
  }

  // 生成导入预览数据
  const generateImportPreview = (month) => {
    const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const getRandom = (min, max) => {
      const val = (Math.sin(seed * 999 + min) + 1) / 2
      return Math.floor(min + val * (max - min))
    }
    return baseStationData.map(station => ({
      code: station.code,
      partnerBusCost: getRandom(10000, 100000),
      partnerSocialCost: getRandom(5000, 50000),
    }))
  }

  // 处理文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
      const previewData = generateImportPreview(importMonth || selectedMonth)
      setImportPreview(previewData)
      setShowPreview(true)
    }
  }

  // 处理导入
  const handleImport = () => {
    if (!importFile || !importMonth) return
    const importedData = generateImportPreview(importMonth)

    setMonthlyData(prev => {
      const newData = { ...prev }
      if (!newData[importMonth]) {
        newData[importMonth] = generateMonthData(importMonth)
      }
      newData[importMonth] = newData[importMonth].map(station => {
        const imported = importedData.find(item => item.code === station.code)
        if (imported) {
          return {
            ...station,
            partnerBusCost: imported.partnerBusCost,
            partnerSocialCost: imported.partnerSocialCost,
            grossProfit: calcGrossProfit({
              ...station,
              partnerBusCost: imported.partnerBusCost,
              partnerSocialCost: imported.partnerSocialCost,
            }),
          }
        }
        return station
      })
      return newData
    })

    setImportModalOpen(false)
    setImportFile(null)
    setImportPreview([])
    setShowPreview(false)
    setImportMonth('')
    alert('保存成功！')
  }

  // 打开手动录入弹窗
  const openManualModal = (station) => {
    setEditingStation(station)
    setManualForm({
      partnerBusCost: station.partnerBusCost !== null ? station.partnerBusCost : '',
      partnerSocialCost: station.partnerSocialCost !== null ? station.partnerSocialCost : '',
    })
    setManualModalOpen(true)
  }

  // 保存手动录入
  const handleManualSave = () => {
    if (!editingStation) return
    const busCost = parseFloat(manualForm.partnerBusCost)
    const socialCost = parseFloat(manualForm.partnerSocialCost)

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(station => {
        if (station.code !== editingStation.code) return station
        const updated = {
          ...station,
          partnerBusCost: isNaN(busCost) ? null : busCost,
          partnerSocialCost: isNaN(socialCost) ? null : socialCost,
        }
        updated.grossProfit = calcGrossProfit(updated)
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
    alert('导出成功（已选择' + keys.length + '个字段，前端原型模拟）')
  }

  const saveCellValue = (rowCode, colKey, nextValue) => {
    setMonthlyData(prev => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].map(station => {
        if (station.code !== rowCode) return station
        const updated = { ...station, [colKey]: nextValue }
        updated.grossProfit = calcGrossProfit(updated)
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
          <h2 className="text-lg font-bold text-gray-800">单站月度营收明细表</h2>
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
            {/* 一级分组表�?*/}
            <thead className="sticky top-0 z-10">
              <tr>
                {visibleGroups.map(group => (
                  <th
                    key={group.key}
                    colSpan={group.columns.length}
                    className={`px-2 py-2 border-b border-r border-gray-200 text-center font-semibold text-gray-700 text-sm ${group.bgColor}`}
                  >
                    {group.title}
                  </th>
                ))}
              </tr>
              {/* 二级明细表头 */}
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
                    const isProfit = col.key === 'grossProfit'

                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          isEditable
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } ${isProfit && value < 0 ? 'text-red-600 font-semibold' : ''} ${
                          isProfit && value >= 0 ? 'text-green-600 font-semibold' : ''
                        }`}
                      >
                        {isEditable ? (
                          <InlineEditableCell
                            value={value}
                            displayValue={formatNumber(value)}
                            placeholder="待填写"
                            inputType="number"
                            numeric
                            onSave={(nextValue) => saveCellValue(row.code, col.key, nextValue)}
                          />
                        ) : (
                          <span>{typeof value === 'number' ? formatNumber(value, col.key.includes('Price') ? 4 : 2) : value}</span>
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
      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportFile(null); setShowPreview(false); setImportPreview([]) }} title="Excel批量导入">
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
                onChange={handleFileUpload}
                className="hidden"
                id="revenue-import-file"
              />
              <label
                htmlFor="revenue-import-file"
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
              <li>必须包含列：站点编码、支付合作单位公交充电成�?�?、支付合作单位社会充电成�?�?</li>
              <li>站点编码用于匹配数据</li>
              <li>导入数据将绑定所选统计自然月存档</li>
            </ul>
          </div>

          {/* 预览表格 */}
          {showPreview && importPreview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">导入预览</h4>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">站点编码</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">公交充电成本(�?</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">社会充电成本(�?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 5).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-xs">{item.code}</td>
                        <td className="px-3 py-2 text-xs">{formatNumber(item.partnerBusCost)}</td>
                        <td className="px-3 py-2 text-xs">{formatNumber(item.partnerSocialCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 5 && (
                  <p className="text-sm text-gray-500 mb-2">拖拽文件到此处，或点击上传</p>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {/* <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setImportModalOpen(false); setImportFile(null); setShowPreview(false); setImportPreview([]) }}
              className="bg-white text-primary border border-primary px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile || !importMonth}
              className="bg-primary text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              确认导入
            </button>
          </div> */}
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
              <p>社会充电收入：{editingStation ? formatNumber(editingStation.socialIncome) : '-'}</p>
              <p>公交充电收入：{editingStation ? formatNumber(editingStation.busIncome) : '-'}</p>
            </div>
          </div>

          {/* 可编辑字�?*/}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支付合作单位公交充电成本(�?
              </label>
              <input
                type="number"
                value={manualForm.partnerBusCost}
                onChange={(e) => setManualForm(prev => ({ ...prev, partnerBusCost: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支付合作单位社会充电成本(�?
              </label>
              <input
                type="number"
                value={manualForm.partnerSocialCost}
                onChange={(e) => setManualForm(prev => ({ ...prev, partnerSocialCost: e.target.value }))}
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
            {/* <button
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
            </button> */}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StationRevenue
















