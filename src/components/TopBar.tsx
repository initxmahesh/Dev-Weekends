import { Bell, Filter, Menu, Search, SlidersHorizontal } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0 bg-[#0d0e1c]">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden flex items-center justify-center p-1.5 rounded-md text-[#6b7094] hover:bg-white/[0.05] hover:text-[#e4e6f5] transition-colors duration-150 cursor-pointer"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu size={17} />
      </button>

      {/* Search bar */}
      <div className="flex-1 flex items-center gap-2.5 bg-[#0f1020] border border-white/[0.06] rounded-lg px-3.5 py-2 cursor-text hover:border-white/[0.1] transition-colors duration-150">
        <Search size={13} className="text-[#3a3d5c] shrink-0" />
        <span className="flex-1 text-[13px] text-[#3a3d5c] select-none">
          Search your vault...
        </span>
        <kbd className="hidden sm:flex items-center text-[10px] text-[#3a3d5c] bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5 font-sans shrink-0 leading-none">
          ⌘K
        </kbd>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6b7094] hover:bg-white/[0.05] hover:text-[#e4e6f5] transition-colors duration-150 cursor-pointer"
          aria-label="Filter"
        >
          <Filter size={14} />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6b7094] hover:bg-white/[0.05] hover:text-[#e4e6f5] transition-colors duration-150 cursor-pointer"
          aria-label="Sort"
        >
          <SlidersHorizontal size={14} />
        </button>
        <div className="w-px h-4 bg-white/[0.06] mx-1" />
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#6b7094] hover:bg-white/[0.05] hover:text-[#e4e6f5] transition-colors duration-150 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>
      </div>
    </div>
  )
}
