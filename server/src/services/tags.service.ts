import { getDb } from '../db/connection.js'
import type { TaxonomyTagDto, TrendingTagDto } from '../types/index.js'

const ACCENT_LABELS = new Set([
  'artificial intelligence',
  'productivity',
  'machine learning',
  'research',
])

export function listTaxonomyTags(): TaxonomyTagDto[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT tag, COUNT(*) AS note_count
       FROM note_tags
       GROUP BY tag
       ORDER BY note_count DESC, tag ASC`,
    )
    .all() as { tag: string; note_count: number }[]

  const sampleStmt = db.prepare(
    `SELECT n.title
     FROM notes n
     INNER JOIN note_tags nt ON nt.note_id = n.id
     WHERE nt.tag = ?
     ORDER BY n.updated_at DESC
     LIMIT 3`,
  )

  return rows.map((row, index) => ({
    id: index + 1,
    tag: row.tag,
    noteCount: row.note_count,
    samples: (sampleStmt.all(row.tag) as { title: string }[]).map(r => r.title),
  }))
}

export function getTrendingTags(limit = 8): TrendingTagDto[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT tag, COUNT(*) AS count
       FROM note_tags
       GROUP BY tag
       ORDER BY count DESC, tag ASC
       LIMIT ?`,
    )
    .all(limit) as { tag: string; count: number }[]

  return rows.map((row, index) => {
    const label = row.tag.replace(/^#/, '').replace(/-/g, ' ')
    const formatted =
      label.charAt(0).toUpperCase() + label.slice(1)
    return {
      id: index + 1,
      label: formatted,
      accent: ACCENT_LABELS.has(label.toLowerCase()),
      count: row.count,
    }
  })
}
