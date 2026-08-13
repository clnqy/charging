import React, { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  BarChart3, 
  MessageSquare,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Menu
} from 'lucide-react'

const menuItems = [
  {
    key: 'data-analysis',
    icon: BarChart3,
    label: '数据统计与分析',
    path: '/data-analysis/station-summary',
    highlight: true,
    children: [
      { key: 'data-analysis-station-summary', label: '站点经营汇总表', path: '/data-analysis/station-summary' },
      { key: 'data-analysis-station-revenue', label: '单站营收表', path: '/data-analysis/station-revenue' },
      { key: 'data-analysis-station-bus-operation', label: '单站公交运营情况表', path: '/data-analysis/station-bus-operation' },
      { key: 'data-analysis-station-social-operation', label: '单站社会运营情况表', path: '/data-analysis/station-social-operation' },
      { key: 'data-analysis-station-bus-revenue', label: '站点公交收入表', path: '/data-analysis/station-bus-revenue' },
      { key: 'data-analysis-station-cost', label: '站点成本表', path: '/data-analysis/station-cost' },
      { key: 'data-analysis-station-social-revenue', label: '单站社会营收情况表', path: '/data-analysis/station-social-revenue' },
      { key: 'data-analysis-bus-line-energy', label: '公交单线能耗表', path: '/data-analysis/bus-line-energy' },
      { key: 'data-analysis-historical-electricity-price', label: '历年供电电价台账', path: '/data-analysis/historical-electricity-price' },
    ]
  },
  {
    key: 'settlement',
    icon: Database,
    label: '结算管理',
    path: '/settlement/large-customer-rules',
    children: [
      { key: 'settlement-large-customer-rules', label: '大客户结算规则配置', path: '/settlement/large-customer-rules' },
    ]
  },
  {
    key: 'system',
    icon: Settings,
    label: '系统管理',
    path: '/system',
    children: [
      { key: 'system-role', label: '角色管理', path: '/system/role' },
      { key: 'system-user', label: '用户管理', path: '/system/user' },
      { key: 'system-log', label: '操作日志', path: '/system/log' },
    ]
  },
  {
    key: 'user',
    icon: Users,
    label: '用户管理',
    path: '/user',
    children: [
      { key: 'user-list', label: '用户列表', path: '/user/list' },
      { key: 'user-group', label: '用户分组', path: '/user/group' },
    ]
  },
  {
    key: 'message',
    icon: MessageSquare,
    label: '消息通知',
    path: '/message',
    children: []
  },
  {
    key: 'base-data',
    icon: Database,
    label: '基础数据管理',
    path: '/base-data/station',
    children: [
      { key: 'base-data-station', label: '站点基础表', path: '/base-data/station' },
      { key: 'base-data-vehicle', label: '站车基础表', path: '/base-data/vehicle' },
      { key: 'base-data-order', label: '订单数据表', path: '/base-data/order' },
    ]
  },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedKeys, setExpandedKeys] = useState([])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems
    const query = searchQuery.toLowerCase()
    return menuItems.filter(item => {
      const matchSelf = item.label.toLowerCase().includes(query)
      const matchChildren = item.children?.some(child => 
        child.label.toLowerCase().includes(query)
      )
      return matchSelf || matchChildren
    })
  }, [searchQuery])

  const toggleExpand = (key) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside 
      className="bg-sidebar-dark text-white h-full flex flex-col transition-all duration-300 z-30"
      style={{ width: collapsed ? '5%' : '18%', minWidth: collapsed ? '60px' : '200px' }}
    >
      {/* Logo区域 */}
      <div 
        className="flex items-center justify-between p-4 border-b border-white/10"
        style={{ height: '7vh', minHeight: '60px' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base whitespace-nowrap">充电运营管理平台</span>
          </div>
        )}
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          style={{ margin: collapsed ? '0 auto' : '0' }}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* 搜索区域 */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索菜单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      )}

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedKeys.includes(item.key)
            const active = isActive(item.path)

            return (
              <li key={item.key}>
                <NavLink
                  to={item.path}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault()
                      toggleExpand(item.key)
                    }
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 relative
                    ${collapsed ? 'justify-center' : ''}
                    ${item.highlight ? 'bg-primary/20 border-l-2 border-primary' : ''}
                    ${active ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                  `}
                  style={{ gap: collapsed ? '0' : undefined }}
                >
                  <Icon 
                    className={`w-5 h-5 flex-shrink-0 ${item.highlight ? 'text-primary' : ''} ${active ? 'text-white' : ''}`} 
                  />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                      {hasChildren && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </>
                  )}
                  {item.highlight && !collapsed && (
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </NavLink>

                {/* 子菜单 */}
                {hasChildren && !collapsed && isExpanded && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <NavLink
                          to={child.path}
                          className={({ isActive }) => `
                            block px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${isActive ? 'bg-primary/30 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                          `}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

