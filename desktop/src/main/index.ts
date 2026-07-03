import { app, BrowserWindow, ipcMain, dialog, shell, Notification } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs'
import electronUpdater from 'electron-updater'

const { autoUpdater } = electronUpdater

let mainWindow: BrowserWindow | null = null
let engine: any = null

type DesktopSettings = {
  projectPath: string
  indexingMode: 'manual'
}

const defaultSettings: DesktopSettings = { projectPath: '', indexingMode: 'manual' }

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function readSettings(): DesktopSettings {
  try {
    const value = JSON.parse(readFileSync(settingsPath(), 'utf-8'))
    return {
      projectPath: ensureProjectPath(value.projectPath),
      indexingMode: 'manual',
    }
  } catch {
    return defaultSettings
  }
}

function saveSettings(settings: DesktopSettings): void {
  mkdirSync(app.getPath('userData'), { recursive: true })
  writeFileSync(settingsPath(), JSON.stringify(settings, null, 2) + '\n', 'utf-8')
}

const isDev = !app.isPackaged

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

function getEnginePath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, 'scripts')
    : join(app.getAppPath(), '..', 'scripts')
  return join(base, 'context-engine.mjs')
}

async function getEngine() {
  if (!engine) {
    const enginePath = getEnginePath()
    if (!existsSync(enginePath)) {
      throw new Error(`Engine not found at ${enginePath}. Initialize a project first.`)
    }
    engine = await import(pathToFileURL(enginePath).href)
  }
  return engine
}

function setupAutoUpdater(): void {
  if (isDev) return

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update:available', info.version)
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update:download-progress', progress.percent)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update:downloaded')
    if (mainWindow) {
      new Notification({
        title: 'ContextVault',
        body: 'A new version has been downloaded. Restart to apply the update.',
      }).show()
    }
  })

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update:error', err.message)
  })
}

ipcMain.handle('update:check', async () => {
  if (isDev) return { available: false }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { available: result?.updateInfo?.version ? true : false, version: result?.updateInfo?.version }
  } catch {
    return { available: false }
  }
})

ipcMain.handle('update:download', async () => {
  if (isDev) return
  autoUpdater.downloadUpdate()
})

ipcMain.handle('update:install', async () => {
  if (isDev) return
  setImmediate(() => autoUpdater.quitAndInstall())
})

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'ContextVault',
    backgroundColor: '#0d0d1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    setupAutoUpdater()
    if (!isDev) autoUpdater.checkForUpdates()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getVaultPath(projectPath: string): string {
  return join(projectPath, '.contextvault')
}

function ensureProjectPath(_path?: string): string {
  const stored = _path || ''
  if (stored && existsSync(join(stored, '.contextvault'))) return stored
  return ''
}

function getDashboardStats(projectPath: string) {
  const vaultPath = getVaultPath(projectPath)
  if (!existsSync(vaultPath)) {
    return { sessions: 0, events: 0, decisions: 0, problems: 0, tasks: 0, memoryExists: false }
  }
  try {
    const sessionsDir = join(vaultPath, 'sessions')
    const indexFile = join(vaultPath, 'index', 'context-index.json')
    const memoryFile = join(vaultPath, 'memory.md')

    let sessionCount = 0
    let eventCount = 0
    let decisionCount = 0
    let problemCount = 0
    let taskCount = 0

    if (existsSync(indexFile)) {
      const index = JSON.parse(readFileSync(indexFile, 'utf-8'))
      sessionCount = index.sessionCount || 0
      eventCount = index.eventCount || 0
      if (index.events) {
        decisionCount = index.events.filter((e: any) => e.type === 'decision').length
        problemCount = index.events.filter((e: any) => e.type === 'problem').length
        taskCount = index.events.filter((e: any) => e.type === 'task').length
      }
    }
    const memoryExists = existsSync(memoryFile)

    return {
      sessions: sessionCount,
      events: eventCount,
      decisions: decisionCount,
      problems: problemCount,
      tasks: taskCount,
      memoryExists,
    }
  } catch {
    return { sessions: 0, events: 0, decisions: 0, problems: 0, tasks: 0, memoryExists: false }
  }
}

function listSessions(projectPath: string) {
  const vaultPath = getVaultPath(projectPath)
  if (!existsSync(vaultPath)) return []
  try {
    const sessionsDir = join(vaultPath, 'sessions')
    const browserDir = join(vaultPath, 'imports', 'browser')
    const results: any[] = []

    const readDir = (dir: string, source: string) => {
      if (!existsSync(dir)) return
      const files = readdirSync(dir).filter((f: string) => f.endsWith('.md'))
      for (const file of files) {
        const content = readFileSync(join(dir, file), 'utf-8')
        const frontmatter = parseFrontmatter(content)
        results.push({
          id: frontmatter.id || file.replace('.md', ''),
          title: frontmatter.title || file.replace('.md', ''),
          source: frontmatter.source || source,
          startedAt: frontmatter.started_at || frontmatter.startedAt || '',
          eventCount: frontmatter.event_count || 0,
          file,
        })
      }
    }

    readDir(sessionsDir, 'terminal')
    readDir(browserDir, 'browser')

    results.sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    return results
  } catch {
    return []
  }
}

function parseFrontmatter(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return result
  const yaml = match[1]
  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      let value: any = kv[2].trim()
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value === 'true') value = true
      if (value === 'false') value = false
      const num = Number(value)
      if (!isNaN(num) && value !== '') value = num
      result[kv[1]] = value
    }
  }
  return result
}

function getSessionById(projectPath: string, id: string) {
  const vaultPath = getVaultPath(projectPath)
  const searchDirs = [
    join(vaultPath, 'sessions'),
    join(vaultPath, 'imports', 'browser'),
  ]

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue
    const files = readdirSync(dir).filter((f: string) => f.endsWith('.md'))
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8')
      const frontmatter = parseFrontmatter(content)
      if (frontmatter.id === id || file.includes(id)) {
        const events = parseEvents(content)
        return { frontmatter, events, content, file }
      }
    }
  }
  return null
}

function parseEvents(content: string): any[] {
  const events: any[] = []
  const headingRegex = /^##\s+(.+)$/
  const lines = content.split('\n')
  let currentType = ''
  let currentContent: string[] = []
  let currentMeta: any = {}

  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].match(headingRegex)
    if (headingMatch) {
      if (currentType && currentContent.length > 0) {
        events.push({
          type: currentType,
          content: currentContent.join('\n').trim(),
          ...currentMeta,
        })
      }
      currentType = headingMatch[1].trim().toLowerCase()
      currentContent = []
      currentMeta = {}

      const metaMatch = lines[i + 1]?.match(/<!--\s*context-event:\s*(\{.*?\})\s*-->/)
      if (metaMatch) {
        try {
          currentMeta = JSON.parse(metaMatch[1])
          i++
        } catch { /* ignore */ }
      }
    } else if (currentType) {
      currentContent.push(lines[i])
    }
  }
  if (currentType && currentContent.length > 0) {
    events.push({
      type: currentType,
      content: currentContent.join('\n').trim(),
      ...currentMeta,
    })
  }
  return events
}

async function searchSessions(projectPath: string, query: string, filters: any) {
  const eng = await getEngine()
  try {
    const result = await eng.retrieveContext(projectPath, query, normalizeFilters(filters))
    return result
  } catch (err) {
    return { results: [], sessions: [], links: [], query, generatedAt: new Date().toISOString() }
  }
}

async function prepareContext(projectPath: string, query: string, filters: any) {
  const eng = await getEngine()
  try {
    const result = await eng.prepareContext(projectPath, query, normalizeFilters(filters))
    return {
      success: true,
      output: readFileSync(result.outputPath, 'utf-8'),
      outputPath: result.outputPath,
      eventCount: result.retrieval.results.length,
      sessionCount: result.retrieval.sessions.length,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

function normalizeFilters(filters: any = {}) {
  const toArray = (plural: unknown, singular: unknown) => {
    if (Array.isArray(plural)) return plural.filter(Boolean)
    const value = plural || singular
    return typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : []
  }
  return {
    limit: Number(filters.limit) || 20,
    types: toArray(filters.types, filters.type),
    sources: toArray(filters.sources, filters.source),
    since: filters.since || undefined,
  }
}

function getSettings() {
  const stored = readSettings()
  return {
    projectPath: ensureProjectPath(global.__projectPath || stored.projectPath),
    indexingMode: stored.indexingMode,
    version: app.getVersion(),
  }
}

function updateSettings(settings: any) {
  const current = readSettings()
  const projectPath = ensureProjectPath(settings.projectPath || global.__projectPath || current.projectPath)
  global.__projectPath = projectPath
  saveSettings({ projectPath, indexingMode: 'manual' })
  return getSettings()
}

declare global {
  var __projectPath: string
}

global.__projectPath = ''

ipcMain.handle('contextvault:open-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select a project folder',
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const projectPath = result.filePaths[0]
  const eng = await getEngine()
  const paths = eng.ensureEngineStorage(projectPath)
  if (!existsSync(paths.memoryPath)) {
    writeFileSync(paths.memoryPath, '# ContextVault Project Memory\n\nAdd durable project context here.\n', 'utf-8')
  }
  eng.buildContextIndex(projectPath)
  global.__projectPath = projectPath
  saveSettings({ projectPath, indexingMode: 'manual' })
  return projectPath
})

ipcMain.handle('contextvault:get-dashboard-stats', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return null
  return getDashboardStats(pp)
})

ipcMain.handle('contextvault:list-sessions', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return []
  return listSessions(pp)
})

ipcMain.handle('contextvault:get-session', async (_e, id: string) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return null
  return getSessionById(pp, id)
})

ipcMain.handle('contextvault:search', async (_e, query: string, filters: any) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp || !query) return { results: [], sessions: [] }
  return searchSessions(pp, query, filters)
})

ipcMain.handle('contextvault:prepare-context', async (_e, query: string, filters: any) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'No project selected' }
  return prepareContext(pp, query, filters)
})

ipcMain.handle('contextvault:export-markdown', async (_e, id: string) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp || !id) return null
  const session = getSessionById(pp, id)
  if (!session) return null
  return { content: session.content, filename: session.file }
})

ipcMain.handle('contextvault:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'openDirectory'],
    title: 'Import browser exports',
    filters: [
      { name: 'Markdown / ZIP', extensions: ['md', 'zip'] },
    ],
  })
  if (result.canceled || result.filePaths.length === 0) return null

  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { error: 'No project selected' }

  const eng = await getEngine()
  try {
    const importResult = await eng.importBrowserExports(pp, result.filePaths[0])
    eng.buildContextIndex(pp)
    return importResult
  } catch (err: any) {
    return { error: err.message }
  }
})

ipcMain.handle('contextvault:get-settings', async () => getSettings())

ipcMain.handle('contextvault:update-settings', async (_e, settings: any) => updateSettings(settings))

ipcMain.handle('contextvault:rebuild-index', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'No project selected' }
  try {
    const eng = await getEngine()
    const index = eng.buildContextIndex(pp)
    return { success: true, sessions: index.sessionCount, events: index.eventCount }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('contextvault:update-memory', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'No project selected' }
  try {
    const eng = await getEngine()
    const result = eng.updateProjectMemory(pp)
    return { success: true, content: readFileSync(result.memoryPath, 'utf-8'), eventCount: result.eventCount }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('contextvault:build-timeline', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'No project selected' }
  try {
    const eng = await getEngine()
    const result = eng.buildTimeline(pp)
    return { success: true, content: readFileSync(result.outputPath, 'utf-8'), eventCount: result.eventCount }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('contextvault:export-all', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'No project selected' }
  try {
    const vaultPath = getVaultPath(pp)
    const memoryPath = join(vaultPath, 'memory.md')
    const sessions = listSessions(pp)
    const sections = ['# ContextVault Full Export', '', `Generated at: ${new Date().toISOString()}`, '', '## Project Memory', '', existsSync(memoryPath) ? readFileSync(memoryPath, 'utf-8').trim() : 'No project memory.', '', '## Sessions', '']
    for (const item of sessions) {
      const session = getSessionById(pp, item.id)
      if (session) sections.push(session.content.trim(), '')
    }
    const content = sections.join('\n')
    const outputPath = join(vaultPath, 'exports', 'contextvault-full-export.md')
    writeFileSync(outputPath, content, 'utf-8')
    return { success: true, content, filename: 'contextvault-full-export.md', sessionCount: sessions.length }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('contextvault:open-vault-folder', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return false
  return (await shell.openPath(getVaultPath(pp))) === ''
})

ipcMain.handle('contextvault:open-external', async (_e, url: string) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url)
  }
})

ipcMain.handle('contextvault:get-project-path', async () => global.__projectPath || null)

app.whenReady().then(async () => {
  const developmentProject = isDev ? join(app.getAppPath(), '..') : ''
  global.__projectPath = ensureProjectPath(process.env.CONTEXTVAULT_PROJECT_PATH || readSettings().projectPath || developmentProject)
  if (global.__projectPath) {
    try {
      const eng = await getEngine()
      eng.ensureEngineStorage(global.__projectPath)
      eng.buildContextIndex(global.__projectPath)
    } catch (error) {
      console.error('Failed to initialize ContextVault engine:', error)
    }
  }
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
