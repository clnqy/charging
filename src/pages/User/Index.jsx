import React from 'react'
import { Users } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const UserIndex = () => {
  const columns = [
    { title: '用户ID', key: 'id', sortable: true },
    { title: '用户名', key: 'name', sortable: true },
    { title: '手机号', key: 'phone' },
    { title: '注册时间', key: 'registerTime', sortable: true },
    { title: '状态', key: 'status' },
    { title: '余额', key: 'balance', sortable: true },
  ]

  const data = [
    { id: 'U001', name: '张三', phone: '138****1234', registerTime: '2026-01-01', status: '正常', balance: '¥1,234.50' },
    { id: 'U002', name: '李四', phone: '139****5678', registerTime: '2026-01-15', status: '正常', balance: '¥567.80' },
    { id: 'U003', name: '王五', phone: '137****9012', registerTime: '2026-02-01', status: '正常', balance: '¥890.00' },
    { id: 'U004', name: '赵六', phone: '136****3456', registerTime: '2026-02-10', status: '正常', balance: '¥2,100.00' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入用户名" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">初始余额</label>
        <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入初始余额" />
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={Users}
      title="用户管理"
      searchPlaceholder="搜索用户名或手机号..."
      addButtonLabel="新增用户"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="新增用户"
    />
  )
}

export default UserIndex
