import React, { useMemo, useRef, useState } from 'react'
import { CheckSquare, ChevronDown, ChevronRight, Edit, Plus, Power, Search, Trash2, XCircle } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'

const SETTLEMENT_TYPES = {
  ENERGY: '按电量',
  RATIO: '按比例',
}

const PERIODS = [
  ['sharp', '尖'],
  ['peak', '峰'],
  ['flat', '平'],
  ['valley', '谷'],
]

const CUSTOMERS = [
  { customerNo: 'BUS-C001', customerName: '重庆公交集团' },
  { customerNo: 'BUS-C002', customerName: '两江公交公司' },
  { customerNo: 'EXT-C001', customerName: '两江大客户' },
  { customerNo: 'EXT-C002', customerName: '新电途企业客户' },
  { customerNo: 'EXT-C003', customerName: '园区物流车队' },
]

const STATION_OPTIONS = [
  { code: 'ST001', name: '中心广场充电站' },
  { code: 'ST002', name: '高新园区充电站' },
  { code: 'ST003', name: '火车站充电站' },
  { code: 'ST004', name: '体育馆充电站' },
  { code: 'ST005', name: '机场充电站' },
  { code: 'ST006', name: '大学城充电站' },
  { code: 'ST007', name: '工业园充电站' },
  { code: 'ST008', name: '物流中心充电站' },
  { code: 'ST009', name: '医院充电站' },
  { code: 'ST010', name: '商业中心充电站' },
]

const columns = [
  { key: 'customerNo', title: '客户编号', width: 140 },
  { key: 'customerName', title: '客户名称', width: 180 },
  { key: 'settlementType', title: '结算类型', width: 120 },
  { key: 'stationSummary', title: '结算充电站', width: 180 },
  { key: 'ruleDetail', title: '结算规则详情', width: 460 },
  { key: 'startDate', title: '生效开始日期', width: 140 },
  { key: 'endDate', title: '生效结束日期', width: 140 },
  { key: 'status', title: '规则状态', width: 110 },
  { key: 'creator', title: '创建人', width: 110 },
  { key: 'createdAt', title: '创建时间', width: 170 },
  { key: 'action', title: '操作', width: 210 },
]

const emptyPrices = { sharp: '', peak: '', flat: '', valley: '' }
const emptyRatios = { electricity: '', service: '' }

const emptyForm = {
  id: null,
  customerNo: '',
  customerName: '',
  settlementStations: [],
  settlementType: SETTLEMENT_TYPES.ENERGY,
  startDate: '',
  endDate: '',
  longTerm: false,
  status: '启用',
  electricityPrices: { ...emptyPrices },
  servicePrices: { ...emptyPrices },
  externalRatios: { ...emptyRatios },
}

const initialRules = [
  {
    id: 1,
    customerNo: 'BUS-C001',
    customerName: '重庆公交集团',
    settlementStations: ['ST001', 'ST002', 'ST003'],
    settlementType: SETTLEMENT_TYPES.ENERGY,
    startDate: '2026-01-01',
    endDate: '长期有效',
    status: '启用',
    creator: '管理员',
    createdAt: '2026-08-01 09:20:00',
    electricityPrices: { sharp: '0.82', peak: '0.76', flat: '0.61', valley: '0.38' },
    servicePrices: { sharp: '0.12', peak: '0.10', flat: '0.08', valley: '0.05' },
    externalRatios: { ...emptyRatios },
    referencedOrderCount: 12,
  },
  {
    id: 2,
    customerNo: 'EXT-C001',
    customerName: '两江大客户',
    settlementStations: ['ST004', 'ST005'],
    settlementType: SETTLEMENT_TYPES.RATIO,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    status: '启用',
    creator: '管理员',
    createdAt: '2026-08-02 10:15:00',
    electricityPrices: { ...emptyPrices },
    servicePrices: { ...emptyPrices },
    externalRatios: { electricity: '95.00', service: '80.00' },
    referencedOrderCount: 4,
  },
  {
    id: 3,
    customerNo: 'EXT-C002',
    customerName: '新电途企业客户',
    settlementStations: ['ST006'],
    settlementType: SETTLEMENT_TYPES.RATIO,
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    status: '停用',
    creator: '运营专员',
    createdAt: '2026-08-03 14:30:00',
    electricityPrices: { ...emptyPrices },
    servicePrices: { ...emptyPrices },
    externalRatios: { electricity: '110.00', service: '100.00' },
    referencedOrderCount: 0,
  },
]

const toNumber = (value) => Number.parseFloat(value)
const formatTwo = (value) => (value === '' || value === null || value === undefined ? '' : toNumber(value).toFixed(2))
const getPrices = (rule, key) => ({ ...emptyPrices, ...(rule[key] || (key === 'electricityPrices' ? rule.busPrices : null) || {}) })

const getStationSummary = (stationCodes = []) => {
  if (!stationCodes.length) return '-'
  if (stationCodes.length === STATION_OPTIONS.length) return '全部站点'
  const names = stationCodes.map((code) => STATION_OPTIONS.find((station) => station.code === code)?.name || code)
  return names.length > 2 ? `${names.slice(0, 2).join('、')} 等 ${names.length} 个站点` : names.join('、')
}

const getRuleDetail = (rule) => {
  if (rule.settlementType === SETTLEMENT_TYPES.ENERGY) {
    const electricity = getPrices(rule, 'electricityPrices')
    const service = getPrices(rule, 'servicePrices')
    const priceText = PERIODS.map(([key, label]) => `${label}${electricity[key] || '-'}`).join('/')
    const serviceText = PERIODS.map(([key, label]) => `${label}${service[key] || '-'}`).join('/')
    return `适用 ${rule.settlementStations?.length || 0} 个站点；电价：${priceText}；服务费：${serviceText}`
  }
  const r = rule.externalRatios
  return `适用 ${rule.settlementStations?.length || 0} 个站点；电费比例 ${r.electricity}%；服务费比例 ${r.service}%`
}

const isRangeOverlap = (aStart, aEnd, bStart, bEnd) => {
  const aEndValue = aEnd === '长期有效' ? '9999-12-31' : aEnd
  const bEndValue = bEnd === '长期有效' ? '9999-12-31' : bEnd
  return aStart <= bEndValue && bStart <= aEndValue
}

export const calculateLargeCustomerSettlement = (order, rule) => {
  if (!rule || rule.status !== '启用') {
    return {
      electricityFee: Number(order.platformElectricityFee || 0),
      serviceFee: Number(order.platformServiceFee || 0),
      totalAmount: Number(order.platformTotalAmount || 0),
      fallback: true,
      message: '未匹配启用规则，降级为平台默认电价',
    }
  }

  if (rule.settlementType === SETTLEMENT_TYPES.ENERGY) {
    const power = order.periodPower || {}
    const electricityPrices = getPrices(rule, 'electricityPrices')
    const servicePrices = getPrices(rule, 'servicePrices')
    const electricityFee = PERIODS.reduce((sum, [key]) => sum + Number(power[key] || 0) * Number(electricityPrices[key] || 0), 0)
    const serviceFee = PERIODS.reduce((sum, [key]) => sum + Number(power[key] || 0) * Number(servicePrices[key] || 0), 0)
    return {
      electricityFee: Number(electricityFee.toFixed(2)),
      serviceFee: Number(serviceFee.toFixed(2)),
      totalAmount: Number((electricityFee + serviceFee).toFixed(2)),
      fallback: false,
    }
  }

  const electricityFee = Number(order.platformElectricityFee || 0) * Number(rule.externalRatios.electricity || 0) / 100
  const serviceFee = Number(order.platformServiceFee || 0) * Number(rule.externalRatios.service || 0) / 100
  return {
    electricityFee: Number(electricityFee.toFixed(2)),
    serviceFee: Number(serviceFee.toFixed(2)),
    totalAmount: Number((electricityFee + serviceFee).toFixed(2)),
    fallback: false,
  }
}

const Cell = ({ value, className = '' }) => (
  <span title={String(value ?? '-')} className={`block overflow-hidden text-ellipsis whitespace-nowrap ${className}`}>
    {value ?? '-'}
  </span>
)

const cloneForm = (rule) => ({
  ...rule,
  settlementStations: [...(rule.settlementStations || [])],
  electricityPrices: getPrices(rule, 'electricityPrices'),
  servicePrices: getPrices(rule, 'servicePrices'),
  externalRatios: { ...emptyRatios, ...(rule.externalRatios || {}) },
})

const LargeCustomerRuleConfig = () => {
  const [rules, setRules] = useState(initialRules)
  const [selectedIds, setSelectedIds] = useState([])
  const [filters, setFilters] = useState({ keyword: '', settlementType: '', status: '' })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [logs, setLogs] = useState([])
  const [stationTreeOpen, setStationTreeOpen] = useState(false)
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false)
  const [widths, setWidths] = useState(() => {
    const saved = localStorage.getItem('largeCustomerRuleWidths')
    return saved ? JSON.parse(saved) : Object.fromEntries(columns.map((col) => [col.key, col.width]))
  })
  const tableRef = useRef(null)
  const reportFields = useReportFields({
    storageKey: 'settlement:large-customer-rules',
    groups: [{ title: '大客户结算规则字段', columns }],
    fixedKeys: ['customerNo', 'customerName', 'action'],
  })

  const visibleColumns = reportFields.visibleColumns
  const allStationSelected = form.settlementStations.length === STATION_OPTIONS.length

  const addLog = (type, content) => {
    setLogs((prev) => [{ type, content, user: '当前用户', time: new Date().toLocaleString('zh-CN') }, ...prev].slice(0, 6))
  }

  const filteredRules = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return rules.filter((rule) => {
      const matchKeyword = !keyword || [rule.customerNo, rule.customerName].some((value) => value.toLowerCase().includes(keyword))
      const matchType = !filters.settlementType || rule.settlementType === filters.settlementType
      const matchStatus = !filters.status || rule.status === filters.status
      return matchKeyword && matchType && matchStatus
    })
  }, [filters, rules])

  const allSelected = filteredRules.length > 0 && filteredRules.every((rule) => selectedIds.includes(rule.id))

  const validateDecimal = (value, { max = Infinity } = {}) => {
    if (value === '' || value === null || value === undefined) return '必填'
    if (!/^\d+(\.\d{1,2})?$/.test(String(value))) return '请输入非负数，最多保留 2 位小数'
    const number = toNumber(value)
    if (number < 0) return '不能为负数'
    if (number > max) return `不能超过 ${max}`
    return ''
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.customerNo) nextErrors.customerNo = '请选择客户'
    if (!form.settlementStations.length) nextErrors.settlementStations = '请选择至少一个结算充电站'
    if (!form.settlementType) nextErrors.settlementType = '请选择结算类型'
    if (!form.startDate) nextErrors.startDate = '请选择生效开始日期'
    if (!form.longTerm && !form.endDate) nextErrors.endDate = '请选择生效结束日期'
    const finalEndDate = form.longTerm ? '长期有效' : form.endDate
    if (form.startDate && !form.longTerm && form.endDate && form.endDate < form.startDate) nextErrors.endDate = '结束日期不能早于开始日期'

    if (form.settlementType === SETTLEMENT_TYPES.ENERGY) {
      ;['electricityPrices', 'servicePrices'].forEach((group) => {
        PERIODS.forEach(([key]) => {
          const message = validateDecimal(form[group][key])
          if (message) nextErrors[`${group}.${key}`] = message
        })
      })
    } else {
      ;['electricity', 'service'].forEach((key) => {
        const message = validateDecimal(form.externalRatios[key], { max: 999.99 })
        if (message) nextErrors[`externalRatios.${key}`] = message
      })
    }

    const hasOverlap = rules.some((rule) => (
      rule.id !== form.id &&
      rule.customerNo === form.customerNo &&
      rule.status === '启用' &&
      form.status === '启用' &&
      form.startDate &&
      finalEndDate &&
      isRangeOverlap(form.startDate, finalEndDate, rule.startDate, rule.endDate)
    ))
    if (hasOverlap) nextErrors.overlap = '同一客户、同一时间段内不允许存在多条同时生效的结算规则'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const openCreate = () => {
    setForm(cloneForm(emptyForm))
    setErrors({})
    setStationTreeOpen(false)
    setStationDropdownOpen(false)
    setModal('create')
  }

  const openEdit = (rule) => {
    setForm({
      ...cloneForm(rule),
      longTerm: rule.endDate === '长期有效',
      endDate: rule.endDate === '长期有效' ? '' : rule.endDate,
    })
    setErrors({})
    setStationTreeOpen(false)
    setStationDropdownOpen(false)
    setModal('edit')
  }

  const normalizePrices = (prices) => Object.fromEntries(Object.entries(prices).map(([key, value]) => [key, formatTwo(value)]))

  const saveRule = () => {
    if (!validateForm()) return
    const customer = CUSTOMERS.find((item) => item.customerNo === form.customerNo)
    const normalized = {
      ...form,
      customerName: customer.customerName,
      endDate: form.longTerm ? '长期有效' : form.endDate,
      settlementStations: [...form.settlementStations],
      electricityPrices: normalizePrices(form.electricityPrices),
      servicePrices: normalizePrices(form.servicePrices),
      busPrices: normalizePrices(form.electricityPrices),
      externalRatios: Object.fromEntries(Object.entries(form.externalRatios).map(([key, value]) => [key, formatTwo(value)])),
      creator: form.creator || '当前用户',
      createdAt: form.createdAt || new Date().toLocaleString('zh-CN'),
      referencedOrderCount: form.referencedOrderCount || 0,
    }

    if (modal === 'create') {
      const nextRule = { ...normalized, id: Date.now() }
      setRules((prev) => [nextRule, ...prev])
      addLog('新增', `新增 ${nextRule.customerName} 结算规则`)
    } else {
      setRules((prev) => prev.map((rule) => (rule.id === normalized.id ? normalized : rule)))
      addLog('编辑', `编辑 ${normalized.customerName} 结算规则`)
    }
    setStationDropdownOpen(false)
    setModal(null)
  }

  const setRuleStatus = (ids, status) => {
    if (!ids.length) return
    setRules((prev) => prev.map((rule) => (ids.includes(rule.id) ? { ...rule, status } : rule)))
    addLog(status, `${status} ${ids.length} 条结算规则`)
    setSelectedIds([])
  }

  const deleteRule = (rule) => {
    if (rule.referencedOrderCount > 0) {
      alert('已有订单引用，请先停用，禁止直接删除')
      return
    }
    if (!window.confirm(`确认删除 ${rule.customerName} 的结算规则？`)) return
    setRules((prev) => prev.filter((item) => item.id !== rule.id))
    setSelectedIds((prev) => prev.filter((id) => id !== rule.id))
    addLog('删除', `删除 ${rule.customerName} 结算规则`)
  }

  const handleSettlementTypeChange = (settlementType) => {
    setForm((prev) => ({
      ...prev,
      settlementType,
      electricityPrices: { ...emptyPrices },
      servicePrices: { ...emptyPrices },
      externalRatios: { ...emptyRatios },
    }))
    setErrors({})
  }

  const updateNumber = (path, value) => {
    const [group, key] = path.split('.')
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }))
  }

  const toggleStation = (code) => {
    setForm((prev) => ({
      ...prev,
      settlementStations: prev.settlementStations.includes(code)
        ? prev.settlementStations.filter((item) => item !== code)
        : [...prev.settlementStations, code],
    }))
  }

  const toggleAllStations = () => {
    setForm((prev) => ({
      ...prev,
      settlementStations: allStationSelected ? [] : STATION_OPTIONS.map((station) => station.code),
    }))
  }

  const handleResizeStart = (event, key) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths[key] || 120
    const handleMove = (moveEvent) => {
      setWidths((prev) => ({ ...prev, [key]: Math.max(90, startWidth + moveEvent.clientX - startX) }))
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      setWidths((current) => {
        localStorage.setItem('largeCustomerRuleWidths', JSON.stringify(current))
        return current
      })
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const renderCell = (rule, col) => {
    if (col.key === 'stationSummary') return <Cell value={getStationSummary(rule.settlementStations)} />
    if (col.key === 'ruleDetail') return <Cell value={getRuleDetail(rule)} />
    if (col.key === 'status') {
      return <span className={`px-2 py-1 rounded text-xs ${rule.status === '启用' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{rule.status}</span>
    }
    if (col.key === 'action') {
      return (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <button onClick={() => openEdit(rule)} className="text-primary hover:underline inline-flex items-center gap-1"><Edit className="w-4 h-4" />编辑</button>
          <button onClick={() => setRuleStatus([rule.id], rule.status === '启用' ? '停用' : '启用')} className="text-primary hover:underline inline-flex items-center gap-1">
            <Power className="w-4 h-4" />{rule.status === '启用' ? '停用' : '启用'}
          </button>
          <button onClick={() => deleteRule(rule)} className="text-red-600 hover:underline inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />删除</button>
        </div>
      )
    }
    return <Cell value={rule[col.key]} />
  }

  const renderPriceGroup = (group, title, markerClassName) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${markerClassName}`}>{title}</span>
        <span className="text-xs text-gray-400">尖 / 峰 / 平 / 谷分别配置</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PERIODS.map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}时段（元/kWh）<span className="text-red-500">*</span></label>
            <input type="number" min="0" step="0.01" value={form[group][key]} onChange={(event) => updateNumber(`${group}.${key}`, event.target.value)} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors[`${group}.${key}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            {errors[`${group}.${key}`] && <p className="text-xs text-red-500 mt-1">{errors[`${group}.${key}`]}</p>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-container min-w-0 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex flex-col gap-2" style={{ height: '16%' }}>
        <div className="flex items-center gap-2" style={{ height: '52%' }}>
          <div className="flex items-center gap-2 min-w-0" style={{ width: '34%' }}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={filters.keyword}
              onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
              placeholder="客户名称、客户编号"
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select value={filters.settlementType} onChange={(event) => setFilters((prev) => ({ ...prev, settlementType: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '18%' }}>
            <option value="">结算类型</option>
            <option value={SETTLEMENT_TYPES.ENERGY}>按电量</option>
            <option value={SETTLEMENT_TYPES.RATIO}>按比例</option>
          </select>
          <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '16%' }}>
            <option value="">规则状态</option>
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
          <button onClick={() => addLog('搜索', '搜索大客户结算规则列表')} className="btn-primary text-sm flex items-center gap-1"><Search className="w-4 h-4" />搜索</button>
          <button onClick={() => setFilters({ keyword: '', settlementType: '', status: '' })} className="btn-secondary text-sm">重置</button>
        </div>
        <div className="flex items-center justify-between" style={{ height: '48%' }}>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />新增规则</button>
            <button onClick={() => setRuleStatus(selectedIds, '启用')} className="btn-secondary text-sm flex items-center gap-1"><CheckSquare className="w-4 h-4" />批量启用</button>
            <button onClick={() => setRuleStatus(selectedIds, '停用')} className="btn-secondary text-sm flex items-center gap-1"><XCircle className="w-4 h-4" />批量停用</button>
          </div>
          <div className="flex items-center gap-2">
            <ReportFieldControls fields={reportFields} onExport={(keys) => addLog('导出', `导出 ${keys.length} 个字段`)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-0 overflow-auto" style={{ height: '74%' }} ref={tableRef}>
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: visibleColumns.reduce((sum, col) => sum + (widths[col.key] || col.width), 48) + 48 }}>
          <thead className="sticky top-0 z-20 bg-gray-100">
            <tr>
              <th className="border border-gray-300 text-center bg-gray-100" style={{ width: 48, minWidth: 48 }}>
                <input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? filteredRules.map((rule) => rule.id) : [])} />
              </th>
              {visibleColumns.map((col) => (
                <th key={col.key} className={`border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 z-30 bg-gray-100' : 'bg-gray-100'}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                  <div className="flex items-center justify-center gap-1 min-w-0">
                    <span title={col.title} className="overflow-hidden text-ellipsis">{col.title}</span>
                    <span onMouseDown={(event) => handleResizeStart(event, col.key)} className="cursor-col-resize w-1 h-4 bg-gray-300 hover:bg-primary flex-shrink-0" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr key={rule.id} className={`hover:bg-blue-50 ${selectedIds.includes(rule.id) ? 'bg-blue-50' : 'bg-white'}`}>
                <td className="border border-gray-200 text-center align-middle" style={{ width: 48 }}>
                  <input type="checkbox" checked={selectedIds.includes(rule.id)} onChange={(event) => setSelectedIds(event.target.checked ? [...selectedIds, rule.id] : selectedIds.filter((id) => id !== rule.id))} />
                </td>
                {visibleColumns.map((col) => (
                  <td key={col.key} className={`border border-gray-200 px-2 py-2 text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 bg-white z-10' : ''}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                    {renderCell(rule, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRules.length === 0 && <div className="text-center py-10 text-gray-500">未找到匹配的结算规则</div>}
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-3 p-3 flex items-center justify-between" style={{ height: '10%' }}>
        <div className="text-sm text-gray-600">共 <b className="text-primary">{filteredRules.length}</b> 条规则，已选 <b className="text-primary">{selectedIds.length}</b> 条</div>
        <div className="text-xs text-gray-500 truncate max-w-[60%]">{logs[0] ? `最近操作：${logs[0].type} ${logs[0].time} ${logs[0].content}` : '历史订单不回溯重算，规则变更仅作用于后续新增订单。'}</div>
      </div>

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? '新增大客户结算规则' : '编辑大客户结算规则'} showFooter={false}>
        <div className="space-y-4">
          {errors.overlap && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">{errors.overlap}</div>}
          <section>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-1 border-b">基础信息</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称<span className="text-red-500">*</span></label>
                <select value={form.customerNo} onChange={(event) => {
                  const customer = CUSTOMERS.find((item) => item.customerNo === event.target.value)
                  setForm((prev) => ({ ...prev, customerNo: event.target.value, customerName: customer?.customerName || '' }))
                }} className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:border-primary ${errors.customerNo ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <option value="">请选择大客户档案</option>
                  {CUSTOMERS.map((customer) => <option key={customer.customerNo} value={customer.customerNo}>{customer.customerName}（{customer.customerNo}）</option>)}
                </select>
                {errors.customerNo && <p className="text-xs text-red-500 mt-1">{errors.customerNo}</p>}
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">结算充电站<span className="text-red-500">*</span></label>
                  <button type="button" onClick={toggleAllStations} className="text-xs text-primary hover:underline">{allStationSelected ? '取消全选' : '全选'}</button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStationDropdownOpen((open) => !open)}
                    className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:border-primary flex items-center justify-between gap-2 ${errors.settlementStations ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  >
                    <span className={`truncate ${form.settlementStations.length ? 'text-gray-700' : 'text-gray-400'}`}>
                      {form.settlementStations.length ? `已选择 ${form.settlementStations.length} 个站点：${getStationSummary(form.settlementStations)}` : '请选择结算充电站'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${stationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {stationDropdownOpen && (
                    <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-64 overflow-auto p-2">
                      <div className="flex items-center gap-2 px-2 py-2 hover:bg-blue-50 rounded">
                        <button
                          type="button"
                          onClick={() => setStationTreeOpen((open) => !open)}
                          className="text-gray-500 hover:text-primary"
                          title={stationTreeOpen ? '收起' : '展开'}
                        >
                          {stationTreeOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <label className="flex items-center gap-2 text-sm text-gray-700 flex-1 cursor-pointer">
                          <input type="checkbox" checked={allStationSelected} onChange={toggleAllStations} />
                          <span className="font-medium">全部充电站</span>
                          <span className="text-xs text-gray-400">({STATION_OPTIONS.length})</span>
                        </label>
                      </div>
                      {stationTreeOpen && (
                        <div className="ml-7 mt-1 space-y-1">
                          {STATION_OPTIONS.map((station) => (
                            <label key={station.code} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 rounded cursor-pointer">
                              <input type="checkbox" checked={form.settlementStations.includes(station.code)} onChange={() => toggleStation(station.code)} />
                              <span className="truncate" title={`${station.name}（${station.code}）`}>{station.name}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{station.code}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.settlementStations && <p className="text-xs text-red-500 mt-1">{errors.settlementStations}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结算类型<span className="text-red-500">*</span></label>
                <div className="flex gap-4 h-9 items-center">
                  {[SETTLEMENT_TYPES.ENERGY, SETTLEMENT_TYPES.RATIO].map((type) => (
                    <label key={type} className="flex items-center gap-1 text-sm text-gray-700">
                      <input type="radio" checked={form.settlementType === type} onChange={() => handleSettlementTypeChange(type)} />
                      {type}
                    </label>
                  ))}
                </div>
                {errors.settlementType && <p className="text-xs text-red-500 mt-1">{errors.settlementType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">规则状态</label>
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="启用">启用</option>
                  <option value="停用">停用</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生效开始日期<span className="text-red-500">*</span></label>
                <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.startDate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生效结束日期<span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="date" disabled={form.longTerm} value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} className={`flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.endDate ? 'border-red-400 bg-red-50' : 'border-gray-200'} ${form.longTerm ? 'bg-gray-50' : ''}`} />
                  <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                    <input type="checkbox" checked={form.longTerm} onChange={(event) => setForm((prev) => ({ ...prev, longTerm: event.target.checked, endDate: event.target.checked ? '' : prev.endDate }))} />
                    长期有效
                  </label>
                </div>
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-1 border-b">结算计价配置</h4>
            {form.settlementType === SETTLEMENT_TYPES.ENERGY ? (
              <div className="space-y-4">
                {renderPriceGroup('electricityPrices', '电价', 'bg-blue-50 text-blue-700 border border-blue-100')}
                {renderPriceGroup('servicePrices', '服务费', 'bg-emerald-50 text-emerald-700 border border-emerald-100')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['electricity', '电费结算比例（%）'],
                  ['service', '服务费结算比例（%）'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}<span className="text-red-500">*</span></label>
                    <input type="number" min="0" max="999.99" step="0.01" value={form.externalRatios[key]} onChange={(event) => updateNumber(`externalRatios.${key}`, event.target.value)} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors[`externalRatios.${key}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    {errors[`externalRatios.${key}`] && <p className="text-xs text-red-500 mt-1">{errors[`externalRatios.${key}`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={saveRule} className="btn-primary text-sm">保存</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LargeCustomerRuleConfig
