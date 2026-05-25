import { useState } from 'react'
import './App.css'

import { Sidebar }        from './components/Sidebar'
import { TopBar }         from './components/TopBar'
import { PinnedNodes }    from './components/PinnedNodes'
import { RecentActivity } from './components/RecentActivity'
import { QuickStats }     from './components/QuickStats'

export default function App() {
  const [activeNav, setActiveNav]     = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0e1c] font-sans antialiased">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 pb-8">
          <PinnedNodes />
          <RecentActivity />
        </div>
      </main>

      <QuickStats />
    </div>
  )
}
