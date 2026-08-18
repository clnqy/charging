import React, { useEffect, useRef, useState } from 'react'

const InlineEditableCell = ({
  value,
  displayValue,
  placeholder = '-',
  inputType = 'text',
  numeric = false,
  onSave,
  className = '',
  inputClassName = '',
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setDraft(value === null || value === undefined ? '' : String(value))
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    const nextValue = numeric
      ? (trimmed === '' ? null : Number(trimmed))
      : trimmed

    onSave(Number.isNaN(nextValue) ? null : nextValue)
    setEditing(false)
    setDraft('')
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={inputType}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            commitEdit()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            cancelEdit()
          }
        }}
        className={`w-full px-2 py-1 border border-primary rounded text-sm bg-white outline-none ${inputClassName}`}
      />
    )
  }

  return (
    <span
      onClick={startEdit}
      className={`cursor-text text-blue-600 hover:underline ${className}`}
      title=""
    >
      {value === null || value === undefined || value === '' ? (
        <span className="text-gray-400 italic">{placeholder}</span>
      ) : (
        displayValue ?? value
      )}
    </span>
  )
}

export default InlineEditableCell










