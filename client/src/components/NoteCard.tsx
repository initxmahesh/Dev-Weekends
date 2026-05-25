import { MoreHorizontal, Star } from 'lucide-react'
import type { RecentNote } from '../types'

function visualVariant(id: number): string {
  const variants = ['visual-card--violet', 'visual-card--cyan', 'visual-card--indigo', 'visual-card--amber']
  return variants[id % variants.length]!
}

interface NoteCardProps {
  note: RecentNote
  onSelect: () => void
  footer?: React.ReactNode
  showMenu?: boolean
}

export function NoteCard({ note, onSelect, footer, showMenu = true }: NoteCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      className="bg-[#13142a] border border-white/[0.06] rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 hover:border-violet-500/25 hover:bg-[#14152f] transition-all duration-200 cursor-pointer group min-h-[168px] h-full"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#eef0fb] leading-snug line-clamp-2">
          {note.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          {note.isFavorite && (
            <Star size={12} className="text-amber-400" fill="currentColor" />
          )}
          {showMenu && (
            <button
              type="button"
              onClick={e => e.stopPropagation()}
              className="p-1 rounded text-[#636a8a] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white/[0.05] cursor-pointer"
              aria-label="More options"
            >
              <MoreHorizontal size={13} />
            </button>
          )}
        </div>
      </div>

      {note.type === 'text' && (
        <p className="text-[12px] sm:text-[13px] text-[#8b91b8] leading-relaxed flex-1 line-clamp-3">
          {note.url ? (
            <span className="text-violet-400 break-all">{note.url}</span>
          ) : (
            note.description
          )}
        </p>
      )}
      {note.type === 'code' && (
        <pre className="bg-[#070810] border border-white/[0.04] rounded-md p-3 text-[11px] text-[#8b91b8] leading-relaxed flex-1 overflow-x-auto font-mono line-clamp-4">
          <code>{note.code}</code>
        </pre>
      )}
      {note.type === 'checklist' && (
        <ul className="flex flex-col gap-1.5 flex-1">
          {note.items?.slice(0, 3).map(item => (
            <li key={item} className="flex items-center gap-2 text-[12px] text-[#8b91b8]">
              <span className="w-3 h-3 rounded-[3px] border border-white/15 shrink-0" />
              <span className="truncate">{item}</span>
            </li>
          ))}
        </ul>
      )}
      {note.type === 'image' && (
        <div
          className={[
            'relative flex-1 min-h-[88px] sm:min-h-[96px] rounded-lg overflow-hidden border border-white/[0.06]',
            'visual-card',
            visualVariant(note.id),
          ].join(' ')}
        >
          <div className="absolute inset-0 visual-card__pattern" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-end p-3 z-[1]">
            <span className="text-[10px] font-semibold tracking-[0.6px] uppercase text-white/70">
              Visual
            </span>
            <span className="text-[11px] text-white/45 line-clamp-1 mt-0.5">{note.title}</span>
          </div>
        </div>
      )}

      {footer ?? (
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <span className="text-[11px] text-[#636a8a]">{note.archivedAt ?? note.date}</span>
          {note.folder && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-white/[0.06] text-[#636a8a] capitalize">
              {note.folder}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
