import React, { useEffect, useMemo, useState } from 'react'
import { Columns3, FileSpreadsheet } from 'lucide-react'
import Modal from './Modal'

const normalize = (groups) => groups.map((group) => ({
  ...group,
  columns: group.columns.filter((col) => !['shortName', 'group'].includes(col.key)),
}))

export const useReportFields = ({ storageKey, groups, fixedKeys = [], defaultKeys }) => {
  const normalizedGroups = useMemo(() => normalize(groups), [groups])
  const allColumns = useMemo(() => normalizedGroups.flatMap((group) => group.columns), [normalizedGroups])
  const allKeys = useMemo(() => allColumns.map((col) => col.key), [allColumns])
  const systemDefaultKeys = useMemo(() => defaultKeys || allKeys, [defaultKeys, allKeys])

  const [visibleKeys, setVisibleKeys] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}:visible`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return [...new Set([...parsed.filter((key) => allKeys.includes(key)), ...fixedKeys])]
      } catch {
        return [...new Set([...systemDefaultKeys, ...fixedKeys])]
      }
    }
    return [...new Set([...systemDefaultKeys, ...fixedKeys])]
  })

  const [exportKeys, setExportKeys] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}:export`)
    if (saved) {
      try {
        return JSON.parse(saved).filter((key) => allKeys.includes(key))
      } catch {
        return visibleKeys
      }
    }
    return visibleKeys
  })

  useEffect(() => {
    localStorage.setItem(`${storageKey}:visible`, JSON.stringify(visibleKeys))
  }, [storageKey, visibleKeys])

  useEffect(() => {
    localStorage.setItem(`${storageKey}:export`, JSON.stringify(exportKeys))
  }, [storageKey, exportKeys])

  const visibleColumns = useMemo(
    () => allColumns.filter((col) => visibleKeys.includes(col.key)),
    [allColumns, visibleKeys]
  )

  const resetVisible = () => setVisibleKeys([...new Set([...systemDefaultKeys, ...fixedKeys])])

  return {
    groups: normalizedGroups,
    allColumns,
    visibleColumns,
    visibleKeys,
    setVisibleKeys,
    exportKeys,
    setExportKeys,
    resetVisible,
    fixedKeys,
  }
}

const CheckboxGroup = ({ groups, checkedKeys, setCheckedKeys, fixedKeys = [] }) => {
  const allKeys = groups.flatMap((group) => group.columns.map((col) => col.key))
  const fixedSet = new Set(fixedKeys)
  const toggleKey = (key, checked) => {
    setCheckedKeys((prev) => checked ? [...new Set([...prev, key])] : prev.filter((item) => item !== key || fixedSet.has(item)))
  }
  const setAll = () => setCheckedKeys([...new Set([...allKeys, ...fixedKeys])])
  const clearAll = () => setCheckedKeys([...fixedKeys])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={setAll} className="btn-secondary text-xs">全选所有字段</button>
        <button onClick={clearAll} className="btn-secondary text-xs">清空所有勾选</button>
      </div>
      {groups.map((group) => {
        const groupKeys = group.columns.map((col) => col.key)
        const selectGroup = () => setCheckedKeys((prev) => [...new Set([...prev, ...groupKeys])])
        const invertGroup = () => setCheckedKeys((prev) => {
          const set = new Set(prev)
          groupKeys.forEach((key) => {
            if (fixedSet.has(key)) set.add(key)
            else if (set.has(key)) set.delete(key)
            else set.add(key)
          })
          return [...set]
        })

        return (
          <div key={group.title} className="border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">{group.title}</h4>
              <div className="flex gap-2">
                <button onClick={selectGroup} className="text-xs text-primary hover:underline">全选本组</button>
                <button onClick={invertGroup} className="text-xs text-primary hover:underline">反选本组</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.columns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    disabled={fixedSet.has(col.key)}
                    checked={checkedKeys.includes(col.key)}
                    onChange={(event) => toggleKey(col.key, event.target.checked)}
                  />
                  <span className="truncate" title={col.title}>{col.title}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ReportFieldControls = ({ fields, onExport, className = '' }) => {
  const [columnOpen, setColumnOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [draftVisible, setDraftVisible] = useState(fields.visibleKeys)
  const [draftExport, setDraftExport] = useState(fields.exportKeys)

  const openColumns = () => {
    setDraftVisible(fields.visibleKeys)
    setColumnOpen(true)
  }

  const openExport = () => {
    setDraftExport(fields.exportKeys.length ? fields.exportKeys : fields.visibleKeys)
    setExportOpen(true)
  }

  return (
    <>
      <button onClick={openExport} className={`bg-white text-primary border border-primary px-4 py-2 rounded text-sm flex items-center gap-1 hover:opacity-90 transition-opacity ${className}`}>
        <FileSpreadsheet className="w-4 h-4" />
        导出
      </button>
      <button onClick={openColumns} className={`bg-white text-primary border border-primary px-4 py-2 rounded text-sm flex items-center gap-1 hover:opacity-90 transition-opacity ${className}`}>
        <Columns3 className="w-4 h-4" />
        列设置
      </button>

      <Modal isOpen={columnOpen} onClose={() => setColumnOpen(false)} title="列设置" showFooter={false}>
        <CheckboxGroup groups={fields.groups} checkedKeys={draftVisible} setCheckedKeys={setDraftVisible} fixedKeys={fields.fixedKeys} />
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          <button onClick={() => setColumnOpen(false)} className="btn-secondary text-sm">取消</button>
          <button onClick={() => { fields.resetVisible(); setColumnOpen(false) }} className="btn-secondary text-sm">恢复默认</button>
          <button onClick={() => { fields.setVisibleKeys(draftVisible); setColumnOpen(false) }} className="btn-primary text-sm">确定</button>
        </div>
      </Modal>

      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="导出" showFooter={false}>
        <p className="text-sm text-red-500 mb-3">请勾选要导出的字段！</p>
        <CheckboxGroup groups={fields.groups} checkedKeys={draftExport} setCheckedKeys={setDraftExport} fixedKeys={[]} />
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          <button onClick={() => setExportOpen(false)} className="btn-secondary text-sm">取消</button>
          <button onClick={() => { fields.setExportKeys(draftExport); onExport?.(draftExport); setExportOpen(false) }} className="btn-primary text-sm">导出</button>
        </div>
      </Modal>
    </>
  )
}

export default ReportFieldControls
