import { TrendingUp, Wifi } from 'lucide-react'
import { trendingTags } from '../data'

export function QuickStats() {
  return (
    <aside className="hidden xl:flex w-60 shrink-0 flex-col bg-[#08090f] border-l border-white/[0.06] overflow-y-auto p-5">
      <p className="text-[10.5px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-4">
        Quick Stats
      </p>

      {/* Total assets */}
      <div className="bg-[#13142a] border border-white/[0.06] rounded-xl p-4 mb-4">
        <span className="block text-[11px] text-[#8b91b8] mb-2">Total Knowledge Assets</span>
        <span className="block text-[30px] font-bold text-[#eef0fb] tracking-tight leading-none">
          1,284
        </span>
        <div className="flex items-center gap-1.5 mt-2.5">
          <TrendingUp size={11} className="text-emerald-400" />
          <span className="text-[11px] text-emerald-400 font-medium">+24 this week</span>
        </div>
      </div>

      <div className="h-px bg-white/[0.04] mb-4" />

      {/* Trending tags */}
      <div className="mb-4">
        <p className="text-[11px] font-medium text-[#8b91b8] mb-3">Trending Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map(tag => (
            <span
              key={tag.id}
              className={[
                'text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors duration-150',
                tag.accent
                  ? 'bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/15'
                  : 'bg-white/[0.03] text-[#8b91b8] border-white/[0.06] hover:border-white/[0.1] hover:text-[#eef0fb]',
              ].join(' ')}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.04] mb-4" />

      {/* Sync status */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Wifi size={11} className="text-[#8b91b8]" />
          <p className="text-[11px] font-medium text-[#8b91b8]">Sync Status</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
            <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[12px] text-[#8b91b8]">All nodes encrypted &amp; synced</span>
        </div>
      </div>
    </aside>
  )
}
