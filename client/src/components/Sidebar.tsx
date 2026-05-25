import { Brain, Plus, Settings, X } from 'lucide-react'
import { navItems } from '../data'

interface SidebarProps {
  activeNav: string
  setActiveNav: (id: string) => void
  open: boolean
  onClose: () => void
  onNewNote: () => void
}

export function Sidebar({ activeNav, setActiveNav, open, onClose, onNewNote }: SidebarProps) {
  return (
    <aside
      className={[
        'fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto',
        'w-[min(85vw,260px)] sm:w-[220px] shrink-0 flex flex-col h-full',
        'bg-[#08090f] border-r border-white/[0.06]',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 sm:px-5 pt-5 sm:pt-6 pb-3 sm:pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Brain size={13} className="text-violet-400" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-[#eef0fb] leading-none tracking-tight">
              Second Brain
            </p>
            <p className="text-[10px] text-[#636a8a] mt-1 tracking-wide">Knowledge Vault</p>
          </div>
        </div>
        <button
          className="lg:hidden p-1.5 rounded-md text-[#8b91b8] hover:text-[#eef0fb] hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={15} />
        </button>
      </div>

      {/* New Note */}
      <div className="px-4 mb-5 shrink-0">
        <button
          type="button"
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors duration-150 cursor-pointer"
        >
          <Plus size={14} />
          New Note
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          return (
            <button
              key={item.id}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left',
                'transition-colors duration-150 cursor-pointer',
                isActive
                  ? 'bg-violet-600/[0.14] text-violet-300'
                  : 'text-[#8b91b8] hover:bg-white/[0.04] hover:text-[#eef0fb]',
              ].join(' ')}
              onClick={() => { setActiveNav(item.id); onClose() }}
            >
              <Icon size={14} className="shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3.5 border-t border-white/[0.04] flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-full bg-violet-600/20 text-violet-400 text-[11px] font-bold flex items-center justify-center shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#eef0fb] truncate leading-none">Alex Rivera</p>
          <p className="text-[10px] text-[#636a8a] tracking-wider mt-1">PRO ACCOUNT</p>
        </div>
        <button
          className="p-1.5 rounded-md text-[#636a8a] hover:text-[#8b91b8] hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={13} />
        </button>
      </div>
    </aside>
  )
}
