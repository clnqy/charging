import React, { useMemo, useRef, useState } from 'react'
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
  Edit,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import Modal from '../../components/Modal'

const baseColumns = [
  { key: 'stationName', name: '站点名称', width: 150 },
  { key: 'vehicleNo', name: '车辆自编号', width: 130, fixed: true, required: true },
  { key: 'plateNo', name: '车牌号', width: 120, fixed: true, required: true },
  { key: 'lineNo', name: '线路号', width: 90 },
  { key: 'orgName', name: '组织名称', width: 150, required: true },
  { key: 'deptName', name: '部门名称', width: 150, required: true },
  { key: 'assetValue', name: '资产原值', width: 120, type: 'number' },
  { key: 'vehicleCategory', name: '车辆分类', width: 120 },
  { key: 'registerDate', name: '入籍日期', width: 120, type: 'date' },
  { key: 'usedYears', name: '已使用年限', width: 110, type: 'number' },
  { key: 'vehicleModel', name: '车辆型号', width: 150 },
  { key: 'vin', name: '车架号', width: 190, fixed: true, required: true },
  { key: 'powerType', name: '动力类型名称', width: 130 },
  { key: 'capacity', name: '荷载人数', width: 100, type: 'number' },
]

const detailColumns = [
  { key: 'lengthMm', name: '长(mm)', width: 100, type: 'number', hiddenDefault: true },
  { key: 'widthMm', name: '宽(mm)', width: 100, type: 'number', hiddenDefault: true },
  { key: 'heightMm', name: '高(mm)', width: 100, type: 'number', hiddenDefault: true },
  { key: 'manufacturer', name: '车辆制造厂', width: 180, hiddenDefault: true },
]

const actionColumn = { key: 'action', name: '操作', width: 140 }
const allColumns = [...baseColumns, ...detailColumns, actionColumn]
const exportDefaultKeys = baseColumns.map((item) => item.key)

const initialVehicles = [
  ['陈家桥公交充电站', '202601', '渝A12345D', '820', '重庆公交集团', '西部分公司', 862000, '公交客车', '2021-03-12', 5, 'XML6855JEVJ0C', 'LZYTATE68M1000012', 80, 10500, 2550, 3200, '厦门金龙联合汽车工业有限公司', '运营', '有效'],
  ['福佑路公交枢纽站', '202602', '渝A23567D', '160', '重庆公交集团', '北部分公司', 915000, '公交客车', '2022-08-18', 4, 'BYD6100LGEV9', 'LGXCH6CD7N2000431', 82, 10490, 2500, 3300, '比亚迪汽车工业有限公司', '运营', '有效'],
  ['五里店公交站', '202603', '渝A88901D', '638', '重庆公交集团', '两江分公司', 798000, '公交客车', '2020-11-03', 6, 'ZK6856BEVG3', 'LZYTATE63L1000877', 76, 8540, 2450, 3180, '郑州宇通客车股份有限公司', '维修', '有效'],
  ['南坪公交充电站', '202604', '渝B11220D', '305', '重庆公交集团', '南部分公司', 875000, '公交客车', '2023-05-21', 3, 'XML6105JEVW0C', 'LZYTATE66P1000456', 80, 10490, 2550, 3260, '厦门金龙联合汽车工业有限公司', '停运', '无效'],
  ['菜园坝公交充电站', '202605', '渝A66778D', '454', '重庆公交集团', '南部分公司', 688000, '中巴客车', '2019-09-30', 7, 'BJ6851EVCA', 'LVCC6B2B4K9002781', 58, 8495, 2450, 3150, '北汽福田汽车股份有限公司', '运营', '有效'],
  ['观音桥公交充电站', '202606', '渝A90123D', '818', '重庆公交集团', '北部分公司', 938000, '双层客车', '2024-01-09', 2, 'ZK6125CHEVNPG4', 'LZYTATE68R1000066', 92, 11980, 2550, 3600, '郑州宇通客车股份有限公司', '运营', '有效'],
].map((row, index) => ({
  id: index + 1,
  stationName: row[0],
  vehicleNo: row[1],
  plateNo: row[2],
  lineNo: row[3],
  orgName: row[4],
  deptName: row[5],
  assetValue: row[6],
  vehicleCategory: row[7],
  registerDate: row[8],
  usedYears: row[9],
  vehicleModel: row[10],
  vin: row[11],
  powerType: '纯电',
  capacity: row[12],
  lengthMm: row[13],
  widthMm: row[14],
  heightMm: row[15],
  manufacturer: row[16],
  vehicleStatus: row[17],
  validity: row[18],
  businessNature: '公交运营',
}))

const filterFields = [
  { key: 'orgName', label: '组织名称' },
  { key: 'deptName', label: '部门名称' },
  { key: 'lineNo', label: '线路编号' },
  { key: 'vehicleCategory', label: '车辆分类' },
  { key: 'powerType', label: '动力类型名称' },
]

const emptyForm = Object.fromEntries([...baseColumns, ...detailColumns].map((item) => [item.key, '']))

const Cell = ({ value, className = '' }) => (
  <span title={value ?? '-'} className={`block w-full overflow-hidden text-ellipsis whitespace-nowrap ${className}`}>
    {value ?? '-'}
  </span>
)

const VehicleBase = () => {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(Object.fromEntries(filterFields.map((item) => [item.key, ''])))
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modal, setModal] = useState(null)
  const [activeTab, setActiveTab] = useState('base')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [importFile, setImportFile] = useState(null)
  const [exportKeys, setExportKeys] = useState(exportDefaultKeys)
  const [batchForm, setBatchForm] = useState({ vehicleStatus: '', validity: '', businessNature: '' })
  const [logs, setLogs] = useState([])
  const [visibleKeys, setVisibleKeys] = useState(() => {
    const saved = localStorage.getItem('vehicleBaseVisibleColumns')
    return saved ? JSON.parse(saved) : allColumns.filter((item) => !item.hiddenDefault).map((item) => item.key)
  })
  const [widths, setWidths] = useState(() => {
    const saved = localStorage.getItem('vehicleBaseColumnWidths')
    return saved ? JSON.parse(saved) : Object.fromEntries(allColumns.map((item) => [item.key, item.width]))
  })
  const tableRef = useRef(null)

  const visibleColumns = allColumns.filter((item) => visibleKeys.includes(item.key) || item.key === 'action')

  const options = useMemo(() => {
    const result = {}
    filterFields.forEach((field) => {
      result[field.key] = [...new Set(vehicles.map((item) => item[field.key]).filter(Boolean))]
    })
    return result
  }, [vehicles])

  const filteredVehicles = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return vehicles.filter((item) => {
      const matchKeyword = !keyword || [item.plateNo, item.vehicleNo, item.vin].some((value) => String(value).toLowerCase().includes(keyword))
      const matchFilters = filterFields.every((field) => !filters[field.key] || item[field.key] === filters[field.key])
      return matchKeyword && matchFilters
    })
  }, [vehicles, query, filters])

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize))
  const pageRows = filteredVehicles.slice((page - 1) * pageSize, page * pageSize)

  const addLog = (type, content) => {
    setLogs((prev) => [{ type, content, user: '当前用户', time: new Date().toLocaleString('zh-CN') }, ...prev].slice(0, 8))
  }

  const resetPage = () => setPage(1)

  const validateForm = () => {
    const nextErrors = {}
    baseColumns.filter((item) => item.required).forEach((item) => {
      if (!String(form[item.key] || '').trim()) nextErrors[item.key] = '必填'
    })
    const duplicate = vehicles.find((item) => item.id !== form.id && (item.plateNo === form.plateNo || item.vin === form.vin))
    if (duplicate?.plateNo === form.plateNo) nextErrors.plateNo = '车牌号已存在'
    if (duplicate?.vin === form.vin) nextErrors.vin = '车架号已存在'
    ;[...baseColumns, ...detailColumns].filter((item) => item.type === 'number').forEach((item) => {
      if (form[item.key] !== '' && Number(form[item.key]) < 0) nextErrors[item.key] = '请输入非负数'
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const openForm = (row) => {
    setForm({ ...emptyForm, ...row })
    setErrors({})
    setActiveTab('base')
    setModal('edit')
  }

  const saveForm = () => {
    if (!validateForm()) return
    const normalized = { ...form, powerType: '纯电' }
    ;[...baseColumns, ...detailColumns].filter((item) => item.type === 'number').forEach((item) => {
      normalized[item.key] = normalized[item.key] === '' ? '' : Number(normalized[item.key])
    })
    setVehicles((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)))
    addLog('编辑', `更新车辆 ${normalized.plateNo}`)
    setModal(null)
  }

  const deleteRows = (ids) => {
    if (!ids.length) return
    if (!window.confirm(`确认删除 ${ids.length} 条车辆档案？系统将先校验关联关系。`)) return
    setVehicles((prev) => prev.filter((item) => !ids.includes(item.id)))
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
    addLog('删除', `删除 ${ids.length} 条车辆档案`)
  }

  const saveBatch = () => {
    const patch = Object.fromEntries(Object.entries(batchForm).filter(([, value]) => value))
    setVehicles((prev) => prev.map((item) => (selectedIds.includes(item.id) ? { ...item, ...patch, powerType: '纯电' } : item)))
    addLog('批量编辑', `批量修改 ${selectedIds.length} 条车辆档案`)
    setModal(null)
  }

  const handleResizeStart = (event, key) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths[key] || 120
    const handleMove = (moveEvent) => {
      setWidths((prev) => ({ ...prev, [key]: Math.max(70, startWidth + moveEvent.clientX - startX) }))
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      setWidths((current) => {
        localStorage.setItem('vehicleBaseColumnWidths', JSON.stringify(current))
        return current
      })
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const toggleColumn = (key) => {
    const next = visibleKeys.includes(key) ? visibleKeys.filter((item) => item !== key) : [...visibleKeys, key]
    setVisibleKeys(next)
    localStorage.setItem('vehicleBaseVisibleColumns', JSON.stringify(next))
  }

  const fieldControl = (col) => (
    <div key={col.key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {col.name}{col.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'}
        min={col.type === 'number' ? 0 : undefined}
        readOnly={col.key === 'powerType'}
        value={col.key === 'powerType' ? '纯电' : form[col.key] ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [col.key]: e.target.value }))}
        className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors[col.key] ? 'border-red-400 bg-red-50' : 'border-gray-200'} ${col.key === 'powerType' ? 'bg-gray-50' : ''}`}
      />
      {errors[col.key] && <p className="text-xs text-red-500 mt-1">{errors[col.key]}</p>}
    </div>
  )

  const allSelected = pageRows.length > 0 && pageRows.every((item) => selectedIds.includes(item.id))

  return (
    <div className="page-container min-w-0 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex flex-col gap-2 min-h-0" style={{ height: '15%' }}>
        <div className="flex items-center gap-2 min-h-0" style={{ height: '58%' }}>
          <div className="flex items-center gap-2 min-w-0" style={{ width: '28%' }}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); resetPage() }} placeholder="车牌号、车辆编号、车架号" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-5 gap-2 min-w-0" style={{ width: '56%' }}>
            {filterFields.map((field) => (
              <select key={field.key} value={filters[field.key]} onChange={(e) => { setFilters((prev) => ({ ...prev, [field.key]: e.target.value })); resetPage() }} className="px-2 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary min-w-0">
                <option value="">{field.label}</option>
                {options[field.key]?.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2" style={{ width: '16%' }}>
            <button className="btn-primary text-sm flex items-center justify-center gap-1"><Search className="w-4 h-4" />搜索</button>
            <button onClick={() => { setFilters(Object.fromEntries(filterFields.map((item) => [item.key, '']))); setQuery(''); resetPage() }} className="btn-secondary text-sm">重置</button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 min-h-0" style={{ height: '42%' }}>
          {selectedIds.length > 0 && <button onClick={() => setModal('batch')} className="btn-secondary text-sm flex items-center gap-1"><CheckSquare className="w-4 h-4" />批量编辑</button>}
          <button onClick={() => setModal('import')} className="btn-secondary text-sm flex items-center gap-1"><Upload className="w-4 h-4" />批量导入</button>
          <button onClick={() => setModal('export')} className="btn-secondary text-sm flex items-center gap-1"><Download className="w-4 h-4" />导出</button>
          <button onClick={() => addLog('刷新', '刷新车辆基础表')} className="btn-secondary text-sm px-3" title="刷新"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setModal('columns')} className="btn-secondary text-sm px-3" title="列设置"><Columns3 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-0 overflow-auto" style={{ height: '75%' }} ref={tableRef}>
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: visibleColumns.reduce((sum, col) => sum + (widths[col.key] || col.width), 48) }}>
          <thead className="sticky top-0 z-20 bg-gray-100">
            <tr>
              <th className="border border-gray-300 text-center bg-gray-100" style={{ width: 48, minWidth: 48 }}><input type="checkbox" checked={allSelected} onChange={(e) => setSelectedIds(e.target.checked ? [...new Set([...selectedIds, ...pageRows.map((item) => item.id)])] : selectedIds.filter((id) => !pageRows.some((item) => item.id === id)))} /></th>
              {visibleColumns.map((col) => (
                <th key={col.key} className={`border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 z-30 bg-gray-100' : 'bg-gray-100'}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                  <div className="flex items-center justify-center gap-1 min-w-0">
                    <span title={col.name} className="overflow-hidden text-ellipsis">{col.name}</span>
                    <span onMouseDown={(e) => handleResizeStart(e, col.key)} className="cursor-col-resize w-1 h-4 bg-gray-300 hover:bg-primary flex-shrink-0" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className={`hover:bg-blue-50 ${selectedIds.includes(row.id) ? 'bg-blue-50' : 'bg-white'}`}>
                <td className="border border-gray-200 text-center align-middle" style={{ width: 48 }}><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds, row.id] : selectedIds.filter((id) => id !== row.id))} /></td>
                {visibleColumns.map((col) => (
                  <td key={col.key} className={`border border-gray-200 px-2 py-2 text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 bg-white z-10' : ''}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                    {col.key === 'action' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openForm(row)} className="text-primary hover:underline inline-flex items-center gap-1"><Edit className="w-4 h-4" />编辑</button>
                        <button onClick={() => deleteRows([row.id])} className="text-red-600 hover:underline inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />删除</button>
                      </div>
                    ) : (
                      <Cell value={col.type === 'number' && row[col.key] !== '' ? Number(row[col.key]).toLocaleString('zh-CN') : row[col.key]} className={col.fixed ? 'font-medium text-primary' : ''} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 && <div className="text-center py-10 text-gray-500">未找到匹配车辆档案</div>}
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-3 p-3 flex items-center justify-between" style={{ height: '10%' }}>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>共 <b className="text-primary">{filteredVehicles.length}</b> 条数据</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="px-2 py-1 border border-gray-300 rounded text-sm">
            {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}条/页</option>)}
          </select>
          {logs[0] && <span title={logs[0].content}>最近操作：{logs[0].type} {logs[0].time}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronsLeft className="w-4 h-4" /></button>
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm">第 <b className="text-primary">{page}</b> / {totalPages} 页</span>
          <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50"><ChevronsRight className="w-4 h-4" /></button>
        </div>
      </div>

      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title={`编辑车辆 - ${form.plateNo || ''}`} onConfirm={saveForm} confirmText="保存">
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-gray-200">
            {[['base', '基础信息'], ['detail', '详细信息']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`px-3 py-2 text-sm border-b-2 ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">{(activeTab === 'base' ? baseColumns : detailColumns).map(fieldControl)}</div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'batch'} onClose={() => setModal(null)} title={`批量编辑 ${selectedIds.length} 条车辆`} onConfirm={saveBatch} confirmText="保存">
        <div className="grid grid-cols-1 gap-3">
          {['vehicleStatus', 'validity', 'businessNature'].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{key === 'vehicleStatus' ? '车辆状态' : key === 'validity' ? '有效性' : '经营性质'}</label>
              <input value={batchForm[key]} onChange={(e) => setBatchForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="留空则不修改" />
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={modal === 'import'} onClose={() => setModal(null)} title="批量导入车辆档案" onConfirm={() => { addLog('导入', `导入文件 ${importFile?.name || '模板数据'}`); setModal(null) }} confirmText="开始导入">
        <div className="space-y-4">
          <button className="btn-secondary text-sm flex items-center gap-1"><Download className="w-4 h-4" />下载标准导入模板</button>
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600">{importFile ? importFile.name : '选择 Excel 文件上传'}</span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setImportFile(e.target.files?.[0])} />
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-gray-600 leading-relaxed">系统将执行格式校验、重复校验、必填项校验，并展示错误行与错误原因。当前为前端原型模拟。</div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'export'} onClose={() => setModal(null)} title="导出字段选择" onConfirm={() => { addLog('导出', `导出 ${exportKeys.length} 个字段`); setModal(null) }} confirmText="导出">
        <div className="grid grid-cols-2 gap-2">
          {[...baseColumns, ...detailColumns].map((col) => (
            <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={exportKeys.includes(col.key)} onChange={(e) => setExportKeys(e.target.checked ? [...exportKeys, col.key] : exportKeys.filter((key) => key !== col.key))} />
              {col.name}
            </label>
          ))}
        </div>
      </Modal>

      <Modal isOpen={modal === 'columns'} onClose={() => setModal(null)} title="列设置" showFooter={false}>
        <div className="grid grid-cols-2 gap-2">
          {[...baseColumns, ...detailColumns].map((col) => (
            <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={visibleKeys.includes(col.key)} onChange={() => toggleColumn(col.key)} />
              {col.name}{col.hiddenDefault && <span className="text-xs text-gray-400">默认隐藏</span>}
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default VehicleBase
