import { useCallback, useState } from 'react'
import './App.css'

import { Sidebar }        from './components/Sidebar'
import { TopBar }         from './components/TopBar'
import { PinnedNodes }    from './components/PinnedNodes'
import { RecentActivity } from './components/RecentActivity'
import { QuickStats }     from './components/QuickStats'
import { NewNoteModal, type NewNotePayload } from './components/NewNoteModal'
import { recentNotes as initialRecentNotes } from './data'
import type { RecentNote } from './types'

function formatNoteDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function App() {
  const [activeNav, setActiveNav]     = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>(initialRecentNotes)

  const handleCreateNote = useCallback((payload: NewNotePayload) => {
    const id = Date.now()
    const date = formatNoteDate(payload.date)
    const base = {
      id,
      date,
      folder: payload.folder,
      tags: payload.tags.length ? payload.tags : undefined,
    }

    if (payload.tab === 'task') {
      const items = payload.body
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
      setRecentNotes(prev => [
        { ...base, type: 'checklist', title: payload.title, items },
        ...prev,
      ])
      return
    }

    if (payload.tab === 'link') {
      setRecentNotes(prev => [
        {
          ...base,
          type: 'text',
          title: payload.title,
          description: payload.body,
          url: payload.body,
        },
        ...prev,
      ])
      return
    }

    setRecentNotes(prev => [
      {
        ...base,
        type: 'text',
        title: payload.title,
        description: payload.body,
      },
      ...prev,
    ])
  }, [])

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
        onNewNote={() => setNewNoteOpen(true)}
      />

      <NewNoteModal
        open={newNoteOpen}
        onClose={() => setNewNoteOpen(false)}
        onCreate={handleCreateNote}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 pb-8">
          <PinnedNodes />
          <RecentActivity notes={recentNotes} />
        </div>
      </main>

      <QuickStats />
    </div>
  )
}
