import { Pin } from 'lucide-react'
import { pinnedNotes } from '../data'

export function PinnedNodes() {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Pin size={12} className="text-[#3a3d5c]" />
        <span className="text-[10.5px] font-semibold tracking-[0.8px] text-[#3a3d5c] uppercase">
          Pinned Nodes
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {pinnedNotes.map(note => (
          <article
            key={note.id}
            className="bg-[#13142a] border border-white/[0.06] rounded-xl p-5 min-w-[320px] max-w-[380px] shrink-0 flex flex-col gap-3 hover:border-violet-500/25 hover:bg-[#14152f] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold tracking-[0.6px] uppercase px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/[0.15]">
                {note.badge}
              </span>
              <span className="text-[11px] text-[#3a3d5c]">Last edited: {note.lastEdited}</span>
            </div>

            <h3 className="text-[14.5px] font-semibold text-[#e4e6f5] leading-snug tracking-tight">
              {note.title}
            </h3>

            <p className="text-[12.5px] text-[#6b7094] leading-relaxed line-clamp-3 flex-1">
              {note.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] text-[#3a3d5c] bg-white/[0.03] border border-white/[0.05] rounded px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
