import type { z } from 'zod'
import { getDb, withTransaction } from '../db/connection.js'
import type { createNoteSchema, listNotesQuerySchema, updateNoteSchema } from '../schemas/note.schema.js'
import type { LinkedNoteDto, NoteDto, NoteRow, PinnedNoteDto } from '../types/index.js'
import { NotFoundError } from '../utils/errors.js'
import {
  formatArchiveLabel,
  formatDisplayDate,
  formatRelativeEdited,
  isoDateOnly,
} from '../utils/dates.js'

type CreateInput = z.infer<typeof createNoteSchema>
type UpdateInput = z.infer<typeof updateNoteSchema>
type ListQuery = z.infer<typeof listNotesQuerySchema>

function asNoteRow(row: unknown): NoteRow {
  return row as NoteRow
}

function parseAttachments(raw: string | null): string[] | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : undefined
  } catch {
    return undefined
  }
}

function normalizeTag(tag: string): string {
  const t = tag.trim().replace(/^#+/, '')
  return t.startsWith('#') ? t : `#${t}`
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function computeReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function bodyText(row: NoteRow, items: string[]): string {
  if (row.type === 'checklist') return items.join(' ')
  return [row.description, row.code, row.url].filter(Boolean).join(' ')
}

function rowToDto(row: NoteRow, items: string[], tags: string[]): NoteDto {
  const words = countWords(`${row.title} ${bodyText(row, items)}`)
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    code: row.code ?? undefined,
    url: row.url ?? undefined,
    items: items.length ? items : undefined,
    date: formatDisplayDate(row.note_date),
    folder: row.folder,
    tags: tags.length ? tags : undefined,
    badge: row.badge ?? undefined,
    lastEdited: formatRelativeEdited(row.updated_at),
    createdAt: formatDisplayDate(row.created_at.slice(0, 10)),
    updatedAt: formatRelativeEdited(row.updated_at),
    wordCount: words,
    readTimeMinutes: computeReadTime(words),
    isPinned: row.is_pinned === 1,
    isFavorite: row.is_favorite === 1,
    isArchived: row.is_archived === 1,
    archivedAt: row.is_archived === 1 ? formatArchiveLabel(row.updated_at) : undefined,
    reminderAt: row.reminder_at ?? undefined,
    attachmentNames: parseAttachments(row.attachment_names),
  }
}

function loadNoteRelations(noteId: number) {
  const db = getDb()
  const items = db
    .prepare(
      'SELECT content FROM note_items WHERE note_id = ? ORDER BY sort_order ASC',
    )
    .all(noteId) as { content: string }[]
  const tags = db
    .prepare('SELECT tag FROM note_tags WHERE note_id = ? ORDER BY tag ASC')
    .all(noteId) as { tag: string }[]
  return {
    items: items.map(i => i.content),
    tags: tags.map(t => t.tag),
  }
}

function tabToNoteFields(input: CreateInput) {
  if (input.tab === 'link') {
    const url = input.url ?? input.body
    return {
      type: 'text' as const,
      description: input.description ?? null,
      code: null,
      url,
      items: [] as string[],
    }
  }
  if (input.tab === 'task') {
    const items =
      input.items ??
      input.body
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
    return {
      type: 'checklist' as const,
      description: null,
      code: null,
      url: null,
      items,
    }
  }
  return {
    type: (input.type ?? 'text') as NoteRow['type'],
    description: input.description ?? input.body ?? null,
    code: input.code ?? null,
    url: input.url ?? null,
    items: input.items ?? [],
  }
}

export function listNotes(query: ListQuery): { notes: NoteDto[]; total: number } {
  const db = getDb()
  const conditions: string[] = []
  const params: Record<string, string | number> = {}

  switch (query.nav) {
    case 'favorites':
      conditions.push('n.is_favorite = 1', 'n.is_archived = 0')
      break
    case 'pinned':
      conditions.push('n.is_pinned = 1', 'n.is_archived = 0')
      break
    case 'archive':
      conditions.push('n.is_archived = 1')
      break
    case 'tags':
      conditions.push('n.is_archived = 0')
      if (query.tag) {
        conditions.push(
          'EXISTS (SELECT 1 FROM note_tags t WHERE t.note_id = n.id AND t.tag = @tag)',
        )
        params.tag = normalizeTag(query.tag)
      }
      break
    default:
      conditions.push('n.is_archived = 0')
  }

  if (query.folder) {
    conditions.push('n.folder = @folder')
    params.folder = query.folder
  }

  if (query.type) {
    conditions.push('n.type = @type')
    params.type = query.type
  }

  if (query.q) {
    const pattern = `%${query.q}%`
    params.q = pattern
    conditions.push(`(
      n.title LIKE @q COLLATE NOCASE OR
      COALESCE(n.description, '') LIKE @q COLLATE NOCASE OR
      COALESCE(n.code, '') LIKE @q COLLATE NOCASE OR
      COALESCE(n.url, '') LIKE @q COLLATE NOCASE OR
      EXISTS (SELECT 1 FROM note_tags t WHERE t.note_id = n.id AND t.tag LIKE @q COLLATE NOCASE) OR
      EXISTS (SELECT 1 FROM note_items i WHERE i.note_id = n.id AND i.content LIKE @q COLLATE NOCASE)
    )`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const orderBy = (() => {
    switch (query.sort) {
      case 'oldest':
        return 'n.note_date ASC, n.id ASC'
      case 'title-asc':
        return 'n.title ASC COLLATE NOCASE, n.id ASC'
      case 'title-desc':
        return 'n.title DESC COLLATE NOCASE, n.id DESC'
      default:
        return 'n.note_date DESC, n.id DESC'
    }
  })()

  const total = db
    .prepare(`SELECT COUNT(*) AS c FROM notes n ${where}`)
    .get(params) as { c: number }

  const rows = db
    .prepare(
      `SELECT n.* FROM notes n ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit: query.limit, offset: query.offset })

  const notes = (rows as unknown as NoteRow[]).map(row => {
    const { items, tags } = loadNoteRelations(row.id)
    return rowToDto(row, items, tags)
  })

  return { notes, total: total.c }
}

export function listPinnedNotes(): PinnedNoteDto[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT * FROM notes WHERE is_pinned = 1 AND is_archived = 0 ORDER BY updated_at DESC`,
    )
    .all()

  return (rows as unknown as NoteRow[]).map(row => {
    const { tags } = loadNoteRelations(row.id)
    return {
      id: row.id,
      badge: row.badge ?? 'NOTE',
      lastEdited: formatRelativeEdited(row.updated_at),
      title: row.title,
      description: row.description ?? '',
      tags,
    }
  })
}

export function getNoteById(id: number): NoteDto {
  const db = getDb()
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  const note = row ? asNoteRow(row) : undefined
  if (!note) throw new NotFoundError('Note')
  const { items, tags } = loadNoteRelations(id)
  return rowToDto(note, items, tags)
}

export function createNote(input: CreateInput): NoteDto {
  const db = getDb()
  const mapped = tabToNoteFields(input)
  const noteDate = isoDateOnly(input.date)
  const tags = input.tags.map(normalizeTag)

  const id = withTransaction(() => {
    const result = db
      .prepare(
        `INSERT INTO notes (
          type, title, description, code, url, folder, badge,
          is_pinned, is_favorite, is_archived, note_date, reminder_at, attachment_names
        ) VALUES (
          @type, @title, @description, @code, @url, @folder, @badge,
          @is_pinned, @is_favorite, 0, @note_date, @reminder_at, @attachment_names
        )`,
      )
      .run({
        type: mapped.type,
        title: input.title,
        description: mapped.description,
        code: mapped.code,
        url: mapped.url,
        folder: input.folder,
        badge: input.badge ?? null,
        is_pinned: input.isPinned ? 1 : 0,
        is_favorite: input.isFavorite ? 1 : 0,
        note_date: noteDate,
        reminder_at: input.reminder ?? null,
        attachment_names:
          input.attachmentNames.length > 0
            ? JSON.stringify(input.attachmentNames)
            : null,
      })

    const noteId = Number(result.lastInsertRowid)

    mapped.items.forEach((content, sort_order) => {
      db.prepare(
        'INSERT INTO note_items (note_id, content, sort_order) VALUES (?, ?, ?)',
      ).run(noteId, content, sort_order)
    })

    for (const tag of tags) {
      db.prepare('INSERT INTO note_tags (note_id, tag) VALUES (?, ?)').run(noteId, tag)
    }

    return noteId
  })

  return getNoteById(id)
}

export function updateNote(id: number, input: UpdateInput): NoteDto {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM notes WHERE id = ?').get(id)
  if (!existing) throw new NotFoundError('Note')

  withTransaction(() => {
    const sets: string[] = []
    const params: Record<string, string | number | null> = { id }

    if (input.title !== undefined) {
      sets.push('title = @title')
      params.title = input.title
    }
    if (input.description !== undefined) {
      sets.push('description = @description')
      params.description = input.description
    }
    if (input.code !== undefined) {
      sets.push('code = @code')
      params.code = input.code
    }
    if (input.url !== undefined) {
      sets.push('url = @url')
      params.url = input.url
    }
    if (input.folder !== undefined) {
      sets.push('folder = @folder')
      params.folder = input.folder
    }
    if (input.badge !== undefined) {
      sets.push('badge = @badge')
      params.badge = input.badge
    }
    if (input.noteDate !== undefined) {
      sets.push('note_date = @note_date')
      params.note_date = input.noteDate
    }
    if (input.isPinned !== undefined) {
      sets.push('is_pinned = @is_pinned')
      params.is_pinned = input.isPinned ? 1 : 0
    }
    if (input.isFavorite !== undefined) {
      sets.push('is_favorite = @is_favorite')
      params.is_favorite = input.isFavorite ? 1 : 0
    }
    if (input.isArchived !== undefined) {
      sets.push('is_archived = @is_archived')
      params.is_archived = input.isArchived ? 1 : 0
    }
    if (input.reminder !== undefined) {
      sets.push('reminder_at = @reminder_at')
      params.reminder_at = input.reminder
    }
    if (input.attachmentNames !== undefined) {
      sets.push('attachment_names = @attachment_names')
      params.attachment_names =
        input.attachmentNames.length > 0
          ? JSON.stringify(input.attachmentNames)
          : null
    }

    if (sets.length > 0) {
      sets.push("updated_at = datetime('now')")
      db.prepare(`UPDATE notes SET ${sets.join(', ')} WHERE id = @id`).run(params)
    }

    if (input.items !== undefined) {
      db.prepare('DELETE FROM note_items WHERE note_id = ?').run(id)
      input.items.forEach((content, sort_order) => {
        db.prepare(
          'INSERT INTO note_items (note_id, content, sort_order) VALUES (?, ?, ?)',
        ).run(id, content, sort_order)
      })
    }

    if (input.tags !== undefined) {
      db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id)
      input.tags.map(normalizeTag).forEach(tag => {
        db.prepare('INSERT INTO note_tags (note_id, tag) VALUES (?, ?)').run(id, tag)
      })
    }
  })

  return getNoteById(id)
}

export function deleteNote(id: number): void {
  const db = getDb()
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  if (result.changes === 0) throw new NotFoundError('Note')
}

export function getRelatedNotes(id: number, limit = 4): LinkedNoteDto[] {
  const db = getDb()
  const exists = db.prepare('SELECT id FROM notes WHERE id = ?').get(id)
  if (!exists) throw new NotFoundError('Note')

  const rows = db
    .prepare(
      `SELECT DISTINCT n.id, n.title, n.description
       FROM notes n
       INNER JOIN note_tags t1 ON t1.note_id = n.id
       WHERE t1.tag IN (SELECT tag FROM note_tags WHERE note_id = ?)
         AND n.id != ?
         AND n.is_archived = 0
       ORDER BY n.updated_at DESC
       LIMIT ?`,
    )
    .all(id, id, limit) as { id: number; title: string; description: string | null }[]

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    description: (r.description ?? '').slice(0, 120),
  }))
}
