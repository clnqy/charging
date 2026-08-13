import React, { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = '确认', cancelText = '取消', showFooter = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-auto">
          {children}
        </div>
        {showFooter && (
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <button 
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              {cancelText}
            </button>
            <button 
              onClick={handleConfirm}
              className="btn-primary text-sm"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
