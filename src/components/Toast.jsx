import React, { useEffect, useState } from 'react'

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeStyles = {
    info: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-danger',
  }

  if (!visible) return null

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${typeStyles[type]} animate-in slide-in-from-right`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

export const useToast = () => {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration, key: Date.now() })
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <Toast 
      key={toast.key}
      message={toast.message} 
      type={toast.type} 
      duration={toast.duration} 
      onClose={hideToast} 
    />
  ) : null

  return { showToast, ToastComponent }
}

export default Toast
