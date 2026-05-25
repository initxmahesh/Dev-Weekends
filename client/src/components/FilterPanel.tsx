import { Check, X } from 'lucide-react'
import type { NoteFilters, NoteSort, NoteType } from '../types'
import { defaultNoteFilters } from '../types'

const NOTE_TYPES: { value: NoteType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'text', label: 'Text' },
  { value: 'code', label: 'Code' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'image', label: 'Visual' },
]

const FOLDERS = [
  { value: '', label: 'All folders' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'work', label: 'Work' },
  { value: 'ideas', label: 'Ideas' },
  { value: 'archive', label: 'Archive' },
]

const SORT_OPTIONS: { value: NoteSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
]

interface FilterPanelProps {
  filters: NoteFilters
  onChange: (filters: NoteFilters) => void
  onClose: () => void
}

export function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  const hasActive =
    filters.type !== '' ||
    filters.folder !== '' ||
    filters.sort !== defaultNoteFilters.sort

  const patch = (partial: Partial<NoteFilters>) => onChange({ ...filters, ...partial })

  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-[min(100vw-2rem,320px)] rounded-xl border border-white/[0.08] bg-[#14151f] shadow-2xl shadow-black/40 p-4"
      role="dialog"
      aria-label="Filter notes"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-semibold text-[#eef0fb] uppercase tracking-wide">
          Filters
        </p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[#636a8a] hover:text-[#eef0fb] hover:bg-white/[0.05] cursor-pointer"
          aria-label="Close filters"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-[#636a8a] mb-2">Note type</label>
          <div className="flex flex-wrap gap-1.5">
            {NOTE_TYPES.map(opt => (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => patch({ type: opt.value })}
                className={[
                  'px-2.5 py-1 rounded-md text-[11px] border transition-colors cursor-pointer',
                  filters.type === opt.value
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
                    : 'bg-white/[0.03] text-[#8b91b8] border-white/[0.06] hover:border-white/[0.12]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#636a8a] mb-2">Folder</label>
          <select
            value={filters.folder}
            onChange={e => patch({ folder: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[#0d0e1c] border border-white/[0.08] text-[12px] text-[#eef0fb] outline-none focus:border-violet-500/40 cursor-pointer"
          >
            {FOLDERS.map(f => (
              <option key={f.value || 'all'} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#636a8a] mb-2">Sort by</label>
          <select
            value={filters.sort}
            onChange={e => patch({ sort: e.target.value as NoteSort })}
            className="w-full px-3 py-2 rounded-lg bg-[#0d0e1c] border border-white/[0.08] text-[12px] text-[#eef0fb] outline-none focus:border-violet-500/40 cursor-pointer"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => onChange({ ...filters, ...defaultNoteFilters, query: filters.query })}
          disabled={!hasActive}
          className="text-[12px] text-[#8b91b8] hover:text-[#eef0fb] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Reset filters
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium cursor-pointer"
        >
          <Check size={13} />
          Apply
        </button>
      </div>
    </div>
  )
}

export function countActiveFilters(filters: NoteFilters): number {
  let n = 0
  if (filters.type) n++
  if (filters.folder) n++
  if (filters.sort !== defaultNoteFilters.sort) n++
  return n
}
