import React, { useMemo, useState } from 'react'
import { AlertCircle, Eye, Search, Upload } from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'

const stationOptions = [
  { code: 'YIM00100', name: '沙坪坝区陈家桥公交充电站' },
  { code: 'YIM00200', name: '北区光亮天润城公交充电站' },
  { code: 'YIM00300', name: '福佑路公交枢纽站' },
  { code: 'YIM00400', name: '碚都佳园首末站' },
  { code: 'YIM00500', name: '五里店公交站' },
]

const orderTypes = ['公交', '社会', '大客户']
const customerTypes = ['驿满微信', '快电', '小桔', '新电途', '公交集团']
const resultStatuses = ['成功', '失败', '取消']

const generateMockData = () => {
  const data = []

  for (let i = 1; i <= 65; i += 1) {
    const station = stationOptions[i % stationOptions.length]
    const totalPower = 15 + (i % 50)
    const resultStatus = resultStatuses[i % 11 === 0 ? 1 : i % 17 === 0 ? 2 : 0]
    const settlementElectricityFee = resultStatus === '成功' ? (totalPower * (0.52 + (i % 8) * 0.03)).toFixed(2) : '0.00'
    const settlementServiceFee = resultStatus === '成功' ? (totalPower * (0.32 + (i % 5) * 0.02)).toFixed(2) : '0.00'
    const chargingBillAmount = resultStatus === '成功' ? (Number(settlementElectricityFee) + Number(settlementServiceFee)).toFixed(2) : '0.00'
    const discountAmount = resultStatus === '成功' ? (totalPower * (0.03 + (i % 4) * 0.01)).toFixed(2) : '0.00'
    const orderSettlementAmount = resultStatus === '成功' ? Math.max(0, Number(chargingBillAmount) - Number(discountAmount)).toFixed(2) : '0.00'
    const receivedAmount = resultStatus === '成功' ? (Number(orderSettlementAmount) * (i % 6 === 0 ? 0.98 : 1)).toFixed(2) : '0.00'
    const contractSettlementElectricityFee = resultStatus === '成功' ? (Number(settlementElectricityFee) * (i % 3 === 0 ? 0.95 : 1.05)).toFixed(2) : '0.00'
    const contractSettlementServiceFee = resultStatus === '成功' ? (Number(settlementServiceFee) * (i % 4 === 0 ? 0.8 : 1)).toFixed(2) : '0.00'
    const contractSettlementAmount = resultStatus === '成功' ? (Number(contractSettlementElectricityFee) + Number(contractSettlementServiceFee)).toFixed(2) : '0.00'
    const startHour = 8 + (i % 14)
    const startMin = i % 60
    const duration = 30 + (i % 120)
    const endHour = startHour + Math.floor((startMin + duration) / 60)
    const endMin = (startMin + duration) % 60

    data.push({
      orderNo: `ORD20260101${String(i).padStart(4, '0')}`,
      originalOrderNo: `ORIG-${String(i).padStart(5, '0')}`,
      stationCode: station.code,
      stationName: station.name,
      vin: `LZYTATE${String(202600000 + i).padStart(9, '0')}`,
      orderType: orderTypes[i % orderTypes.length],
      customerType: customerTypes[i % customerTypes.length],
      resultStatus,
      startTime: `2026-01-01 ${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`,
      endTime: `2026-01-01 ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`,
      chargeDuration: `${Math.floor(duration / 60)}小时${duration % 60}分`,
      totalPower: totalPower.toFixed(2),
      settlementElectricityFee,
      settlementServiceFee,
      chargingBillAmount,
      discountAmount,
      orderSettlementAmount,
      receivedAmount,
      contractSettlementElectricityFee,
      contractSettlementServiceFee,
      contractSettlementAmount,
      totalStartValue: (100 + i * 2).toFixed(2),
      totalEndValue: (120 + i * 2).toFixed(2),
      startSoc: `${20 + (i % 60)}%`,
      endSoc: `${50 + (i % 40)}%`,
      settleTime: `2026-01-01 ${String(endHour + 1).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`,
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
  { title: '站点编码', key: 'stationCode', width: '9%' },
  { title: '站点名称', key: 'stationName', width: '14%' },
  { title: 'VIN', key: 'vin', width: '13%' },
  { title: '订单类型', key: 'orderType', width: '8%' },
  { title: '客户类型', key: 'customerType', width: '9%' },
  { title: '订单结果状态', key: 'resultStatus', width: '9%' },
  { title: '开始时间', key: 'startTime', width: '10%' },
  { title: '结束时间', key: 'endTime', width: '10%' },
  { title: '充电时长', key: 'chargeDuration', width: '8%' },
  { title: '总电量(kWh)', key: 'totalPower', width: '8%' },
  { title: '结算电费(元)', key: 'settlementElectricityFee', width: '9%' },
  { title: '结算服务费(元)', key: 'settlementServiceFee', width: '10%' },
  { title: '充电账单金额', key: 'chargingBillAmount', width: '10%' },
  { title: '优惠总金额', key: 'discountAmount', width: '10%' },
  { title: '订单结算金额', key: 'orderSettlementAmount', width: '10%' },
  { title: '实收金额', key: 'receivedAmount', width: '9%' },
  { title: '合同结算电费', key: 'contractSettlementElectricityFee', width: '10%' },
  { title: '合同结算服务费', key: 'contractSettlementServiceFee', width: '11%' },
  { title: '合同结算金额', key: 'contractSettlementAmount', width: '10%' },
  { title: '总起始值', key: 'totalStartValue', width: '8%' },
  { title: '总结束值', key: 'totalEndValue', width: '8%' },
  { title: '开始SOC', key: 'startSoc', width: '6%' },
  { title: '结束SOC', key: 'endSoc', width: '6%' },
  { title: '结清时间', key: 'settleTime', width: '10%' },
  { title: '桩流水号', key: 'pileFlowNo', width: '10%' },
  { title: '桩体号', key: 'pileNo', width: '8%' },
  { title: '车牌号', key: 'plateNo', width: '8%' },
  { title: '数据来源', key: 'source', width: '8%' },
  { title: '操作', key: 'action', width: '8%' },
]

const amountFields = [
  ['结算电费', 'settlementElectricityFee'],
  ['结算服务费', 'settlementServiceFee'],
  ['充电账单金额', 'chargingBillAmount'],
  ['优惠总金额', 'discountAmount'],
  ['订单结算金额', 'orderSettlementAmount'],
  ['实收金额', 'receivedAmount'],
  ['合同结算电费', 'contractSettlementElectricityFee'],
  ['合同结算服务费', 'contractSettlementServiceFee'],
  ['合同结算金额', 'contractSettlementAmount'],
]

const OrderData = () => {
  const [searchOriginalNo, setSearchOriginalNo] = useState('')
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')
  const [searchPileNo, setSearchPileNo] = useState('')
  const [searchPlateNo, setSearchPlateNo] = useState('')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [importError, setImportError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const reportFields = useReportFields({
    storageKey: 'base-data:order-data',
    groups: [{ title: '订单数据字段', columns: tableColumns }],
    fixedKeys: ['orderNo', 'originalOrderNo', 'action'],
  })

  const filteredData = useMemo(() => {
    let data = [...mockOrderData]

    if (searchOriginalNo.trim()) {
      data = data.filter((item) => item.originalOrderNo.toLowerCase().includes(searchOriginalNo.toLowerCase()))
    }
    if (searchStartDate) {
      data = data.filter((item) => item.startTime >= searchStartDate.replace('T', ' '))
    }
    if (searchEndDate) {
      data = data.filter((item) => item.endTime <= searchEndDate.replace('T', ' '))
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
    setSearchOriginalNo('')
    setSearchStartDate('')
    setSearchEndDate('')
    setSearchPileNo('')
    setSearchPlateNo('')
    setCurrentPage(1)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
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
    alert('导入成功（前端原型模拟）')
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
      return <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(row.resultStatus)}`}>{row.resultStatus}</span>
    }
    if (col.key === 'source') {
      return <span className={`text-xs font-medium ${row.source === '系统同步' ? 'text-primary' : 'text-warning'}`}>{row.source}</span>
    }
    if (col.key === 'action') {
      return (
        <button
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
    return row[col.key] ?? '-'
  }

  return (
    <div className="page-container h-full flex flex-col">
      <div className="page-content flex-1 flex flex-col">
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">原始订单流水号</label>
              <input type="text" placeholder="请输入原始订单流水号" value={searchOriginalNo} onChange={(e) => setSearchOriginalNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">开始时间</label>
              <input type="datetime-local" value={searchStartDate} onChange={(e) => setSearchStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">结束时间</label>
              <input type="datetime-local" value={searchEndDate} onChange={(e) => setSearchEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">桩体号</label>
              <input type="text" placeholder="请输入桩体号" value={searchPileNo} onChange={(e) => setSearchPileNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">车牌号</label>
              <input type="text" placeholder="请输入车牌号" value={searchPlateNo} onChange={(e) => setSearchPlateNo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} className="btn-primary text-sm flex items-center gap-1">
              <Search className="w-4 h-4" />
              搜索
            </button>
            <button onClick={handleReset} className="btn-secondary text-sm">重置</button>
            <div className="flex-1" />
            <button onClick={() => setImportModalOpen(true)} className="btn-primary text-sm flex items-center gap-1">
              <Upload className="w-4 h-4" />
              导入
            </button>
            <ReportFieldControls fields={reportFields} onExport={(keys) => alert(`导出成功（已选择${keys.length}个字段，前端原型模拟）`)} />
          </div>
        </div>

        <div className="overflow-auto flex-1 bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {reportFields.visibleColumns.map((col) => (
                  <th key={col.key} className="px-3 py-3 text-left text-xs font-bold text-gray-700 border-b border-gray-200 whitespace-nowrap" style={{ width: col.width }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, index) => (
                <tr key={row.orderNo} onClick={() => openDetail(row)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  {reportFields.visibleColumns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={String(row[col.key] ?? '')}>
                      {renderTableCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedData.length === 0 && <div className="text-center py-8 text-gray-500">未找到匹配数据</div>}
        </div>

        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-500">共 {filteredData.length} 条记录，第 {currentPage} / {totalPages} 页</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">首页</button>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">上一页</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 text-sm border rounded transition-colors ${currentPage === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">下一页</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">末页</button>
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

      <Modal isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedOrder(null) }} title="订单详情" showFooter={false}>
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">基础信息</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>订单号：{selectedOrder.orderNo}</p>
                <p>原始订单流水号：{selectedOrder.originalOrderNo}</p>
                <p>订单类型：{selectedOrder.orderType}</p>
                <p>客户类型：{selectedOrder.customerType}</p>
                <p>订单结果状态：<span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(selectedOrder.resultStatus)}`}>{selectedOrder.resultStatus}</span></p>
                <p>数据来源：{selectedOrder.source}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">站点与车辆</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>站点编码：{selectedOrder.stationCode}</p>
                <p>站点名称：{selectedOrder.stationName}</p>
                <p>VIN：{selectedOrder.vin}</p>
                <p>车牌号：{selectedOrder.plateNo}</p>
                <p>桩体号：{selectedOrder.pileNo}</p>
                <p>桩流水号：{selectedOrder.pileFlowNo}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">充电过程</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>开始时间：{selectedOrder.startTime}</p>
                <p>结束时间：{selectedOrder.endTime}</p>
                <p>充电时长：{selectedOrder.chargeDuration}</p>
                <p>总电量：{selectedOrder.totalPower} kWh</p>
                <p>开始SOC：{selectedOrder.startSoc}</p>
                <p>结束SOC：{selectedOrder.endSoc}</p>
                <p>总起始值：{selectedOrder.totalStartValue}</p>
                <p>总结束值：{selectedOrder.totalEndValue}</p>
                <p>结清时间：{selectedOrder.settleTime}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">账单金额</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                {amountFields.map(([label, key]) => (
                  <p key={key}>{label}：{selectedOrder[key]} 元</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={importModalOpen} onClose={() => { setImportModalOpen(false); setImportFile(null); setImportError('') }} title="导入订单数据" onConfirm={handleImport}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => document.getElementById('order-import-file').click()}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">{importFile ? `已选择：${importFile.name}` : '点击上传或拖拽文件到此处'}</p>
            <p className="text-xs text-gray-400">支持 .xlsx、.xls、.csv 格式</p>
            <input id="order-import-file" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          </div>
          {importError && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-danger">{importError}</div>}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">导入文件格式要求</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              <p>文件需包含订单号、原始订单流水号、站点编码、VIN、订单类型、客户类型、订单结果状态、充电过程和结算金额等字段。</p>
              <p className="mt-2 text-red-500">注：导入时将自动校验数据格式，不符合规范的数据不允许导入。</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OrderData
