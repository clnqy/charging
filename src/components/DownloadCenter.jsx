import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Modal from './Modal'

const pad2 = (value) => String(value).padStart(2, '0')

export const formatTaskTime = (date = new Date()) => (
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
)

export const createTransferTask = ({ type, name, status = '生成中', actionLabel = '下载', operator = '当前用户' }) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  name,
  status,
  actionLabel,
  operator,
  time: formatTaskTime(),
})

export const defaultTemplateRows = [
  {
    id: 'template-default',
    name: '标准导入模板.xlsx',
    status: '可下载',
    operator: '系统',
    time: formatTaskTime(),
    actionLabel: '下载',
  },
]

const downloadTabs = [
  { key: 'export', label: '导出中心' },
  { key: 'import', label: '导入中心' },
  { key: 'template', label: '模板中心' },
]

export const useDownloadCenter = ({ templates = defaultTemplateRows } = {}) => {
  const [downloadCenterOpen, setDownloadCenterOpen] = useState(false)
  const [downloadTab, setDownloadTab] = useState('export')
  const [downloadTasks, setDownloadTasks] = useState([])

  const addDownloadTask = (task, completedStatus) => {
    setDownloadTasks((prev) => [task, ...prev])
    window.setTimeout(() => {
      setDownloadTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, status: completedStatus } : item)))
    }, 1200)
  }

  const createExportTask = ({ name, operator }) => {
    const task = createTransferTask({ type: 'export', name, status: '生成中', actionLabel: '下载', operator })
    addDownloadTask(task, '可下载')
    setDownloadTab('export')
    setDownloadCenterOpen(true)
  }

  const createImportTask = ({ name, operator }) => {
    const task = createTransferTask({ type: 'import', name, status: '生成中', actionLabel: '下载结果', operator })
    addDownloadTask(task, '导入完成')
    setDownloadTab('import')
    setDownloadCenterOpen(true)
  }

  return {
    downloadCenterOpen,
    setDownloadCenterOpen,
    downloadTab,
    setDownloadTab,
    downloadTasks,
    setDownloadTasks,
    templates,
    createExportTask,
    createImportTask,
  }
}

const getTaskStatusClass = (status) => {
  if (status === '可下载' || status === '导入完成') return 'text-success bg-green-50'
  return 'text-primary bg-blue-50'
}

const rowsByTab = ({ tab, tasks, templates }) => {
  if (tab === 'template') return templates
  return tasks.filter((item) => item.type === tab)
}

const DownloadCenterModal = ({
  center,
  title = '下载中心（保留最近30天的数据）',
}) => {
  const rows = rowsByTab({ tab: center.downloadTab, tasks: center.downloadTasks, templates: center.templates })

  return (
    <Modal isOpen={center.downloadCenterOpen} onClose={() => center.setDownloadCenterOpen(false)} title={title} showFooter={false} widthClass="max-w-4xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded border border-gray-200 p-1 bg-gray-50">
            {downloadTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => center.setDownloadTab(tab.key)}
                className={`px-4 py-1.5 text-sm rounded transition-colors ${center.downloadTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={() => center.setDownloadTasks((prev) => [...prev])} className="btn-secondary text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>

        <div className="overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">文件名称</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">文件状态</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">操作人</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">操作时间</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 whitespace-nowrap text-gray-700" title={item.name}>{item.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTaskStatusClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{item.operator}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{item.time}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button
                      onClick={() => alert(`${item.actionLabel}：${item.name}`)}
                      className={`text-sm ${item.status === '生成中' ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:opacity-80'}`}
                      disabled={item.status === '生成中'}
                    >
                      {item.actionLabel}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">暂无任务</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}

export default DownloadCenterModal
