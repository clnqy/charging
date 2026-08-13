import React from 'react'
import { DollarSign } from 'lucide-react'
import PageTemplate from '../../components/PageTemplate'

const FinanceIndex = () => {
  const columns = [
    { title: '账单编号', key: 'billNo', sortable: true },
    { title: '类型', key: 'type' },
    { title: '金额', key: 'amount', sortable: true },
    { title: '状态', key: 'status' },
    { title: '创建时间', key: 'createTime', sortable: true },
    { title: '备注', key: 'remark' },
  ]

  const data = [
    { billNo: 'BILL202601010001', type: '充值', amount: '¥500.00', status: '已完成', createTime: '2026-01-01 09:00', remark: '用户充值' },
    { billNo: 'BILL202601010002', type: '消费', amount: '¥45.80', status: '已完成', createTime: '2026-01-01 10:30', remark: '充电消费' },
    { billNo: 'BILL202601010003', type: '退款', amount: '¥20.00', status: '处理中', createTime: '2026-01-01 11:00', remark: '订单退款' },
    { billNo: 'BILL202601010004', type: '充值', amount: '¥1,000.00', status: '已完成', createTime: '2026-01-01 14:00', remark: '用户充值' },
  ]

  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">账单类型</label>
        <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary">
          <option>充值</option>
          <option>消费</option>
          <option>退款</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
        <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" placeholder="请输入金额" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" rows={3} placeholder="请输入备注"></textarea>
      </div>
    </div>
  )

  return (
    <PageTemplate
      icon={DollarSign}
      title="财务与价格管理"
      searchPlaceholder="搜索账单编号..."
      addButtonLabel="新增账单"
      columns={columns}
      data={data}
      onAdd={() => {}}
      customFormContent={formContent}
      modalTitle="新增账单"
    />
  )
}

export default FinanceIndex
