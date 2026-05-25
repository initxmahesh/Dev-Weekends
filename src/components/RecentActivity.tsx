import { Clock, MoreHorizontal } from 'lucide-react'
import { recentNotes } from '../data'

export function RecentActivity() {
  const topNotes = recentNotes.slice(0, 3)
  const imageNote = recentNotes[3]
  const checklistNote = recentNotes[4]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={12} className="text-[#636a8a]" />
        <span className="text-[10.5px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase">
          Recent Activity
        </span>
      </div>

      {/* Top row — text / code notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-3.5">
        {topNotes.map(note => (
          <article
            key={note.id}
            className="bg-[#13142a] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2.5 hover:border-white/[0.1] hover:bg-[#14152f] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-[13px] font-semibold text-[#eef0fb] leading-snug">{note.title}</h4>
              <button
                className="p-1 rounded shrink-0 text-[#636a8a] opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-[#8b91b8] hover:bg-white/[0.05] transition-all duration-150 cursor-pointer"
                aria-label="More options"
              >
                <MoreHorizontal size={13} />
              </button>
            </div>

            {note.type === 'text' && (
              <p className="text-[12px] text-[#8b91b8] leading-relaxed flex-1 line-clamp-3">
                {note.description}
              </p>
            )}
            {note.type === 'code' && (
              <pre className="bg-[#070810] border border-white/[0.04] rounded-md p-3 text-[11px] text-[#8b91b8] leading-relaxed flex-1 overflow-x-auto font-mono">
                <code>{note.code}</code>
              </pre>
            )}

            <span className="text-[11px] text-[#636a8a] mt-auto">{note.date}</span>
          </article>
        ))}
      </div>

      {/* Bottom row — visual research + checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr] gap-3.5">
        {/* Visual research card — gradient defined in App.css */}
        <article className="vr-card relative bg-[#070810] border border-white/[0.05] rounded-xl min-h-[160px] overflow-hidden cursor-pointer hover:border-white/[0.08] transition-colors duration-200">
          <div className="absolute bottom-4 left-5 z-10">
            <span className="text-[10.5px] font-semibold tracking-[1px] uppercase text-white/50">
              {imageNote.title}
            </span>
          </div>
        </article>

        {/* Checklist card */}
        <article className="bg-[#13142a] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2.5 hover:border-white/[0.1] hover:bg-[#14152f] transition-all duration-200 cursor-pointer group">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-[#eef0fb] leading-snug">
              {checklistNote.title}
            </h4>
            <button
              className="p-1 rounded shrink-0 text-[#636a8a] opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-[#8b91b8] hover:bg-white/[0.05] transition-all duration-150 cursor-pointer"
              aria-label="More options"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            {checklistNote.items?.map(item => (
              <label
                key={item}
                className="flex items-center gap-2 text-[12.5px] text-[#8b91b8] cursor-pointer hover:text-[#c0c4de] transition-colors duration-150"
              >
                <span className="w-3.5 h-3.5 rounded-[3px] border border-white/[0.15] shrink-0" />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <span className="text-[11px] text-[#636a8a] mt-auto">{checklistNote.date}</span>
        </article>
      </div>
    </section>
  )
}
