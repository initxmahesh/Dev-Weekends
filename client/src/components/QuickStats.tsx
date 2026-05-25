import { useEffect, useState } from 'react'
import { TrendingUp, Wifi } from 'lucide-react'
import { fetchStats, fetchTrendingTags } from '../api/notes'
import type { TrendingTag } from '../types'

export function QuickStats() {
  const [totalAssets, setTotalAssets] = useState<number | null>(null)
  const [addedThisWeek, setAddedThisWeek] = useState<number | null>(null)
  const [syncOk, setSyncOk] = useState(true)
  const [tags, setTags] = useState<TrendingTag[]>([])

  useEffect(() => {
    fetchStats()
      .then(s => {
        setTotalAssets(s.totalAssets)
        setAddedThisWeek(s.addedThisWeek)
        setSyncOk(s.syncStatus === 'ok')
      })
      .catch(() => {
        setTotalAssets(null)
        setAddedThisWeek(null)
        setSyncOk(false)
      })

    fetchTrendingTags()
      .then(setTags)
      .catch(() => setTags([]))
  }, [])

  return (
    <aside className="hidden xl:flex w-56 2xl:w-60 shrink-0 flex-col bg-[#08090f] border-l border-white/[0.06] overflow-y-auto p-4 2xl:p-5">
      <p className="text-[10.5px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase mb-4">
        Quick Stats
      </p>

      <div className="bg-[#13142a] border border-white/[0.06] rounded-xl p-4 mb-4">
        <span className="block text-[11px] text-[#8b91b8] mb-2">Total Knowledge Assets</span>
        <span className="block text-[30px] font-bold text-[#eef0fb] tracking-tight leading-none">
          {totalAssets !== null ? totalAssets.toLocaleString() : '—'}
        </span>
        {addedThisWeek !== null && addedThisWeek > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <TrendingUp size={11} className="text-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">
              +{addedThisWeek} this week
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-white/[0.04] mb-4" />

      <div className="mb-4">
        <p className="text-[11px] font-medium text-[#8b91b8] mb-3">Trending Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-[11px] text-[#636a8a]">No tags yet</span>
          ) : (
            tags.map(tag => (
              <span
                key={tag.id}
                className={[
                  'text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors duration-150',
                  tag.accent
                    ? 'bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/15'
                    : 'bg-white/[0.03] text-[#8b91b8] border-white/[0.06] hover:border-white/[0.10] hover:text-[#eef0fb]',
                ].join(' ')}
              >
                {tag.label}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="h-px bg-white/[0.04] mb-4" />

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Wifi size={11} className="text-[#8b91b8]" />
          <p className="text-[11px] font-medium text-[#8b91b8]">Sync Status</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2 shrink-0">
            {syncOk && (
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
            )}
            <span
              className={[
                'relative block w-2 h-2 rounded-full',
                syncOk ? 'bg-emerald-400' : 'bg-amber-400',
              ].join(' ')}
            />
          </span>
          <span className="text-[12px] text-[#8b91b8]">
            {syncOk ? 'All nodes encrypted & synced' : 'API unreachable'}
          </span>
        </div>
      </div>
    </aside>
  )
}
