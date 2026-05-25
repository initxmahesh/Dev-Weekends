import { useEffect, useRef, useState } from 'react'
import { Bell, Filter, Menu, Search, X } from 'lucide-react'
import type { NoteFilters } from '../types'
import { countActiveFilters, FilterPanel } from './FilterPanel'

interface TopBarProps {
  onMenuClick: () => void
  search: string
  onSearchChange: (value: string) => void
  filters: NoteFilters
  onFiltersChange: (filters: NoteFilters) => void
}

export function TopBar({
  onMenuClick,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: TopBarProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const activeFilterCount = countActiveFilters(filters)

  useEffect(() => {
    if (!filterOpen) return
    const close = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [filterOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('vault-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-2 sm:gap-3 py-2.5 sm:py-3 border-b border-white/[0.06] shrink-0 bg-[#0d0e1c]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          className="lg:hidden flex items-center justify-center p-2 rounded-lg text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb] transition-colors duration-150 cursor-pointer shrink-0"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 flex items-center gap-2 sm:gap-2.5 min-w-0 bg-[#0f1020] border border-white/[0.06] rounded-lg px-3 sm:px-3.5 py-2 focus-within:border-violet-500/30 transition-colors duration-150">
          <Search size={14} className="text-[#636a8a] shrink-0" />
          <input
            id="vault-search"
            type="search"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search your vault…"
            className="flex-1 min-w-0 bg-transparent text-[13px] sm:text-[14px] text-[#eef0fb] placeholder:text-[#636a8a] outline-none border-none"
            aria-label="Search notes"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-1 rounded text-[#636a8a] hover:text-[#eef0fb] cursor-pointer shrink-0"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden md:flex items-center text-[10px] text-[#636a8a] bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 font-sans shrink-0 leading-none">
            ⌘K
          </kbd>
        </div>

        <div className="relative flex items-center gap-0.5 sm:gap-1 shrink-0 [&>button]:relative">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
              aria-label="Filter notes"
              className={[
                'relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-colors duration-150 cursor-pointer',
                filterOpen || activeFilterCount > 0
                  ? 'bg-violet-600/15 text-violet-300'
                  : 'text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb]',
              ].join(' ')}
            >
              <Filter size={15} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {filterOpen && (
              <FilterPanel
                filters={filters}
                onChange={onFiltersChange}
                onClose={() => setFilterOpen(false)}
              />
            )}
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/[0.06] mx-0.5" />
          <button
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-[#8b91b8] hover:bg-white/[0.05] hover:text-[#eef0fb] transition-colors duration-150 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-1.5 h-1.5 rounded-full bg-violet-500 pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  )
}
