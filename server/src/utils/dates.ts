export function formatDisplayDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelativeEdited(updatedAt: string): string {
  const then = new Date(updatedAt.includes('T') ? updatedAt : `${updatedAt}Z`)
  const now = Date.now()
  const diffMs = now - then.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDisplayDate(updatedAt.slice(0, 10))
}

export function formatArchiveLabel(updatedAt: string): string {
  const d = new Date(updatedAt.includes('T') ? updatedAt : `${updatedAt}Z`)
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `Archived ${label}`
}

export function isoDateOnly(input?: string): string {
  if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input
  return new Date().toISOString().slice(0, 10)
}
