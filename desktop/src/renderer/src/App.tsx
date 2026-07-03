import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import Search from './pages/Search'
import PrepareContext from './pages/PrepareContext'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="flex h-full w-full bg-dark-800 text-neutral-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/prepare" element={<PrepareContext />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
