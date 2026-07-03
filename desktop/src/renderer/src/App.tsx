import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import AutoUpdateBanner from './components/AutoUpdateBanner'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Search from './pages/Search'
import PrepareContext from './pages/PrepareContext'
import Settings from './pages/Settings'
import VaultTools from './pages/VaultTools'
import Recorder from './pages/Recorder'

export default function App() {
  const [projectRevision, setProjectRevision] = useState(0)

  useEffect(() => {
    const handleProjectChange = () => setProjectRevision((value) => value + 1)
    window.addEventListener('contextvault:project-changed', handleProjectChange)
    return () => window.removeEventListener('contextvault:project-changed', handleProjectChange)
  }, [])

  return (
    <div className="flex h-full w-full flex-col bg-dark-800 text-neutral-200">
      <AutoUpdateBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main key={projectRevision} className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/record" element={<Recorder />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/prepare" element={<PrepareContext />} />
            <Route path="/tools" element={<VaultTools />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
