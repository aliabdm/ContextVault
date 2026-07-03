import { app, BrowserWindow, ipcMain, dialog, shell, Notification } from 'electron'
import { basename, join } from 'path'
import { pathToFileURL } from 'url'
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync, watch, type FSWatcher } from 'fs'
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import electronUpdater from 'electron-updater'
import { parseSessionEvents } from './session-format'

const { autoUpdater } = electronUpdater

let mainWindow: BrowserWindow | null = null
let engine: any = null
const cliRecorders = new Map<string, ChildProcessWithoutNullStreams>()
let vaultWatcher: FSWatcher | null = null
let vaultRefreshTimer: NodeJS.Timeout | null = null
let lastVaultUpdatedAt = new Date().toISOString()

const CLI_COMMANDS = new Set([
  'init', 'list', 'show', 'export', 'search', 'import', 'index', 'retrieve',
  'prepare', 'memory', 'link', 'timeline', 'history', 'tasks', 'decisions', 'problems',
])

type DesktopSettings = {
  projectPath: string
  recentProjects: string[]
  indexingMode: 'manual'
}

const defaultSettings: DesktopSettings = { projectPath: '', recentProjects: [], indexingMode: 'manual' }

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function readSettings(): DesktopSettings {
  try {
    const value = JSON.parse(readFileSync(settingsPath(), 'utf-8'))
    const projectPath = ensureProjectPath(value.projectPath)
    const recentProjects = Array.from(new Set([
      projectPath,
      ...(Array.isArray(value.recentProjects) ? value.recentProjects : []),
    ].map((item) => ensureProjectPath(item)).filter(Boolean))).slice(0, 12)
    return {
      projectPath,
      recentProjects,
      indexingMode: 'manual',
    }
  } catch {
    return { ...defaultSettings, recentProjects: [] }
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

function getCliPath(): string {
  const base = app.isPackaged
    ? join(process.resourcesPath, 'scripts')
    : join(app.getAppPath(), '..', 'scripts')
  return join(base, 'vault-terminal.mjs')
}

function cleanCliValue(value: unknown, maxLength = 4000): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength)
}

function spawnCli(projectPath: string, args: string[]): ChildProcessWithoutNullStreams {
  const cliPath = getCliPath()
  if (!existsSync(cliPath)) throw new Error(`ContextVault CLI not found at ${cliPath}`)
  return spawn(process.execPath, [cliPath, ...args], {
    cwd: projectPath,
    windowsHide: true,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
}

function runCliCommand(projectPath: string, command: string, args: unknown[] = []) {
  return new Promise((resolve) => {
    if (!CLI_COMMANDS.has(command)) {
      resolve({ success: false, output: '', error: `Unsupported command: ${command}`, exitCode: 1 })
      return
    }
    const safeArgs = Array.isArray(args) ? args.map((value) => cleanCliValue(value)).filter(Boolean).slice(0, 40) : []
    let child: ChildProcessWithoutNullStreams
    try {
      child = spawnCli(projectPath, [command, ...safeArgs])
    } catch (error) {
      resolve({ success: false, output: '', error: error instanceof Error ? error.message : String(error), exitCode: 1 })
      return
    }
    let output = ''
    let errorOutput = ''
    child.stdout.on('data', (chunk) => { output += chunk.toString() })
    child.stderr.on('data', (chunk) => { errorOutput += chunk.toString() })
    child.on('error', (error) => resolve({ success: false, output, error: error.message, exitCode: 1 }))
    child.on('close', async (code) => {
      if (command !== 'show' && command !== 'list') {
        try {
          const eng = await getEngine()
          eng.buildContextIndex(projectPath)
        } catch { /* command output remains authoritative */ }
      }
      resolve({
        success: code === 0,
        output: output.trim(),
        error: errorOutput.trim() || (code === 0 ? '' : `${command} exited with code ${code}`),
        exitCode: code ?? 1,
      })
    })
    child.stdin.end()
  })
}

async function activateProject(projectPath: string): Promise<string> {
  const eng = await getEngine()
  const paths = eng.ensureEngineStorage(projectPath)
  if (!existsSync(paths.memoryPath)) {
    writeFileSync(paths.memoryPath, '# ContextVault Project Memory\n\nAdd durable project context here.\n', 'utf-8')
  }
  eng.buildContextIndex(projectPath)

  const current = readSettings()
  const previousProjectPath = ensureProjectPath(global.__projectPath)
  const recentProjects = Array.from(new Set([
    projectPath,
    previousProjectPath,
    ...current.recentProjects,
  ].filter(Boolean))).slice(0, 12)
  global.__projectPath = projectPath
  saveSettings({ projectPath, recentProjects, indexingMode: 'manual' })
  watchActiveVault(projectPath)
  return projectPath
}

function watchActiveVault(projectPath: string): void {
  vaultWatcher?.close()
  vaultWatcher = null
  if (vaultRefreshTimer) clearTimeout(vaultRefreshTimer)
  const sessionsPath = join(getVaultPath(projectPath), 'sessions')
  lastVaultUpdatedAt = new Date().toISOString()
  mkdirSync(sessionsPath, { recursive: true })
  try {
    vaultWatcher = watch(sessionsPath, () => {
      if (vaultRefreshTimer) clearTimeout(vaultRefreshTimer)
      vaultRefreshTimer = setTimeout(async () => {
        try {
          const eng = await getEngine()
          eng.buildContextIndex(projectPath)
          lastVaultUpdatedAt = new Date().toISOString()
          mainWindow?.webContents.send('contextvault:vault-changed')
        } catch (error) {
          console.error('Failed to refresh changed vault:', error)
        }
      }, 250)
    })
  } catch (error) {
    console.error('Failed to watch active ContextVault sessions:', error)
  }
}

function projectInfo(projectPath: string) {
  return {
    path: projectPath,
    name: basename(projectPath),
    active: projectPath === global.__projectPath,
  }
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
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }
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
        const events = parseSessionEvents(content)
        return { frontmatter, events, content, file }
      }
    }
  }
  return null
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
  const projectPath = ensureProjectPath(global.__projectPath || stored.projectPath)
  const recentProjects = Array.from(new Set([projectPath, ...stored.recentProjects].filter(Boolean)))
  return {
    projectPath,
    recentProjects: recentProjects.map(projectInfo),
    indexingMode: stored.indexingMode,
    version: app.getVersion(),
  }
}

function updateSettings(settings: any) {
  const current = readSettings()
  const previousProjectPath = ensureProjectPath(global.__projectPath)
  const projectPath = ensureProjectPath(settings.projectPath || global.__projectPath || current.projectPath)
  global.__projectPath = projectPath
  const recentProjects = Array.from(new Set([projectPath, previousProjectPath, ...current.recentProjects].filter(Boolean))).slice(0, 12)
  saveSettings({ projectPath, recentProjects, indexingMode: 'manual' })
  if (projectPath) watchActiveVault(projectPath)
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
  if (result.canceled || result.filePaths.length === 0) return { success: false, canceled: true, error: 'Import canceled.' }

  return activateProject(result.filePaths[0])
})

ipcMain.handle('contextvault:list-projects', async () => getSettings().recentProjects)

ipcMain.handle('contextvault:switch-project', async (_e, projectPath: string) => {
  const resolved = ensureProjectPath(projectPath)
  if (!resolved || !readSettings().recentProjects.includes(resolved)) {
    return { success: false, error: 'Project is unavailable. Add the folder again.' }
  }
  await activateProject(resolved)
  return { success: true, project: projectInfo(resolved) }
})

ipcMain.handle('contextvault:remove-project', async (_e, projectPath: string) => {
  const current = readSettings()
  const recentProjects = current.recentProjects.filter((item) => item !== projectPath)
  let activePath = ensureProjectPath(global.__projectPath || current.projectPath)
  if (activePath === projectPath) activePath = recentProjects[0] || ''
  global.__projectPath = activePath
  saveSettings({ projectPath: activePath, recentProjects, indexingMode: 'manual' })
  if (activePath) {
    const eng = await getEngine()
    eng.buildContextIndex(activePath)
  }
  return { success: true, activeProjectPath: activePath, projects: getSettings().recentProjects }
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
    return { success: true, ...importResult }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('contextvault:list-events', async (_e, type: string, filters: any) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, events: [], error: 'No project selected' }
  try {
    const eng = await getEngine()
    const normalized = normalizeFilters(filters)
    const events = eng.listContextEvents(pp, type || undefined, { ...normalized, query: String(filters?.query || '').trim() })
    return { success: true, events }
  } catch (error) {
    return { success: false, events: [], error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('contextvault:get-watcher-status', async () => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { watching: false, projectPath: '', lastUpdatedAt: '', events: 0, sources: [] }
  try {
    const indexPath = join(getVaultPath(pp), 'index', 'context-index.json')
    const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf-8')) : { events: [], eventCount: 0 }
    const events = Array.isArray(index.events) ? index.events : []
    const sources = Array.from(new Set(events.map((event: any) => event.platform || event.source).filter(Boolean))).sort()
    return { watching: Boolean(vaultWatcher), projectPath: pp, lastUpdatedAt: lastVaultUpdatedAt, events: index.eventCount || events.length, sources }
  } catch {
    return { watching: Boolean(vaultWatcher), projectPath: pp, lastUpdatedAt: lastVaultUpdatedAt, events: 0, sources: [] }
  }
})

ipcMain.handle('contextvault:run-cli', async (_e, command: string, args: unknown[] = []) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, output: '', error: 'Select a project first.', exitCode: 1 }
  return runCliCommand(pp, cleanCliValue(command, 40), args)
})

ipcMain.handle('contextvault:recorder-start', async (_e, input: { title?: string; source?: string }) => {
  const pp = ensureProjectPath(global.__projectPath)
  if (!pp) return { success: false, error: 'Select a project first.' }
  if (cliRecorders.size > 0) return { success: false, error: 'A CLI recording is already active.' }

  try {
    const recorderId = `recorder-${Date.now().toString(36)}`
    const child = spawnCli(pp, ['record'])
    cliRecorders.set(recorderId, child)

    const emit = (channel: string, payload: Record<string, unknown>) => {
      mainWindow?.webContents.send(channel, { recorderId, ...payload })
    }
    child.stdout.on('data', (chunk) => emit('contextvault:recorder-output', { stream: 'stdout', data: chunk.toString() }))
    child.stderr.on('data', (chunk) => emit('contextvault:recorder-output', { stream: 'stderr', data: chunk.toString() }))
    child.on('error', (error) => emit('contextvault:recorder-output', { stream: 'stderr', data: `${error.message}\n` }))
    child.on('close', async (code) => {
      cliRecorders.delete(recorderId)
      try {
        const eng = await getEngine()
        eng.buildContextIndex(pp)
      } catch { /* the recorder exit still needs to reach the UI */ }
      emit('contextvault:recorder-exit', { exitCode: code ?? 1 })
    })

    const title = cleanCliValue(input?.title, 200) || 'Untitled desktop session'
    const source = cleanCliValue(input?.source, 80) || 'desktop'
    child.stdin.write(`/title ${title}\n`)
    child.stdin.write(`/source ${source}\n`)
    return { success: true, recorderId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

ipcMain.handle('contextvault:recorder-send', async (_e, recorderId: string, command: string) => {
  const child = cliRecorders.get(recorderId)
  if (!child || child.stdin.destroyed) return { success: false, error: 'Recorder is not active.' }
  const line = cleanCliValue(command, 1_000_000)
  if (!line || line === '/end') return { success: false, error: 'Use Finish & save to end the recording.' }
  child.stdin.write(`${line}\n`)
  return { success: true }
})

ipcMain.handle('contextvault:recorder-finish', async (_e, recorderId: string) => {
  const child = cliRecorders.get(recorderId)
  if (!child || child.stdin.destroyed) return { success: false, error: 'Recorder is not active.' }
  return new Promise((resolve) => {
    child.once('close', (code) => resolve({ success: code === 0, exitCode: code ?? 1, error: code === 0 ? '' : `Recorder exited with code ${code}` }))
    child.once('error', (error) => resolve({ success: false, exitCode: 1, error: error.message }))
    child.stdin.write('/end\n')
    child.stdin.end()
  })
})

ipcMain.handle('contextvault:recorder-cancel', async (_e, recorderId: string) => {
  const child = cliRecorders.get(recorderId)
  if (!child) return { success: true }
  child.kill()
  cliRecorders.delete(recorderId)
  return { success: true }
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
  const storedSettings = readSettings()
  global.__projectPath = ensureProjectPath(process.env.CONTEXTVAULT_PROJECT_PATH || storedSettings.projectPath || developmentProject)
  if (global.__projectPath) {
    try {
      const eng = await getEngine()
      eng.ensureEngineStorage(global.__projectPath)
      eng.buildContextIndex(global.__projectPath)
      watchActiveVault(global.__projectPath)
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

app.on('before-quit', () => {
  vaultWatcher?.close()
  if (vaultRefreshTimer) clearTimeout(vaultRefreshTimer)
  for (const child of cliRecorders.values()) child.kill()
  cliRecorders.clear()
})
