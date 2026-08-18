import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, AlertCircle, RefreshCw, Clock } from 'lucide-react'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
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
    return min + val * (max - min)
  }

  return baseStationData.map((station) => {
    const socialPower = Math.round(getRandom(10000, 200000))
    const busPower = Math.round(getRandom(50000, 300000))

    const socialElectricityIncome = Math.round(socialPower * getRandom(0.45, 0.65))
    const socialChargingServiceIncome = Math.round(socialPower * getRandom(0.15, 0.25))
    const socialIncome = socialElectricityIncome + socialChargingServiceIncome
    const socialAvgPrice = socialPower > 0 ? (socialIncome / socialPower).toFixed(4) : '0.0000'
    const socialServiceFee = 0

    const busElectricityIncome = Math.round(busPower * getRandom(0.55, 0.75))
    const busChargingServiceIncome = Math.round(busPower * getRandom(0.25, 0.35))
    const busIncome = busElectricityIncome + busChargingServiceIncome
    const busAvgPrice = busPower > 0 ? (busIncome / busPower).toFixed(4) : '0.0000'
    const busServiceFee = 0

    const totalPower = socialPower + busPower
    const totalElectricityFee = socialElectricityIncome + busElectricityIncome
    const totalServiceFee = socialChargingServiceIncome + busChargingServiceIncome
    const totalRevenue = totalElectricityFee + totalServiceFee

    return {
      ...station,
      month,
      socialPower,
      socialElectricityIncome,
      socialChargingServiceIncome,
      socialIncome,
      socialAvgPrice,
      socialServiceFee,
      busPower,
      busElectricityIncome,
      busChargingServiceIncome,
      busIncome,
      busAvgPrice,
      busServiceFee,
      totalPower,
      totalElectricityFee,
      totalServiceFee,
      totalRevenue,
    }
  })
}

// ==================== 列定义（含分组、公式、统计口径）====================
const columnGroups = [
  { key: 'siteInfo', title: '站点信息', colSpan: 4, bgColor: 'bg-blue-50', columns: [
    { key: 'code', title: '站点编码', width: 'w-24' },
    { key: 'name', title: '站点', width: 'w-48' },
    { key: 'type', title: '经营模式', width: 'w-16' },
    // { key: 'month', title: '月份', width: 'w-20' },
  ] },
  { key: 'social', title: '社会充电', colSpan: 6, bgColor: 'bg-green-50', columns: [
    { key: 'socialPower', title: '社会结算电量(kWh)', width: 'w-28' },
    { key: 'socialElectricityIncome', title: '充电电费收入(元)', width: 'w-28' },
    { key: 'socialChargingServiceIncome', title: '充电服务费收入(元)', width: 'w-28' },
    { key: 'socialIncome', title: '社会充电收入(元)', width: 'w-28' },
    { key: 'socialAvgPrice', title: '社会平均结算单价(元/kWh)', width: 'w-32' },
    { key: 'socialServiceFee', title: '社会平台服务费(元)', width: 'w-28' },
  ] },
  { key: 'bus', title: '公交充电', colSpan: 6, bgColor: 'bg-yellow-50', columns: [
    { key: 'busPower', title: '公交结算电量(kWh)', width: 'w-28' },
    { key: 'busElectricityIncome', title: '充电电费收入(元)', width: 'w-28' },
    { key: 'busChargingServiceIncome', title: '充电服务费收入(元)', width: 'w-28' },
    { key: 'busIncome', title: '公交充电收入(元)', width: 'w-28' },
    { key: 'busAvgPrice', title: '公交平均结算单价(元/kWh)', width: 'w-32' },
    { key: 'busServiceFee', title: '公交平台服务费(元)', width: 'w-28' },
  ] },
  { key: 'total', title: '合计', colSpan: 4, bgColor: 'bg-red-50', columns: [
    { key: 'totalPower', title: '充电量合计', width: 'w-28', tip: '社会结算电量 + 公交结算电量。' },
    { key: 'totalElectricityFee', title: '电费合计', width: 'w-28', tip: '社会充电电费收入 + 公交充电电费收入。' },
    { key: 'totalServiceFee', title: '服务费合计', width: 'w-28', tip: '社会充电服务费收入 + 公交充电服务费收入。' },
    { key: 'totalRevenue', title: '总收入合计', width: 'w-28', tip: '电费合计 + 服务费合计。' },
  ] },
]
// ==================== 格式化函数====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationRevenue = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-revenue:v3',
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

  // 导出
  const handleExport = (keys) => {
    alert('导出成功（已选择' + keys.length + '个字段，前端原型模拟）')
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
          <ReportFieldControls fields={reportFields} onExport={handleExport} />
        </div>
      </div>

      {/* ========== 页面标题========== */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">单站月度营收明细表</h2>
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
            {/* 一级分组表头*/}
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
                    const isTotal = ['totalPower', 'totalElectricityFee', 'totalServiceFee', 'totalRevenue'].includes(col.key)

                    return (
                      <td
                        key={col.key}
                        className={`px-2 py-2 border-r border-gray-100 text-sm whitespace-nowrap min-w-[160px] ${
                          'bg-gray-50'
                        } ${isTotal ? 'text-primary font-semibold' : ''}`}
                      >
                        <span>{typeof value === 'number' ? formatNumber(value, col.key.includes('Price') ? 4 : 2) : value}</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default StationRevenue
















