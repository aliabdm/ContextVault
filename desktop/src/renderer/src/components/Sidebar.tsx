import { NavLink } from 'react-router-dom'
import ProjectSwitcher from './ProjectSwitcher'

const links = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/record', label: 'Record Session', icon: '●' },
  { to: '/sessions', label: 'Sessions', icon: '☰' },
  { to: '/history', label: 'History', icon: 'H' },
  { to: '/decisions', label: 'Decisions', icon: 'D' },
  { to: '/problems', label: 'Problems', icon: '!' },
  { to: '/tasks', label: 'Tasks', icon: 'T' },
  { to: '/retrieve', label: 'Retrieve', icon: 'R' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/prepare', label: 'Prepare', icon: '⊞' },
  { to: '/tools', label: 'Vault Tools', icon: '◇' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-dark-600 bg-dark-900 p-4">
      <div className="mb-5 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vault-500 text-sm font-bold text-white">CV</div>
        <span className="text-base font-semibold text-white">ContextVault</span>
      </div>

      <ProjectSwitcher />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-vault-500/10 text-vault-300'
                  : 'text-neutral-400 hover:bg-dark-700 hover:text-neutral-200'
              }`
            }
          >
            <span className={link.to === '/record' ? 'text-base text-red-400' : 'text-lg'}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-dark-600 pt-4">
        <a
          href="https://github.com/aliabdm/ContextVault"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          onClick={(event) => {
            event.preventDefault()
            window.contextVault?.openExternal('https://github.com/aliabdm/ContextVault')
          }}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
        <a
          href="https://senior-mohammad-ali.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          onClick={(event) => {
            event.preventDefault()
            window.contextVault?.openExternal('https://senior-mohammad-ali.vercel.app/')
          }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
          </svg>
          Portfolio
        </a>
      </div>
    </aside>
  )
}
