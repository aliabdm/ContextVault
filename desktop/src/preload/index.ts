import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openProject: (): Promise<string | null> =>
    ipcRenderer.invoke('contextvault:open-project'),

  getDashboardStats: (): Promise<{
    sessions: number
    events: number
    decisions: number
    problems: number
    tasks: number
    memoryExists: boolean
  } | null> => ipcRenderer.invoke('contextvault:get-dashboard-stats'),

  listSessions: (): Promise<any[]> =>
    ipcRenderer.invoke('contextvault:list-sessions'),

  getSession: (id: string): Promise<any> =>
    ipcRenderer.invoke('contextvault:get-session', id),

  search: (query: string, filters?: any): Promise<any> =>
    ipcRenderer.invoke('contextvault:search', query, filters),

  prepareContext: (query: string, filters?: any): Promise<any> =>
    ipcRenderer.invoke('contextvault:prepare-context', query, filters),

  exportMarkdown: (id: string): Promise<{ content: string; filename: string } | null> =>
    ipcRenderer.invoke('contextvault:export-markdown', id),

  importConversation: (): Promise<any> =>
    ipcRenderer.invoke('contextvault:import'),

  getSettings: (): Promise<any> =>
    ipcRenderer.invoke('contextvault:get-settings'),

  updateSettings: (settings: any): Promise<any> =>
    ipcRenderer.invoke('contextvault:update-settings', settings),

  rebuildIndex: (): Promise<any> => ipcRenderer.invoke('contextvault:rebuild-index'),
  updateMemory: (): Promise<any> => ipcRenderer.invoke('contextvault:update-memory'),
  buildTimeline: (): Promise<any> => ipcRenderer.invoke('contextvault:build-timeline'),
  exportAll: (): Promise<any> => ipcRenderer.invoke('contextvault:export-all'),
  openVaultFolder: (): Promise<boolean> => ipcRenderer.invoke('contextvault:open-vault-folder'),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('contextvault:open-external', url),

  getProjectPath: (): Promise<string | null> =>
    ipcRenderer.invoke('contextvault:get-project-path'),

  checkForUpdate: (): Promise<{ available: boolean; version?: string }> =>
    ipcRenderer.invoke('update:check'),

  downloadUpdate: (): Promise<void> =>
    ipcRenderer.invoke('update:download'),

  installUpdate: (): Promise<void> =>
    ipcRenderer.invoke('update:install'),

  onUpdateAvailable: (callback: (version: string) => void) => {
    ipcRenderer.on('update:available', (_e, version) => callback(version))
  },

  onUpdateProgress: (callback: (percent: number) => void) => {
    ipcRenderer.on('update:download-progress', (_e, percent) => callback(percent))
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update:downloaded', () => callback())
  },

  onUpdateError: (callback: (msg: string) => void) => {
    ipcRenderer.on('update:error', (_e, msg) => callback(msg))
  },
}

contextBridge.exposeInMainWorld('contextVault', api)
