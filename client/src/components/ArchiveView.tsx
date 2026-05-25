import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Archive,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { ApiError } from '../api/client'
import { emptyArchive, fetchArchiveStats } from '../api/archive'
import { deleteNote, fetchNotes, updateNote } from '../api/notes'
import { NoteCard } from './NoteCard'
import { notesGridClass, ViewSectionHeader, viewContainerClass } from './ViewSectionHeader'
import type { ArchiveStats, NoteFilters, RecentNote } from '../types'

const FOLDER_CATEGORIES: Record<string, { label: string; className: string }> = {
  work: { label: 'Engineering', className: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  ideas: { label: 'Product', className: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  inbox: { label: 'General', className: 'bg-white/[0.06] text-[#8b91b8] border-white/[0.08]' },
  archive: { label: 'Archive', className: 'bg-white/[0.06] text-[#8b91b8] border-white/[0.08]' },
}

function badgeStyle(badge?: string) {
  const b = (badge ?? 'DRAFT').toUpperCase()
  if (b === 'COMPLETED') {
    return 'bg-orange-500/15 text-orange-300 border-orange-500/25'
  }
  if (b === 'REFERENCE' || b === 'SYSTEM') {
    return 'bg-white/[0.06] text-[#8b91b8] border-white/[0.08]'
  }
  return 'bg-white/[0.05] text-[#636a8a] border-white/[0.08]'
}

function categoryForNote(note: RecentNote) {
  const folder = note.folder ?? 'inbox'
  return FOLDER_CATEGORIES[folder] ?? FOLDER_CATEGORIES.inbox!
}

interface ArchiveViewProps {
  onSelectNote: (id: number) => void
  onNotesChanged?: () => void
  filters?: NoteFilters
}

export function ArchiveView({ onSelectNote, onNotesChanged, filters }: ArchiveViewProps) {
  const [notes, setNotes] = useState<RecentNote[]>([])
  const [stats, setStats] = useState<ArchiveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<number | null>(null)
  const [emptying, setEmptying] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [archived, archiveStats] = await Promise.all([
        fetchNotes('archive', { filters }),
        fetchArchiveStats(),
      ])
      setNotes(archived)
      setStats(archiveStats)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load archive')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (menuId === null) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuId])

  const handleEmptyArchive = async () => {
    if (notes.length === 0) return
    if (
      !window.confirm(
        `Permanently delete all ${notes.length} archived items? This cannot be undone.`,
      )
    ) {
      return
    }
    setEmptying(true)
    try {
      await emptyArchive()
      setMenuId(null)
      await load()
      onNotesChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to empty archive')
    } finally {
      setEmptying(false)
    }
  }

  const handleRestore = async (id: number) => {
    setMenuId(null)
    try {
      await updateNote(id, { isArchived: false })
      setNotes(prev => prev.filter(n => n.id !== id))
      const archiveStats = await fetchArchiveStats()
      setStats(archiveStats)
      onNotesChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to restore note')
    }
  }

  const handleDelete = async (id: number) => {
    setMenuId(null)
    const note = notes.find(n => n.id === id)
    if (!note) return
    if (!window.confirm(`Permanently delete "${note.title}"?`)) return
    try {
      await deleteNote(id)
      setNotes(prev => prev.filter(n => n.id !== id))
      const archiveStats = await fetchArchiveStats()
      setStats(archiveStats)
      onNotesChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete note')
    }
  }

  const itemLabel = stats?.archivedTotal === 1 ? 'item' : 'items'

  return (
    <div className={viewContainerClass}>
      <ViewSectionHeader
        icon={Archive}
        title="Archive"
        count={loading ? undefined : notes.length}
        countLabel="items"
        actions={
          <button
            type="button"
            onClick={() => void handleEmptyArchive()}
            disabled={emptying || notes.length === 0}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/[0.08] bg-[#13142a] text-[12px] sm:text-[13px] text-[#8b91b8] hover:text-[#eef0fb] hover:border-white/[0.14] transition-colors cursor-pointer disabled:opacity-40"
          >
            <Trash2 size={14} />
            {emptying ? 'Emptying…' : 'Empty Archive'}
          </button>
        }
      />

      <p className="text-[13px] text-[#636a8a] -mt-2 mb-4 sm:mb-5 max-w-2xl leading-relaxed">
        Items removed from your active workspace but preserved for reference.
      </p>

      {error && (
        <div
          className="mb-4 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-[13px] text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && (
        <p className="text-[13px] text-[#636a8a] py-8">Loading archive…</p>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-[#13142a] border border-white/[0.06] flex items-center justify-center mb-4">
            <Archive size={20} className="text-[#636a8a]" />
          </div>
          <p className="text-[14px] font-medium text-[#eef0fb]">Your archive is empty</p>
          <p className="text-[13px] text-[#636a8a] mt-1 max-w-sm">
            Archived notes will appear here when you move them out of your active workspace.
          </p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className={notesGridClass}>
          {notes.map(note => {
            const category = categoryForNote(note)
            const statusBadge = (note.badge ?? 'DRAFT').toUpperCase()
            return (
              <div key={note.id} className="relative h-full">
                <NoteCard
                  note={note}
                  showMenu={false}
                  onSelect={() => onSelectNote(note.id)}
                  footer={
                    <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                      <span
                        className={[
                          'text-[10px] font-semibold tracking-[0.4px] uppercase px-2 py-0.5 rounded border',
                          badgeStyle(note.badge),
                        ].join(' ')}
                      >
                        {statusBadge}
                      </span>
                      <span
                        className={[
                          'text-[10px] font-medium px-2 py-0.5 rounded border',
                          category.className,
                        ].join(' ')}
                      >
                        {category.label}
                      </span>
                      <span className="text-[11px] text-[#636a8a] ml-auto truncate">
                        {note.archivedAt ?? note.date}
                      </span>
                    </div>
                  }
                />
                <div
                  className="absolute top-3 right-3 z-10"
                  ref={menuId === note.id ? menuRef : undefined}
                >
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setMenuId(menuId === note.id ? null : note.id)
                    }}
                    className="p-1.5 rounded-md bg-[#13142a]/90 border border-white/[0.08] text-[#636a8a] hover:text-[#eef0fb] cursor-pointer"
                    aria-label="More options"
                    aria-expanded={menuId === note.id}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {menuId === note.id && (
                    <div className="absolute right-0 top-full mt-1 z-20 min-w-[150px] py-1 rounded-lg border border-white/[0.08] bg-[#14151f] shadow-xl">
                      <button
                        type="button"
                        onClick={() => void handleRestore(note.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-[#8b91b8] hover:bg-white/[0.04] hover:text-[#eef0fb] cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(note.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {stats && (
        <footer className="mt-8 sm:mt-10 pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 border-t border-white/[0.04]">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-1.5">
              Storage
            </p>
            <p className="text-[16px] sm:text-[18px] font-bold text-[#eef0fb]">
              {stats.storageUsedMb} MB{' '}
              <span className="text-[#636a8a] font-normal text-[13px] sm:text-[14px]">
                / {stats.storageLimitMb} MB
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-1.5">
              Archived Total
            </p>
            <p className="text-[16px] sm:text-[18px] font-bold text-[#eef0fb]">
              {stats.archivedTotal} {itemLabel}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-1.5">
              Auto-Delete
            </p>
            <p className="text-[16px] sm:text-[18px] font-bold text-[#eef0fb]">
              {stats.autoDeleteEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
