export {}

interface ContextVaultAPI {
  openProject: () => Promise<string | null>
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
  getSettings: () => Promise<any>
  updateSettings: (settings: any) => Promise<any>
  openExternal: (url: string) => Promise<void>
  getProjectPath: () => Promise<string | null>
}

declare global {
  interface Window {
    contextVault?: ContextVaultAPI
  }
}
