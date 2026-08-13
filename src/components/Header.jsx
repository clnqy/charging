import React from 'react'
import { Bell, ChevronDown, KeyRound, LogOut } from 'lucide-react'

const Header = ({ sidebarCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  return (
    <header
      className="bg-primary text-white flex items-center justify-between px-4 shadow-md z-20 transition-all duration-300"
      style={{ height: '7vh', minHeight: '60px', width: '100%' }}
    >
      {sidebarCollapsed && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-primary font-bold text-sm">充</span>
          </div>
          <span className="font-bold text-lg hidden md:inline">充电运营管理平台</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-1 justify-center">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-sm font-medium">管</span>
        </div>
        <span className="text-sm font-medium">运营管理员</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-xs flex items-center justify-center font-medium">
            3
          </span>
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="text-sm hidden md:inline">管理员</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[160px] text-gray-800">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <KeyRound className="w-4 h-4" />
                修改密码
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-danger transition-colors">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
