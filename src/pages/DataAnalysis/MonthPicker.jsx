import React, { useState } from 'react'
import { Calendar, ChevronsLeft, ChevronsRight } from 'lucide-react'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1)

const MonthPicker = ({ value, onChange, className = '' }) => {
  const selectedYear = Number((value || '').slice(0, 4)) || new Date().getFullYear()
  const [open, setOpen] = useState(false)
  const [panelYear, setPanelYear] = useState(selectedYear)

  const toggleOpen = () => {
    setPanelYear(selectedYear)
    setOpen(prev => !prev)
  }

  const selectMonth = (month) => {
    onChange(`${panelYear}-${String(month).padStart(2, '0')}`)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-40 h-10 px-3 border rounded-md bg-white text-left text-sm flex items-center justify-between shadow-sm transition-colors ${
          open ? 'border-primary ring-2 ring-blue-100' : 'border-gray-200 hover:border-primary'
        }`}
      >
        <span className={value ? 'text-gray-700' : 'text-gray-400'}>
          {value || '选择月份'}
        </span>
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-md shadow-xl z-[9999] border border-gray-100 overflow-hidden">
            <div className="h-12 px-3 flex items-center justify-between border-b border-gray-100">
              <button
                type="button"
                onClick={() => setPanelYear(prev => prev - 1)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-50 text-gray-400"
                title="上一年"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">{panelYear}</span>
              <button
                type="button"
                onClick={() => setPanelYear(prev => prev + 1)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-50 text-gray-400"
                title="下一年"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 px-5 py-5">
              {MONTH_OPTIONS.map(month => {
                const monthValue = `${panelYear}-${String(month).padStart(2, '0')}`
                const selected = value === monthValue

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(month)}
                    className={`h-9 rounded text-sm transition-colors ${
                      selected
                        ? 'bg-primary text-white font-semibold'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
                    }`}
                  >
                    {month}月
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MonthPicker
