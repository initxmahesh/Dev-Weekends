import type { LucideIcon } from 'lucide-react'

interface ViewSectionHeaderProps {
  icon: LucideIcon
  title: string
  count?: number
  countLabel?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
}

export function ViewSectionHeader({
  icon: Icon,
  title,
  count,
  countLabel = 'notes',
  badge,
  actions,
}: ViewSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
      <Icon size={12} className="text-[#636a8a] shrink-0" />
      <span className="text-[10.5px] font-semibold tracking-[0.8px] text-[#636a8a] uppercase">
        {title}
      </span>
      {badge}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap justify-end">
        {count !== undefined && (
          <span className="text-[11px] text-[#636a8a]">
            {count} {count === 1 ? countLabel.replace(/s$/, '') : countLabel}
          </span>
        )}
        {actions}
      </div>
    </div>
  )
}

export { viewContainerClass, notesGridClass } from '../layout'
