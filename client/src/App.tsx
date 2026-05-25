import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { NotesFeed } from './components/NotesFeed'
import { TagsView } from './components/TagsView'
import { ArchiveView } from './components/ArchiveView'
import { NoteDetailView } from './components/NoteDetailView'
import { QuickStats } from './components/QuickStats'
import { MobileQuickStats } from './components/MobileQuickStats'
import { NewNoteModal, type NewNotePayload } from './components/NewNoteModal'
import { ApiError } from './api/client'
import { createNote, fetchNotes } from './api/notes'
import { defaultNoteFilters, type NoteFilters, type RecentNote } from './types'
import { countActiveFilters } from './components/FilterPanel'
import { mainColumnPadding, mainColumnPaddingY } from './layout'

export default function App() {
  const [activeNav, setActiveNav] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<NoteFilters>(defaultNoteFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(t)
  }, [search])

  const mergedFilters = useMemo(
    (): NoteFilters => ({ ...filters, query: debouncedSearch }),
    [filters, debouncedSearch],
  )

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const notes = await fetchNotes(activeNav, { filters: mergedFilters })
      setRecentNotes(notes)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [activeNav, mergedFilters])

  useEffect(() => {
    setSelectedNoteId(null)
    if (activeNav === 'tags' || activeNav === 'archive') return
    void loadNotes()
  }, [activeNav, loadNotes])

  const handleCreateNote = useCallback(
    async (payload: NewNotePayload) => {
      try {
        setError(null)
        const note = await createNote(payload)
        if (activeNav === 'all' || activeNav === 'archive') {
          setRecentNotes(prev => [note, ...prev])
        } else {
          await loadNotes()
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to create note')
        throw err
      }
    },
    [activeNav, loadNotes],
  )

  const handleNoteUpdated = useCallback((updated: RecentNote) => {
    setRecentNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
  }, [])

  const showFeedStats =
    selectedNoteId === null && activeNav !== 'tags' && activeNav !== 'archive'

  const hasSearchOrFilters =
    debouncedSearch.length > 0 || countActiveFilters(filters) > 0

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0d0e1c] font-sans antialiased">
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
        <div className={`flex flex-col flex-1 min-h-0 ${mainColumnPadding}`}>
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {showFeedStats && <MobileQuickStats />}

          {selectedNoteId !== null ? (
            <NoteDetailView
              noteId={selectedNoteId}
              onBack={() => setSelectedNoteId(null)}
              onOpenNote={id => setSelectedNoteId(id)}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={() => {
                setSelectedNoteId(null)
                void loadNotes()
              }}
            />
          ) : (
            <div
              className={`flex-1 overflow-y-auto overflow-x-hidden ${mainColumnPaddingY} pb-6 sm:pb-8`}
            >
            {error && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-[13px] text-red-300"
                role="alert"
              >
                {error}
              </div>
            )}
            {activeNav === 'tags' ? (
              <TagsView
                onSelectNote={id => setSelectedNoteId(id)}
                search={debouncedSearch}
                filters={mergedFilters}
              />
            ) : activeNav === 'archive' ? (
              <ArchiveView
                onSelectNote={id => setSelectedNoteId(id)}
                filters={mergedFilters}
                onNotesChanged={() => {
                  if (activeNav !== 'archive') void loadNotes()
                }}
              />
            ) : (
              <NotesFeed
                notes={recentNotes}
                activeNav={activeNav}
                loading={loading}
                onSelectNote={id => setSelectedNoteId(id)}
                searchActive={hasSearchOrFilters}
              />
            )}
            </div>
          )}
        </div>
      </main>

      {showFeedStats && <QuickStats />}
    </div>
  )
}
