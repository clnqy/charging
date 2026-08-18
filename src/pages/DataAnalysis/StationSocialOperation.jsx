import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, RefreshCw, Clock, Edit3 } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import InlineEditableCell from './InlineEditableCell'
import FieldTooltip from '../../components/FieldTooltip'

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
    return Math.floor(min + val * (max - min))
  }
  const getRandomFloat = (min, max, decimals = 2) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return (min + val * (max - min)).toFixed(decimals)
  }

  return baseStationData.map((station) => {
    // 手动录入字段（初始为空）
    const openTime = null
    const closeTime = null
    const nightGunCount = null

    // 自动获取枪数量
    const gunCount = getRandom(10, 50)

    // 自动统计字段
    const socialCharging = getRandom(50000, 300000)
    const validOrders = getRandom(1000, 5000)
    const failOrders = getRandom(50, 300)
    const totalOrders = validOrders + failOrders
    const startSuccessRate = totalOrders > 0 ? ((validOrders / totalOrders) * 100).toFixed(2) : '0.00'

    const sharpOrders = getRandom(100, 800)
    const peakOrders = getRandom(300, 1500)
    const flatOrders = getRandom(200, 1200)
    const valleyOrders1 = getRandom(50, 400)
    const valleyOrders2 = getRandom(80, 500)

    const serviceFee = getRandom(5000, 50000)
    const avgServicePrice = socialCharging > 0 ? (serviceFee / socialCharging).toFixed(4) : '0.0000'

    const sharpPower = getRandom(5000, 50000)
    const peakPower = getRandom(15000, 150000)
    const flatPower = getRandom(10000, 100000)
    const valleyPower = getRandom(3000, 60000)
    const totalPower = sharpPower + peakPower + flatPower + valleyPower

    const sharpRatio = totalPower > 0 ? ((sharpPower / totalPower) * 100).toFixed(2) : '0.00'
    const peakRatio = totalPower > 0 ? ((peakPower / totalPower) * 100).toFixed(2) : '0.00'
    const flatRatio = totalPower > 0 ? ((flatPower / totalPower) * 100).toFixed(2) : '0.00'
    const valleyRatio = totalPower > 0 ? ((valleyPower / totalPower) * 100).toFixed(2) : '0.00'

    // 单枪日均充电量
    const dailyPerGun = gunCount && gunCount > 0 ? (socialCharging / gunCount / 31).toFixed(2) : '0.00'
    // 月设备利用率
    const utilizationRate = getRandomFloat(20, 90, 2)

    return {
      ...station,
      month,
      openTime,
      closeTime,
      gunCount,
      nightGunCount,
      socialCharging,
      dailyPerGun,
      utilizationRate,
      validOrders,
      failOrders,
      startSuccessRate,
      sharpOrders,
      peakOrders,
      flatOrders,
      valleyOrders1,
      valleyOrders2,
      serviceFee,
      avgServicePrice,
      sharpRatio,
      peakRatio,
      flatRatio,
      valleyRatio,
      sharpPower,
      peakPower,
      flatPower,
      valleyPower,
    }
  })
}

// ==================== 列定义====================
const columns = [
  { key: 'code', title: '站点编码', width: 'w-24' },
  { key: 'name', title: '站点', width: 'w-48' },
  { key: 'type', title: '站点类型', width: 'w-16' },
  { key: 'openTime', title: '开放时间', width: 'w-20', editable: true },
  { key: 'closeTime', title: '关闭时间', width: 'w-20', editable: true },
  { key: 'gunCount', title: '枪数量', width: 'w-16' },
  { key: 'nightGunCount', title: '夜间开放枪数量(0-6点)', width: 'w-28', editable: true },
  { key: 'socialCharging', title: '社会充电量(kWh)', width: 'w-28' },
  { key: 'dailyPerGun', title: '单枪日均充电量(kWh)', width: 'w-28' },
  { key: 'utilizationRate', title: '设备利用率', width: 'w-24' },
  { key: 'validOrders', title: '有效订单数(>2度)', width: 'w-28' },
  { key: 'failOrders', title: '失败订单数(小于2度)', width: 'w-28' },
  { key: 'startSuccessRate', title: '启动成功率', width: 'w-20' },
  { key: 'sharpOrders', title: '尖订单数', width: 'w-16' },
  { key: 'peakOrders', title: '峰订单数', width: 'w-16' },
  { key: 'flatOrders', title: '平订单数', width: 'w-16' },
  { key: 'valleyOrders1', title: '谷订单数(0-5点)', width: 'w-24' },
  { key: 'valleyOrders2', title: '谷订单数(5-8点)', width: 'w-24' },
  { key: 'serviceFee', title: '原始服务费(元)', width: 'w-28' },
  { key: 'avgServicePrice', title: '平均服务费单价(元/kWh)', width: 'w-32' },
  { key: 'sharpRatio', title: '尖占比', width: 'w-16' },
  { key: 'peakRatio', title: '峰占比', width: 'w-16' },
  { key: 'flatRatio', title: '平占比', width: 'w-16' },
  { key: 'valleyRatio', title: '谷占比', width: 'w-16' },
  { key: 'sharpPower', title: '尖电量', width: 'w-20' },
  { key: 'peakPower', title: '峰电量', width: 'w-20' },
  { key: 'flatPower', title: '平电量', width: 'w-20' },
  { key: 'valleyPower', title: '谷电量', width: 'w-20' },
]
// ==================== 格式化函数====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationSocialOperation = () => {
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-social-operation',
    groups: [{ title: '社会运营', columns }],
    fixedKeys: ['code', 'name'],
  })
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [editingStation, setEditingStation] = useState(null)
  const [manualForm, setManualForm] = useState({ openTime: '', closeTime: '', gunCount: '', nightGunCount: '' })

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
      openTime: station.openTime !== null ? station.openTime : '',
      closeTime: station.closeTime !== null ? station.closeTime : '',
      gunCount: station.gunCount !== null ? station.gunCount : '',
      nightGunCount: station.nightGunCount !== null ? station.nightGunCount : '',
    })
    setManualModalOpen(true)
  }

  // 保存手动录入
  const handleManualSave = () => {
    if (!editingStation) return

    setMonthlyData(prev => {
      const newData = { ...prev }
      newData[selectedMonth] = newData[selectedMonth].map(station => {
        if (station.code !== editingStation.code) return station
        return {
          ...station,
          openTime: manualForm.openTime || null,
          closeTime: manualForm.closeTime || null,
          gunCount: manualForm.gunCount ? parseInt(manualForm.gunCount) : null,
          nightGunCount: manualForm.nightGunCount ? parseInt(manualForm.nightGunCount) : null,
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
            <span>更新频率（T+1）</span>
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
          <h2 className="text-lg font-bold text-gray-800">单站社会运营明细表</h2>
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
                    const isUtilization = col.key === 'utilizationRate'
                    const numValue = parseFloat(value)
                    const isLowUtilization = isUtilization && !isNaN(numValue) && numValue < 30

                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          isEditable
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } ${isLowUtilization ? 'text-orange-600 font-semibold' : ''}`}
                      >
                        {isEditable ? (
                          <InlineEditableCell
                            value={value}
                            placeholder="待填写"
                            inputType={col.key === 'nightGunCount' ? 'number' : 'text'}
                            numeric={col.key === 'nightGunCount'}
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
                id="social-op-import-file"
              />
              <label
                htmlFor="social-op-import-file"
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
              <li>必须包含列：站点编码、开放时间、关闭时间、枪数量、夜间开放枪数量</li>
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

          {/* 可编辑字段*/}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开放时间
              </label>
              <input
                type="text"
                value={manualForm.openTime}
                onChange={(e) => setManualForm(prev => ({ ...prev, openTime: e.target.value }))}
                placeholder="如：06:00"
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关闭时间
              </label>
              <input
                type="text"
                value={manualForm.closeTime}
                onChange={(e) => setManualForm(prev => ({ ...prev, closeTime: e.target.value }))}
                placeholder="如：22:00"
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                枪数量
              </label>
              <input
                type="number"
                value={manualForm.gunCount}
                onChange={(e) => setManualForm(prev => ({ ...prev, gunCount: e.target.value }))}
                placeholder="请输入"
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                夜间开放枪数量(0-6点)
              </label>
              <input
                type="number"
                value={manualForm.nightGunCount}
                onChange={(e) => setManualForm(prev => ({ ...prev, nightGunCount: e.target.value }))}
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
          {/* <div className="flex justify-end gap-2 pt-2">
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
          </div> */}
        </div>
      </Modal>
    </div>
  )
}

export default StationSocialOperation



















