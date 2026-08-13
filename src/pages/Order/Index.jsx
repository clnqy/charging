import React from 'react'
import { ClipboardList } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const OrderIndex = () => {
  const columns = [
    { title: '订单号', key: 'orderNo', sortable: true },
    { title: '用户', key: 'user' },
    { title: '场站', key: 'station' },
    { title: '金额', key: 'amount', sortable: true },
    { title: '状态', key: 'status' },
    { title: '创建时间', key: 'createTime', sortable: true },
  ]

  const data = [
    { orderNo: 'ORD202601010001', user: '张三', station: '中心广场充电站', amount: '¥45.80', status: '已完成', createTime: '2026-01-01 10:30' },
    { orderNo: 'ORD202601010002', user: '李四', station: '高新园区充电站', amount: '¥32.50', status: '处理中', createTime: '2026-01-01 11:15' },
    { orderNo: 'ORD202601010003', user: '王五', station: '火车站充电站', amount: '¥67.20', status: '已完成', createTime: '2026-01-01 14:20' },
    { orderNo: 'ORD202601010004', user: '赵六', station: '体育馆充电站', amount: '¥18.90', status: '待处理', createTime: '2026-01-01 16:45' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">用户</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请选择用户" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">场站</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请选择场站" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">充电金额</label>
        <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入充电金额" />
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={ClipboardList}
      title="订单与预约管理"
      searchPlaceholder="搜索订单号或用户..."
      addButtonLabel="新增订单"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="新增订单"
    />
  )
}

export default OrderIndex
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Search, Plus, BarChart3 } from 'lucide-react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const OrderIndex = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const columns = [
    { title: '订单号', key: 'orderNo', sortable: true },
    { title: '用户', key: 'user' },
    { title: '场站', key: 'station' },
    { title: '金额', key: 'amount', sortable: true },
    { title: '状态', key: 'status' },
    { title: '创建时间', key: 'createTime', sortable: true },
  ]

  const data = [
    { orderNo: 'ORD202601010001', user: '张三', station: '中心广场充电站', amount: '¥45.80', status: '已完成', createTime: '2026-01-01 10:30' },
    { orderNo: 'ORD202601010002', user: '李四', station: '高新园区充电站', amount: '¥32.50', status: '处理中', createTime: '2026-01-01 11:15' },
    { orderNo: 'ORD202601010003', user: '王五', station: '火车站充电站', amount: '¥67.20', status: '已完成', createTime: '2026-01-01 14:20' },
    { orderNo: 'ORD202601010004', user: '赵六', station: '体育馆充电站', amount: '¥18.90', status: '待处理', createTime: '2026-01-01 16:45' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="page-title">订单与预约管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/data-analysis')}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            数据分析
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索订单号或用户..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            新增订单
          </button>
        </div>

        <Table columns={columns} data={data} showSelection />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="新增订单"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请选择用户" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">场站</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请选择场站" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">充电金额</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入充电金额" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OrderIndex
