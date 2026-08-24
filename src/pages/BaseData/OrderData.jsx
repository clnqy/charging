import React, { useMemo, useState } from 'react'
import { AlertCircle, Calendar, Download, Eye, Search, Upload } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import DownloadCenterModal, { useDownloadCenter } from '../../components/DownloadCenter'

const stationOptions = [
  { code: 'YIM00100', name: '沙坪坝区陈家桥公交充电站' },
  { code: 'YIM00200', name: '北区光亮天润城公交充电站' },
  { code: 'YIM00300', name: '福佑路公交枢纽站' },
  { code: 'YIM00400', name: '碚都佳园首末站' },
  { code: 'YIM00500', name: '五里店公交站' },
]

const payTypes = ['后台充值', '支付宝', '微信']
const customerTypes = ['驿满微信', '快电', '小桔', '新电途', '公交集团']
const resultStatuses = ['成功', '失败', '取消']
const billTypes = ['实时账单', '月结账单', '合同账单']
const chargeTypes = ['社会充电', '公交充电', '大客户充电']
const chargePolicies = ['尖峰平谷', '固定单价', '时段单价']
const memberTypes = ['个人会员', '企业会员', '公交会员', '大客户会员']
const endReasons = ['正常结束', '用户主动停止', '枪拔出结束', '设备故障停止']
const payModes = ['微信', '支付宝', '银联', '余额', '现金']
const orgNames = ['重庆公交集团', '一公司', '二公司', '三公司']

const pad2 = (value) => String(value).padStart(2, '0')
const formatDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const formatDisplayValue = (value) => (value === null || value === undefined || value === '' ? '-' : value)
const toMoney = (value) => Number(value).toFixed(2)

const generateMockData = () => {
  const data = []
  const todayText = formatDate(new Date())
  const todayOrderPrefix = todayText.replaceAll('-', '')

  for (let i = 1; i <= 65; i += 1) {
    const station = stationOptions[i % stationOptions.length]
    const payType = payTypes[i % payTypes.length]
    const customerType = customerTypes[i % customerTypes.length]
    const billType = billTypes[i % billTypes.length]
    const chargeType = chargeTypes[i % chargeTypes.length]
    const chargePolicy = chargePolicies[i % chargePolicies.length]
    const memberType = memberTypes[i % memberTypes.length]
    const endReason = endReasons[i % endReasons.length]
    const groupName = orgNames[i % orgNames.length]
    const orderDate = i <= 18 ? todayText : '2026-01-01'
    const orderDatePrefix = i <= 18 ? todayOrderPrefix : '20260101'
    const totalPower = 15 + (i % 50)
    const resultStatus = resultStatuses[i % 11 === 0 ? 1 : i % 17 === 0 ? 2 : 0]
    const startHour = 8 + (i % 14)
    const startMin = i % 60
    const duration = 30 + (i % 120)
    const endHour = startHour + Math.floor((startMin + duration) / 60)
    const endMin = (startMin + duration) % 60

    const sharpPower = Number((totalPower * 0.12).toFixed(2))
    const peakPower = Number((totalPower * 0.38).toFixed(2))
    const flatPower = Number((totalPower * 0.32).toFixed(2))
    const valleyPower = Number(Math.max(totalPower - sharpPower - peakPower - flatPower, 0).toFixed(2))

    const sharpBalance = resultStatus === '成功' ? toMoney(sharpPower * (0.88 + (i % 3) * 0.01)) : '0.00'
    const peakBalance = resultStatus === '成功' ? toMoney(peakPower * (0.92 + (i % 2) * 0.01)) : '0.00'
    const flatBalance = resultStatus === '成功' ? toMoney(flatPower * (0.84 + (i % 4) * 0.01)) : '0.00'
    const valleyBalance = resultStatus === '成功' ? toMoney(valleyPower * (0.72 + (i % 5) * 0.01)) : '0.00'
    const totalBasePowerBalance = resultStatus === '成功'
      ? toMoney(Number(sharpBalance) + Number(peakBalance) + Number(flatBalance) + Number(valleyBalance))
      : '0.00'
    const totalBaseServiceBalance = resultStatus === '成功' ? toMoney(totalPower * (0.18 + (i % 5) * 0.01)) : '0.00'
    const settlementElectricityFee = totalBasePowerBalance
    const settlementServiceFee = totalBaseServiceBalance
    const chargingBillAmount = resultStatus === '成功'
      ? toMoney(Number(settlementElectricityFee) + Number(settlementServiceFee))
      : '0.00'
    const discountAmount = resultStatus === '成功' ? toMoney(totalPower * (0.03 + (i % 4) * 0.01)) : '0.00'
    const orderSettlementAmount = resultStatus === '成功'
      ? toMoney(Math.max(0, Number(chargingBillAmount) - Number(discountAmount)))
      : '0.00'
    const actualPowerBalance = resultStatus === '成功'
      ? toMoney(Number(totalBasePowerBalance) * (0.97 + (i % 3) * 0.005))
      : '0.00'
    const actualServiceBalance = resultStatus === '成功'
      ? toMoney(Number(totalBaseServiceBalance) * (0.96 + (i % 4) * 0.005))
      : '0.00'
    const actualMoney = resultStatus === '成功'
      ? toMoney(Number(actualPowerBalance) + Number(actualServiceBalance))
      : '0.00'
    const receivedAmount = resultStatus === '成功' ? actualMoney : '0.00'
    const contractSettlementElectricityFee = resultStatus === '成功'
      ? toMoney(Number(settlementElectricityFee) * (i % 3 === 0 ? 0.95 : 1.05))
      : '0.00'
    const contractSettlementServiceFee = resultStatus === '成功'
      ? toMoney(Number(settlementServiceFee) * (i % 4 === 0 ? 0.8 : 1))
      : '0.00'
    const contractSettlementAmount = resultStatus === '成功'
      ? toMoney(Number(contractSettlementElectricityFee) + Number(contractSettlementServiceFee))
      : '0.00'
    const payTime = resultStatus === '成功'
      ? `${orderDate} ${pad2(Math.min(endHour + 1, 23))}:${pad2((endMin + 5) % 60)}:00`
      : ''
    const pileName = `${station.name}-桩${String((i % 8) + 1).padStart(2, '0')}`
    const gunNo = String((i % 2) + 1)
    const memberId = `MID${String(500000 + i)}`
    const memberName = `${memberType}${String(1000 + i)}`
    const subMemberName = i % 4 === 0 ? `子成员${String(2000 + i)}` : ''
    const userFlowNo = `UF${orderDatePrefix}${String(i).padStart(5, '0')}`
    const telephone = `138${String(10000000 + i).slice(-8)}`
    const card = `CARD${String(100000 + i)}`

    data.push({
      orderNo: `ORD${orderDatePrefix}${String(i).padStart(4, '0')}`,
      originalOrderNo: `ORIG-${String(i).padStart(5, '0')}`,
      stationCode: station.code,
      stationName: station.name,
      pileName,
      gunNo,
      vin: `LZYTATE${String(202600000 + i).padStart(9, '0')}`,
      memberId,
      memberName,
      subMemberName,
      userFlowNo,
      telephone,
      groupName,
      memberType,
      billType,
      chargeType,
      chargePolicy,
      endReason,
      payTime,
      card,
      payModeStr: payModes[i % payModes.length],
      payType,
      customerType,
      resultStatus,
      startTime: `${orderDate} ${pad2(startHour)}:${pad2(startMin)}:00`,
      endTime: `${orderDate} ${pad2(endHour)}:${pad2(endMin)}:00`,
      chargeDuration: `${Math.floor(duration / 60)}小时${duration % 60}分钟`,
      totalPower: toMoney(totalPower),
      sharpPower: toMoney(sharpPower),
      peakPower: toMoney(peakPower),
      flatPower: toMoney(flatPower),
      valleyPower: toMoney(valleyPower),
      sharpBalance,
      peakBalance,
      flatBalance,
      valleyBalance,
      totalBasePowerBalance,
      totalBaseServiceBalance,
      settlementElectricityFee,
      settlementServiceFee,
      chargingBillAmount,
      discountAmount,
      orderSettlementAmount,
      actualPowerBalance,
      actualServiceBalance,
      actualMoney,
      receivedAmount,
      contractSettlementElectricityFee,
      contractSettlementServiceFee,
      contractSettlementAmount,
      totalStartValue: toMoney(100 + i * 2),
      totalEndValue: toMoney(120 + i * 2),
      startSoc: `${20 + (i % 60)}%`,
      endSoc: `${50 + (i % 40)}%`,
      settleTime: `TRD${orderDatePrefix}${String(i).padStart(3, '0')}`,
      pileFlowNo: `FLOW-${String(i).padStart(6, '0')}`,
      pileNo: `PILE-${String((i % 20) + 1).padStart(3, '0')}`,
      plateNo: `渝A${String(10000 + i).slice(1)}`,
      source: i % 3 === 0 ? '外部导入' : '系统同步',
    })
  }

  return data
}

const mockOrderData = generateMockData()

const tableColumns = [
  { title: '订单号', key: 'orderNo', width: '12%' },
  { title: '原始订单流水号', key: 'originalOrderNo', width: '12%' },
  // { title: '站点编码', key: 'stationCode', width: '9%' },
  { title: '站点名称', key: 'stationName', width: '14%' },
  { title: '充电桩名称', key: 'pileName', width: '12%' },
  { title: '枪号', key: 'gunNo', width: '6%' },
  { title: 'VIN', key: 'vin', width: '13%' },
  { title: '会员ID', key: 'memberId', width: '10%' },
  { title: '会员名称', key: 'memberName', width: '10%' },
  { title: '子成员名称', key: 'subMemberName', width: '10%' },
  { title: '用户流水号', key: 'userFlowNo', width: '10%' },
  { title: '手机号', key: 'telephone', width: '10%' },
  { title: '归属组织', key: 'groupName', width: '10%' },
  { title: '会员类型', key: 'memberType', width: '9%' },
  { title: '订单业务类型', key: 'billType', width: '10%' },
  // { title: '客户类型', key: 'customerType', width: '9%' },
  { title: '业务模式', key: 'chargeType', width: '10%' },
  { title: '充电模式', key: 'chargePolicy', width: '10%' },
  { title: '停止原因', key: 'endReason', width: '10%' },
  { title: '订单状态', key: 'resultStatus', width: '9%' },
  { title: '开始时间', key: 'startTime', width: '10%' },
  { title: '结束时间', key: 'endTime', width: '10%' },
  { title: '支付时间', key: 'payTime', width: '10%' },
  { title: '充电时长', key: 'chargeDuration', width: '8%' },
  { title: '总电量（kWh）', key: 'totalPower', width: '8%' },
  { title: '尖电量（kWh）', key: 'sharpPower', width: '8%' },
  { title: '峰电量（kWh）', key: 'peakPower', width: '8%' },
  { title: '平电量（kWh）', key: 'flatPower', width: '8%' },
  { title: '谷电量（kWh）', key: 'valleyPower', width: '8%' },
  // { title: '结算电费(元)', key: 'settlementElectricityFee', width: '9%' },
  { title: '尖电费(元)', key: 'sharpBalance', width: '8%' },
  { title: '峰电费(元)', key: 'peakBalance', width: '8%' },
  { title: '平电费(元)', key: 'flatBalance', width: '8%' },
  { title: '谷电费(元)', key: 'valleyBalance', width: '8%' },
  { title: '账单总电费(元)', key: 'totalBasePowerBalance', width: '10%' },
  { title: '账单总服务费(元)', key: 'totalBaseServiceBalance', width: '10%' },
  { title: '总实收电费(元)', key: 'actualPowerBalance', width: '10%' },
  { title: '总实收服务费(元)', key: 'actualServiceBalance', width: '10%' },
  { title: '实收总金额(元)', key: 'actualMoney', width: '10%' },
  { title: '应收占位费(元)', key: 'occupationFee', width: '10%' },
  { title: '充电账单金额(元)', key: 'chargingBillAmount', width: '10%' },
  { title: '优惠总金额(元)', key: 'discountAmount', width: '10%' },
  // { title: '订单结算金额', key: 'orderSettlementAmount', width: '10%' },
  // { title: '实收金额', key: 'receivedAmount', width: '9%' },
  { title: '合同结算电费(元)', key: 'contractSettlementElectricityFee', width: '10%' },
  { title: '合同结算服务费(元)', key: 'contractSettlementServiceFee', width: '11%' },
  { title: '合同结算金额(元)', key: 'contractSettlementAmount', width: '10%' },
  { title: '总起始值（kWh）', key: 'totalStartValue', width: '8%' },
  { title: '总结束值（kWh）', key: 'totalEndValue', width: '8%' },
  { title: '开始SOC（%）', key: 'startSoc', width: '6%' },
  { title: '结束SOC（%）', key: 'endSoc', width: '6%' },
  { title: '第三方订单号', key: 'settleTime', width: '10%' },
  { title: '桩流水号', key: 'pileFlowNo', width: '10%' },
  { title: '桩体号', key: 'pileNo', width: '8%' },
  { title: '车牌号', key: 'plateNo', width: '8%' },
  { title: '数据来源', key: 'source', width: '8%' },
  { title: '卡号', key: 'card', width: '10%' },
  { title: '支付方式', key: 'payModeStr', width: '9%' },
  { title: '支付类型', key: 'payType', width: '8%' },
  { title: '操作', key: 'action', width: '8%' },
]

const orderDetailSections = [
  {
    title: '基础信息',
    fields: [
      { label: '订单号', key: 'orderNo' },
      { label: '原始订单流水号', key: 'originalOrderNo' },
      { label: '订单业务类型', key: 'billType' },
      // { label: '客户类型', key: 'customerType' },
      { label: '会员类型', key: 'memberType' },
      { label: '会员ID', key: 'memberId' },
      { label: '会员名称', key: 'memberName' },
      { label: '子成员名称', key: 'subMemberName' },
      { label: '用户流水号', key: 'userFlowNo' },
      { label: '归属组织', key: 'groupName' },
      { label: '手机号', key: 'telephone' },
      {
        label: '订单结果状态',
        key: 'resultStatus',
        render: (value) => (
          <span
            className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
              value === '成功' ? 'text-success bg-green-50' : value === '失败' ? 'text-danger bg-red-50' : 'text-warning bg-orange-50'
            }`}
          >
            {formatDisplayValue(value)}
          </span>
        ),
      },
      { label: '停止原因', key: 'endReason' },
      { label: '数据来源', key: 'source' },
    ],
  },
  {
    title: '站点与设备',
    fields: [
      // { label: '站点编码', key: 'stationCode' },
      { label: '站点名称', key: 'stationName' },
      { label: '充电桩名称', key: 'pileName' },
      { label: '枪号', key: 'gunNo' },
      { label: '桩体号', key: 'pileNo' },
      { label: '桩流水号', key: 'pileFlowNo' },
      { label: 'VIN', key: 'vin' },
      { label: '车牌号', key: 'plateNo' },
    ],
  },
  {
    title: '充电过程',
    fields: [
      { label: '业务模式', key: 'chargeType' },
      { label: '充电模式', key: 'chargePolicy' },
      { label: '开始时间', key: 'startTime' },
      { label: '结束时间', key: 'endTime' },
      { label: '支付时间', key: 'payTime' },
      { label: '充电时长', key: 'chargeDuration' },
      { label: '总电量（kWh）', key: 'totalPower', unit: ' kWh' },
      { label: '开始SOC（%）', key: 'startSoc' },
      { label: '结束SOC（%）', key: 'endSoc' },
      { label: '总起始值（kWh）', key: 'totalStartValue' },
      { label: '总结束值（kWh）', key: 'totalEndValue' },
      { label: '第三方订单号', key: 'settleTime' },
    ],
  },
  {
    title: '分时电量',
    fields: [
      { label: '尖电量（kWh）', key: 'sharpPower', unit: ' kWh' },
      { label: '峰电量（kWh）', key: 'peakPower', unit: ' kWh' },
      { label: '平电量（kWh）', key: 'flatPower', unit: ' kWh' },
      { label: '谷电量（kWh）', key: 'valleyPower', unit: ' kWh' },
    ],
  },
  {
    title: '支付信息',
    fields: [
      { label: '卡号', key: 'card' },
      { label: '支付方式', key: 'payModeStr' },
      { label: '支付类型', key: 'payType' },
    ],
  },
  {
    title: '账单金额',
    fields: [
      { label: '尖电费(元)', key: 'sharpBalance', unit: ' 元' },
      { label: '峰电费(元)', key: 'peakBalance', unit: ' 元' },
      { label: '平电费(元)', key: 'flatBalance', unit: ' 元' },
      { label: '谷电费(元)', key: 'valleyBalance', unit: ' 元' },
      { label: '充电账单金额(元)', key: 'chargingBillAmount', unit: ' 元' },
      { label: '账单总服务费(元)', key: 'totalBaseServiceBalance', unit: ' 元' },
      { label: '账单总电费(元)', key: 'totalBasePowerBalance', unit: ' 元' },
      { label: '应收占位费(元)', key: 'occupationFee', unit: ' 元' },
      { label: '结算服务费(元)', key: 'settlementServiceFee', unit: ' 元' },
      { label: '优惠总金额(元)', key: 'discountAmount', unit: ' 元' },
      // { label: '订单结算金额', key: 'orderSettlementAmount', unit: ' 元' },
      { label: '总实收电费(元)', key: 'actualPowerBalance', unit: ' 元' },
      { label: '总实收服务费(元)', key: 'actualServiceBalance', unit: ' 元' },
      { label: '实收总金额(元)', key: 'actualMoney', unit: ' 元' },
      // { label: '实收金额', key: 'receivedAmount', unit: ' 元' },
      { label: '合同结算电费(元)', key: 'contractSettlementElectricityFee', unit: ' 元' },
      { label: '合同结算服务费(元)', key: 'contractSettlementServiceFee', unit: ' 元' },
      { label: '合同结算金额(元)', key: 'contractSettlementAmount', unit: ' 元' },
    ],
  },
]

const MAX_DATE_RANGE_MS = 15 * 24 * 60 * 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const createTodayRange = () => {
  const today = formatDate(new Date())
  return { start: today, end: today }
}

const getDateDiffDays = (startValue, endValue) => {
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.abs(Math.round((end.getTime() - start.getTime()) / ONE_DAY_MS))
}

const getRangeError = (startValue, endValue) => {
  if (!startValue || !endValue) return ''
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  if (start > end) return '开始日期不能晚于结束日期'
  if (getDateDiffDays(startValue, endValue) > 15) return '日期范围最大支持选择15天'
  return ''
}

const DateRangePicker = ({ startDate, endDate, onChange, error }) => {
  const [open, setOpen] = useState(false)

  const chooseToday = () => {
    const today = createTodayRange()
    onChange(today.start, today.end)
    setOpen(false)
  }

  const chooseRecentDays = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    onChange(formatDate(start), formatDate(end))
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`w-full px-3 py-2 border rounded text-sm bg-white text-left flex items-center justify-between gap-2 transition-colors ${
          error ? 'border-danger text-danger' : 'border-gray-200 text-gray-700 focus:outline-none focus:border-primary'
        }`}
      >
        <span className="truncate">{startDate} 至 {endDate}</span>
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[360px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => onChange(event.target.value, endDate)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => onChange(startDate, event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button type="button" onClick={chooseToday} className="btn-secondary text-xs">今天</button>
              <button type="button" onClick={() => chooseRecentDays(7)} className="btn-secondary text-xs">近7天</button>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary text-xs">确定</button>
          </div>
          {error && <div className="mt-2 text-xs text-danger">{error}</div>}
        </div>
      )}
      {error && <div className="mt-1 text-xs text-danger">{error}</div>}
    </div>
  )
}

const templateRows = [
  {
    id: 'template-1',
    name: '订单基础表导入模板.xlsx',
    status: '可下载',
    operator: '系统',
    time: '2026-08-19 00:00:00',
    actionLabel: '下载',
  },
]

const OrderData = () => {
  const initialRange = createTodayRange()
  const [searchOriginalNo, setSearchOriginalNo] = useState('')
  const [searchStartDate, setSearchStartDate] = useState(initialRange.start)
  const [searchEndDate, setSearchEndDate] = useState(initialRange.end)
  const [searchPileNo, setSearchPileNo] = useState('')
  const [searchPlateNo, setSearchPlateNo] = useState('')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [importError, setImportError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const downloadCenter = useDownloadCenter({ templates: templateRows })

  const reportFields = useReportFields({
    storageKey: 'base-data:order-data',
    groups: [{ title: '订单数据字段', columns: tableColumns }],
    fixedKeys: ['orderNo', 'originalOrderNo', 'action'],
  })

  const rangeError = useMemo(() => getRangeError(searchStartDate, searchEndDate), [searchStartDate, searchEndDate])

  const filteredData = useMemo(() => {
    let data = [...mockOrderData]

    if (searchOriginalNo.trim()) {
      data = data.filter((item) => item.originalOrderNo.toLowerCase().includes(searchOriginalNo.toLowerCase()))
    }
    if (searchStartDate) {
      data = data.filter((item) => item.startTime >= `${searchStartDate} 00:00:00`)
    }
    if (searchEndDate) {
      data = data.filter((item) => item.endTime <= `${searchEndDate} 23:59:59`)
    }
    if (searchPileNo.trim()) {
      data = data.filter((item) => item.pileNo.toLowerCase().includes(searchPileNo.toLowerCase()))
    }
    if (searchPlateNo.trim()) {
      data = data.filter((item) => item.plateNo.toLowerCase().includes(searchPlateNo.toLowerCase()))
    }

    return data
  }, [searchOriginalNo, searchStartDate, searchEndDate, searchPileNo, searchPlateNo])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage])

  const handleReset = () => {
    const todayRange = createTodayRange()
    setSearchOriginalNo('')
    setSearchStartDate(todayRange.start)
    setSearchEndDate(todayRange.end)
    setSearchPileNo('')
    setSearchPlateNo('')
    setCurrentPage(1)
  }

  const handleExport = () => {
    if (rangeError) {
      downloadCenter.setDownloadCenterOpen(true)
      downloadCenter.setDownloadTab('export')
      return
    }

    downloadCenter.createExportTask({
      name: `订单基础表导出_${searchStartDate}_${searchEndDate}.xlsx`,
    })
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setImportError('文件格式不正确，仅支持 .xlsx、.xls、.csv 格式')
      return
    }
    setImportError('')
    setImportFile(file)
  }

  const handleImport = () => {
    if (!importFile) {
      setImportError('请选择导入文件')
      return
    }
    downloadCenter.createImportTask({ name: importFile.name })
    setImportModalOpen(false)
    setImportFile(null)
    setImportError('')
  }

  const openDetail = (order) => {
    setSelectedOrder(order)
    setDetailModalOpen(true)
  }

  const getStatusClass = (status) => {
    if (status === '成功') return 'text-success bg-green-50'
    if (status === '失败') return 'text-danger bg-red-50'
    return 'text-warning bg-orange-50'
  }

  const renderTableCell = (row, col) => {
    if (col.key === 'resultStatus') {
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(row.resultStatus)}`}>
          {formatDisplayValue(row.resultStatus)}
        </span>
      )
    }

    if (col.key === 'source') {
      return (
        <span className={`text-xs font-medium ${row.source === '系统同步' ? 'text-primary' : 'text-warning'}`}>
          {formatDisplayValue(row.source)}
        </span>
      )
    }

    if (col.key === 'action') {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            openDetail(row)
          }}
          className="text-primary hover:opacity-80 inline-flex items-center gap-1 text-xs"
        >
          <Eye className="w-3 h-3" />
          查看
        </button>
      )
    }

    return formatDisplayValue(row[col.key])
  }

  const renderDetailField = (field, order) => {
    if (field.render) return field.render(order[field.key], order)
    const value = formatDisplayValue(order[field.key])
    return value === '-' ? value : `${value}${field.unit || ''}`
  }

  const summaryFields = [
    { label: '订单号', key: 'orderNo' },
    { label: '站点名称', key: 'stationName' },
    { label: '充电桩名称', key: 'pileName' },
    { label: '实收总金额(元)', key: 'actualMoney' },
  ]

  const detailCardClass = 'rounded-lg border border-gray-200 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
  const sectionTitleClass = 'flex items-center gap-2 mb-3'
  const sectionBarClass = 'h-5 w-1 bg-primary rounded-full flex-shrink-0'
  const sectionHeadingClass = 'text-sm font-semibold text-gray-900'
  const fieldCardClass = 'min-w-0 rounded-md border border-gray-100 bg-gray-50/70 px-2.5 py-1.5'

  return (
    <div className="page-container h-full flex flex-col">
      <div className="page-content flex-1 flex flex-col">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">原始订单流水号</label>
              <input
                type="text"
                placeholder="请输入原始订单流水号"
                value={searchOriginalNo}
                onChange={(event) => setSearchOriginalNo(event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">订单日期</label>
              <DateRangePicker
                startDate={searchStartDate}
                endDate={searchEndDate}
                error={rangeError}
                onChange={(start, end) => {
                  setSearchStartDate(start)
                  setSearchEndDate(end)
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">桩体号</label>
              <input
                type="text"
                placeholder="请输入桩体号"
                value={searchPileNo}
                onChange={(event) => setSearchPileNo(event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">车牌号</label>
              <input
                type="text"
                placeholder="请输入车牌号"
                value={searchPlateNo}
                onChange={(event) => setSearchPlateNo(event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!rangeError) setCurrentPage(1)
              }}
              disabled={Boolean(rangeError)}
              className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              搜索
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary text-sm">重置</button>
            <div className="flex-1" />
            <button type="button" onClick={() => setImportModalOpen(true)} className="btn-primary text-sm flex items-center gap-1">
              <Upload className="w-4 h-4" />
              导入
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={Boolean(rangeError)}
              className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
            <ReportFieldControls fields={reportFields} showExport={false} />
          </div>
          {rangeError && <div className="mt-3 text-xs text-danger">{rangeError}</div>}
        </div>

        <div className="relative overflow-auto flex-1 bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {reportFields.visibleColumns.map((col) => (
                  col.key === 'action' ? (
                    <th
                      key={col.key}
                      className="sticky right-0 z-30 px-3 py-3 text-left text-xs font-bold text-gray-700 border-b border-gray-200 whitespace-nowrap bg-gray-100"
                      style={{ width: col.width, minWidth: col.width, boxShadow: '-10px 0 12px -12px rgba(15, 23, 42, 0.45)' }}
                    >
                      {col.title}
                    </th>
                  ) : (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left text-xs font-bold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                    style={{ width: col.width }}
                  >
                    {col.title}
                  </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, index) => (
                <tr
                  key={row.orderNo}
                  onClick={() => openDetail(row)}
                  className={`group hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  {reportFields.visibleColumns.map((col) => (
                    col.key === 'action' ? (
                      <td
                        key={col.key}
                        className={`sticky right-0 z-20 px-3 py-2.5 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis ${
                          index % 2 === 0 ? 'bg-white group-hover:bg-gray-50' : 'bg-gray-50/30 group-hover:bg-gray-50'
                        }`}
                        style={{ width: col.width, minWidth: col.width, boxShadow: '-10px 0 12px -12px rgba(15, 23, 42, 0.35)' }}
                        title={String(row[col.key] ?? '')}
                      >
                        {renderTableCell(row, col)}
                      </td>
                    ) : (
                      <td
                        key={col.key}
                        className="px-3 py-2.5 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                        title={String(row[col.key] ?? '')}
                      >
                        {renderTableCell(row, col)}
                      </td>
                    )
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedData.length === 0 && <div className="text-center py-8 text-gray-500">未找到匹配数据</div>}
        </div>

        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-500">共 {filteredData.length} 条记录，当前第 {currentPage} / {totalPages} 页</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              首页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded transition-colors ${
                  currentPage === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              末页
            </button>
          </div>
        </div>

        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold">数据说明：</span>
              订单数据表按订单号为唯一标识，支持通过列设置控制列表字段显隐；导出字段可在导出弹窗中二次勾选。
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedOrder(null) }}
        title="订单详情"
        showFooter={false}
        widthClass="max-w-lg"
      >
        {selectedOrder && (
          <div className="space-y-3 text-sm">
            <div className={`${detailCardClass} bg-gray-50`}>
              <div className={sectionTitleClass}>
                <span className={sectionBarClass} />
                <div>
                  <h4 className={sectionHeadingClass}>订单概览</h4>
                  <p className="mt-1 text-xs text-gray-500">查看订单基础信息、设备信息与结算详情</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                {summaryFields.map((field) => (
                  <div key={field.key} className="min-w-0 rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
                    <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                    <div className="text-sm font-semibold text-gray-900 truncate" title={String(selectedOrder[field.key] ?? '')}>{renderDetailField(field, selectedOrder)}</div>
                  </div>
                ))}
              </div>
            </div>

            {orderDetailSections.map((section) => (
              <div key={section.title} className={detailCardClass}>
                <div className={sectionTitleClass}>
                  <span className={sectionBarClass} />
                  <h4 className={sectionHeadingClass}>{section.title}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  {section.fields.map((field) => (
                    <div key={field.key} className={fieldCardClass}>
                      <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                      <div className="text-sm font-medium text-gray-900 break-words leading-snug">{renderDetailField(field, selectedOrder)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportFile(null); setImportError('') }} title="导入订单数据" onConfirm={handleImport}>
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('order-import-file').click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">{importFile ? `已选择：${importFile.name}` : '点击上传或拖拽文件到此处'}</p>
            <p className="text-xs text-gray-400">支持 .xlsx、.xls、.csv 格式</p>
            <input id="order-import-file" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          </div>
          {importError && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-danger">{importError}</div>}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">导入文件格式要求</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              <p>文件需包含订单号、原始订单流水号、站点/桩体信息、会员信息、充电/支付信息、分时电量和结算金额等字段。</p>
              <p className="mt-2 text-red-500">注：导入时将自动校验数据格式，不符合规范的数据不允许导入。</p>
            </div>
          </div>
        </div>
      </Modal>

      <DownloadCenterModal center={downloadCenter} />
    </div>
  )
}

export default OrderData
