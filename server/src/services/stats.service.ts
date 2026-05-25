import { getDb } from '../db/connection.js'
import type { StatsDto } from '../types/index.js'

export function getStats(): StatsDto {
  const db = getDb()

  const total = db.prepare('SELECT COUNT(*) AS c FROM notes').get() as { c: number }

  const week = db
    .prepare(
      `SELECT COUNT(*) AS c FROM notes
       WHERE created_at >= datetime('now', '-7 days')`,
    )
    .get() as { c: number }

  const last = db
    .prepare('SELECT MAX(updated_at) AS t FROM notes')
    .get() as { t: string | null }

  return {
    totalAssets: total.c,
    addedThisWeek: week.c,
    syncStatus: 'ok',
    lastSyncAt: last.t ?? new Date().toISOString(),
  }
}
