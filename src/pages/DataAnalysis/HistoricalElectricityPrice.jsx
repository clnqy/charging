import React, { useState, useMemo, useEffect } from 'react'
import { Upload, Download, PlusCircle, Info, Check, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ==================== 基础数据定义 ====================
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, label: `${i + 1}月` }))
const TIME_PERIODS = ['尖', '峰', '平', '谷']

// 时段配色
const PERIOD_STYLES = {
  尖: { color: '#ff4d4f', bg: 'bg-red-500', text: 'text-red-500', label: '尖' },
  峰: { color: '#faad14', bg: 'bg-orange-500', text: 'text-orange-500', label: '峰' },
  平: { color: '#52c41a', bg: 'bg-green-500', text: 'text-green-500', label: '平' },
  谷: { color: '#1890ff', bg: 'bg-blue-500', text: 'text-blue-500', label: '谷' },
}

// ==================== 页面组件 ===================
const HistoricalElectricityPrice = () => {
  // 年份管理
  const [allYears, setAllYears] = useState([2026, 2025, 2024])
  // 图表显示的年份（筛选用）
  const [chartYears, setChartYears] = useState([2026, 2025, 2024])
  // 顶部年份选择（展示用，支持多选）
  const [selectedYears, setSelectedYears] = useState([2026, 2025, 2024])
  // 图表显示的时段
  const [chartPeriods, setChartPeriods] = useState(['尖', '峰', '平', '谷'])
  
  // 表格分页（每页5年）
  const ITEMS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState(1)
  
  // 电价数据 - 新结构 priceData[year][period][month]
  const [priceData, setPriceData] = useState(() => {
    const initial = {}
    allYears.forEach(year => {
      initial[year] = {}
      TIME_PERIODS.forEach(period => {
        initial[year][period] = {}
        MONTHS.forEach(m => {
          initial[year][period][m.month] = (Math.random() * 0.8 + 0.8).toFixed(4)
        })
      })
    })
    return initial
  })
  
  // 编辑状态
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  
  // 通知
  const [notification, setNotification] = useState(null)
  
  // 新增年度弹窗
  const [showAddYearModal, setShowAddYearModal] = useState(false)
  const [newYearInput, setNewYearInput] = useState('')
  const [yearInputError, setYearInputError] = useState('')
  
  // 持久化筛选状态到localStorage
  useEffect(() => {
    const saved = localStorage.getItem('electricityPriceFilter')
    if (saved) {
      try {
        const filter = JSON.parse(saved)
        if (filter.chartYears) setChartYears(filter.chartYears)
        if (filter.chartPeriods) setChartPeriods(filter.chartPeriods)
        if (filter.selectedYears) setSelectedYears(filter.selectedYears)
        if (filter.currentPage) setCurrentPage(filter.currentPage)
      } catch (e) {
        console.error('Failed to load filter state:', e)
      }
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('electricityPriceFilter', JSON.stringify({
      chartYears,
      chartPeriods,
      selectedYears,
      currentPage,
    }))
  }, [chartYears, chartPeriods, selectedYears, currentPage])
  
  // 显示通知
  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }
  
  // 下拉框多选状态
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  
  // 处理年度选项切换
  const handleYearToggle = (year) => {
    toggleYear(year)
  }
  
  // 渲染下拉框选项
  const renderYearOptions = () => {
    return allYears.map(year => {
      const isSelected = selectedYears.includes(year)
      return (
        <div
          key={year}
          onClick={() => handleYearToggle(year)}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50' : ''
          }`}
        >
          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
            isSelected ? 'bg-primary border-primary' : 'border-gray-300'
          }`}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className={`text-sm ${isSelected ? 'font-semibold text-primary' : 'text-gray-700'}`}>
            {year}
          </span>
        </div>
      )
    })
  }
  
  // 验证年度输入
  const validateYearInput = (value) => {
    if (!value || value.trim() === '') {
      setYearInputError('请输入年度')
      return false
    }
    if (!/^\d{4}$/.test(value)) {
      setYearInputError('年度必须是4位数字')
      return false
    }
    const year = parseInt(value)
    if (allYears.includes(year)) {
      setYearInputError('该年度台账已存在，无需重复新增')
      return false
    }
    setYearInputError('')
    return true
  }
  
  // 新增年度
  const handleAddYear = () => {
    if (!validateYearInput(newYearInput)) return
    
    const newYear = parseInt(newYearInput)
    setAllYears(prev => [...prev, newYear].sort((a, b) => b - a))
    
    // 新数据结构：newYear -> period -> month -> value
    setPriceData(prev => {
      const newData = { ...prev }
      newData[newYear] = {}
      TIME_PERIODS.forEach(period => {
        newData[newYear][period] = {}
        MONTHS.forEach(m => {
          newData[newYear][period][m.month] = ''
        })
      })
      return newData
    })
    
    setChartYears(prev => [...prev, newYear].sort((a, b) => b - a))
    setSelectedYears(prev => [...prev, newYear].sort((a, b) => b - a))
    setNewYearInput('')
    setYearInputError('')
    setShowAddYearModal(false)
    showNotification('success', `已添加年度 ${newYear}`)
  }
  
  // 快捷筛选操作
  const selectAllYears = () => { setChartYears([...allYears].sort((a, b) => b - a)); setSelectedYears([...allYears].sort((a, b) => b - a)) }
  const clearAllYears = () => { setChartYears([]); setSelectedYears([]) }
  const selectAllPeriods = () => setChartPeriods([...TIME_PERIODS])
  const clearAllPeriods = () => setChartPeriods([])
  
  // 切换选择(同时影响图表和顶部列表
  const toggleYear = (year) => {
    let newChartYears
    let newSelectedYears
    
    if (chartYears.includes(year)) {
      newChartYears = chartYears.filter(y => y !== year)
    } else {
      newChartYears = [...chartYears, year].sort((a, b) => b - a)
    }
    
    if (selectedYears.includes(year)) {
      newSelectedYears = selectedYears.filter(y => y !== year)
    } else {
      newSelectedYears = [...selectedYears, year].sort((a, b) => b - a)
    }
    
    setChartYears(newChartYears)
    setSelectedYears(newSelectedYears)
  }
  
  const togglePeriod = (period) => {
    if (chartPeriods.includes(period)) {
      setChartPeriods(prev => prev.filter(p => p !== period))
    } else {
      setChartPeriods(prev => [...prev, period])
    }
  }
  
  // 获取所有可编辑的单元格顺序(按年度→时段→月份）
  const editableCellsOrder = useMemo(() => {
    const order = []
    selectedYears.filter(year => chartYears.includes(year)).forEach(year => {
      TIME_PERIODS.forEach(period => {
        MONTHS.forEach(m => {
          order.push({ year, period, month: m.month })
        })
      })
    })
    return order
  }, [selectedYears, chartYears])
  
  // 获取下一个单元格(纵向跳转:同一年份、下一个时段）
  const getNextCellVertical = (currentYear, currentPeriod, currentMonth) => {
    const periodIndex = TIME_PERIODS.indexOf(currentPeriod)
    
    // 如果当前不是最后一个时段）则跳到下一个时段的同月份）
    if (periodIndex < TIME_PERIODS.length - 1) {
      return {
        year: currentYear,
        period: TIME_PERIODS[periodIndex + 1],
        month: currentMonth
      }
    }
    
    // 如果当前是最后一个时段）检查是否是最后一个年份
    const yearIndex = selectedYears.indexOf(currentYear)
    const visibleYears = selectedYears.filter(y => chartYears.includes(y))
    
    if (yearIndex < visibleYears.length - 1 && currentMonth === 12) {
      // 如果是12月，跳到下一年度的第一个时段的同月份
      const nextYear = visibleYears[yearIndex + 1]
      return {
        year: nextYear,
        period: TIME_PERIODS[0], // 尖
        month: currentMonth
      }
    }
    
    return null // 最后一个单元格
  }
  
  // 获取上一个单元格(纵向跳转)
  const getPrevCellVertical = (currentYear, currentPeriod, currentMonth) => {
    const periodIndex = TIME_PERIODS.indexOf(currentPeriod)
    
    // 如果当前不是第一个时段）则跳到上一个时段的同月份）
    if (periodIndex > 0) {
      return {
        year: currentYear,
        period: TIME_PERIODS[periodIndex - 1],
        month: currentMonth
      }
    }
    
    // 如果当前是第一个时段）检查是否是第一个年份
    const yearIndex = selectedYears.indexOf(currentYear)
    const visibleYears = selectedYears.filter(y => chartYears.includes(y))
    
    if (yearIndex > 0 && currentMonth === 1) {
      // 如果是1月，跳到上一年度的最后一个时段的同月份
      const prevYear = visibleYears[yearIndex - 1]
      return {
        year: prevYear,
        period: TIME_PERIODS[TIME_PERIODS.length - 1], // 尖
        month: currentMonth
      }
    }
    
    return null // 第一个单元格
  }
  
  // 单元格编辑 - 新结构
  const startEdit = (year, period, month) => {
    setEditingCell({ year, period, month })
    const currentVal = priceData[year]?.[period]?.[month] || ''
    setEditValue(currentVal !== '' ? String(currentVal) : '')
  }
  
  const stopEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }
  
  const saveEdit = (moveToNext = false) => {
    if (!editingCell) return
    
    const { year, period, month } = editingCell
    const val = editValue.trim()
    
    if (val === '') {
      setPriceData(prev => {
        const newData = { ...prev }
        if (!newData[year]) newData[year] = {}
        if (!newData[year][period]) newData[year][period] = {}
        newData[year][period][month] = ''
        return newData
      })
    } else {
      const numVal = parseFloat(val)
      if (isNaN(numVal) || numVal < 0) {
        showNotification('error', '请输入有效的非负数字')
        return
      }
      if (val.split('.')[1]?.length > 4) {
        showNotification('error', '最多保留4位小数')
        return
      }
      
      setPriceData(prev => {
        const newData = { ...prev }
        if (!newData[year]) newData[year] = {}
        if (!newData[year][period]) newData[year][period] = {}
        newData[year][period][month] = numVal.toFixed(4)
        return newData
      })
    }
    
    if (moveToNext) {
      // 纵向移动到下一个单元格(同一年份、下一个时段）
      const nextCell = getNextCellVertical(year, period, month)
      if (nextCell) {
        startEdit(nextCell.year, nextCell.period, nextCell.month)
      } else {
        stopEdit()
      }
    } else {
      showNotification('success', '保存成功!')
      stopEdit()
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit(true) // Enter：保存并纵向跳转到下一个单元格
    } else if (e.key === 'Escape') {
      e.preventDefault()
      stopEdit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        // Shift+Tab: 纵向跳到上一个单元格
        const { year, period, month } = editingCell
        const prevCell = getPrevCellVertical(year, period, month)
        if (prevCell) {
          startEdit(prevCell.year, prevCell.period, prevCell.month)
        }
      } else {
        // Tab: 纵向跳到下一个单元格
        const { year, period, month } = editingCell
        const nextCell = getNextCellVertical(year, period, month)
        if (nextCell) {
          startEdit(nextCell.year, nextCell.period, nextCell.month)
        }
      }
    }
  }
  
  // 计算总页数
  const totalPages = Math.ceil(allYears.length / ITEMS_PER_PAGE) || 1
  
  // 当前页的年份
  const currentPageYears = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return allYears.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [allYears, currentPage])

  const visibleTableYears = useMemo(
    () => selectedYears.filter(year => chartYears.includes(year)),
    [selectedYears, chartYears]
  )
  
  // 生成图表数据（使用新数据结构：priceData[year][period][month]）
  const chartData = useMemo(() => {
    return MONTHS.map(m => {
      const point = { month: m.label }
      allYears.forEach(year => {
        if (chartYears.includes(year)) {
          chartPeriods.forEach(period => {
            const value = priceData[year]?.[period]?.[m.month] || 0
            point[`${year}-${period}`] = parseFloat(value) || 0
          })
        }
      })
      return point
    })
  }, [priceData, allYears, chartYears, chartPeriods])
  
  // 计算线条粗细
  const totalLines = chartYears.length * chartPeriods.length
  const strokeWidth = totalLines > 8 ? 1.5 : totalLines > 4 ? 2 : 2.5
  
  // 年份颜色深浅（同色系）
  const getYearColor = (year, period) => {
    const baseColor = PERIOD_STYLES[period]?.color || '#1890ff'
    const yearIndex = allYears.indexOf(year)
    // 最新年份用原色，之前的年份逐渐加深
    const darkness = 1 + (yearIndex * 0.15)
    return baseColor
  }
  
  // 导出、导入
  const handleExport = () => showNotification('success', '导出成功!')
  const handleImport = () => showNotification('success', '导入成功!')
  
  // 获取当前可见的图例
  const visibleLegends = useMemo(() => {
    const legends = []
    currentPageYears.forEach(year => {
      if (chartYears.includes(year)) {
        chartPeriods.forEach(period => {
          legends.push(`${year}年${period}`)
        })
      }
    })
    return legends
  }, [currentPageYears, chartYears, chartPeriods])
  
  return (
    <div className="page-container h-full flex flex-col min-h-0 overflow-hidden">
      {/* 通知 */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[10000] px-4 py-2 rounded shadow-lg text-white text-sm animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* 新增年度弹窗 */}
      {showAddYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">新增年度列</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                请输入年度<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newYearInput}
                onChange={(e) => {
                  setNewYearInput(e.target.value)
                  if (yearInputError) setYearInputError('')
                }}
                placeholder="如：2027"
                className={`w-full px-3 py-2 border ${yearInputError ? 'border-red-500' : 'border-gray-200'} rounded text-sm focus:outline-none focus:border-primary`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddYear()
                  if (e.key === 'Escape') { setShowAddYearModal(false); setYearInputError(''); }
                }}
                autoFocus
              />
              {yearInputError && (
                <p className="text-xs text-red-500 mt-1">{yearInputError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowAddYearModal(false); setYearInputError(''); }}
                className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddYear}
                className="px-4 py-2 text-sm bg-primary text-white rounded hover:opacity-90"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 顶部操作栏（12%高度）========= */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between flex-shrink-0" style={{ height: '12%' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleImport} className="btn-primary text-sm flex items-center gap-1">
            <Upload className="w-4 h-4" /> Excel批量导入
          </button>
          <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-1">
            <Download className="w-4 h-4" /> 导出全表
          </button>
          <button onClick={() => setShowAddYearModal(true)} className="btn-secondary text-sm flex items-center gap-1">
            <PlusCircle className="w-4 h-4" /> 新增年度列
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
          <Info className="w-3 h-3" /> 所有单元格支持手动编辑，Enter键提交保存
        </div>
      </div>

      {/* ========== 顶部年份选择区（5%高度）========= */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex-shrink-0 relative" style={{ height: '5%' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">显示年度:</span>
          
          {/* 下拉框多选*/}
          <div className="relative flex-1">
            {/* 触发器*/}
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-left text-sm flex items-center justify-between hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {selectedYears.length === 0 ? (
                  <span className="text-gray-400">请选择年度</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1">
                    {selectedYears.slice(0, 3).map(year => (
                      <span key={year} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {year}
                      </span>
                    ))}
                    {selectedYears.length > 3 && (
                      <span className="text-xs text-gray-500">+{selectedYears.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <svg className={`w-4 h-4 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 下拉内容 */}
            {showYearDropdown && (
              <>
                {/* 遮罩层*/}
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowYearDropdown(false)}
                />
                
                {/* 下拉面板 */}
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => { setChartYears([...allYears].sort((a, b) => b - a)); setSelectedYears([...allYears].sort((a, b) => b - a)); }} 
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white text-gray-600 transition-colors"
                    >
                      全选
                    </button>
                    <button 
                      onClick={() => { setChartYears([]); setSelectedYears([]); }} 
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white text-gray-600 transition-colors"
                    >
                      清空
                    </button>
                    <div className="flex-1"></div>
                    <span className="text-xs text-gray-500">
                      已选 {selectedYears.length}/{allYears.length} 个年度
                    </span>
                  </div>
                  
                  {/* 年度选项 */}
                  {renderYearOptions()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========== 标题区（5%高度）========= */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between flex-shrink-0" style={{ height: '5%' }}>
        <h2 className="text-lg font-bold text-gray-800">历年供电电价台账</h2>
        <span className="text-sm text-gray-500">数据最后更新：{new Date().toLocaleString('zh-CN')}</span>
      </div>

      {/* ========== 台账表格区域（32%高度）========= */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0 mb-3" style={{ height: '32%' }}>
        <div className="overflow-x-auto overflow-y-auto h-full">
          <table className="text-sm border-collapse">
            {/* 第一列：年度+时段 + 1-12月*/}
            <thead>
              <tr>
                <th 
                  className="px-3 py-2 border border-gray-300 bg-gray-100 text-center text-sm font-bold text-gray-700 sticky left-0 z-20 min-w-[80px]"
                >
                  年度
                </th>
                <th 
                  className="px-3 py-2 border border-gray-300 bg-gray-100 text-center text-sm font-bold text-gray-700 sticky left-[80px] z-20 min-w-[80px]"
                >
                  时段
                </th>
                {MONTHS.map(m => (
                  <th key={m.month} className="px-2 py-2 border border-gray-300 bg-gray-100 text-center text-xs font-bold text-gray-700 min-w-[80px]">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 渲染当前选中的年度和时段 */}
              {visibleTableYears.map(year => (
                <React.Fragment key={year}>
                  {chartPeriods.map((period, periodIndex) => (
                    <tr key={`${year}-${period}`} className="hover:bg-gray-50">
                      {periodIndex === 0 && (
                        <td 
                          rowSpan={chartPeriods.length}
                          className="px-3 py-2 border border-gray-300 bg-blue-600 text-center text-sm font-bold text-white sticky left-0 z-10 align-middle"
                        >
                          {year}
                        </td>
                      )}
                      <td className={`px-2 py-2 border border-gray-200 text-center text-sm font-semibold ${PERIOD_STYLES[period]?.text || 'text-gray-800'}`}>
                        {period}
                      </td>
                      {MONTHS.map(m => {
                        const isEditing = editingCell?.year === year && editingCell?.period === period && editingCell?.month === m.month
                        const value = priceData[year]?.[period]?.[m.month] || ''
                        return (
                          <td
                            key={`${year}-${period}-${m.month}`}
                            className={`px-2 py-2 border border-gray-200 text-center cursor-pointer transition-all ${
                              isEditing ? 'bg-blue-50 ring-2 ring-primary' : 'bg-white hover:border-primary'
                            }`}
                            onClick={() => startEdit(year, period, m.month)}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-full px-1 py-0.5 text-sm border border-primary bg-white text-center focus:outline-none"
                                onBlur={saveEdit}
                              />
                            ) : (
                              <span className="text-gray-800">
                                {value ? parseFloat(value).toFixed(4) : '-'}
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {(visibleTableYears.length === 0 || chartPeriods.length === 0) && (
            <div className="text-center py-8 text-gray-500">请选择年度和时段后查看台账数据</div>
          )}
        </div>
      </div>

      {/* ========== 电价趋势图表区域（剩余高度）========= */}
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        {/* 维度筛选控件*/}
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="space-y-2">
            {/* 年度选择区*/}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">年度:</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={selectAllYears} className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                  全选
                </button>
                <button onClick={clearAllYears} className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                  清空
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                {allYears.map(year => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      chartYears.includes(year)
                        ? 'bg-primary text-white font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 时段选择区*/}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">时段:</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={selectAllPeriods} className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                  全选
                </button>
                <button onClick={clearAllPeriods} className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                  清空
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                {TIME_PERIODS.map(period => {
                  const style = PERIOD_STYLES[period]
                  const isSelected = chartPeriods.includes(period)
                  return (
                    <button
                      key={period}
                      onClick={() => togglePeriod(period)}
                      className={`px-3 py-1 text-xs rounded transition-all font-semibold ${
                        isSelected
                          ? `${style.bg} text-white shadow-sm`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 折线图*/}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis 
              tickFormatter={(value) => value.toFixed(2)} 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value, name) => {
                const [year, period] = name.split('-')
                return [`${parseFloat(value).toFixed(4)} 元/kWh`, `${year}年${period}`]
              }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => visibleLegends.includes(value) ? value : null}
            />
            {chartYears.flatMap(year => 
              chartPeriods.map(period => {
                const key = `${year}-${period}`
                const color = getYearColor(year, period)
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={color}
                    strokeWidth={totalLines > 8 ? 1.5 : 2}
                    dot={{ r: 2, strokeWidth: 2, stroke: '#acababff' }}
                    activeDot={{ r: 5 }}
                    animationDuration={300}
                  />
                )
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HistoricalElectricityPrice














