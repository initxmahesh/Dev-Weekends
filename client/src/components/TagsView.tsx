import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Plus, Tag, X } from 'lucide-react'
import { ApiError } from '../api/client'
import { createNote, fetchNotes } from '../api/notes'
import { fetchTaxonomyTags } from '../api/tags'
import { NoteCard } from './NoteCard'
import { notesGridClass, ViewSectionHeader, viewContainerClass } from './ViewSectionHeader'
import type { NoteFilters, RecentNote, TaxonomyTag } from '../types'

const TAG_THEMES = [
  { dot: 'bg-sky-400', accent: 'from-sky-500/20 to-transparent' },
  { dot: 'bg-violet-400', accent: 'from-violet-500/20 to-transparent' },
  { dot: 'bg-orange-400', accent: 'from-orange-500/20 to-transparent' },
  { dot: 'bg-emerald-400', accent: 'from-emerald-500/20 to-transparent' },
  { dot: 'bg-rose-400', accent: 'from-rose-500/20 to-transparent' },
  { dot: 'bg-amber-400', accent: 'from-amber-500/20 to-transparent' },
] as const

function tagTheme(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = (hash + tag.charCodeAt(i) * (i + 1)) % TAG_THEMES.length
  return TAG_THEMES[hash]!
}

function normalizeTagInput(raw: string) {
  const t = raw.trim().replace(/^#+/, '').toLowerCase().replace(/\s+/g, '-')
  return t ? `#${t}` : ''
}

function noteInitial(title: string) {
  const words = title.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return title.slice(0, 2).toUpperCase()
}

interface TagCardProps {
  item: TaxonomyTag
  active: boolean
  onClick: () => void
}

function TagCard({ item, active, onClick }: TagCardProps) {
  const theme = tagTheme(item.tag)
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'text-left bg-[#13142a] border border-white/[0.06] rounded-xl p-4 sm:p-5',
        'hover:border-violet-500/25 hover:bg-[#14152f] transition-all duration-200 cursor-pointer',
        'flex flex-col min-h-[168px] h-full overflow-hidden relative',
        active ? 'border-violet-500/40 ring-1 ring-violet-500/20' : '',
      ].join(' ')}
    >
      <div
        className={[
          'absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none',
          theme.accent,
        ].join(' ')}
        aria-hidden
      />
      <div className="relative flex flex-col h-full gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
          <span className="font-mono text-[13px] sm:text-[14px] font-semibold text-[#eef0fb] tracking-tight truncate">
            {item.tag}
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-[#8b91b8] leading-relaxed line-clamp-2 flex-1">
          {item.samples[0] ?? 'No linked notes yet'}
        </p>

        <div className="flex items-end justify-between gap-3 mt-auto pt-1">
          <div>
            <p className="text-[20px] sm:text-[22px] font-bold text-[#eef0fb] leading-none">
              {item.noteCount}
            </p>
            <p className="text-[11px] text-[#636a8a] mt-1">
              {item.noteCount === 1 ? 'note' : 'notes'}
            </p>
          </div>
          {item.samples.length > 0 && (
            <div className="flex -space-x-2 shrink-0">
              {item.samples.slice(0, 3).map((title, i) => (
                <span
                  key={`${title}-${i}`}
                  title={title}
                  className="w-7 h-7 rounded-full border-2 border-[#13142a] bg-violet-600/30 flex items-center justify-center text-[9px] font-semibold text-[#eef0fb]"
                >
                  {noteInitial(title)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

interface TagsViewProps {
  onSelectNote: (id: number) => void
  search?: string
  filters?: NoteFilters
}

export function TagsView({ onSelectNote, search = '', filters }: TagsViewProps) {
  const [tags, setTags] = useState<TaxonomyTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [creating, setCreating] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tagNotes, setTagNotes] = useState<RecentNote[]>([])
  const [tagNotesLoading, setTagNotesLoading] = useState(false)

  const loadTags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTaxonomyTags()
      setTags(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTags()
  }, [loadTags])

  const loadTagNotes = useCallback(async (tag: string) => {
    setTagNotesLoading(true)
    try {
      const notes = await fetchNotes('tags', { tag, filters })
      setTagNotes(notes)
    } catch {
      setTagNotes([])
    } finally {
      setTagNotesLoading(false)
    }
  }, [filters])

  const openTag = (tag: string) => {
    setActiveTag(tag)
    void loadTagNotes(tag)
  }

  useEffect(() => {
    if (!activeTag) return
    void loadTagNotes(activeTag)
  }, [activeTag, loadTagNotes, search])

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(tags, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'taxonomy-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCreateTag = async () => {
    const tag = normalizeTagInput(newTagName)
    if (!tag) return
    setCreating(true)
    try {
      await createNote({
        tab: 'note',
        title: 'Untitled',
        body: '',
        folder: 'inbox',
        tags: [tag.replace(/^#/, '')],
        date: 'Today',
        attachmentNames: [],
        reminder: undefined,
      })
      setNewTagName('')
      setCreateOpen(false)
      await loadTags()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create tag')
    } finally {
      setCreating(false)
    }
  }

  const filteredTags = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tags
    return tags.filter(
      t =>
        t.tag.toLowerCase().includes(q) ||
        t.samples.some(s => s.toLowerCase().includes(q)),
    )
  }, [tags, search])

  return (
    <div className={viewContainerClass}>
      <ViewSectionHeader
        icon={Tag}
        title="Tags"
        count={loading ? undefined : filteredTags.length}
        countLabel="tags"
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              disabled={tags.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[12px] text-[#8b91b8] hover:text-[#eef0fb] hover:border-white/[0.14] transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Create Tag
            </button>
          </>
        }
      />

      <p className="text-[13px] text-[#636a8a] -mt-2 mb-4 sm:mb-5 max-w-2xl leading-relaxed">
        Browse categories and open tagged notes — same layout as your main feed.
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
        <p className="text-[13px] text-[#636a8a] py-8">Loading tags…</p>
      )}

      {!loading && filteredTags.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-[#13142a] border border-white/[0.06] flex items-center justify-center mb-4">
            <Tag size={20} className="text-[#636a8a]" />
          </div>
          <p className="text-[14px] font-medium text-[#eef0fb]">
            {search ? 'No tags match your search' : 'No tags yet'}
          </p>
          <p className="text-[13px] text-[#636a8a] mt-1 max-w-sm">
            {search
              ? 'Try another search term.'
              : 'Create a tag to organize your notes.'}
          </p>
        </div>
      )}

      {!loading && filteredTags.length > 0 && (
        <div className={notesGridClass}>
          {filteredTags.map(item => (
            <TagCard
              key={item.tag}
              item={item}
              active={activeTag === item.tag}
              onClick={() => openTag(item.tag)}
            />
          ))}
        </div>
      )}

      {activeTag && (
        <section className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
            <Tag size={12} className="text-[#636a8a]" />
            <span className="text-[10.5px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase">
              Tagged notes
            </span>
            <span className="font-mono text-[12px] text-violet-300">{activeTag}</span>
            {!tagNotesLoading && (
              <span className="text-[11px] text-[#636a8a] ml-auto">
                {tagNotes.length} {tagNotes.length === 1 ? 'note' : 'notes'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className="p-1.5 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.05] cursor-pointer ml-1"
              aria-label="Close tagged notes"
            >
              <X size={14} />
            </button>
          </div>

          {tagNotesLoading && (
            <p className="text-[13px] text-[#636a8a] py-6">Loading notes…</p>
          )}
          {!tagNotesLoading && tagNotes.length === 0 && (
            <p className="text-[13px] text-[#636a8a] py-6">No notes with this tag yet.</p>
          )}
          {!tagNotesLoading && tagNotes.length > 0 && (
            <div className={notesGridClass}>
              {tagNotes.map(note => (
                <NoteCard key={note.id} note={note} onSelect={() => onSelectNote(note.id)} />
              ))}
            </div>
          )}
        </section>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-[#13142a] p-5 shadow-2xl"
            role="dialog"
            aria-labelledby="create-tag-title"
          >
            <h3 id="create-tag-title" className="text-[16px] font-semibold text-[#eef0fb] mb-1">
              Create Tag
            </h3>
            <p className="text-[12px] text-[#636a8a] mb-4">
              Adds a new category and an inbox note tagged with it.
            </p>
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleCreateTag()}
              placeholder="e.g. deep-work"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-[#0d0e1c] border border-white/[0.08] text-[13px] text-[#eef0fb] outline-none focus:border-violet-500/40 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false)
                  setNewTagName('')
                }}
                className="px-4 py-2 rounded-lg text-[13px] text-[#8b91b8] hover:text-[#eef0fb] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateTag()}
                disabled={creating || !normalizeTagInput(newTagName)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium disabled:opacity-50 cursor-pointer"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
