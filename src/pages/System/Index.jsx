import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CheckSquare,
  ChevronDown,
  Copy,
  Edit,
  KeyRound,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import Modal from '../../components/Modal'
import ReportFieldControls, { useReportFields } from '../../components/ReportFieldControls'

const orgOptions = ['重庆公交集团', '北部运营公司', '南部运营公司', '巴驿站场分公司']
const deptOptions = {
  '重庆公交集团': ['运营管理部', '财务管理部', '安全管理部'],
  '北部运营公司': ['北部运营一部', '北部运营二部'],
  '南部运营公司': ['南部运营一部', '南部运营二部'],
  '巴驿站场分公司': ['场站运营部', '资产管理部'],
}

const stationScopeNodes = [
  {
    key: 'org:重庆公交集团',
    label: '重庆公交集团',
    children: [
      { key: 'station:中心广场充电站', label: '中心广场充电站' },
      { key: 'station:高新园区充电站', label: '高新园区充电站' },
      { key: 'station:机场充电站', label: '机场充电站' },
    ],
  },
  {
    key: 'org:巴驿站场分公司',
    label: '巴驿站场分公司',
    children: [
      { key: 'station:体育馆充电站', label: '体育馆充电站' },
      { key: 'station:医院充电站', label: '医院充电站' },
    ],
  },
]

const permissionTree = [
  {
    key: 'menu:data-analysis',
    label: '数据统计与分析',
    type: 'page',
    children: [
      {
        key: 'page:station-bus-operation',
        label: '单站公交运营情况表',
        type: 'page',
        children: [
          { key: 'btn:station-bus-operation:view', label: '查看列表', type: 'button' },
          { key: 'btn:station-bus-operation:import', label: '导入', type: 'button' },
          { key: 'btn:station-bus-operation:export', label: '导出', type: 'button' },
        ],
      },
      {
        key: 'page:station-summary',
        label: '站点经营汇总表',
        type: 'page',
        children: [
          { key: 'btn:station-summary:view', label: '查看列表', type: 'button' },
          { key: 'btn:station-summary:export', label: '导出', type: 'button' },
        ],
      },
    ],
  },
  {
    key: 'menu:base-data',
    label: '基础数据管理',
    type: 'page',
    children: [
      {
        key: 'page:station-base',
        label: '站点基础表',
        type: 'page',
        children: [
          { key: 'btn:station-base:view', label: '查看列表', type: 'button' },
          { key: 'btn:station-base:edit', label: '编辑', type: 'button' },
          { key: 'btn:station-base:import', label: '导入', type: 'button' },
          { key: 'btn:station-base:export', label: '导出', type: 'button' },
        ],
      },
      {
        key: 'page:vehicle-base',
        label: '站车基础表',
        type: 'page',
        children: [
          { key: 'btn:vehicle-base:view', label: '查看列表', type: 'button' },
          { key: 'btn:vehicle-base:add', label: '新增', type: 'button' },
          { key: 'btn:vehicle-base:edit', label: '编辑', type: 'button' },
          { key: 'btn:vehicle-base:export', label: '导出', type: 'button' },
        ],
      },
    ],
  },
  {
    key: 'menu:settlement',
    label: '结算管理',
    type: 'page',
    children: [
      {
        key: 'page:large-customer-rules',
        label: '大客户结算规则配置',
        type: 'page',
        children: [
          { key: 'btn:large-customer-rules:view', label: '查看列表', type: 'button' },
          { key: 'btn:large-customer-rules:add', label: '新增', type: 'button' },
          { key: 'btn:large-customer-rules:edit', label: '编辑', type: 'button' },
          { key: 'btn:large-customer-rules:delete', label: '删除', type: 'button' },
          { key: 'btn:large-customer-rules:status', label: '启用/停用', type: 'button' },
          { key: 'btn:large-customer-rules:export', label: '导出', type: 'button' },
        ],
      },
    ],
  },
  {
    key: 'menu:system',
    label: '系统管理',
    type: 'page',
    children: [
      {
        key: 'page:user-management',
        label: '用户管理',
        type: 'page',
        children: [
          { key: 'btn:user-management:view', label: '查看列表', type: 'button' },
          { key: 'btn:user-management:add', label: '新增', type: 'button' },
          { key: 'btn:user-management:edit', label: '编辑', type: 'button' },
          { key: 'btn:user-management:reset-password', label: '重置密码', type: 'button' },
          { key: 'btn:user-management:status', label: '启用/禁用', type: 'button' },
          { key: 'btn:user-management:export', label: '导出', type: 'button' },
        ],
      },
      {
        key: 'page:role-management',
        label: '角色管理',
        type: 'page',
        children: [
          { key: 'btn:role-management:view', label: '查看列表', type: 'button' },
          { key: 'btn:role-management:add', label: '新增', type: 'button' },
          { key: 'btn:role-management:edit', label: '编辑', type: 'button' },
          { key: 'btn:role-management:permission', label: '权限配置', type: 'button' },
          { key: 'btn:role-management:copy', label: '复制角色', type: 'button' },
          { key: 'btn:role-management:delete', label: '删除', type: 'button' },
        ],
      },
    ],
  },
]

const userColumns = [
  { key: 'account', title: '用户账号', width: 140 },
  { key: 'name', title: '用户姓名', width: 120 },
  { key: 'phone', title: '手机号码', width: 140 },
  { key: 'org', title: '所属组织', width: 160 },
  { key: 'dept', title: '所属部门', width: 150 },
  { key: 'rolesText', title: '所属角色', width: 220 },
  { key: 'status', title: '账号状态', width: 110 },
  { key: 'lastLogin', title: '最后登录时间', width: 180 },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: 'action', title: '操作', width: 240 },
]

const roleColumns = [
  { key: 'name', title: '角色名称', width: 160 },
  { key: 'description', title: '角色描述', width: 280 },
  { key: 'status', title: '角色状态', width: 110 },
  { key: 'creator', title: '创建人', width: 120 },
  { key: 'createdAt', title: '创建时间', width: 180 },
  { key: 'action', title: '操作', width: 360 },
]

const initialRoles = [
  {
    id: 'admin',
    name: '超级管理员',
    description: '系统最高权限，内置角色禁止编辑和删除。',
    status: '启用',
    creator: '系统内置',
    createdAt: '2026-01-01 09:00:00',
    builtin: true,
    userCount: 1,
    permissions: [],
    dataScopes: [],
  },
  {
    id: 'operator',
    name: '运营管理员',
    description: '负责站点、车辆、订单与运营分析数据维护。',
    status: '启用',
    creator: '管理员',
    createdAt: '2026-02-01 10:20:00',
    userCount: 2,
    permissions: ['menu:data-analysis', 'page:station-bus-operation', 'btn:station-bus-operation:view', 'btn:station-bus-operation:export', 'menu:base-data', 'page:station-base', 'btn:station-base:view', 'btn:station-base:edit'],
    dataScopes: ['org:重庆公交集团', 'station:中心广场充电站', 'station:高新园区充电站'],
  },
  {
    id: 'finance',
    name: '财务人员',
    description: '查看结算、营收、成本相关数据，支持导出报表。',
    status: '启用',
    creator: '管理员',
    createdAt: '2026-02-15 14:30:00',
    userCount: 1,
    permissions: ['menu:settlement', 'page:large-customer-rules', 'btn:large-customer-rules:view', 'btn:large-customer-rules:export'],
    dataScopes: ['org:重庆公交集团'],
  },
  {
    id: 'auditor',
    name: '审计只读',
    description: '仅查看系统日志、基础台账和关键经营分析报表。',
    status: '停用',
    creator: '管理员',
    createdAt: '2026-03-01 11:10:00',
    userCount: 0,
    permissions: ['menu:system', 'page:user-management', 'btn:user-management:view'],
    dataScopes: [],
  },
]

const initialUsers = [
  { id: 1, account: 'admin', name: '系统管理员', phone: '13800000001', org: '重庆公交集团', dept: '运营管理部', roleIds: ['admin'], status: '启用', lastLogin: '2026-08-19 08:42:11', createdAt: '2026-01-01 09:00:00', dataScopeType: 'all', dataScopeKeys: [], forcePasswordChange: false },
  { id: 2, account: 'ops001', name: '运营专员', phone: '13800000002', org: '北部运营公司', dept: '北部运营一部', roleIds: ['operator'], status: '启用', lastLogin: '2026-08-18 17:20:30', createdAt: '2026-02-12 10:15:00', dataScopeType: 'deptAndChildren', dataScopeKeys: [], forcePasswordChange: false },
  { id: 3, account: 'finance01', name: '财务会计', phone: '13800000003', org: '重庆公交集团', dept: '财务管理部', roleIds: ['finance'], status: '启用', lastLogin: '2026-08-18 09:16:08', createdAt: '2026-03-06 15:20:00', dataScopeType: 'dept', dataScopeKeys: [], forcePasswordChange: false },
  { id: 4, account: 'safe001', name: '安全管理员', phone: '13800000004', org: '巴驿站场分公司', dept: '场站运营部', roleIds: ['operator', 'auditor'], status: '禁用', lastLogin: '2026-08-10 13:05:29', createdAt: '2026-04-08 11:30:00', dataScopeType: 'specified', dataScopeKeys: ['station:体育馆充电站'], forcePasswordChange: true },
]

const emptyUserForm = {
  id: null,
  account: '',
  name: '',
  phone: '',
  org: '',
  dept: '',
  roleIds: [],
  status: '启用',
  initialPassword: 'Ym@123456',
  resetPassword: false,
  resetPasswordValue: '',
  dataScopeType: 'dept',
  dataScopeKeys: [],
}

const emptyRoleForm = {
  id: null,
  name: '',
  description: '',
  status: '启用',
}

const nowText = () => new Date().toLocaleString('zh-CN')
const roleText = (roleIds, roles) => roleIds.map((id) => roles.find((role) => role.id === id)?.name || id).join('、')
const flattenKeys = (nodes) => nodes.flatMap((node) => [node.key, ...(node.children ? flattenKeys(node.children) : [])])
const childKeys = (node) => [node.key, ...(node.children ? flattenKeys(node.children) : [])]
const invertKeys = (allKeys, currentKeys) => allKeys.filter((key) => !currentKeys.includes(key))

const StatusBadge = ({ status }) => (
  <span className={`inline-flex px-2 py-1 rounded text-xs ${status === '启用' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
    {status}
  </span>
)

const Cell = ({ value }) => (
  <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={String(value ?? '-')}>
    {value ?? '-'}
  </span>
)

const normalizeColumns = (columns) => columns.map((group) => ({
  ...group,
  columns: group.columns.filter((col) => !['shortName', 'group'].includes(col.key)),
}))

const useColumnWidths = (storageKey, columns) => {
  const [widths, setWidths] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return Object.fromEntries(columns.map((col) => [col.key, col.width]))
      }
    }
    return Object.fromEntries(columns.map((col) => [col.key, col.width]))
  })

  const handleResizeStart = (event, key) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths[key] || 120
    const handleMove = (moveEvent) => {
      setWidths((prev) => ({ ...prev, [key]: Math.max(90, startWidth + moveEvent.clientX - startX) }))
    }
    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      setWidths((current) => {
        localStorage.setItem(storageKey, JSON.stringify(current))
        return current
      })
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  return { widths, handleResizeStart }
}

const useReport = (storageKey, columns, fixedKeys) => useReportFields({
  storageKey,
  groups: [{ title: '字段', columns }],
  fixedKeys,
})

const nodeMatchesKeyword = (node, keyword) => {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return true
  return node.label.toLowerCase().includes(kw) || Boolean(node.children?.some((child) => nodeMatchesKeyword(child, keyword)))
}

const TreeCheckbox = ({ node, checkedKeys, onToggle, keyword = '', level = 0 }) => {
  const currentKeys = childKeys(node)
  const checked = currentKeys.every((key) => checkedKeys.includes(key))
  const partialChecked = !checked && currentKeys.some((key) => checkedKeys.includes(key))
  if (!nodeMatchesKeyword(node, keyword)) return null

  const typeText = node.type === 'button' ? '功能' : level === 0 ? '菜单' : '页面'
  const typeClassName = node.type === 'button'
    ? 'bg-amber-50 text-amber-600'
    : level === 0
      ? 'bg-slate-100 text-slate-600'
      : 'bg-blue-50 text-blue-600'

  return (
    <div className="space-y-1">
      <label className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 ${level === 0 ? 'bg-gray-50 font-semibold' : ''}`}>
        <input type="checkbox" checked={checked} onChange={(event) => onToggle(node, event.target.checked)} />
        <span className={partialChecked ? 'text-primary' : ''}>{node.label}</span>
        <span className={`text-[11px] px-1.5 py-0.5 rounded ${typeClassName}`}>{typeText}</span>
      </label>
      {node.children && (
        <div className="ml-4 pl-4 border-l border-gray-200 space-y-1">
          {node.children.map((child) => <TreeCheckbox key={child.key} node={child} checkedKeys={checkedKeys} onToggle={onToggle} keyword={keyword} level={level + 1} />)}
        </div>
      )}
    </div>
  )
}

const SystemTable = ({ rows, visibleColumns, widths, onResize, selectedIds, setSelectedIds, renderCell }) => {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-0 overflow-auto" style={{ height: '74%' }}>
      <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: visibleColumns.reduce((sum, col) => sum + (widths[col.key] || col.width), 48) + 48 }}>
        <thead className="sticky top-0 z-20 bg-gray-100">
          <tr>
            <th className="border border-gray-300 text-center bg-gray-100" style={{ width: 48, minWidth: 48 }}>
              <input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((row) => row.id) : [])} />
            </th>
            {visibleColumns.map((col) => (
              <th key={col.key} className={`border border-gray-300 px-2 py-2 text-center font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 z-30 bg-gray-100' : 'bg-gray-100'}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                <div className="flex items-center justify-center gap-1 min-w-0">
                  <span title={col.title} className="overflow-hidden text-ellipsis">{col.title}</span>
                  <span onMouseDown={(event) => onResize(event, col.key)} className="cursor-col-resize w-1 h-4 bg-gray-300 hover:bg-primary flex-shrink-0" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={`hover:bg-blue-50 ${selectedIds.includes(row.id) ? 'bg-blue-50' : 'bg-white'}`}>
              <td className="border border-gray-200 text-center align-middle" style={{ width: 48 }}>
                <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={(event) => setSelectedIds(event.target.checked ? [...selectedIds, row.id] : selectedIds.filter((id) => id !== row.id))} />
              </td>
              {visibleColumns.map((col) => (
                <td key={col.key} className={`border border-gray-200 px-2 py-2 text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis ${col.key === 'action' ? 'sticky right-0 bg-white z-10' : ''}`} style={{ width: widths[col.key] || col.width, minWidth: widths[col.key] || col.width }}>
                  {['status', 'action'].includes(col.key) ? renderCell(row, col) : (row[col.key] && typeof row[col.key] === 'string' && row[col.key].length > 0 ? <Cell value={row[col.key]} /> : renderCell(row, col))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="text-center py-10 text-gray-500">未找到匹配数据</div>}
    </div>
  )
}

const SystemIndex = () => {
  const location = useLocation()
  return location.pathname.includes('/system/user') ? <UserManagement /> : <RoleManagement />
}

const UserManagement = () => {
  const [roles, setRoles] = useState(initialRoles)
  const [users, setUsers] = useState(initialUsers)
  const [filters, setFilters] = useState({ keyword: '', org: '', dept: '', roleId: '', status: '' })
  const [selectedIds, setSelectedIds] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyUserForm)
  const [errors, setErrors] = useState({})
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [resetForm, setResetForm] = useState({ ids: [], password: 'Ym@123456', forceChange: true })
  const [logs, setLogs] = useState([])

  const fields = useReport('system:user-management', userColumns, ['account', 'name', 'action'])
  const { widths, handleResizeStart } = useColumnWidths('systemUserColumnWidths', userColumns)

  const addLog = (type, content) => setLogs((prev) => [{ type, content, user: '当前用户', time: nowText() }, ...prev].slice(0, 6))

  const rows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return users.map((user) => ({ ...user, rolesText: roleText(user.roleIds, roles) })).filter((user) => {
      const matchKeyword = !keyword || [user.account, user.name, user.phone].some((value) => value.toLowerCase().includes(keyword))
      const matchOrg = !filters.org || user.org === filters.org
      const matchDept = !filters.dept || user.dept === filters.dept
      const matchRole = !filters.roleId || user.roleIds.includes(filters.roleId)
      const matchStatus = !filters.status || user.status === filters.status
      return matchKeyword && matchOrg && matchDept && matchRole && matchStatus
    })
  }, [filters, roles, users])

  const availableDepts = form.org ? deptOptions[form.org] || [] : []
  const filterDepts = filters.org ? deptOptions[filters.org] || [] : Object.values(deptOptions).flat()

  const openCreate = () => {
    setForm(emptyUserForm)
    setErrors({})
    setRoleDropdownOpen(false)
    setModal('userForm')
  }

  const openEdit = (user) => {
    setForm({ ...emptyUserForm, ...user, resetPassword: false, resetPasswordValue: '' })
    setErrors({})
    setRoleDropdownOpen(false)
    setModal('userForm')
  }

  const validateUser = () => {
    const next = {}
    if (!form.account.trim()) next.account = '请输入用户账号'
    if (!form.id && users.some((user) => user.account === form.account.trim())) next.account = '账号不可重复'
    if (!form.name.trim()) next.name = '请输入用户姓名'
    if (!/^1[3-9]\d{9}$/.test(form.phone)) next.phone = '请输入正确的手机号码'
    if (!form.org) next.org = '请选择所属组织'
    if (!form.dept) next.dept = '请选择所属部门'
    if (!form.roleIds.length) next.roleIds = '至少分配 1 个角色'
    if (form.dataScopeType === 'specified' && !form.dataScopeKeys.length) next.dataScopeKeys = '请选择指定组织或站点'
    if (form.resetPassword && !form.resetPasswordValue.trim()) next.resetPasswordValue = '请输入新密码'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveUser = () => {
    if (!validateUser()) return
    const normalized = { ...form, account: form.account.trim(), name: form.name.trim(), createdAt: form.createdAt || nowText(), lastLogin: form.lastLogin || '-', forcePasswordChange: form.resetPassword || form.forcePasswordChange || false }
    if (form.id) {
      setUsers((prev) => prev.map((user) => (user.id === form.id ? normalized : user)))
      addLog('编辑用户', `${normalized.account}：更新基础信息、角色和数据权限`)
    } else {
      setUsers((prev) => [{ ...normalized, id: Date.now() }, ...prev])
      addLog('新增用户', `${normalized.account}：创建账号并分配角色`)
    }
    setRoleDropdownOpen(false)
    setModal(null)
  }

  const setUserStatus = (ids, status) => {
    if (!ids.length) return
    setUsers((prev) => prev.map((user) => (ids.includes(user.id) ? { ...user, status } : user)))
    addLog(status === '启用' ? '启用用户' : '禁用用户', `${ids.length} 个账号已${status}${status === '禁用' ? '，在线会话已强制下线' : ''}`)
    setSelectedIds([])
  }

  const openReset = (ids) => {
    if (!ids.length) return
    setResetForm({ ids, password: 'Ym@123456', forceChange: true })
    setModal('resetPassword')
  }

  const saveResetPassword = () => {
    if (!resetForm.password.trim()) return
    setUsers((prev) => prev.map((user) => (resetForm.ids.includes(user.id) ? { ...user, forcePasswordChange: resetForm.forceChange } : user)))
    addLog('重置密码', `重置 ${resetForm.ids.length} 个账号密码${resetForm.forceChange ? '，下次登录强制修改' : ''}`)
    setSelectedIds([])
    setModal(null)
  }

  const toggleFormRole = (roleId) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId) ? prev.roleIds.filter((id) => id !== roleId) : [...prev.roleIds, roleId],
    }))
  }

  const toggleScopeNode = (node, checked) => {
    const keys = childKeys(node)
    setForm((prev) => {
      const set = new Set(prev.dataScopeKeys)
      keys.forEach((key) => {
        if (checked) set.add(key)
        else set.delete(key)
      })
      return { ...prev, dataScopeKeys: [...set] }
    })
  }

  const renderCell = (user, col) => {
    if (col.key === 'status') return <StatusBadge status={user.status} />
    if (col.key === 'action') {
      return (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <button onClick={() => openEdit(user)} className="text-primary hover:underline inline-flex items-center gap-1"><Edit className="w-4 h-4" />编辑</button>
          <button onClick={() => setUserStatus([user.id], user.status === '启用' ? '禁用' : '启用')} className="text-primary hover:underline inline-flex items-center gap-1"><Power className="w-4 h-4" />{user.status === '启用' ? '禁用' : '启用'}</button>
          <button onClick={() => openReset([user.id])} className="text-primary hover:underline inline-flex items-center gap-1"><KeyRound className="w-4 h-4" />重置密码</button>
        </div>
      )
    }
    return <Cell value={user[col.key]} />
  }

  return (
    <div className="page-container min-w-0 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex flex-col gap-2" style={{ height: '16%' }}>
        <div className="flex items-center gap-2" style={{ height: '52%' }}>
          <div className="flex items-center gap-2 min-w-0" style={{ width: '28%' }}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="账号、姓名、手机号" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <select value={filters.org} onChange={(event) => setFilters((prev) => ({ ...prev, org: event.target.value, dept: '' }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '16%' }}>
            <option value="">所属组织</option>
            {orgOptions.map((org) => <option key={org} value={org}>{org}</option>)}
          </select>
          <select value={filters.dept} onChange={(event) => setFilters((prev) => ({ ...prev, dept: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '15%' }}>
            <option value="">所属部门</option>
            {filterDepts.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select value={filters.roleId} onChange={(event) => setFilters((prev) => ({ ...prev, roleId: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '14%' }}>
            <option value="">所属角色</option>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
          <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '12%' }}>
            <option value="">账号状态</option>
            <option value="启用">启用</option>
            <option value="禁用">禁用</option>
          </select>
          <button onClick={() => addLog('搜索用户', '按条件查询用户列表')} className="btn-primary text-sm flex items-center gap-1"><Search className="w-4 h-4" />搜索</button>
        </div>
        <div className="flex items-center justify-between" style={{ height: '48%' }}>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />新增用户</button>
            <button onClick={() => setModal('importUser')} className="btn-secondary text-sm flex items-center gap-1"><Upload className="w-4 h-4" />批量导入</button>
            <button onClick={() => setUserStatus(selectedIds, '启用')} className="btn-secondary text-sm flex items-center gap-1"><CheckSquare className="w-4 h-4" />批量启用</button>
            <button onClick={() => setUserStatus(selectedIds, '禁用')} className="btn-secondary text-sm flex items-center gap-1"><XCircle className="w-4 h-4" />批量禁用</button>
            <button onClick={() => openReset(selectedIds)} className="btn-secondary text-sm flex items-center gap-1"><KeyRound className="w-4 h-4" />重置密码</button>
            <button onClick={() => setFilters({ keyword: '', org: '', dept: '', roleId: '', status: '' })} className="btn-secondary text-sm">重置</button>
          </div>
          <div className="flex items-center gap-2">
            <ReportFieldControls fields={fields} onExport={(keys) => addLog('导出用户', `导出 ${keys.length} 个字段`)} exportFileName="用户管理导出.xlsx" />
            <button onClick={() => addLog('刷新用户', '刷新用户列表')} className="btn-secondary text-sm flex items-center gap-1"><RefreshCw className="w-4 h-4" />刷新</button>
          </div>
        </div>
      </div>

      <SystemTable rows={rows} visibleColumns={fields.visibleColumns} widths={widths} onResize={handleResizeStart} selectedIds={selectedIds} setSelectedIds={setSelectedIds} renderCell={renderCell} />

      <div className="bg-white rounded-lg shadow-sm mt-3 p-3 flex items-center justify-between" style={{ height: '10%' }}>
        <div className="text-sm text-gray-600">共 <b className="text-primary">{rows.length}</b> 个用户，已选 <b className="text-primary">{selectedIds.length}</b> 个</div>
        <div className="text-xs text-gray-500 truncate max-w-[60%]">{logs[0] ? `最近操作：${logs[0].type} ${logs[0].time} ${logs[0].content}` : '账号、角色、数据权限变更均会写入操作日志。'}</div>
      </div>

      <Modal isOpen={modal === 'userForm'} onClose={() => setModal(null)} title={form.id ? '编辑用户' : '新增用户'} showFooter={false}>
        <div className="space-y-5">
          <section>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-1 border-b">基础信息</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户账号<span className="text-red-500">*</span></label>
                <input disabled={Boolean(form.id)} value={form.account} onChange={(event) => setForm((prev) => ({ ...prev, account: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${form.id ? 'bg-gray-100 text-gray-500' : ''} ${errors.account ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.account && <p className="text-xs text-red-500 mt-1">{errors.account}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户姓名<span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号码<span className="text-red-500">*</span></label>
                <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">账号状态</label>
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary">
                  <option value="启用">启用</option>
                  <option value="禁用">禁用</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属组织<span className="text-red-500">*</span></label>
                <select value={form.org} onChange={(event) => setForm((prev) => ({ ...prev, org: event.target.value, dept: '' }))} className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:border-primary ${errors.org ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <option value="">请选择组织</option>
                  {orgOptions.map((org) => <option key={org} value={org}>{org}</option>)}
                </select>
                {errors.org && <p className="text-xs text-red-500 mt-1">{errors.org}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属部门<span className="text-red-500">*</span></label>
                <select value={form.dept} onChange={(event) => setForm((prev) => ({ ...prev, dept: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:border-primary ${errors.dept ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <option value="">请选择部门</option>
                  {availableDepts.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                {errors.dept && <p className="text-xs text-red-500 mt-1">{errors.dept}</p>}
              </div>
              <div className="col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">分配角色<span className="text-red-500">*</span></label>
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen((open) => !open)}
                  className={`w-full px-3 py-2 border rounded text-sm bg-white focus:outline-none focus:border-primary flex items-center justify-between gap-2 ${errors.roleIds ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                >
                  <span className={`truncate text-left ${form.roleIds.length ? 'text-gray-700' : 'text-gray-400'}`}>
                    {form.roleIds.length
                      ? `已选择 ${form.roleIds.length} 个角色：${roleText(form.roleIds, roles)}`
                      : '请选择角色'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleDropdownOpen && (
                  <div className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-2 max-h-56 overflow-auto">
                    <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100 mb-2">
                      <span className="text-xs text-gray-500">多选角色</span>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          roleIds: roles.filter((role) => role.status === '启用').map((role) => role.id),
                        }))}
                        className="text-xs text-primary hover:underline"
                      >
                        全选
                      </button>
                    </div>
                    <div className="space-y-1">
                      {roles.filter((role) => role.status === '启用').map((role) => (
                        <label key={role.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 rounded cursor-pointer">
                          <input type="checkbox" checked={form.roleIds.includes(role.id)} onChange={() => toggleFormRole(role.id)} />
                          <span className="truncate" title={role.name}>{role.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {errors.roleIds && <p className="text-xs text-red-500 mt-1">{errors.roleIds}</p>}
              </div>
              {!form.id && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">初始密码</label>
                  <input value={form.initialPassword} onChange={(event) => setForm((prev) => ({ ...prev, initialPassword: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
                </div>
              )}
              {form.id && (
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.resetPassword} onChange={(event) => setForm((prev) => ({ ...prev, resetPassword: event.target.checked }))} />
                    重置密码
                  </label>
                  {form.resetPassword && <input value={form.resetPasswordValue} onChange={(event) => setForm((prev) => ({ ...prev, resetPasswordValue: event.target.value }))} placeholder="请输入新密码" className={`mt-2 w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.resetPasswordValue ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />}
                  {errors.resetPasswordValue && <p className="text-xs text-red-500 mt-1">{errors.resetPasswordValue}</p>}
                </div>
              )}
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-1 border-b">权限范围</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数据范围</label>
                  <select
                    value={form.dataScopeType}
                    onChange={(event) => setForm((prev) => ({ ...prev, dataScopeType: event.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="self">本人数据</option>
                    <option value="dept">本部门数据</option>
                    <option value="deptAndChildren">本部门及下属部门</option>
                    <option value="specified">指定组织/站点</option>
                  </select>
                </div>
              {form.dataScopeType === 'specified' && (
                <div className={`border rounded p-3 space-y-2 ${errors.dataScopeKeys ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  {stationScopeNodes.map((node) => <TreeCheckbox key={node.key} node={node} checkedKeys={form.dataScopeKeys} onToggle={toggleScopeNode} />)}
                </div>
              )}
              {errors.dataScopeKeys && <p className="text-xs text-red-500">{errors.dataScopeKeys}</p>}
            </div>
          </section>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={saveUser} className="btn-primary text-sm">保存</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'resetPassword'} onClose={() => setModal(null)} title="重置密码" showFooter={false}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">将为 {resetForm.ids.length} 个账号设置统一初始密码。</p>
          <input value={resetForm.password} onChange={(event) => setResetForm((prev) => ({ ...prev, password: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={resetForm.forceChange} onChange={(event) => setResetForm((prev) => ({ ...prev, forceChange: event.target.checked }))} />
            下次登录强制修改密码
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={saveResetPassword} className="btn-primary text-sm">确认重置</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'importUser'} onClose={() => setModal(null)} title="批量导入用户" showFooter={false}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">上传用户导入文件（前端原型模拟）</p>
            <p className="text-xs text-gray-400 mt-1">模板字段：用户账号、用户姓名、手机号码、组织、部门、角色</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={() => { addLog('导入用户', '按模板批量创建用户账号'); setModal(null) }} className="btn-primary text-sm">导入</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const RoleManagement = () => {
  const [roles, setRoles] = useState(initialRoles)
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [selectedIds, setSelectedIds] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyRoleForm)
  const [errors, setErrors] = useState({})
  const [permissionRole, setPermissionRole] = useState(null)
  const [permissionKeyword, setPermissionKeyword] = useState('')
  const [permissionKeys, setPermissionKeys] = useState([])
  const [dataKeys, setDataKeys] = useState([])
  const [logs, setLogs] = useState([])

  const fields = useReport('system:role-management', roleColumns, ['name', 'action'])
  const { widths, handleResizeStart } = useColumnWidths('systemRoleColumnWidths', roleColumns)

  const addLog = (type, content) => setLogs((prev) => [{ type, content, user: '当前用户', time: nowText() }, ...prev].slice(0, 6))

  const rows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    return roles.filter((role) => {
      const matchKeyword = !keyword || role.name.toLowerCase().includes(keyword)
      const matchStatus = !filters.status || role.status === filters.status
      return matchKeyword && matchStatus
    })
  }, [filters, roles])

  const validateRole = () => {
    const next = {}
    if (!form.name.trim()) next.name = '请输入角色名称'
    if (roles.some((role) => role.id !== form.id && role.name === form.name.trim())) next.name = '角色名称不可重复'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openCreate = () => {
    setForm(emptyRoleForm)
    setErrors({})
    setModal('roleForm')
  }

  const openEdit = (role) => {
    if (role.builtin) {
      alert('内置超级管理员角色禁止编辑')
      return
    }
    setForm({ id: role.id, name: role.name, description: role.description, status: role.status })
    setErrors({})
    setModal('roleForm')
  }

  const openCopy = (role) => {
    setForm({ id: null, name: `${role.name}-副本`, description: role.description, status: '启用', permissions: role.permissions, dataScopes: role.dataScopes })
    setErrors({})
    setModal('roleForm')
  }

  const saveRole = () => {
    if (!validateRole()) return
    if (form.id) {
      setRoles((prev) => prev.map((role) => (role.id === form.id ? { ...role, ...form } : role)))
      addLog('编辑角色', `${form.name} 基础信息已更新`)
    } else {
      const nextRole = { ...form, id: `role-${Date.now()}`, creator: '当前用户', createdAt: nowText(), userCount: 0, permissions: form.permissions || [], dataScopes: form.dataScopes || [] }
      setRoles((prev) => [nextRole, ...prev])
      addLog(form.permissions ? '复制角色' : '新增角色', `${nextRole.name} 已创建`)
    }
    setModal(null)
  }

  const openPermission = (role) => {
    setPermissionRole(role)
    setPermissionKeys(role.permissions || [])
    setDataKeys(role.dataScopes || [])
    setPermissionKeyword('')
    setModal('permission')
  }

  const togglePermissionNode = (node, checked) => {
    const keys = childKeys(node)
    setPermissionKeys((prev) => {
      const set = new Set(prev)
      keys.forEach((key) => {
        if (checked) set.add(key)
        else set.delete(key)
      })
      return [...set]
    })
  }

  const toggleDataNode = (node, checked) => {
    const keys = childKeys(node)
    setDataKeys((prev) => {
      const set = new Set(prev)
      keys.forEach((key) => {
        if (checked) set.add(key)
        else set.delete(key)
      })
      return [...set]
    })
  }

  const savePermission = () => {
    setRoles((prev) => prev.map((role) => (role.id === permissionRole.id ? { ...role, permissions: permissionKeys, dataScopes: dataKeys } : role)))
    addLog('权限配置', `${permissionRole.name} 权限已保存，在线用户权限刷新策略已触发`)
    setModal(null)
  }

  const setRoleStatus = (role) => {
    if (role.builtin) {
      alert('内置超级管理员角色禁止停用')
      return
    }
    const nextStatus = role.status === '启用' ? '停用' : '启用'
    setRoles((prev) => prev.map((item) => (item.id === role.id ? { ...item, status: nextStatus } : item)))
    addLog(nextStatus === '启用' ? '启用角色' : '停用角色', `${role.name} 已${nextStatus}${nextStatus === '停用' ? '，名下用户不再拥有该角色权限' : ''}`)
  }

  const deleteRole = (role) => {
    if (role.builtin) {
      alert('内置超级管理员角色禁止删除')
      return
    }
    if (role.userCount > 0) {
      alert('该角色已分配用户，请先移除所有用户后再删除')
      return
    }
    if (!window.confirm(`确认删除角色 ${role.name}？`)) return
    setRoles((prev) => prev.filter((item) => item.id !== role.id))
    addLog('删除角色', `${role.name} 已删除`)
  }

  const renderCell = (role, col) => {
    if (col.key === 'status') return <StatusBadge status={role.status} />
    if (col.key === 'action') {
      return (
        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
          <button onClick={() => openEdit(role)} className={`hover:underline inline-flex items-center gap-1 ${role.builtin ? 'text-gray-400 cursor-not-allowed' : 'text-primary'}`}><Edit className="w-4 h-4" />编辑</button>
          <button onClick={() => openPermission(role)} className="text-primary hover:underline inline-flex items-center gap-1"><ShieldCheck className="w-4 h-4" />权限配置</button>
          <button onClick={() => openCopy(role)} className="text-primary hover:underline inline-flex items-center gap-1"><Copy className="w-4 h-4" />复制角色</button>
          <button onClick={() => setRoleStatus(role)} className={`hover:underline inline-flex items-center gap-1 ${role.builtin ? 'text-gray-400 cursor-not-allowed' : 'text-primary'}`}><Power className="w-4 h-4" />{role.status === '启用' ? '停用' : '启用'}</button>
          <button onClick={() => deleteRole(role)} className={`hover:underline inline-flex items-center gap-1 ${role.builtin ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}><Trash2 className="w-4 h-4" />删除</button>
        </div>
      )
    }
    return <Cell value={role[col.key]} />
  }

  return (
    <div className="page-container min-w-0 overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm p-3 mb-3 flex flex-col gap-2" style={{ height: '16%' }}>
        <div className="flex items-center gap-2" style={{ height: '52%' }}>
          <div className="flex items-center gap-2 min-w-0" style={{ width: '34%' }}>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="角色名称" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary" style={{ width: '18%' }}>
            <option value="">角色状态</option>
            <option value="启用">启用</option>
            <option value="停用">停用</option>
          </select>
          <button onClick={() => addLog('搜索角色', '按条件查询角色列表')} className="btn-primary text-sm flex items-center gap-1"><Search className="w-4 h-4" />搜索</button>
          <button onClick={() => setFilters({ keyword: '', status: '' })} className="btn-secondary text-sm">重置</button>
        </div>
        <div className="flex items-center justify-between" style={{ height: '48%' }}>
          <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" />新增角色</button>
          <div className="flex items-center gap-2">
            <ReportFieldControls fields={fields} onExport={(keys) => addLog('导出角色', `导出 ${keys.length} 个字段`)} exportFileName="角色管理导出.xlsx" />
            <button onClick={() => addLog('刷新角色', '刷新角色列表')} className="btn-secondary text-sm flex items-center gap-1"><RefreshCw className="w-4 h-4" />刷新</button>
          </div>
        </div>
      </div>

      <SystemTable rows={rows} visibleColumns={fields.visibleColumns} widths={widths} onResize={handleResizeStart} selectedIds={selectedIds} setSelectedIds={setSelectedIds} renderCell={renderCell} />

      <div className="bg-white rounded-lg shadow-sm mt-3 p-3 flex items-center justify-between" style={{ height: '10%' }}>
        <div className="text-sm text-gray-600">共 <b className="text-primary">{rows.length}</b> 个角色，已选 <b className="text-primary">{selectedIds.length}</b> 个</div>
        <div className="text-xs text-gray-500 truncate max-w-[60%]">{logs[0] ? `最近操作：${logs[0].type} ${logs[0].time} ${logs[0].content}` : '权限变更保存后实时生效，可配置刷新页面或强制重新登录。'}</div>
      </div>

      <Modal isOpen={modal === 'roleForm'} onClose={() => setModal(null)} title={form.id ? '编辑角色' : '新增角色'} showFooter={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色名称<span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色描述</label>
            <textarea rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色状态</label>
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-primary">
              <option value="启用">启用</option>
              <option value="停用">停用</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={saveRole} className="btn-primary text-sm">保存</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'permission'} onClose={() => setModal(null)} title={`权限配置 - ${permissionRole?.name || ''}`} showFooter={false}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={permissionKeyword} onChange={(event) => setPermissionKeyword(event.target.value)} placeholder="搜索菜单或按钮权限" className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary" />
          </div>
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">菜单权限/功能权限（树形结构）</h4>
              <div className="flex gap-2">
                <button onClick={() => setPermissionKeys(flattenKeys(permissionTree))} className="text-xs text-primary hover:underline">全选</button>
                <button onClick={() => setPermissionKeys((prev) => invertKeys(flattenKeys(permissionTree), prev))} className="text-xs text-primary hover:underline">反选</button>
              </div>
            </div>
            <div className="border border-gray-200 rounded p-3 space-y-3">
              {permissionTree.map((node) => <TreeCheckbox key={node.key} node={node} checkedKeys={permissionKeys} onToggle={togglePermissionNode} keyword={permissionKeyword} />)}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">数据权限</h4>
              <button onClick={() => addLog('保存权限模板', `${permissionRole?.name || ''} 权限模板已保存`)} className="text-xs text-primary hover:underline">保存权限模板</button>
            </div>
            <div className="border border-gray-200 rounded p-3 space-y-3">
              {stationScopeNodes.map((node) => <TreeCheckbox key={node.key} node={node} checkedKeys={dataKeys} onToggle={toggleDataNode} />)}
            </div>
          </section>
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
            页面访问权限控制菜单可见性，按钮权限控制新增、编辑、删除、导出等操作；数据权限控制组织、站点、车辆、大客户数据查询范围。
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setModal(null)} className="btn-secondary text-sm">取消</button>
            <button onClick={savePermission} className="btn-primary text-sm">保存权限</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SystemIndex
