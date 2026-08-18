import React, { useState } from 'react'

const FieldTooltip = ({ content, children, className = '' }) => {
  const [position, setPosition] = useState(null)

  const showTooltip = (event) => {
    if (!content) return
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 120),
    })
  }

  const hideTooltip = () => setPosition(null)

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      tabIndex={content ? 0 : undefined}
    >
      {children}
      {content && position && (
        <span
          className="fixed z-[9999] w-56 -translate-x-1/2 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-left text-xs leading-relaxed text-white shadow-lg whitespace-normal pointer-events-none"
          style={{ top: position.top, left: position.left }}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export default FieldTooltip
