import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, BarChart3 } from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'

/**
 * 公共页面模板组件
 * 用于快速创建列表页(搜索+新增按钮+表格+弹窗)
 * 
 * @param {ReactNode} icon - 模块图标组件
 * @param {string} title - 页面标题
 * @param {string} searchPlaceholder - 搜索框占位符
 * @param {string} addButtonLabel - 新增按钮文字
 * @param {Array} columns - 表格列配置
 * @param {Array} data - 表格数据
 * @param {boolean} showSelection - 是否显示选择框
 * @param {Function} onAdd - 点击新增按钮回调
 * @param {ReactNode} customFormContent - 自定义表单内容(在Modal内)
 * @param {string} modalTitle - Modal标题
 */
const PageTemplate = ({
  icon: Icon,
  title,
  searchPlaceholder = '搜索...',
  addButtonLabel = '新增',
  columns,
  data,
  showSelection = true,
  onAdd,
  customFormContent,
  modalTitle = '新增',
}) => {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  return (
    <div className="page-container">
      {/* 页面标题区 */}
      <div className="page-header">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-primary" />}
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/data-analysis/station-summary')}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            数据分析
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="page-content">
        {/* 筛选区 */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={onAdd}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {addButtonLabel}
          </button>
        </div>

        {/* 表格区 */}
        <Table columns={columns} data={data} showSelection={showSelection} />
      </div>

      {/* 弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        {customFormContent}
      </Modal>
    </div>
  )
}

export default PageTemplate
