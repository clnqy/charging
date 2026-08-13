import React, { useState } from 'react'

const Table = ({ columns, data, showSelection = false, onSelectionChange }) => {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(data.map((_, index) => index))
      setSelectedRows(allIds)
      onSelectionChange?.(Array.from(allIds).map(i => data[i]))
    } else {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(Array.from(newSelected).map(i => data[i]))
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data]
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case '正常':
      case '已完成':
        return 'text-success font-medium'
      case 'danger':
      case '故障':
      case '异常':
        return 'text-danger font-medium'
      case 'warning':
      case '待处理':
      case '处理中':
        return 'text-warning font-medium'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 font-semibold">
          <tr>
            {showSelection && (
              <th className="px-4 py-3 w-10">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  onChange={handleSelectAll}
                  checked={selectedRows.size === data.length && data.length > 0}
                />
              </th>
            )}
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.title}
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr 
              key={index} 
              className={`hover:bg-gray-50 transition-colors ${selectedRows.has(index) ? 'bg-blue-50' : ''}`}
            >
              {showSelection && (
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedRows.has(index)}
                    onChange={() => handleSelectRow(index)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className={`px-4 py-3 ${column.key === 'status' ? getStatusColor(row[column.key]) : ''}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">暂无数据</div>
      )}
    </div>
  )
}

export default Table
