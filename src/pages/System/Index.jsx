import React from 'react'
import { Settings } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const SystemIndex = () => {
  const columns = [
    { title: '角色名称', key: 'name', sortable: true },
    { title: '角色编码', key: 'code', sortable: true },
    { title: '状态', key: 'status' },
    { title: '创建时间', key: 'createTime', sortable: true },
    { title: '备注', key: 'remark' },
  ]

  const data = [
    { name: '超级管理员', code: 'admin', status: '正常', createTime: '2026-01-01', remark: '系统最高权限' },
    { name: '运营人员', code: 'operator', status: '正常', createTime: '2026-01-15', remark: '日常运营管理' },
    { name: '财务人员', code: 'finance', status: '正常', createTime: '2026-02-01', remark: '财务管理权限' },
    { name: '客服人员', code: 'service', status: '正常', createTime: '2026-02-10', remark: '客户服务权限' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入角色名称" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">角色编码</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入角色编码" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" rows={3} placeholder="请输入备注信息"></textarea>
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={Settings}
      title="系统管理"
      searchPlaceholder="搜索角色名称..."
      addButtonLabel="新增角色"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="新增角色"
    />
  )
}

export default SystemIndex
