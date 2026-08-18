import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const requirementsDir = path.join(rootDir, 'requirements')

const labels = {
  defaultPage: '\u539f\u578b\u9875\u9762',
  businessScenario: '\u4e1a\u52a1\u573a\u666f',
  coreGoal: '\u6838\u5fc3\u76ee\u6807',
  sections: [
    '\u4e00\u3001\u529f\u80fd\u9700\u6c42',
    '\u4e8c\u3001\u4ea4\u4e92\u89c4\u8303',
    '\u4e09\u3001\u6570\u636e\u4e0e\u5b57\u6bb5\u5b9a\u4e49',
    '\u56db\u3001\u6743\u9650 & \u5f02\u5e38\u5904\u7406',
    '\u4e94\u3001UI \u7ea6\u675f',
  ],
}

const sanitizeKey = (value) => (
  value
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/^\/+/, '')
    .replace(/\//g, '__') || 'default'
)

const draftToMarkdown = (draft = {}) => {
  const lines = [
    `# ${draft.pageName || labels.defaultPage}`,
    '',
    `## ${labels.businessScenario}`,
    draft.businessScenario || '',
    '',
    `## ${labels.coreGoal}`,
    draft.coreGoal || '',
    '',
  ]

  labels.sections.forEach((title) => {
    lines.push(`## ${title}`, draft.sections?.[title] || '', '')
  })

  return lines.join('\n')
}

const markdownToDraft = (content, fallbackPageName = labels.defaultPage) => {
  const draft = {
    pageName: fallbackPageName,
    businessScenario: '',
    coreGoal: '',
    sections: Object.fromEntries(labels.sections.map((title) => [title, ''])),
  }
  const headingMap = new Map([
    [labels.businessScenario, 'businessScenario'],
    [labels.coreGoal, 'coreGoal'],
    ...labels.sections.map((title) => [title, title]),
  ])
  const buckets = Object.fromEntries([
    'businessScenario',
    'coreGoal',
    ...labels.sections,
  ].map((key) => [key, []]))

  let currentKey = null
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      draft.pageName = line.replace(/^#\s*/, '').trim() || fallbackPageName
      currentKey = null
      continue
    }
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s*/, '').trim()
      currentKey = headingMap.get(title) || null
      continue
    }
    if (currentKey && buckets[currentKey]) buckets[currentKey].push(rawLine)
  }

  draft.businessScenario = buckets.businessScenario.join('\n').trim()
  draft.coreGoal = buckets.coreGoal.join('\n').trim()
  labels.sections.forEach((title) => {
    draft.sections[title] = buckets[title].join('\n').trim()
  })
  return draft
}

const sendJson = (res, statusCode, data) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

const readBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => resolve(body))
  req.on('error', reject)
})

const requirementPlugin = () => ({
  name: 'requirement-md-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/requirements')) return next()

      const url = new URL(req.url, 'http://localhost')

      if (req.method === 'GET') {
        const key = sanitizeKey(url.searchParams.get('key') || 'default')
        const filePath = path.join(requirementsDir, `${key}.md`)
        try {
          const content = await fs.readFile(filePath, 'utf8')
          sendJson(res, 200, { ok: true, key, draft: markdownToDraft(content) })
        } catch {
          sendJson(res, 200, { ok: true, key, draft: null })
        }
        return
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        try {
          const parsed = JSON.parse(await readBody(req) || '{}')
          const key = sanitizeKey(parsed.key || url.searchParams.get('key') || 'default')
          const filePath = path.join(requirementsDir, `${key}.md`)
          await fs.mkdir(requirementsDir, { recursive: true })
          await fs.writeFile(filePath, draftToMarkdown(parsed.draft || {}), 'utf8')
          sendJson(res, 200, { ok: true, key })
        } catch (error) {
          sendJson(res, 500, { ok: false, message: error.message })
        }
        return
      }

      sendJson(res, 405, { ok: false, message: 'Method not allowed' })
    })
  },
})

export default defineConfig({
  plugins: [react(), requirementPlugin()],
  server: {
    port: 3000,
    host: true,
  },
})
