import { Clock, Search } from 'lucide-react'
import { NoteCard } from './NoteCard'
import { notesGridClass, ViewSectionHeader, viewContainerClass } from './ViewSectionHeader'
import type { RecentNote } from '../types'
import { navTitles } from '../types'

interface NotesFeedProps {
  notes: RecentNote[]
  activeNav: string
  loading?: boolean
  onSelectNote: (id: number) => void
  searchActive?: boolean
}

export function NotesFeed({
  notes,
  activeNav,
  loading,
  onSelectNote,
  searchActive = false,
}: NotesFeedProps) {
  const title = navTitles[activeNav] ?? 'Notes'

  return (
    <section className={viewContainerClass}>
      <ViewSectionHeader
        icon={Clock}
        title={title}
        count={loading ? undefined : notes.length}
        badge={
          searchActive ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600/15 text-violet-300 border border-violet-500/20">
              Filtered
            </span>
          ) : undefined
        }
      />

      {loading && (
        <p className="text-[13px] text-[#636a8a] py-8">Loading notes…</p>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-[#13142a] border border-white/[0.06] flex items-center justify-center mb-4">
            <Search size={20} className="text-[#636a8a]" />
          </div>
          <p className="text-[14px] font-medium text-[#eef0fb]">
            {searchActive ? 'No matching notes' : 'Nothing here yet'}
          </p>
          <p className="text-[13px] text-[#636a8a] mt-1 max-w-sm">
            {searchActive
              ? 'Try a different search term or adjust your filters.'
              : activeNav === 'favorites'
                ? 'Open a note and star it to add it here.'
                : activeNav === 'pinned'
                  ? 'Pin notes from the detail view to see them here.'
                  : 'Create a new note to get started.'}
          </p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className={notesGridClass}>
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onSelect={() => onSelectNote(note.id)} />
          ))}
        </div>
      )}
    </section>
  )
}
