import React from 'react'
import { MessageSquare, Bell, Mail, AlertCircle } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const MessageIndex = () => {
  const columns = [
    { title: '消息ID', key: 'id', sortable: true },
    { title: '类型', key: 'type' },
    { title: '标题', key: 'title' },
    { title: '接收人', key: 'receiver' },
    { title: '状态', key: 'status' },
    { title: '发送时间', key: 'sendTime', sortable: true },
  ]

  const data = [
    { id: 'MSG001', type: '系统通知', title: '系统维护通知', receiver: '全部用户', status: '已发送', sendTime: '2026-01-01 08:00' },
    { id: 'MSG002', type: '订单提醒', title: '订单完成提醒', receiver: '张三', status: '已发送', sendTime: '2026-01-01 10:35' },
    { id: 'MSG003', type: '告警通知', title: '设备故障告警', receiver: '管理员', status: '待发送', sendTime: '2026-01-01 11:00' },
    { id: 'MSG004', type: '活动推送', title: '春节优惠活动', receiver: '全部用户', status: '已发送', sendTime: '2026-01-01 12:00' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">消息类型</label>
        <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary">
          <option>系统通知</option>
          <option>订单提醒</option>
          <option>告警通知</option>
          <option>活动推送</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">消息标题</label>
        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入消息标题" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">消息内容</label>
        <textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" rows={4} placeholder="请输入消息内容"></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">接收人</label>
        <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary">
          <option>全部用户</option>
          <option>指定用户</option>
        </select>
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={MessageSquare}
      title="消息通知"
      searchPlaceholder="搜索消息标题..."
      addButtonLabel="发送消息"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="发送消息"
    />
  )
}

export default MessageIndex
