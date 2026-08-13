import React from 'react'
import { Zap } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const StationIndex = () => {
  const columns = [
    { title: '场站名称', key: 'name', sortable: true },
    { title: '场站编号', key: 'code', sortable: true },
    { title: '地址', key: 'address' },
    { title: '状态', key: 'status' },
    { title: '充电桩数', key: 'count', sortable: true },
    { title: '创建时间', key: 'createTime', sortable: true },
  ]

  const data = [
    { name: '中心广场充电站', code: 'ST001', address: '市中心广场北路1号', status: '正常', count: '12', createTime: '2026-01-01' },
    { name: '高新园区充电站', code: 'ST002', address: '高新区科技大道88号', status: '正常', count: '8', createTime: '2026-01-15' },
    { name: '火车站充电站', code: 'ST003', address: '火车站南广场', status: '正常', count: '16', createTime: '2026-02-01' },
    { name: '体育馆充电站', code: 'ST004', address: '体育中心路168号', status: '正常', count: '6', createTime: '2026-02-10' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">场站名称</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入场站名称" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">场站地址</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入场站地址" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">充电桩数量</label>
        <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入充电桩数量" />
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={Zap}
      title="场站与设备管理"
      searchPlaceholder="搜索场站名称..."
      addButtonLabel="新增场站"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="新增场站"
    />
  )
}

export default StationIndex
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Search, Plus, BarChart3 } from 'lucide-react'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const StationIndex = () => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const columns = [
    { title: '场站名称', key: 'name', sortable: true },
    { title: '场站编号', key: 'code', sortable: true },
    { title: '地址', key: 'address' },
    { title: '状态', key: 'status' },
    { title: '充电桩数', key: 'count', sortable: true },
    { title: '创建时间', key: 'createTime', sortable: true },
  ]

  const data = [
    { name: '中心广场充电站', code: 'ST001', address: '市中心广场北路1号', status: '正常', count: '12', createTime: '2026-01-01' },
    { name: '高新园区充电站', code: 'ST002', address: '高新区科技大道88号', status: '正常', count: '8', createTime: '2026-01-15' },
    { name: '火车站充电站', code: 'ST003', address: '火车站南广场', status: '正常', count: '16', createTime: '2026-02-01' },
    { name: '体育馆充电站', code: 'ST004', address: '体育中心路168号', status: '正常', count: '6', createTime: '2026-02-10' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="page-title">场站与设备管理</h1>
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
              placeholder="搜索场站名称..."
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
            新增场站
          </button>
        </div>

        <Table columns={columns} data={data} showSelection />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="新增场站"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">场站名称</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入场站名称" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">场站地址</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入场站地址" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">充电桩数量</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入充电桩数量" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StationIndex
