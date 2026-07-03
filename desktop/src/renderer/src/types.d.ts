export {}

interface ContextVaultAPI {
  openProject: () => Promise<string | null>
  listProjects: () => Promise<Array<{ path: string; name: string; active: boolean }>>
  switchProject: (projectPath: string) => Promise<any>
  removeProject: (projectPath: string) => Promise<any>
  getDashboardStats: () => Promise<{
    sessions: number
    events: number
    decisions: number
    problems: number
    tasks: number
    memoryExists: boolean
  } | null>
  listSessions: () => Promise<any[]>
  getSession: (id: string) => Promise<any>
  search: (query: string, filters?: any) => Promise<any>
  prepareContext: (query: string, filters?: any) => Promise<any>
  exportMarkdown: (id: string) => Promise<{ content: string; filename: string } | null>
  importConversation: () => Promise<any>
  saveSession: (input: {
    title: string
    source: string
    startedAt: string
    events: Array<{ type: string; content: string; createdAt: string }>
  }) => Promise<any>
  getSettings: () => Promise<any>
  updateSettings: (settings: any) => Promise<any>
  rebuildIndex: () => Promise<any>
  updateMemory: () => Promise<any>
  buildTimeline: () => Promise<any>
  exportAll: () => Promise<any>
  openVaultFolder: () => Promise<boolean>
  openExternal: (url: string) => Promise<void>
  getProjectPath: () => Promise<string | null>

  checkForUpdate: () => Promise<{ available: boolean; version?: string }>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  onUpdateAvailable: (callback: (version: string) => void) => void
  onUpdateProgress: (callback: (percent: number) => void) => void
  onUpdateDownloaded: (callback: () => void) => void
  onUpdateError: (callback: (msg: string) => void) => void
}

declare global {
  interface Window {
    contextVault?: ContextVaultAPI
  }
}
