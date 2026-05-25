import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  Bold,
  Check,
  Cloud,
  Code,
  FolderOpen,
  Image,
  Italic,
  Link2,
  List,
  Pin,
  Plus,
  Settings,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { ApiError } from '../api/client'
import { deleteNote, fetchNoteById, fetchRelatedNotes } from '../api/notes'
import { useNotePersistence } from '../hooks/useNotePersistence'
import type { LinkedNote, RecentNote } from '../types'

const FOLDERS = ['inbox', 'work', 'ideas', 'archive'] as const

interface NoteDetailViewProps {
  noteId: number
  onBack: () => void
  onOpenNote: (id: number) => void
  onNoteUpdated?: (note: RecentNote) => void
  onNoteDeleted?: () => void
}

function formatTagLabel(tag: string) {
  return tag
    .replace(/^#/, '')
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function normalizeTag(raw: string) {
  const t = raw.trim().replace(/^#+/, '')
  return t ? `#${t.toLowerCase().replace(/\s+/g, '-')}` : ''
}

function getEditableContent(note: RecentNote): string {
  if (note.type === 'checklist') return note.items?.join('\n') ?? ''
  if (note.type === 'code') return note.code ?? ''
  if (note.url) return note.url
  return note.description ?? ''
}

function renderPreview(text: string) {
  const blocks = text.split(/(?=^### )/m)
  if (blocks.length <= 1 && !text.includes('###')) {
    return (
      <div className="mt-4 p-4 rounded-lg bg-[#0a0b12] border border-white/[0.04] text-[13px] text-[#8b91b8] leading-relaxed whitespace-pre-wrap">
        {text || 'Preview will appear as you type…'}
      </div>
    )
  }
  return (
    <div className="mt-4 p-4 rounded-lg bg-[#0a0b12] border border-white/[0.04] space-y-3 text-[13px] text-[#c4c9e8]">
      {blocks.map((block, i) => {
        if (block.startsWith('### ')) {
          const lines = block.split('\n')
          return (
            <div key={i}>
              <h3 className="text-[14px] font-semibold text-[#eef0fb] mb-1">
                {lines[0].replace(/^### /, '')}
              </h3>
              <p className="whitespace-pre-wrap text-[#8b91b8]">{lines.slice(1).join('\n').trim()}</p>
            </div>
          )
        }
        if (block.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-violet-500/40 pl-3 italic text-[#8b91b8]">
              {block.replace(/^> /gm, '')}
            </blockquote>
          )
        }
        return <p key={i} className="whitespace-pre-wrap">{block}</p>
      })}
    </div>
  )
}

export function NoteDetailView({
  noteId,
  onBack,
  onOpenNote,
  onNoteUpdated,
  onNoteDeleted,
}: NoteDetailViewProps) {
  const [note, setNote] = useState<RecentNote | null>(null)
  const [linked, setLinked] = useState<LinkedNote[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tagInputOpen, setTagInputOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [folderOpen, setFolderOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const loadNote = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [n, related] = await Promise.all([
        fetchNoteById(noteId),
        fetchRelatedNotes(noteId),
      ])
      setNote(n)
      setTitle(n.title)
      setBody(getEditableContent(n))
      setLinked(related)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load note')
    } finally {
      setLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    loadNote()
  }, [loadNote])

  const { saveStatus, applyMetadata, saveNow, preventBlur } = useNotePersistence({
    note,
    title,
    body,
    setNote,
    onNoteUpdated,
    onLinkedNotesChange: setLinked,
    onError: message => setError(message),
  })

  const handleBack = () => {
    void saveNow().finally(() => onBack())
  }

  const applyFormat = (action: 'bold' | 'italic' | 'link' | 'list' | 'code' | 'image') => {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)
    let insert = ''
    let cursor = start

    switch (action) {
      case 'bold':
        insert = `**${selected || 'text'}**`
        cursor = start + 2 + (selected || 'text').length
        break
      case 'italic':
        insert = `*${selected || 'text'}*`
        cursor = start + 1 + (selected || 'text').length
        break
      case 'link': {
        const url = window.prompt('Link URL', 'https://')
        if (!url) return
        insert = `[${selected || 'link text'}](${url})`
        cursor = start + insert.length
        break
      }
      case 'list':
        insert = selected
          ? selected
              .split('\n')
              .map(l => (l.startsWith('- ') ? l : `- ${l}`))
              .join('\n')
          : '- '
        cursor = start + insert.length
        break
      case 'code':
        insert = `\`${selected || 'code'}\``
        cursor = start + 1 + (selected || 'code').length
        break
      case 'image': {
        const url = window.prompt('Image URL', 'https://')
        if (!url) return
        insert = `![${selected || 'alt'}](${url})`
        cursor = start + insert.length
        break
      }
    }

    const next = body.slice(0, start) + insert + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  const addTag = () => {
    if (!note) return
    const tag = normalizeTag(tagInput)
    if (!tag) return
    const tags = [...(note.tags ?? [])]
    if (!tags.includes(tag)) tags.push(tag)
    setTagInput('')
    setTagInputOpen(false)
    applyMetadata({ tags })
  }

  const removeTag = (tag: string) => {
    if (!note?.tags) return
    applyMetadata({ tags: note.tags.filter(t => t !== tag) })
  }

  const setFolder = (folder: string) => {
    setFolderOpen(false)
    if (!note || note.folder === folder) return
    applyMetadata({ folder })
  }

  const toggleFavorite = () => {
    if (!note) return
    applyMetadata({ isFavorite: !note.isFavorite })
  }

  const togglePinned = () => {
    if (!note) return
    applyMetadata({ isPinned: !note.isPinned })
  }

  const archiveNote = async () => {
    if (!note) return
    setSettingsOpen(false)
    applyMetadata({ isArchived: true })
    const ok = await saveNow()
    if (ok) onBack()
  }

  const handleDelete = async () => {
    if (!note) return
    if (!window.confirm(`Delete "${note.title}"? This cannot be undone.`)) return
    setSettingsOpen(false)
    try {
      await deleteNote(note.id)
      onNoteDeleted?.()
      onBack()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#636a8a] text-[14px]">
        Loading note…
      </div>
    )
  }

  if (error && !note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-red-300 text-[14px]">{error}</p>
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-violet-400 hover:text-violet-300 cursor-pointer"
        >
          ← Back to notes
        </button>
      </div>
    )
  }

  if (!note) return null

  const tags = note.tags ?? []
  const isTextLike = note.type === 'text' && !note.url

  return (
    <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[12px] text-[#636a8a] hover:text-[#eef0fb] cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          {error && <span className="text-[12px] text-red-400">{error}</span>}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {note.badge && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide">
              {note.badge}
            </span>
          )}
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={[
                'inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border',
                i === 0
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                  : 'bg-violet-500/10 text-violet-300 border-violet-500/25',
              ].join(' ')}
            >
              {formatTagLabel(tag)}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-white cursor-pointer"
                aria-label={`Remove ${tag}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {tagInputOpen ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                  if (e.key === 'Escape') setTagInputOpen(false)
                }}
                placeholder="tag-name"
                autoFocus
                className="w-28 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[12px] text-[#eef0fb] outline-none focus:border-violet-500/40"
              />
              <button
                type="button"
                onClick={addTag}
                className="p-1 rounded-md bg-violet-600 text-white cursor-pointer hover:bg-violet-500"
              >
                <Check size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTagInputOpen(true)}
              className="p-1 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              aria-label="Add tag"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent text-[20px] sm:text-[24px] md:text-[26px] font-bold text-[#eef0fb] tracking-tight leading-tight mb-3 sm:mb-4 outline-none border-none placeholder:text-[#4a5070]"
          placeholder="Note title…"
        />

        {note.type === 'text' && !note.url && (
          <div className="flex flex-wrap items-center gap-1 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/[0.06]">
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('bold')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Bold"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('italic')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Italic"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('link')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Link"
            >
              <Link2 size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('list')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Bullet list"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('code')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Inline code"
            >
              <Code size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => applyFormat('image')}
              className="p-2 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.04] cursor-pointer"
              title="Image"
            >
              <Image size={15} />
            </button>
            <button
              type="button"
              onMouseDown={preventBlur}
              onClick={() => setShowPreview(p => !p)}
              className={[
                'ml-2 text-[11px] px-2 py-1 rounded-md cursor-pointer transition-colors',
                showPreview
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-[#636a8a] hover:text-[#eef0fb]',
              ].join(' ')}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <span className="ml-auto text-[11px] text-[#636a8a]">Markdown enabled</span>
          </div>
        )}

        {showPreview && isTextLike ? (
          renderPreview(body)
        ) : (
          <textarea
            ref={bodyRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={14}
            placeholder={
              note.type === 'checklist'
                ? 'One task per line…'
                : note.type === 'code'
                  ? 'Code…'
                  : note.url
                    ? 'https://…'
                    : 'Start typing…'
            }
            className="w-full bg-transparent text-[14px] text-[#c4c9e8] placeholder:text-[#4a5070] outline-none border-none resize-y leading-relaxed font-mono"
            spellCheck={note.type !== 'code'}
          />
        )}
      </div>

      <aside className="w-full xl:w-[280px] shrink-0 border-t xl:border-t-0 xl:border-l border-white/[0.06] bg-[#08090f] overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6 relative max-h-[45vh] xl:max-h-none">
        <div className="flex items-center justify-between gap-2">
          <div
            className={[
              'flex items-center gap-1.5 text-[11px] font-medium tracking-wide',
              saveStatus === 'saving'
                ? 'text-amber-400'
                : saveStatus === 'error'
                  ? 'text-red-400'
                  : saveStatus === 'dirty'
                    ? 'text-[#8b91b8]'
                    : 'text-emerald-400',
            ].join(' ')}
          >
            <Cloud size={13} />
            {saveStatus === 'saving'
              ? 'SAVING…'
              : saveStatus === 'error'
                ? 'SAVE FAILED'
                : saveStatus === 'dirty'
                  ? 'UNSAVED'
                  : 'SAVED'}
          </div>
          <div className="flex items-center gap-0.5 relative">
            <button
              type="button"
              onClick={togglePinned}
              aria-pressed={note.isPinned}
              className={[
                'p-2 rounded-md cursor-pointer transition-colors',
                note.isPinned
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#636a8a] hover:bg-white/[0.04]',
              ].join(' ')}
              aria-label="Pin note"
            >
              <Pin size={15} />
            </button>
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={note.isFavorite}
              className={[
                'p-2 rounded-md cursor-pointer transition-colors',
                note.isFavorite
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-[#636a8a] hover:bg-white/[0.04]',
              ].join(' ')}
              aria-label="Favorite"
            >
              <Star size={15} fill={note.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFolderOpen(o => !o)
                  setSettingsOpen(false)
                }}
                aria-expanded={folderOpen}
                className={[
                  'p-2 rounded-md cursor-pointer transition-colors',
                  folderOpen
                    ? 'text-violet-400 bg-violet-600/10'
                    : 'text-[#636a8a] hover:bg-white/[0.04]',
                ].join(' ')}
                aria-label="Move to folder"
                title={`Folder: ${note.folder ?? 'inbox'}`}
              >
                <FolderOpen size={15} />
              </button>
              {folderOpen && (
                <ul className="absolute right-0 top-full mt-1 z-20 min-w-[120px] py-1 rounded-lg border border-white/[0.08] bg-[#14151f] shadow-xl">
                  {FOLDERS.map(f => (
                    <li key={f}>
                      <button
                        type="button"
                        onClick={() => setFolder(f)}
                        className={[
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] cursor-pointer',
                          note.folder === f
                            ? 'text-violet-300 bg-violet-600/10'
                            : 'text-[#8b91b8] hover:bg-white/[0.04]',
                        ].join(' ')}
                      >
                        {note.folder === f && <Check size={12} />}
                        <span className={note.folder === f ? '' : 'pl-5'}>{f}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(o => !o)
                  setFolderOpen(false)
                }}
                aria-expanded={settingsOpen}
                className={[
                  'p-2 rounded-md cursor-pointer transition-colors',
                  settingsOpen
                    ? 'text-violet-400 bg-violet-600/10'
                    : 'text-[#636a8a] hover:bg-white/[0.04]',
                ].join(' ')}
                aria-label="Note settings"
              >
                <Settings size={15} />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] py-1 rounded-lg border border-white/[0.08] bg-[#14151f] shadow-xl">
                  <button
                    type="button"
                    onClick={() => void archiveNote()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-[#8b91b8] hover:bg-white/[0.04] hover:text-[#eef0fb] cursor-pointer"
                  >
                    <Archive size={14} />
                    Move to archive
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {note.folder && (
          <p className="text-[11px] text-[#636a8a] -mt-4">
            In folder: <span className="text-[#8b91b8]">{note.folder}</span>
          </p>
        )}

        <div>
          <p className="text-[10px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-3">
            Metadata
          </p>
          <dl className="space-y-2.5 text-[12px]">
            <div className="flex justify-between gap-2">
              <dt className="text-[#636a8a]">Created</dt>
              <dd className="text-[#eef0fb]">{note.createdAt ?? note.date}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#636a8a]">Last updated</dt>
              <dd className="text-[#eef0fb]">{note.updatedAt ?? note.lastEdited ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#636a8a]">Word count</dt>
              <dd className="text-[#eef0fb]">{note.wordCount ?? 0} words</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#636a8a]">Read time</dt>
              <dd className="text-[#eef0fb]">~{note.readTimeMinutes ?? 1} min</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-3">
            Linked notes
          </p>
          {linked.length === 0 ? (
            <p className="text-[12px] text-[#636a8a]">
              Add shared tags to connect notes.
            </p>
          ) : (
            <div className="space-y-2">
              {linked.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onOpenNote(l.id)}
                  className="w-full text-left p-3 rounded-lg bg-[#13142a] border border-white/[0.06] hover:border-violet-500/25 transition-colors cursor-pointer"
                >
                  <p className="text-[12px] font-medium text-[#eef0fb] mb-1">{l.title}</p>
                  <p className="text-[11px] text-[#636a8a] line-clamp-2">{l.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {(folderOpen || settingsOpen) && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default"
          aria-label="Close menu"
          onClick={() => {
            setFolderOpen(false)
            setSettingsOpen(false)
          }}
        />
      )}
    </div>
  )
}
