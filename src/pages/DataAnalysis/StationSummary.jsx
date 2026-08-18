import React, { useState, useMemo } from 'react'
import { FileSpreadsheet, FileText, AlertCircle, Upload, RefreshCw, Clock } from 'lucide-react'
import Modal from '../../components/Modal'
import InlineEditableCell from './InlineEditableCell'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'
import FieldTooltip from '../../components/FieldTooltip'

// 基础站点数据（不含可研收入和目标收入）
const baseStationData = [
  { code: 'ST001', name: '中心广场充电站', cooperationMode: '自营站' },
  { code: 'ST002', name: '高新园区充电站', cooperationMode: '驿满慢充' },
  { code: 'ST003', name: '火车站充电站', cooperationMode: '外协站' },
  { code: 'ST004', name: '体育馆充电站', cooperationMode: '场地合作站' },
  { code: 'ST005', name: '机场充电站', cooperationMode: '高压合作站' },
  { code: 'ST006', name: '大学城充电站', cooperationMode: '低压合作站' },
  { code: 'ST007', name: '工业园充电站', cooperationMode: '三方平台互通站' },
  { code: 'ST008', name: '商业中心充电站', cooperationMode: '自营站' },
  { code: 'ST009', name: '医院充电站', cooperationMode: '场地合作站' },
  { code: 'ST010', name: '物流园充电站', cooperationMode: '自营站' },
]
// 生成某个月的模拟实时数据
const generateMonthData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return Math.floor(min + val * (max - min))
  }

  const busIncome = getRandom(50000, 200000)
  const socialIncome = getRandom(20000, 80000)
  const totalIncome = busIncome + socialIncome
  const totalCost = getRandom(60000, 220000)
  const grossProfit = totalIncome - totalCost
  
  return baseStationData.map(station => ({
    ...station,
    plannedIncome: null,
    targetIncome: null,
    totalIncome,
    busIncome,
    socialIncome,
    totalCost,
    grossProfit,
  }))
}

// 模拟导入数据 - 根据站点编码匹配
const generateImportData = (month) => {
  const seed = month.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const getRandom = (min, max) => {
    const val = (Math.sin(seed * 999 + min) + 1) / 2
    return Math.floor(min + val * (max - min))
  }

  return baseStationData.map(station => ({
    code: station.code,
    plannedIncome: getRandom(100000, 300000),
    targetIncome: getRandom(120000, 350000),
  }))
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(value)
}

const StationSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-07')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importMonth, setImportMonth] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  
  const [monthlyData, setMonthlyData] = useState(() => {
    const initial = {}
    initial['2026-07'] = generateMonthData('2026-07')
    return initial
  })

  const [monthList, setMonthList] = useState(['2026-07'])

  const currentData = useMemo(() => {
    if (monthlyData[selectedMonth]) {
      return monthlyData[selectedMonth]
    }
    const newData = generateMonthData(selectedMonth)
    setMonthlyData(prev => ({ ...prev, [selectedMonth]: newData }))
    return newData
  }, [selectedMonth, monthlyData])

  const totals = useMemo(() => {
    return currentData.reduce((acc, item) => ({
      plannedIncome: acc.plannedIncome + (item.plannedIncome || 0),
      targetIncome: acc.targetIncome + (item.targetIncome || 0),
      totalIncome: acc.totalIncome + (item.totalIncome || 0),
      busIncome: acc.busIncome + (item.busIncome || 0),
      socialIncome: acc.socialIncome + (item.socialIncome || 0),
      totalCost: acc.totalCost + (item.totalCost || 0),
      grossProfit: acc.grossProfit + (item.grossProfit || 0),
    }), {
      plannedIncome: 0, targetIncome: 0, totalIncome: 0,
      busIncome: 0, socialIncome: 0, totalCost: 0, grossProfit: 0
    })
  }, [currentData])

  const getMonthOptions = () => {
    const options = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(2026, 6 - i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      options.push(`${year}-${month}`)
    }
    monthList.forEach(m => {
      if (!options.includes(m)) options.push(m)
    })
    return [...new Set(options)].sort((a, b) => b.localeCompare(a))
  }

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    if (!monthlyData[month]) {
      const newData = generateMonthData(month)
      setMonthlyData(prev => ({ ...prev, [month]: newData }))
    }
  }

  const handleAddMonthly = () => {
    const currentIndex = monthList.indexOf(selectedMonth)
    let nextMonth = ''
    
    if (currentIndex === -1 || currentIndex === 0) {
      const [year, month] = selectedMonth.split('-').map(Number)
      const date = new Date(year, month, 1)
      nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else {
      const [year, month] = monthList[0].split('-').map(Number)
      const date = new Date(year, month, 1)
      nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    
    if (!monthList.includes(nextMonth)) {
      const newData = generateMonthData(nextMonth)
      setMonthlyData(prev => ({ ...prev, [nextMonth]: newData }))
      setMonthList(prev => [nextMonth, ...prev].sort((a, b) => b.localeCompare(a)))
      setSelectedMonth(nextMonth)
    } else {
      setSelectedMonth(nextMonth)
    }
  }

  const handleExportExcel = () => {
    alert('导出Excel功能（前端原型模拟）')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
      const preview = generateImportData(importMonth || selectedMonth)
      setImportPreview(preview)
      setShowPreview(true)
    }
  }

  const handleImport = () => {
    if (!importMonth) {
      alert('请选择导入月份')
      return
    }
    
    const importData = generateImportData(importMonth)
    
    setMonthlyData(prev => {
      const monthData = prev[importMonth] ? [...prev[importMonth]] : generateMonthData(importMonth)
      
      const updatedData = monthData.map(station => {
        const importItem = importData.find(item => item.code === station.code)
        if (importItem) {
          return {
            ...station,
            plannedIncome: importItem.plannedIncome,
            targetIncome: importItem.targetIncome,
          }
        }
        return station
      })
      
      return { ...prev, [importMonth]: updatedData }
    })
    
    if (!monthList.includes(importMonth)) {
      setMonthList(prev => [...prev, importMonth].sort((a, b) => b.localeCompare(a)))
    }
    
    setSelectedMonth(importMonth)
    
    setImportModalOpen(false)
    setShowPreview(false)
    setImportFile(null)
    setImportPreview([])
    setImportMonth('')
    
    alert('保存成功！')
  }

  const saveCellValue = (rowCode, colKey, nextValue) => {
    setMonthlyData(prev => ({
      ...prev,
      [selectedMonth]: prev[selectedMonth].map(station => (
        station.code === rowCode
          ? { ...station, [colKey]: nextValue }
          : station
      ))
    }))
  }
  const tableColumns = [
    { key: 'code', title: '站点编码', width: '8%' },
    { key: 'name', title: '站点', width: '10%' },
    { key: 'cooperationMode', title: '经营模式', width: '9%', note: '数据来源于站点基础表' },
    { key: 'plannedIncome', title: '可研收入（元）', width: '9%' },
    { key: 'targetIncome', title: '目标收入（元）', width: '9%' },
    { key: 'totalIncome', title: '完成总收入（元）', width: '9%' },
    { key: 'busIncome', title: '其中公交收入（元）', width: '9%' },
    { key: 'socialIncome', title: '其中社会收入（元）', width: '9%' },
    { key: 'totalCost', title: '完成总成本（元）', width: '9%' },
    { key: 'grossProfit', title: '充电毛利（元）', width: '9%' },
  ]
  const reportFields = useReportFields({
    storageKey: 'data-analysis:station-summary',
    groups: [{ title: '经营汇总', columns: tableColumns }],
    fixedKeys: ['code', 'name'],
  })

  const renderCell = (row, col) => {
    if (col.key === 'code') return <span className="font-medium">{row.code}</span>
    if (col.key === 'name') return row.name
    if (col.key === 'cooperationMode') return row.cooperationMode
    if (col.key === 'plannedIncome' || col.key === 'targetIncome') {
      return (
        <InlineEditableCell
          value={row[col.key]}
          displayValue={formatCurrency(row[col.key])}
          placeholder="待填写"
          inputType="number"
          numeric
          onSave={(nextValue) => saveCellValue(row.code, col.key, nextValue)}
        />
      )
    }
    return formatCurrency(row[col.key])
  }

  return (
    <div className="page-container h-full flex flex-col">
      {/* 顶部筛选 & 操作区（占主内容高度12%）*/}
      <div 
        className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between"
        style={{ height: '12%', minHeight: '80px' }}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">统计月份</label>
            <select 
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white"
            >
              {getMonthOptions().map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-success bg-green-50 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>每月自动生成</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setImportModalOpen(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            导入可研与目标收入
          </button>
          <div className="flex items-center gap-1 text-xs text-primary bg-blue-50 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>每月自动生成</span>
          </div>
          <ReportFieldControls fields={reportFields} onExport={handleExportExcel} />
        </div>
      </div>

      {/* 统计表标题区*/}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-gray-800">站点经营汇总表</h2>
          <span className="text-sm text-gray-500 ml-2">
            统计月份：{selectedMonth}
          </span>
          {!currentData.some(d => d.plannedIncome !== null) && (
            <span className="text-xs text-warning bg-orange-50 px-2 py-0.5 rounded ml-2">
              请先导入可研收入和目标收入
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded-sm inline-block" />
            导入字段
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white border border-gray-200 rounded-sm inline-block" />
            自动统计
          </span>
        </div>
      </div>

      {/* 主数据表格区域（占主内容剩余高度85%）*/}
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1"
        style={{ height: '85%' }}
      >
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {reportFields.visibleColumns.map(col => (
                  <th 
                    key={col.key}
                    className={`px-3 py-3 text-left text-xs font-bold text-gray-700 border-b border-gray-200 whitespace-nowrap `}
                    style={{ width: col.width }}
                  >
                    <FieldTooltip content={col.note} className="flex">
                      {col.title}
                      {col.note && (
                        <AlertCircle className="w-3 h-3 text-gray-400 cursor-help" />
                      )}
                    </FieldTooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.map((row, index) => (
                <tr 
                  key={row.code} 
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  {reportFields.visibleColumns.map(col => (
                    <td
                      key={col.key}
                      className={`px-3 py-2.5 text-gray-800 whitespace-nowrap ${
                        ['plannedIncome', 'targetIncome'].includes(col.key) ? 'text-right font-medium text-primary' : ''
                      } ${['totalIncome', 'busIncome', 'socialIncome', 'totalCost'].includes(col.key) ? 'text-right' : ''} ${
                        col.key === 'grossProfit' ? `text-right font-bold ${row.grossProfit >= 0 ? 'text-success' : 'text-danger'}` : ''
                      }`}
                    >
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                {reportFields.visibleColumns.map((col, index) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 whitespace-nowrap ${index === 0 ? 'text-gray-800' : 'text-right'} ${
                      col.key === 'grossProfit' ? (totals.grossProfit >= 0 ? 'text-success' : 'text-danger') : ''
                    }`}
                  >
                    {index === 0 ? '合计' : totals[col.key] !== undefined ? formatCurrency(totals[col.key]) : ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 计算逻辑说明 */}
      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <span>每月自动生成</span>
            可研收入、目标收入通过文件导入，根据站点编码自动匹配；
            完成总收入 = 周期内订单自动汇总取值（实时更新）；
            公交收入 = 周期内公交车辆订单汇总（实时更新）；
            社会收入 = 周期内社会散客订单汇总（实时更新）；
            完成总成本 = 同步成本表月度数据（实时更新）；
            充电毛利 = 完成总收入 - 完成总成本（实时更新）。
            毛利为正值时显示绿色，负值时显示红色。
          </div>
        </div>
      </div>

      {/* 导入可研与目标收入弹窗*/}
      <Modal 
        isOpen={importModalOpen} 
        onClose={() => { setImportModalOpen(false); setShowPreview(false); setImportFile(null); setImportPreview([]); setImportMonth('') }}
        title="导入可研与目标收入"
        onConfirm={handleImport}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              导入月份 <span className="text-danger">*</span>
            </label>
            <select 
              value={importMonth}
              onChange={(e) => setImportMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="">请选择导入月份</option>
              {getMonthOptions().map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              导入文件 <span className="text-danger">*</span>
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('import-file-input').click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {importFile ? `已选择：{importFile.name}` : '点击上传或拖拽文件到此处'}
              </p>
              <p className="text-xs text-gray-400">支持 .xlsx, .xls, .csv 格式</p>
              <input
                id="import-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">导入文件格式要求</p>
            <div className="text-xs text-gray-500 leading-relaxed">
              <p>文件需包含以下列：</p>
              <ul className="mt-1 ml-4 list-disc">
                <li>站点编码（必填）- 与系统内站点编码匹配</li>
                <li>可研收入（必填）- 数值型</li>
                <li>目标收入（必填）- 数值型</li>
              </ul>
            </div>
          </div>

          {showPreview && importPreview.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-primary mb-2">导入预览（共 {importPreview.length} 条记录）</p>
              <div className="max-h-40 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-2 py-1 text-left">站点编码</th>
                      <th className="px-2 py-1 text-right">可研收入</th>
                      <th className="px-2 py-1 text-right">目标收入</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.slice(0, 5).map((item, idx) => (
                      <tr key={idx} className="border-b border-blue-100">
                        <td className="px-2 py-1">{item.code}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.plannedIncome)}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.targetIncome)}</td>
                      </tr>
                    ))}
                    {importPreview.length > 5 && (
                      <tr>
                        <td colSpan={3} className="px-2 py-1 text-center text-gray-400">...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default StationSummary















