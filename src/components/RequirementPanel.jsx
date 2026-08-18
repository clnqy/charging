import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, PencilLine, Save, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const STORAGE_KEY = 'prototype-requirement-panel:expanded'

const SECTION_TITLES = [
  '一、功能需求',
  '二、交互规范',
  '三、数据与字段定义',
  '四、权限 & 异常处理',
  '五、UI 约束',
]

const PAGE_MAP = {
  '/data-analysis/station-summary': '站点经营汇总表',
  '/data-analysis/station-revenue': '单站营收表',
  '/data-analysis/station-bus-operation': '单站公交运营情况表',
  '/data-analysis/station-social-operation': '单站社会运营情况表',
  '/data-analysis/station-bus-revenue': '站点公交收入表',
  '/data-analysis/station-cost': '站点成本表',
  '/data-analysis/station-social-revenue': '单站社会营收情况表',
  '/data-analysis/bus-line-energy': '公交单线能耗表',
  '/data-analysis/historical-electricity-price': '历年供电电价台账',
  '/settlement/large-customer-rules': '大客户结算规则配置',
  '/base-data/station': '站点基础表',
  '/base-data/vehicle': '站车基础表',
  '/base-data/order': '订单数据表',
  '/system/role': '角色管理',
  '/system/user': '用户管理',
  '/system/log': '操作日志',
  '/user/list': '用户列表',
  '/user/group': '用户分组',
  '/message': '消息通知',
}

const createDraft = (pageName = '原型页面') => ({
  pageName,
  businessScenario: '',
  coreGoal: '',
  sections: Object.fromEntries(SECTION_TITLES.map((title) => [title, ''])),
})

const getPageKey = (pathname) => {
  const matched = Object.keys(PAGE_MAP)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`))
  return matched || pathname || 'default'
}

const RequirementPanel = () => {
  const location = useLocation()
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === null ? true : saved === 'true'
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [draft, setDraft] = useState(() => createDraft())
  const [activeKey, setActiveKey] = useState('')

  const pageKey = useMemo(() => getPageKey(location.pathname), [location.pathname])
  const pageName = PAGE_MAP[pageKey] || '原型页面'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(expanded))
  }, [expanded])

  useEffect(() => {
    let cancelled = false
    setActiveKey(pageKey)
    setEditing(false)
    setLoading(true)
    setMessage('')
    setDraft(createDraft(pageName))

    fetch(`/api/requirements?key=${encodeURIComponent(pageKey)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('load failed'))))
      .then((data) => {
        if (!cancelled && data?.ok && data?.draft) {
          setDraft({
            ...createDraft(pageName),
            ...data.draft,
            pageName: data.draft.pageName || pageName,
          })
        }
      })
      .catch(() => {
        if (!cancelled) setDraft(createDraft(pageName))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [pageKey, pageName])

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const updateSection = (sectionTitle, value) => {
    setDraft((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionTitle]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const targetKey = activeKey || pageKey
      const res = await fetch(`/api/requirements?key=${encodeURIComponent(targetKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: targetKey, draft }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.ok === false) throw new Error(data?.message || 'save failed')
      setEditing(false)
      setMessage(`已保存到 requirements/${(data.key || targetKey).replace(/^\/+/, '').replace(/\//g, '__')}.md`)
    } catch (error) {
      setMessage(`保存失败：${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed right-0 top-[76px] z-40 flex h-32 w-9 items-center justify-center rounded-l border border-r-0 border-gray-200 bg-gray-50 text-xs text-gray-600 shadow-sm transition-all duration-300 hover:bg-white hover:text-primary"
        aria-label="展开需求说明"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="mt-1 [writing-mode:vertical-rl]">需求说明</span>
      </button>
    )
  }

  return (
    <aside className="fixed bottom-[46px] right-3 top-[76px] z-40 flex w-80 flex-col overflow-hidden rounded border border-gray-200 bg-gray-50/95 text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white/90 px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">需求说明</h3>
          <p className="text-[11px] text-gray-500">{draft.pageName}</p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary"
            >
              <PencilLine className="h-3.5 w-3.5" />
              编辑
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary"
              >
                <X className="h-3.5 w-3.5" />
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded border border-primary bg-primary px-2 py-1 text-xs text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? '保存中' : '保存'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            收起
          </button>
        </div>
      </div>
      {message && (
        <div className={`border-b border-gray-200 px-3 py-2 text-xs ${message.startsWith('保存失败') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3 text-xs leading-relaxed">
        {loading ? (
          <div className="rounded border border-gray-200 bg-white px-3 py-2 text-gray-500 shadow-sm">加载需求说明中...</div>
        ) : (
          <>
            <section>
              <div className="mb-1 text-[11px] font-semibold text-gray-500">页面名称</div>
              {editing ? (
                <input
                  className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-primary focus:outline-none"
                  value={draft.pageName}
                  onChange={(e) => updateField('pageName', e.target.value)}
                />
              ) : (
                <div className="rounded bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm">{draft.pageName}</div>
              )}
            </section>

            <section className="space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-semibold text-gray-500">业务场景：</div>
                {editing ? (
                  <textarea
                    className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-primary focus:outline-none"
                    rows={3}
                    value={draft.businessScenario}
                    onChange={(e) => updateField('businessScenario', e.target.value)}
                  />
                ) : (
                  <p className="rounded bg-white px-3 py-2 text-gray-700 shadow-sm whitespace-pre-line">{draft.businessScenario || '待补充'}</p>
                )}
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold text-gray-500">核心目标：</div>
                {editing ? (
                  <textarea
                    className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-primary focus:outline-none"
                    rows={3}
                    value={draft.coreGoal}
                    onChange={(e) => updateField('coreGoal', e.target.value)}
                  />
                ) : (
                  <p className="rounded bg-white px-3 py-2 text-gray-700 shadow-sm whitespace-pre-line">{draft.coreGoal || '待补充'}</p>
                )}
              </div>
            </section>

            {SECTION_TITLES.map((title) => (
              <section key={title} className="rounded border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <h4 className="mb-2 text-xs font-semibold text-gray-800">{title}</h4>
                {editing ? (
                  <textarea
                    className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-gray-600 shadow-sm focus:border-primary focus:outline-none"
                    rows={4}
                    value={draft.sections[title]}
                    onChange={(e) => updateSection(title, e.target.value)}
                  />
                ) : (
                  <p className="whitespace-pre-line text-gray-600">{draft.sections[title] || '待补充'}</p>
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}

export default RequirementPanel
