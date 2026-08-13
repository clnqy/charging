import React, { useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Search, Upload, Download, Edit, Eye, AlertCircle, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info } from 'lucide-react'
import Modal from '../../components/Modal'

// Tooltip悬浮提示组件
const CellTooltip = ({ content, children }) => {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  
  const handleMouseEnter = (e) => {
    if (!content || content.length <= 50) return // 短内容不显示tooltip
    
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 5,
      left: rect.left + rect.width / 2
    })
    setShow(true)
  }
  
  const handleMouseLeave = () => {
    setShow(false)
  }
  
  return (
    <div 
      ref={ref}
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave} 
      className="relative w-full h-full"
    >
      {children}
      {show && (
        <div 
          className="fixed z-[9999] px-3 py-2 bg-white text-gray-900 text-xs rounded border border-gray-200 shadow-lg max-w-xs whitespace-normal pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)'
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// 模拟站点基础数据
const mockStationData = [
  { 
    code: 'ST001', 
    originalCode: 'CZ-001', 
    name: '中心广场充电站', 
    shortName: '中心广场', 
    group: '市区站群', 
    source: '系统同步',
    commissionTime: '2024-01-15',
    pileCount: 8,
    gunCount: 16,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    remark: ''
  },
  { 
    code: 'ST002', 
    originalCode: 'GX-002', 
    name: '高新园区充电站', 
    shortName: '高新园区', 
    group: '高新站群', 
    source: '外部导入',
    commissionTime: '2024-03-20',
    pileCount: 6,
    gunCount: 12,
    coopMode: '驿满慢充',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '北部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '慢充',
    remark: ''
  },
  { 
    code: 'ST003', 
    originalCode: 'HC-003', 
    name: '火车站充电站', 
    shortName: '火车站', 
    group: '交通站群', 
    source: '系统同步',
    commissionTime: '2023-11-10',
    pileCount: 12,
    gunCount: 24,
    coopMode: '外协站',
    coopUnit: '第三方合作单位',
    managementUnit: '南部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    remark: '交通枢纽重点站点'
  },
  { 
    code: 'ST004', 
    originalCode: 'TY-004', 
    name: '体育馆充电站', 
    shortName: '体育馆', 
    group: '市区站群', 
    source: '外部导入',
    commissionTime: '2024-05-08',
    pileCount: 4,
    gunCount: 8,
    coopMode: '场地合作站',
    coopUnit: '国网重庆电动汽车服务有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '国网平台',
    fastSlow: '快充',
    remark: ''
  },
  { 
    code: 'ST005', 
    originalCode: 'SY-005', 
    name: '机场充电站', 
    shortName: '机场', 
    group: '交通站群', 
    source: '系统同步',
    commissionTime: '2024-02-28',
    pileCount: 16,
    gunCount: 32,
    coopMode: '高压合作站',
    coopUnit: '高压合作方',
    managementUnit: '北部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    remark: '高压供电'
  },
  { 
    code: 'ST006', 
    originalCode: 'DX-006', 
    name: '大学城充电站', 
    shortName: '大学城', 
    group: '教育站群', 
    source: '外部导入',
    commissionTime: '2024-06-15',
    pileCount: 6,
    gunCount: 12,
    coopMode: '低压合作站',
    coopUnit: '低压合作方',
    managementUnit: '南部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    remark: ''
  },
  { 
    code: 'ST007', 
    originalCode: 'GY-007', 
    name: '工业园充电站', 
    shortName: '工业园', 
    group: '工业站群', 
    source: '系统同步',
    commissionTime: '2024-04-22',
    pileCount: 10,
    gunCount: 20,
    coopMode: '三方平台互通站',
    coopUnit: '第三方平台',
    managementUnit: '北部运营分公司',
    dataSource: '万马平台',
    fastSlow: '快充',
    remark: '多平台互通'
  },
  { 
    code: 'ST008', 
    originalCode: 'WL-008', 
    name: '物流中心充电站', 
    shortName: '物流中心', 
    group: '工业站群', 
    source: '外部导入',
    commissionTime: '2024-07-10',
    pileCount: 8,
    gunCount: 16,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '南部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    remark: ''
  },
  { 
    code: 'ST009', 
    originalCode: 'JC-009', 
    name: '医院充电站', 
    shortName: '医院', 
    group: '医疗站群', 
    source: '系统同步',
    commissionTime: '2024-08-05',
    pileCount: 4,
    gunCount: 8,
    coopMode: '场地合作站',
    coopUnit: '国网重庆电动汽车服务有限公司',
    managementUnit: '巴驿站场分公司',
    dataSource: '国网平台',
    fastSlow: '慢充',
    remark: '公立医院'
  },
  { 
    code: 'ST010', 
    originalCode: 'SC-010', 
    name: '商业中心充电站', 
    shortName: '商业中心', 
    group: '市区站群', 
    source: '外部导入',
    commissionTime: '2024-09-18',
    pileCount: 12,
    gunCount: 24,
    coopMode: '自营站',
    coopUnit: '重庆驿满新能源科技有限公司',
    managementUnit: '北部运营分公司',
    dataSource: '驿满平台',
    fastSlow: '快充',
    remark: '市中心核心商圈'
  },
]

const enrichedStationData = mockStationData.map((station, index) => {
  const gunCount = station.gunCount || 0
  const equipmentPower = gunCount * (station.fastSlow === '鎱㈠厖' ? 30 : 60)
  const transformerCapacity = Math.ceil(equipmentPower * 1.25 / 100) * 100
  const researchIncome = 180000 + index * 26000
  const targetIncome = Math.round(researchIncome * 1.12)

  return {
    ...station,
    businessHours: index % 4 === 0 ? '00:00-24:00' : '06:00-22:00',
    nightGunCount: Math.max(0, Math.floor(gunCount * (index % 3 === 0 ? 0.5 : 0.25))),
    equipmentPower,
    transformerCapacity,
    siteRent: 18000 + index * 3500,
    researchIncome,
    targetIncome,
    struggleIncome: Math.round(targetIncome * 1.05),
  }
})

const StationBase = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [importFile, setImportFile] = useState(null)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // 列宽管理
  const columnDefs = [
    { key: 'code', name: '站点编码', width: 90 },
    { key: 'originalCode', name: '站点原始编码', width: 120 },
    { key: 'name', name: '站点', width: 180 },
    { key: 'shortName', name: '站点缩写', width: 100 },
    { key: 'group', name: '站群名', width: 100 },
    { key: 'source', name: '数据来源', width: 90 },
    { key: 'commissionTime', name: '投运时间', width: 110 },
    { key: 'pileCount', name: '桩数量', width: 80 },
    { key: 'gunCount', name: '枪数量', width: 80 },
    { key: 'coopMode', name: '合作模式', width: 130 },
    { key: 'coopUnit', name: '充电站合作单位', width: 200 },
    { key: 'managementUnit', name: '现场管理单位', width: 140 },
    { key: 'dataSource', name: '数据来源平台', width: 110 },
    { key: 'fastSlow', name: '快/慢桩', width: 90 },
    { key: 'remark', name: '备注', width: 150 },
    { key: 'action', name: '操作', width: 70 },
  ]
  
  // 自定义Hook实现列宽管理
  const displayColumnDefs = [
    ...columnDefs.slice(0, 14),
    { key: 'businessHours', name: '营业时间', width: 110 },
    { key: 'nightGunCount', name: '夜间开放枪数', width: 110 },
    { key: 'equipmentPower', name: '设备功率(kW)', width: 110 },
    { key: 'transformerCapacity', name: '变压器容量(kVA)', width: 130 },
    { key: 'siteRent', name: '场地租金(元/月)', width: 130 },
    { key: 'researchIncome', name: '可研收入(元/月)', width: 130 },
    { key: 'targetIncome', name: '经营目标(元/月)', width: 130 },
    columnDefs[14],
    { ...columnDefs[15], width: 120 },
  ]

  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('stationBaseColumnWidths')
    if (saved) {
      try {
        const widths = JSON.parse(saved)
        return displayColumnDefs.map(col => widths[col.name] || col.width)
      } catch (e) {
        console.error('Failed to parse column widths:', e)
      }
    }
    return displayColumnDefs.map(col => col.width)
  })

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    originalCode: '',
    name: '',
    shortName: '',
    group: '',
    commissionTime: '',
    pileCount: '',
    gunCount: '',
    coopMode: '',
    coopUnit: '',
    managementUnit: '',
    dataSource: '',
    fastSlow: '',
    remark: '',
  })

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return enrichedStationData
    const query = searchQuery.toLowerCase()
    return enrichedStationData.filter(item =>
      item.code.toLowerCase().includes(query) ||
      item.originalCode.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.shortName.toLowerCase().includes(query) ||
      item.group.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  // 分页计算
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredData.slice(start, end)
  }, [filteredData, currentPage, pageSize])
  
  // 重置到第一页
  const resetToFirstPage = () => setCurrentPage(1)
  
  // 列宽拖拽
  const handleResizeStart = (e, index) => {
    e.preventDefault()
    const startX = e.clientX
    let startWidth = columnWidths[index]
    
    const handleMouseMove = (e) => {
      const newWidth = Math.max(60, startWidth + (e.clientX - startX))
      setColumnWidths(prev => {
        const newWidths = [...prev]
        newWidths[index] = newWidth
        return newWidths
      })
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // 保存到localStorage
      const widthObj = {}
      displayColumnDefs.forEach((col, i) => {
        widthObj[col.name] = columnWidths[i]
      })
      localStorage.setItem('stationBaseColumnWidths', JSON.stringify(widthObj))
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 打开编辑弹窗
  const handleEdit = (station) => {
    setEditingStation(station)
    setEditForm({
      originalCode: station.originalCode,
      name: station.name,
      shortName: station.shortName,
      group: station.group,
      commissionTime: station.commissionTime || '',
      pileCount: station.pileCount || '',
      gunCount: station.gunCount || '',
      coopMode: station.coopMode || '',
      coopUnit: station.coopUnit || '',
      managementUnit: station.managementUnit || '',
      dataSource: station.dataSource || '',
      fastSlow: station.fastSlow || '',
      remark: station.remark || '',
    })
    setEditModalOpen(true)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    // 模拟保存
    alert('保存成功（前端原型模拟）')
    setEditModalOpen(false)
    setEditingStation(null)
  }

  // 导入
  const handleImport = () => {
    alert('导入成功（前端原型模拟）')
    setImportModalOpen(false)
    setImportFile(null)
  }

  // 导出
  const handleExport = () => {
    alert('导出成功（前端原型模拟）')
  }
  
  // 页面尺寸选择
  const pageSizes = [5, 10, 20, 50]

  // 数据来源颜色
  const getSourceColor = (source) => {
    return source === '系统同步' ? 'text-primary' : 'text-warning'
  }

  // 合作模式颜色
  const getCoopModeColor = (mode) => {
    const colors = {
      '自营站': 'bg-blue-100 text-blue-700',
      '驿满慢充': 'bg-green-100 text-green-700',
      '外协站': 'bg-orange-100 text-orange-700',
      '三方平台互通站': 'bg-purple-100 text-purple-700',
      '高压合作站': 'bg-red-100 text-red-700',
      '低压合作站': 'bg-yellow-100 text-yellow-700',
      '场地合作站': 'bg-teal-100 text-teal-700',
    }
    return colors[mode] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="page-container h-full flex flex-col">
      <div className="page-content flex-1 flex flex-col">
        {/* 搜索 & 操作区 */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索站点编码、原始编码、站点、缩写、站群名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={() => {}}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              搜索
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                清空
              </button>
            )}
          </div>
          <button
            onClick={() => setImportModalOpen(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>

        {/* 数据表格 - 固定宽度容器,横向滚动 */}
        <div 
          className="overflow-auto flex-1 bg-white rounded-lg border border-gray-200 min-h-0" 
          style={{ overflowX: 'auto', overflowY: 'auto', maxWidth: '100%' }}
        >
          <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: 'auto' }}>
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {displayColumnDefs.map((col, colIndex) => (
                  <th
                    key={col.key}
                    className="border-b border-r border-gray-300 py-2 px-3 font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ 
                      width: columnWidths[colIndex], 
                      minWidth: columnWidths[colIndex],
                      maxWidth: columnWidths[colIndex],
                      textAlign: ['pileCount', 'gunCount'].includes(col.key) ? 'center' : 'left',
                      backgroundColor: '#f3f4f6',
                      position: 'relative'
                    }}
                  >
                    <CellTooltip content={col.name}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block max-w-[85%] overflow-hidden text-ellipsis">{col.name}</span>
                        {/* 列宽拖拽手柄 */}
                        <div
                          className="cursor-col-resize hover:bg-primary w-1 h-4 flex items-center justify-center group flex-shrink-0"
                          onMouseDown={(e) => handleResizeStart(e, colIndex)}
                          title={`拖拽调整"${col.name}"列宽`}
                        >
                          <div className="w-px h-3 bg-gray-400 group-hover:bg-primary"></div>
                        </div>
                      </div>
                    </CellTooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr
                  key={row.code}
                  className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50`}
                >
                  {/* 站点编码 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      onClick={() => { setSelectedStation(row); setDetailModalOpen(true) }}
                      style={{ 
                        width: columnWidths[0], minWidth: columnWidths[0], maxWidth: columnWidths[0],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        backgroundColor: 'inherit'
                      }}>
                    <CellTooltip content={row.code}>
                      <span className="font-medium text-primary block cursor-pointer hover:underline">{row.code}</span>
                    </CellTooltip>
                  </td>
                  {/* 站点原始编码 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[1], minWidth: columnWidths[1], maxWidth: columnWidths[1],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.originalCode}>
                      <span className="text-gray-600 block">{row.originalCode}</span>
                    </CellTooltip>
                  </td>
                  {/* 站点名称 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[2], minWidth: columnWidths[2], maxWidth: columnWidths[2],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.name}>
                      <span className="text-gray-800 block">{row.name}</span>
                    </CellTooltip>
                  </td>
                  {/* 站点缩写 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[3], minWidth: columnWidths[3], maxWidth: columnWidths[3],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.shortName}>
                      <span className="text-gray-600 block">{row.shortName}</span>
                    </CellTooltip>
                  </td>
                  {/* 站群名 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[4], minWidth: columnWidths[4], maxWidth: columnWidths[4],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.group}>
                      <span className="text-gray-600 block">{row.group}</span>
                    </CellTooltip>
                  </td>
                  {/* 数据来源 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[5], minWidth: columnWidths[5], maxWidth: columnWidths[5],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.source || ''}>
                      <span className={`text-xs font-medium ${row.source === '系统同步' ? 'text-primary' : 'text-warning'} block`}>
                        {row.source || '-'}
                      </span>
                    </CellTooltip>
                  </td>
                  {/* 投运时间 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[6], minWidth: columnWidths[6], maxWidth: columnWidths[6],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.commissionTime || ''}>
                      <span className="text-gray-600 block">{row.commissionTime || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 桩数量 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[7], minWidth: columnWidths[7], maxWidth: columnWidths[7],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.pileCount || '')}>
                      <span className="font-medium text-gray-800 block">{row.pileCount || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 枪数量 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[8], minWidth: columnWidths[8], maxWidth: columnWidths[8],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.gunCount || '')}>
                      <span className="font-medium text-gray-800 block">{row.gunCount || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 合作模式 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[9], minWidth: columnWidths[9], maxWidth: columnWidths[9],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.coopMode || ''}>
                      <span className={`text-xs px-2 py-1 rounded inline-block ${getCoopModeColor(row.coopMode)} block`}>
                        {row.coopMode || '-'}
                      </span>
                    </CellTooltip>
                  </td>
                  {/* 充电站合作单位 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[10], minWidth: columnWidths[10], maxWidth: columnWidths[10],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.coopUnit || ''}>
                      <span className="text-gray-600 text-xs block">{row.coopUnit || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 现场管理单位 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[11], minWidth: columnWidths[11], maxWidth: columnWidths[11],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.managementUnit || ''}>
                      <span className="text-gray-600 block">{row.managementUnit || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 数据来源平台 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[12], minWidth: columnWidths[12], maxWidth: columnWidths[12],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.dataSource || ''}>
                      <span className="text-xs text-gray-600 block">{row.dataSource || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 快/慢桩 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[13], minWidth: columnWidths[13], maxWidth: columnWidths[13],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.fastSlow || ''}>
                      <span className={`text-xs font-medium ${row.fastSlow === '快充' ? 'text-red-600' : row.fastSlow === '慢充' ? 'text-green-600' : 'text-gray-400'} block`}>
                        {row.fastSlow || '-'}
                      </span>
                    </CellTooltip>
                  </td>
                  {/* 备注 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[14], minWidth: columnWidths[14], maxWidth: columnWidths[14],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.businessHours || ''}>
                      <span className="text-gray-600 block">{row.businessHours || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[15], minWidth: columnWidths[15], maxWidth: columnWidths[15],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.nightGunCount ?? '')}>
                      <span className="text-gray-600 block">{row.nightGunCount ?? '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[16], minWidth: columnWidths[16], maxWidth: columnWidths[16],
                        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.equipmentPower || '')}>
                      <span className="text-gray-600 block">{row.equipmentPower || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[17], minWidth: columnWidths[17], maxWidth: columnWidths[17],
                        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.transformerCapacity || '')}>
                      <span className="text-gray-600 block">{row.transformerCapacity || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[18], minWidth: columnWidths[18], maxWidth: columnWidths[18],
                        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.siteRent || '')}>
                      <span className="text-gray-600 block">{row.siteRent?.toLocaleString('zh-CN') || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[19], minWidth: columnWidths[19], maxWidth: columnWidths[19],
                        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.researchIncome || '')}>
                      <span className="text-gray-600 block">{row.researchIncome?.toLocaleString('zh-CN') || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[20], minWidth: columnWidths[20], maxWidth: columnWidths[20],
                        textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={String(row.targetIncome || '')}>
                      <span className="text-gray-600 block">{row.targetIncome?.toLocaleString('zh-CN') || '-'}</span>
                    </CellTooltip>
                  </td>
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[21], minWidth: columnWidths[21], maxWidth: columnWidths[21],
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                    <CellTooltip content={row.remark || ''}>
                      <span className="text-gray-500 text-xs block">{row.remark || '-'}</span>
                    </CellTooltip>
                  </td>
                  {/* 操作列 */}
                  <td className="border-r border-gray-200 py-2 px-3"
                      style={{ 
                        width: columnWidths[22], minWidth: columnWidths[22], maxWidth: columnWidths[22],
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        backgroundColor: 'inherit'
                      }}>
                    <button
                      onClick={() => handleEdit(row)}
                      className="text-primary hover:text-primary/80 text-xs flex items-center justify-center gap-1 transition-colors mx-auto"
                    >
                      <Edit className="w-3 h-3" />
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">未找到匹配数据</div>
          )}
        </div>
        
        {/* 分页控件 */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                共 <span className="font-semibold text-primary">{filteredData.length}</span> 条数据
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value)
                  setPageSize(newSize)
                  resetToFirstPage()
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
              >
                {pageSizes.map(size => (
                  <option key={size} value={size}>{size}条/页</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="首页"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="上一页"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* 页码按钮 */}
              <span className="px-3 py-1 text-sm text-gray-700">
                第 <span className="font-semibold text-primary">{currentPage}</span> / {totalPages || 1} 页
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="下一页"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="末页"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 数据来源说明 */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold">数据来源说明：</span>
              站点基础表数据来源分为两类：系统同步（系统自动从其他模块同步）和外部导入（通过导入功能从外部系统导入）。
              站点编码按规则自动生成唯一编码，不可编辑；站点原始编码为各外部系统中的编码。
            </div>
          </div>
        </div>
      </div>

      {/* 导入弹窗 */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedStation(null) }}
        title="站点详情"
        showFooter={false}
      >
        {selectedStation && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">基础信息</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>站点编码：{selectedStation.code}</p>
                <p>站点原始编码：{selectedStation.originalCode}</p>
                <p>站点名称：{selectedStation.name}</p>
                <p>站点缩写：{selectedStation.shortName}</p>
                <p>站群名：{selectedStation.group}</p>
                <p>数据来源：{selectedStation.source}</p>
                <p>投运时间：{selectedStation.commissionTime}</p>
                <p>数据来源平台：{selectedStation.dataSource}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">运营能力</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>桩数量：{selectedStation.pileCount}</p>
                <p>枪数量：{selectedStation.gunCount}</p>
                <p>营业时间：{selectedStation.businessHours}</p>
                <p>夜间开放枪数：{selectedStation.nightGunCount}</p>
                <p>设备功率：{selectedStation.equipmentPower} kW</p>
                <p>变压器容量：{selectedStation.transformerCapacity} kVA</p>
                <p>快/慢充：{selectedStation.fastSlow}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">合作与经营目标</h4>
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <p>合作模式：{selectedStation.coopMode}</p>
                <p>合作单位：{selectedStation.coopUnit}</p>
                <p>现场管理单位：{selectedStation.managementUnit}</p>
                <p>场地租金：{selectedStation.siteRent?.toLocaleString('zh-CN')} 元/月</p>
                <p>可研收入：{selectedStation.researchIncome?.toLocaleString('zh-CN')} 元/月</p>
                <p>经营目标：{selectedStation.targetIncome?.toLocaleString('zh-CN')} 元/月</p>
                <p>奋斗收入：{selectedStation.struggleIncome?.toLocaleString('zh-CN')} 元/月</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">备注</h4>
              <p className="text-gray-600">{selectedStation.remark || '-'}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onClose={() => { setImportModalOpen(false); setImportFile(null) }}
        title="导入站点基础数据"
        onConfirm={handleImport}
      >
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('station-import-file').click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              {importFile ? `已选择：${importFile.name}` : '点击上传或拖拽文件到此处'}
            </p>
            <p className="text-xs text-gray-400">支持 .xlsx, .xls, .csv 格式</p>
            <input
              id="station-import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setImportFile(e.target.files[0])}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">导入文件格式要求</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              <p><strong>文件需包含以下列：</strong></p>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li><strong>基础信息（必填）：</strong>站点原始编码、站点名称、站点缩写、站群名</li>
                <li><strong>投运信息（必填）：</strong>投运时间（格式：YYYY-MM-DD）、桩数量、枪数量</li>
                <li><strong>合作信息（必填）：</strong>合作模式、充电站合作单位、现场管理单位</li>
                <li><strong>平台信息（必填）：</strong>数据来源平台、快/慢桩类型</li>
                <li><strong>其他信息：</strong>备注（可选）</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingStation(null) }}
        title={`编辑 - ${editingStation?.name || ''}`}
        onConfirm={handleSaveEdit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点编码</label>
            <input
              type="text"
              value={editingStation?.code || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-gray-100 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">站点编码按规则自动生成，不可编辑</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点原始编码</label>
            <input
              type="text"
              value={editForm.originalCode}
              onChange={(e) => setEditForm({ ...editForm, originalCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站点缩写</label>
            <input
              type="text"
              value={editForm.shortName}
              onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">站群名</label>
            <input
              type="text"
              value={editForm.group}
              onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">投运时间</label>
              <input
                type="date"
                value={editForm.commissionTime}
                onChange={(e) => setEditForm({ ...editForm, commissionTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">桩数量</label>
              <input
                type="number"
                value={editForm.pileCount}
                onChange={(e) => setEditForm({ ...editForm, pileCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">枪数量</label>
              <input
                type="number"
                value={editForm.gunCount}
                onChange={(e) => setEditForm({ ...editForm, gunCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">快/慢桩</label>
              <select
                value={editForm.fastSlow}
                onChange={(e) => setEditForm({ ...editForm, fastSlow: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              >
                <option value="">请选择</option>
                <option value="快充">快充</option>
                <option value="慢充">慢充</option>
                <option value="快充+慢充">快充+慢充</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">合作模式</label>
            <select
              value={editForm.coopMode}
              onChange={(e) => {
                const selectedMode = e.target.value
                // 根据合作模式自动匹配合作单位和管理单位
                let autoCoopUnit = ''
                let autoManagementUnit = ''
                
                if (selectedMode === '自营站') {
                  autoCoopUnit = '重庆驿满新能源科技有限公司'
                  autoManagementUnit = ''
                } else if (selectedMode === '场地合作站') {
                  autoCoopUnit = '国网重庆电动汽车服务有限公司'
                }
                
                setEditForm({
                  ...editForm,
                  coopMode: selectedMode,
                  coopUnit: autoCoopUnit || editForm.coopUnit,
                  managementUnit: autoManagementUnit || editForm.managementUnit,
                })
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">请选择</option>
              <option value="自营站">自营站</option>
              <option value="驿满慢充">驿满慢充</option>
              <option value="外协站">外协站</option>
              <option value="三方平台互通站">三方平台互通站</option>
              <option value="高压合作站">高压合作站</option>
              <option value="低压合作站">低压合作站</option>
              <option value="场地合作站">场地合作站</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">充电站合作单位</label>
            <input
              type="text"
              value={editForm.coopUnit}
              onChange={(e) => setEditForm({ ...editForm, coopUnit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              placeholder="根据合作模式自动匹配"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">现场管理单位</label>
            <select
              value={editForm.managementUnit}
              onChange={(e) => setEditForm({ ...editForm, managementUnit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="">请选择</option>
              <option value="巴驿站场分公司">巴驿站场分公司</option>
              <option value="北部运营分公司">北部运营分公司</option>
              <option value="南部运营分公司">南部运营分公司</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数据来源平台</label>
              <select
                value={editForm.dataSource}
                onChange={(e) => {
                  const selectedSource = e.target.value
                  // 根据合作模式自动匹配数据来源
                  let autoDataSource = ''
                  if (editForm.coopMode === '自营站') {
                    autoDataSource = '驿满平台'
                  }
                  
                  setEditForm({
                    ...editForm,
                    dataSource: autoDataSource || selectedSource,
                  })
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
              >
                <option value="">请选择</option>
                <option value="驿满平台">驿满平台</option>
                <option value="万马平台">万马平台</option>
                <option value="国网平台">国网平台</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <input
                type="text"
                value={editForm.remark}
                onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
                placeholder="可选填"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StationBase
