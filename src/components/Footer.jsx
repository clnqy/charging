import React from 'react'

const Footer = () => {
  return (
    <footer
      className="bg-primary text-white flex items-center justify-center z-20"
      style={{ height: '7vh', minHeight: '40px', width: '100%' }}
    >
      <div className="text-sm text-white/90">
        <span>充电运营管理平台</span>
        <span className="mx-2">|</span>
        <span>版权所有 © 2026 科技有限公司</span>
        <span className="mx-2">|</span>
        <span>版本号：V1.0.0</span>
      </div>
    </footer>
  )
}

export default Footer
