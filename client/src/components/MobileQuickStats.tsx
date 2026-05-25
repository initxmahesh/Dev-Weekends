import { useEffect, useState } from 'react'
import { TrendingUp, Wifi } from 'lucide-react'
import { fetchStats, fetchTrendingTags } from '../api/notes'
import type { TrendingTag } from '../types'

export function MobileQuickStats() {
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
    <div className="xl:hidden shrink-0 border-b border-white/[0.06] bg-[#08090f] py-3 sm:py-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="col-span-2 sm:col-span-1 bg-[#13142a] border border-white/[0.06] rounded-xl p-3 sm:p-4">
          <span className="block text-[10px] sm:text-[11px] text-[#8b91b8] mb-1">Total assets</span>
          <span className="block text-[22px] sm:text-[26px] font-bold text-[#eef0fb] leading-none">
            {totalAssets !== null ? totalAssets.toLocaleString() : '—'}
          </span>
          {addedThisWeek !== null && addedThisWeek > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp size={10} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400">+{addedThisWeek} this week</span>
            </div>
          )}
        </div>

        <div className="bg-[#13142a] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Wifi size={10} className="text-[#8b91b8]" />
            <span className="text-[10px] text-[#8b91b8]">Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={[
                'w-2 h-2 rounded-full shrink-0',
                syncOk ? 'bg-emerald-400' : 'bg-amber-400',
              ].join(' ')}
            />
            <span className="text-[11px] text-[#8b91b8] truncate">
              {syncOk ? 'Synced' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 bg-[#13142a] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[10px] text-[#8b91b8] mb-2">Trending tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 ? (
              <span className="text-[10px] text-[#636a8a]">No tags yet</span>
            ) : (
              tags.slice(0, 5).map(tag => (
                <span
                  key={tag.id}
                  className={[
                    'text-[10px] px-2 py-0.5 rounded-full border',
                    tag.accent
                      ? 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                      : 'bg-white/[0.03] text-[#8b91b8] border-white/[0.06]',
                  ].join(' ')}
                >
                  {tag.label}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
