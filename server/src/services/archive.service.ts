import { getDb, withTransaction } from '../db/connection.js'
import type { ArchiveStatsDto } from '../types/index.js'

const STORAGE_LIMIT_MB = 500

export function getArchiveStats(): ArchiveStatsDto {
  const db = getDb()

  const { count } = db
    .prepare('SELECT COUNT(*) AS count FROM notes WHERE is_archived = 1')
    .get() as { count: number }

  const { bytes } = db
    .prepare(
      `SELECT COALESCE(SUM(
         LENGTH(COALESCE(title, '')) +
         LENGTH(COALESCE(description, '')) +
         LENGTH(COALESCE(code, '')) +
         LENGTH(COALESCE(url, '')) +
         LENGTH(COALESCE(attachment_names, ''))
       ), 0) AS bytes
       FROM notes WHERE is_archived = 1`,
    )
    .get() as { bytes: number }

  const storageUsedMb = Math.max(0.1, Math.round((bytes / (1024 * 1024)) * 10) / 10)

  return {
    storageUsedMb,
    storageLimitMb: STORAGE_LIMIT_MB,
    archivedTotal: count,
    autoDeleteEnabled: false,
  }
}

export function emptyArchive(): number {
  const db = getDb()
  const ids = db
    .prepare('SELECT id FROM notes WHERE is_archived = 1')
    .all() as { id: number }[]

  if (ids.length === 0) return 0

  return withTransaction(() => {
    for (const { id } of ids) {
      db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id)
      db.prepare('DELETE FROM note_items WHERE note_id = ?').run(id)
    }
    const result = db.prepare('DELETE FROM notes WHERE is_archived = 1').run()
    return Number(result.changes)
  })
}
