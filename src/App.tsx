import { useState } from 'react'
import { Command } from 'lucide-react'
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 pb-24">
          <PinnedNodes />
          <RecentActivity />
        </div>
      </main>

      <QuickStats />

      {/* Floating command palette trigger */}
      <button
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 bg-[#13142a] border border-white/[0.09] rounded-full text-[#6b7094] text-[12.5px] font-medium hover:bg-[#191a32] hover:text-[#e4e6f5] hover:border-white/[0.15] transition-all duration-200 z-30 cursor-pointer shadow-lg shadow-black/30"
        aria-label="Open quick action"
      >
        <Command size={12} />
        <span>Quick Action</span>
        <kbd className="text-[10px] opacity-50 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08] font-sans leading-none">
          ⌘K
        </kbd>
      </button>
    </div>
  )
}
