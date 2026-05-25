import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlarmClock,
  Bold,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  FileText,
  Inbox,
  Italic,
  Link2,
  Paperclip,
  Plus,
  Type,
  X,
} from 'lucide-react'

export type NewNoteTab = 'note' | 'task' | 'link'

export interface NewNotePayload {
  tab: NewNoteTab
  title: string
  body: string
  folder: string
  tags: string[]
  date: string
  attachmentNames: string[]
  reminder?: string
}

interface NewNoteModalProps {
  open: boolean
  onClose: () => void
  onCreate?: (payload: NewNotePayload) => void
}

const tabs: { id: NewNoteTab; label: string; icon: typeof FileText }[] = [
  { id: 'note', label: 'Note', icon: FileText },
  { id: 'task', label: 'Task', icon: CheckSquare },
  { id: 'link', label: 'Link', icon: Link2 },
]

const FOLDERS = ['inbox', 'work', 'ideas', 'archive'] as const

const tabConfig: Record<
  NewNoteTab,
  { titlePh: string; bodyPh: string; bodyLabel?: string; submit: string; bodyRows: number }
> = {
  note: {
    titlePh: 'Note title...',
    bodyPh: 'Start typing your thought...',
    submit: 'Create Note',
    bodyRows: 4,
  },
  task: {
    titlePh: 'Task title...',
    bodyPh: 'Add steps (one per line)...',
    bodyLabel: 'Checklist items',
    submit: 'Create Task',
    bodyRows: 3,
  },
  link: {
    titlePh: 'Link title...',
    bodyPh: 'https://',
    bodyLabel: 'URL',
    submit: 'Save Link',
    bodyRows: 1,
  },
}

type TabDraft = { title: string; body: string }

const emptyDrafts = (): Record<NewNoteTab, TabDraft> => ({
  note: { title: '', body: '' },
  task: { title: '', body: '' },
  link: { title: '', body: '' },
})

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  const now = new Date()
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return 'Today'
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeTag(raw: string) {
  const t = raw.trim().replace(/^#+/, '')
  return t ? `#${t.toLowerCase().replace(/\s+/g, '-')}` : ''
}

export function NewNoteModal({ open, onClose, onCreate }: NewNoteModalProps) {
  const [activeTab, setActiveTab] = useState<NewNoteTab>('note')
  const [drafts, setDrafts] = useState(emptyDrafts)
  const [folder, setFolder] = useState<string>('inbox')
  const [tags, setTags] = useState<string[]>([])
  const [date, setDate] = useState(todayIso())
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([])
  const [reminder, setReminder] = useState('')
  const [showFormat, setShowFormat] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [tagInputOpen, setTagInputOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const linkRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const { title, body } = drafts[activeTab]
  const setTitle = (v: string) =>
    setDrafts(d => ({ ...d, [activeTab]: { ...d[activeTab], title: v } }))
  const setBody = (v: string) =>
    setDrafts(d => ({ ...d, [activeTab]: { ...d[activeTab], body: v } }))

  const resetForm = useCallback(() => {
    setActiveTab('note')
    setDrafts(emptyDrafts())
    setFolder('inbox')
    setTags([])
    setDate(todayIso())
    setAttachments([])
    setReminder('')
    setShowFormat(false)
    setShowReminder(false)
    setFolderOpen(false)
    setTagInputOpen(false)
    setTagInput('')
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) return
    resetForm()
    const t = requestAnimationFrame(() => titleRef.current?.focus())
    return () => cancelAnimationFrame(t)
  }, [open, resetForm])

  const switchTab = (tab: NewNoteTab) => {
    setActiveTab(tab)
    setError(null)
    setShowFormat(tab === 'note' ? showFormat : false)
    requestAnimationFrame(() => titleRef.current?.focus())
  }

  const addTag = () => {
    const tag = normalizeTag(tagInput)
    if (!tag) return
    setTags(prev => (prev.includes(tag) ? prev : [...prev, tag]))
    setTagInput('')
    setTagInputOpen(false)
  }

  const applyFormat = (wrapper: [string, string]) => {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = body.slice(start, end)
    const wrapped = `${wrapper[0]}${selected || 'text'}${wrapper[1]}`
    const next = body.slice(0, start) + wrapped + body.slice(end)
    setBody(next)
    setShowFormat(true)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + wrapper[0].length + (selected ? selected.length : 4)
      el.setSelectionRange(cursor, cursor)
    })
  }

  const handleCreate = useCallback(() => {
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle) {
      setError('Add a title to continue.')
      titleRef.current?.focus()
      return
    }

    if (activeTab === 'link') {
      if (!trimmedBody) {
        setError('Enter a URL for this link.')
        linkRef.current?.focus()
        return
      }
      if (!isValidUrl(trimmedBody)) {
        setError('Enter a valid http(s) URL.')
        linkRef.current?.focus()
        return
      }
    }

    if (activeTab === 'task' && !trimmedBody) {
      setError('Add at least one checklist item (one per line).')
      bodyRef.current?.focus()
      return
    }

    setError(null)
    onCreate?.({
      tab: activeTab,
      title: trimmedTitle,
      body: trimmedBody,
      folder,
      tags,
      date,
      attachmentNames: attachments.map(a => a.name),
      reminder: reminder || undefined,
    })
    onClose()
  }, [activeTab, attachments, body, date, folder, onClose, onCreate, reminder, tags, title])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (folderOpen || tagInputOpen) {
          setFolderOpen(false)
          setTagInputOpen(false)
          return
        }
        e.preventDefault()
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleCreate()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, handleCreate, folderOpen, tagInputOpen])

  if (!open) return null

  const cfg = tabConfig[activeTab]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-note-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[520px] rounded-xl border border-white/[0.08] bg-[#0f1018] shadow-2xl shadow-black/50 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  aria-pressed={isActive}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors duration-150 cursor-pointer',
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-[#8b91b8] hover:text-[#eef0fb]',
                  ].join(' ')}
                >
                  <Icon size={13} className="shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8b91b8] hover:text-[#eef0fb] hover:bg-white/[0.05] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-4">
          <input
            ref={titleRef}
            id="new-note-title"
            type="text"
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              setError(null)
            }}
            placeholder={cfg.titlePh}
            className="w-full bg-transparent text-[22px] font-semibold text-[#eef0fb] placeholder:text-[#4a5070] outline-none border-none mb-2"
          />

          {activeTab === 'link' ? (
            <div>
              {cfg.bodyLabel && (
                <label className="text-[11px] text-[#636a8a] uppercase tracking-wide mb-1 block">
                  {cfg.bodyLabel}
                </label>
              )}
              <input
                ref={linkRef}
                type="url"
                value={body}
                onChange={e => {
                  setBody(e.target.value)
                  setError(null)
                }}
                placeholder={cfg.bodyPh}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[14px] text-[#c4c9e8] placeholder:text-[#4a5070] outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
          ) : (
            <>
              {cfg.bodyLabel && (
                <label
                  htmlFor="new-note-body"
                  className="text-[11px] text-[#636a8a] uppercase tracking-wide mb-1 block"
                >
                  {cfg.bodyLabel}
                </label>
              )}
              <textarea
                ref={bodyRef}
                id="new-note-body"
                value={body}
                onChange={e => {
                  setBody(e.target.value)
                  setError(null)
                }}
                placeholder={cfg.bodyPh}
                rows={cfg.bodyRows}
                className="w-full bg-transparent text-[14px] text-[#c4c9e8] placeholder:text-[#4a5070] outline-none border-none resize-none leading-relaxed"
              />
            </>
          )}

          {activeTab === 'note' && showFormat && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={() => applyFormat(['**', '**'])}
                className="p-1.5 rounded-md text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb] cursor-pointer"
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat(['*', '*'])}
                className="p-1.5 rounded-md text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb] cursor-pointer"
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => applyFormat(['`', '`'])}
                className="p-1.5 rounded-md text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb] cursor-pointer"
                title="Code"
              >
                <Code size={14} />
              </button>
            </div>
          )}

          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-3">
              {attachments.map(file => (
                <li
                  key={file.id}
                  className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#8b91b8] max-w-full"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments(prev => prev.filter(a => a.id !== file.id))
                    }
                    className="p-0.5 rounded hover:text-[#eef0fb] cursor-pointer shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showReminder && (
            <div className="mt-3 flex items-center gap-2">
              <AlarmClock size={14} className="text-[#636a8a] shrink-0" />
              <input
                type="datetime-local"
                value={reminder}
                onChange={e => setReminder(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[12px] text-[#c4c9e8] outline-none focus:border-violet-500/40"
              />
              {reminder && (
                <button
                  type="button"
                  onClick={() => setReminder('')}
                  className="text-[11px] text-[#636a8a] hover:text-[#eef0fb] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-600/15 text-[11px] text-violet-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="hover:text-white cursor-pointer"
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-2 text-[12px] text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setFolderOpen(o => !o)
                  setTagInputOpen(false)
                }}
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[12px] transition-colors cursor-pointer shrink-0',
                  folderOpen
                    ? 'bg-violet-600/15 border-violet-500/30 text-violet-300'
                    : 'bg-white/[0.04] border-white/[0.06] text-[#8b91b8] hover:text-[#eef0fb]',
                ].join(' ')}
                aria-expanded={folderOpen}
                aria-haspopup="listbox"
              >
                <Inbox size={12} />
                {folder}
                <ChevronDown size={11} className={folderOpen ? 'rotate-180' : ''} />
              </button>
              {folderOpen && (
                <ul
                  role="listbox"
                  className="absolute left-0 top-full mt-1 z-10 min-w-[120px] py-1 rounded-lg border border-white/[0.08] bg-[#14151f] shadow-xl"
                >
                  {FOLDERS.map(f => (
                    <li key={f}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={folder === f}
                        onClick={() => {
                          setFolder(f)
                          setFolderOpen(false)
                        }}
                        className={[
                          'w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] cursor-pointer',
                          folder === f
                            ? 'text-violet-300 bg-violet-600/10'
                            : 'text-[#8b91b8] hover:bg-white/[0.04] hover:text-[#eef0fb]',
                        ].join(' ')}
                      >
                        {folder === f && <Check size={12} />}
                        <span className={folder === f ? '' : 'pl-5'}>{f}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
                  className="w-24 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[12px] text-[#eef0fb] outline-none focus:border-violet-500/40"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-1 rounded-md bg-violet-600 text-white cursor-pointer hover:bg-violet-500"
                  aria-label="Add tag"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTagInputOpen(true)
                  setFolderOpen(false)
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] text-[#636a8a] hover:text-[#8b91b8] hover:bg-white/[0.03] transition-colors cursor-pointer shrink-0"
              >
                <Plus size={12} />
                Add Tag
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => dateRef.current?.showPicker?.() ?? dateRef.current?.click()}
            className="flex items-center gap-1.5 text-[12px] text-[#8b91b8] hover:text-[#eef0fb] transition-colors cursor-pointer shrink-0"
          >
            <Calendar size={13} />
            {formatDateLabel(date)}
          </button>
          <input
            ref={dateRef}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.06] bg-[#0c0d14]">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files ?? [])
                setAttachments(prev => [
                  ...prev,
                  ...files.map(f => ({
                    id: `${f.name}-${f.size}-${crypto.randomUUID()}`,
                    name: f.name,
                  })),
                ])
                e.target.value = ''
              }}
            />
            <button
              type="button"
              aria-label="Attach files"
              aria-pressed={attachments.length > 0}
              onClick={() => fileRef.current?.click()}
              className={[
                'p-2 rounded-md transition-colors cursor-pointer',
                attachments.length > 0
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#636a8a] hover:text-[#8b91b8] hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              aria-label="Formatting"
              aria-pressed={showFormat}
              disabled={activeTab !== 'note'}
              onClick={() => {
                if (activeTab !== 'note') return
                setShowFormat(f => !f)
                bodyRef.current?.focus()
              }}
              className={[
                'p-2 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed',
                showFormat && activeTab === 'note'
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#636a8a] hover:text-[#8b91b8] hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <Type size={16} />
            </button>
            <button
              type="button"
              aria-label="Set reminder"
              aria-pressed={showReminder}
              onClick={() => setShowReminder(r => !r)}
              className={[
                'p-2 rounded-md transition-colors cursor-pointer',
                showReminder || reminder
                  ? 'text-violet-400 bg-violet-600/10'
                  : 'text-[#636a8a] hover:text-[#8b91b8] hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <AlarmClock size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center px-2.5 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] text-[11px] text-[#636a8a] font-medium">
              ⌘ Enter
            </span>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-[#0d0e1c] text-[13px] font-semibold transition-colors duration-150 cursor-pointer"
            >
              {cfg.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
