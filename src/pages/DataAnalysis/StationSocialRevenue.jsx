import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, Info } from 'lucide-react'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import FieldTooltip from '../../components/FieldTooltip'

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

// ==================== 客户分类字典 ====================
const customerTypes = [
  '两江微信客户',
  '两江大客户',
  '蔚来',
  '小桔',
  '新电途',
  '特来电',
  '小鹏',
]

// ==================== 生成某个月模拟数据（按站点展开） ====================
const generateMonthData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return min + val * (max - min)
  }

  const result = []

  baseStationData.forEach((station) => {
    // 为每个站点生成多个客户的明细数据
    customerTypes.forEach((customerType) => {
      const totalPower = Math.round(getRandom(50000, 300000))
      const chargingIncome = Math.round(totalPower * getRandom(0.8, 1.2))
      
      // 社会收入合计 = 充电收入 × (1-0.6%)
      const socialIncome = Math.round(chargingIncome * 0.994)
      
      // 社会平台服务费
      const serviceFee = Math.round(getRandom(1000, 10000))
      
      // 社会充电成本（从成本表拉取）
      const socialCost = Math.round(socialIncome * getRandom(0.6, 0.8))
      
      // 三方引流手续费 = 社会收入合计 + 服务费 - 成本倒算
      const thirdPartyFee = Math.round(socialIncome + serviceFee - socialCost * 0.95)
      
      // 充电毛利 = 社会收入合计 - 社会充电成本 - 三方引流手续费
      const grossProfit = socialIncome - socialCost - thirdPartyFee

      // 根据客户类型确定结算方式
      const settlementMethod = getSettlementMethod(customerType)

      result.push({
        code: station.code,
        stationName: station.name,
        month,
        customerType,
        settlementMethod,
        totalPower,
        chargingIncome,
        socialIncome,
        serviceFee,
        socialCost,
        thirdPartyFee,
        grossProfit,
        remark: getCustomerRemark(customerType),
        isSubtotal: false, // 标记是否为小计行
        stationCode: station.code, // 用于合并单元格判断
      })
    })

    // 为每个站点添加一个小计行
    const stationRows = result.filter(r => r.code === station.code && !r.isSubtotal)
    if (stationRows.length > 0) {
      const subtotal = {
        code: station.code,
        stationName: station.name,
        month: month,
        customerType: '小计',
        settlementMethod: '-',
        totalPower: stationRows.reduce((sum, r) => sum + r.totalPower, 0),
        chargingIncome: stationRows.reduce((sum, r) => sum + r.chargingIncome, 0),
        socialIncome: stationRows.reduce((sum, r) => sum + r.socialIncome, 0),
        serviceFee: stationRows.reduce((sum, r) => sum + r.serviceFee, 0),
        socialCost: stationRows.reduce((sum, r) => sum + r.socialCost, 0),
        thirdPartyFee: stationRows.reduce((sum, r) => sum + r.thirdPartyFee, 0),
        grossProfit: stationRows.reduce((sum, r) => sum + r.grossProfit, 0),
        remark: '-',
        isSubtotal: true,
        stationCode: station.code, // 用于小计行的合并判断
      }
      result.push(subtotal)
    }
  })

  return result
}

// ==================== 结算方式判断 ====================
const getSettlementMethod = (customerType) => {
  if (customerType === '两江微信客户') return '按实际收款结算'
  if (customerType === '两江大客户') return '按对应合同结算'
  return '按自然月订单结算'
}

// ==================== 客户备注说明 ====================
const getCustomerRemark = (customerType) => {
  const remarks = {
    两江微信客户: '电费+服务费',
    两江大客户: '电费+服务费（按合同折扣）',
    蔚来: '(电费+服务费*80%)*(1-0.6%)',
    小桔: '电费+服务费*85%',
    新电途: '电费*(1-0.6%)+服务费*(85%-0.6%)',
    特来电: '电费+服务费*85%',
    小鹏: '电费+服务费*80%',
  }
  return remarks[customerType] || ''
}


// ==================== 列定义 - 单层表头，严格按顺序 ====================
const columns = [
  { key: 'code', title: '站点编码', width: 'w-24', frozen: true, note: '站点基础表中的站点编码。' },
  { key: 'stationName', title: '站点', width: 'w-40', frozen: true, note: '站点基础表中的站点名称。' },
  { key: 'month', title: '月份', width: 'w-20', frozen: true, note: '当前报表统计月份。' },
  { key: 'settlementMethod', title: '结算方式', width: 'w-24', note: '按社会客户类型匹配的结算口径。' },
  { key: 'customerType', title: '社会客户', width: 'w-20', note: '社会客户或平台分类。' },
  { key: 'totalPower', title: '总电量(kWh)', width: 'w-28', note: '该站点、该客户在统计月份内的充电总电量。' },
  { key: 'chargingIncome', title: '充电收入(元)', width: 'w-28', note: '该客户在统计月份内产生的充电收入。' },
  { key: 'socialIncome', title: '社会收入合计(元)', width: 'w-32', note: '充电收入扣除平台结算比例后形成的社会收入合计。' },
  { key: 'serviceFee', title: '社会平台服务费(元)', width: 'w-32', note: '社会平台或渠道对应的服务费金额。' },
  { key: 'socialCost', title: '社会充电成本(元)', width: 'w-32', note: '从成本报表拉取或计算得到的社会充电成本。' },
  { key: 'thirdPartyFee', title: '三方引流手续费支出(元)', width: 'w-36', note: '第三方平台引流或渠道手续费支出。' },
  { key: 'grossProfit', title: '充电毛利(元)', width: 'w-28', note: '社会收入合计 - 社会充电成本 - 三方引流手续费支出。' },
  { key: 'remark', title: '备注', width: 'w-32', note: '该客户类型的结算或计费备注。' },
]

// 各字段悬浮说明
const columnTips = Object.fromEntries(columns.map((col) => [col.key, col.note || col.title]))

// ==================== 格式化函数 ====================
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string') return value
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

// ==================== 组件 ====================
const StationSocialRevenue = () => {
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-social-revenue',
    groups: [{ title: '社会营收', columns }],
    fixedKeys: ['code', 'stationName', 'month'],
  })
  const [selectedMonth, setSelectedMonth] = useState('2026-05')

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

  // 导出
  const handleExport = (keys) => {
    alert(`导出成功（已选择${keys.length}个字段，前端原型模拟）`)
  }

  // 获取毛利率用于预警判断
  const getRiskLevel = (row) => {
    if (row.customerType === '小计') return 'normal'
    if (row.grossProfit < 0) return 'danger'
    if (row.socialIncome > 0 && row.thirdPartyFee / row.socialIncome > 0.2) return 'warning'
    return 'normal'
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
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            <Info className="w-3 h-3" />
            <span>所有数据由系统自动计算，仅支持查看</span>
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
          <h2 className="text-lg font-bold text-gray-800">站点社会营收情况表</h2>
        </div>
        <span className="text-sm text-gray-500">统计月份：{selectedMonth}</span>
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
                      col.frozen ? 'bg-blue-50 sticky left-0 z-20' : 'bg-gray-50'
                    } align-middle`}
                    style={{ minWidth: col.frozen ? '100px' : undefined, zIndex: col.frozen ? 20 : 10 }}
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
              {currentData.map((row, index) => {
                // 判断是否是小计行
                const isSubtotalRow = row.isSubtotal || row.customerType === '小计'
                
                // 判断是否有风险预警，仅非小计行
                let riskLevel = 'normal'
                if (!isSubtotalRow) {
                  if (row.grossProfit < 0) riskLevel = 'danger'
                  else if (row.socialIncome > 0 && row.thirdPartyFee / row.socialIncome > 0.2) riskLevel = 'warning'
                }
                
                return (
                  <tr 
                    key={index} 
                    className={`transition-colors ${
                      isSubtotalRow ? 'bg-yellow-50 font-semibold' :
                      riskLevel === 'danger' ? 'bg-red-50 hover:bg-red-100' : 
                      riskLevel === 'warning' ? 'bg-orange-50 hover:bg-orange-100' :
                      'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {reportFields.visibleColumns.map(col => {
                      const value = row[col.key]
                      const isNull = value === null || value === undefined || value === ''
                      
                      // 特殊样式处理
                      let cellStyle = ''
                      if (col.key === 'grossProfit' && typeof value === 'number') {
                        if (value < 0) cellStyle = 'text-red-600 font-semibold'
                        else if (!isSubtotalRow) cellStyle = 'text-green-600 font-semibold'
                      }
                      
                      // 小计行样式
                      if (isSubtotalRow) {
                        if (['totalPower', 'chargingIncome', 'socialIncome', 'serviceFee', 'thirdPartyFee', 'grossProfit'].includes(col.key)) {
                          cellStyle = 'text-blue-600 font-bold'
                        }
                      }
                      
                      // 合并单元格逻辑:站点编码、站点名称、月份需要跨行合并
                      let rowSpan = 1
                      
                      if (!isSubtotalRow && ['code', 'stationName', 'month'].includes(col.key)) {
                        const prevRow = index > 0 ? currentData[index - 1] : null
                        const isFirstInGroup = !prevRow || prevRow.code !== row.code || prevRow.customerType === '小计'
                        
                        // 如果不是该组第一行，跳过渲染(由上一行合并)
                        if (!isFirstInGroup) {
                          return null
                        }
                        
                        // 计算该组有多少行
                        for (let i = index + 1; i < currentData.length; i++) {
                          if (currentData[i].code === row.code && !currentData[i].isSubtotal && currentData[i].customerType !== '小计') {
                            rowSpan++
                          } else {
                            break
                          }
                        }
                      }
                      
                      // 冻结列样式，包括站点编码、站点名称、月份
                      const isFrozenCol = ['code', 'stationName', 'month'].includes(col.key)
                      
                      return (
                        <td
                          key={col.key}
                          className={`px-2 py-2 border-r border-gray-200 text-sm whitespace-nowrap align-middle ${cellStyle} ${
                            isFrozenCol ? 'bg-blue-50' : ''
                          }`}
                          rowSpan={rowSpan > 1 ? rowSpan : undefined}
                          style={rowSpan > 1 ? {
                            textAlign: 'left',
                            verticalAlign: 'middle',
                            fontWeight: 'bold'
                          } : undefined}
                        >
                          {isNull ? '-' : (typeof value === 'number' ? formatNumber(value) : value)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StationSocialRevenue





















