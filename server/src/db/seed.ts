import { initDb, getDb, closeDb, withTransaction } from './connection.js'

const SEED_MARKER = '__seed_v2__'

export function seedDatabase(force = false, keepOpen = false): void {
  initDb()
  const db = getDb()

  const count = db.prepare('SELECT COUNT(*) AS c FROM notes').get() as { c: number }
  if (count.c > 0 && !force) {
    console.log('Database already has notes; skipping seed.')
    if (!keepOpen) closeDb()
    return
  }

  if (force) {
    db.exec('DELETE FROM note_tags; DELETE FROM note_items; DELETE FROM notes;')
  }

  const insertNote = db.prepare(`
    INSERT INTO notes (
      type, title, description, code, url, folder, badge,
      is_pinned, is_favorite, is_archived, note_date, attachment_names
    ) VALUES (
      @type, @title, @description, @code, @url, @folder, @badge,
      @is_pinned, @is_favorite, @is_archived, @note_date, @attachment_names
    )
  `)

  const insertItem = db.prepare(`
    INSERT INTO note_items (note_id, content, sort_order) VALUES (@note_id, @content, @sort_order)
  `)

  const insertTag = db.prepare(`
    INSERT INTO note_tags (note_id, tag) VALUES (@note_id, @tag)
  `)

  withTransaction(() => {
    const pinned1 = insertNote.run({
      type: 'text',
      title: 'Systemic Thinking in UI/UX Architecture',
      description: `Systemic thinking in UI/UX architecture requires understanding how individual components interact within a larger ecosystem.

### The Atomic Principle
Every interface element should serve a clear purpose within the hierarchy of information.

### Key Insights
- **Scalability**: Design tokens enable consistent growth across products.
- **Retrieval**: Information architecture must optimize for how users actually search.
- **Friction**: Every interaction point is an opportunity to reduce cognitive load.

> "Simplicity is the ultimate sophistication." — Da Vinci

*Related: Design Systems, Cognitive Load, Zettelkasten*`,
      code: null,
      url: null,
      folder: 'work',
      badge: 'SYSTEM',
      is_pinned: 1,
      is_favorite: 1,
      is_archived: 0,
      note_date: '2024-05-20',
      attachment_names: null,
    })

    const pinned2 = insertNote.run({
      type: 'text',
      title: 'Machine Learning Optimization Techniques',
      description:
        'Overview of gradient descent variants, learning rate schedules, and regularization methods for production model training pipelines.',
      code: null,
      url: null,
      folder: 'ideas',
      badge: 'REFERENCE',
      is_pinned: 1,
      is_favorite: 0,
      is_archived: 0,
      note_date: '2024-05-19',
      attachment_names: null,
    })

    const notes = [
      {
        type: 'text',
        title: 'Obsidian Plugin Ideas',
        description:
          'Brainstorming a visual graph filter that highlights notes based on semantic similarity rather than just explicit tags.',
        note_date: '2024-05-24',
      },
      {
        type: 'text',
        title: 'Stoic Reflections on Resilience',
        description:
          'Meditations on Marcus Aurelius: "The impediment to action advances action. What stands in the way becomes the way."',
        note_date: '2024-05-23',
      },
      {
        type: 'code',
        title: 'Rust Memory Safety Snippets',
        code: 'fn main() {\n  let mut s = String::new();\n  s.push_str("hello");\n}',
        note_date: '2024-05-22',
      },
      {
        type: 'image',
        title: 'VISUAL RESEARCH',
        note_date: '2024-05-21',
      },
    ] as const

    const insertedIds: number[] = []
    for (const n of notes) {
      const row = insertNote.run({
        type: n.type,
        title: n.title,
        description: 'description' in n ? n.description : null,
        code: 'code' in n ? n.code : null,
        url: null,
        folder: 'inbox',
        badge: null,
        is_pinned: 0,
        is_favorite: 0,
        is_archived: 0,
        note_date: n.note_date,
        attachment_names: null,
      })
      insertedIds.push(Number(row.lastInsertRowid))
    }

    const tagAssignments: [number, string[]][] = [
      [Number(pinned1.lastInsertRowid), ['#deeplearning', '#research', '#neuroscience']],
      [Number(pinned2.lastInsertRowid), ['#ml', '#optimization', '#productivity']],
      [insertedIds[0]!, ['#productivity', '#learning']],
      [insertedIds[1]!, ['#philosophy', '#deep-work']],
      [insertedIds[2]!, ['#rust', '#learning']],
      [insertedIds[3]!, ['#health', '#research']],
    ]
    for (const [noteId, tagList] of tagAssignments) {
      tagList.forEach(tag => insertTag.run({ note_id: noteId, tag }))
    }

    const checklistId = insertNote.run({
      type: 'checklist',
      title: 'Weekly Review Checklist',
      description: null,
      code: null,
      url: null,
      folder: 'inbox',
      badge: null,
      is_pinned: 0,
      is_favorite: 0,
      is_archived: 0,
      note_date: '2024-05-20',
      attachment_names: null,
    }).lastInsertRowid

    ;['Clear Physical Inboxes', 'Review Active Projects'].forEach((content, i) => {
      insertItem.run({ note_id: checklistId, content, sort_order: i })
    })

    const archived = [
      {
        type: 'text' as const,
        title: 'System Architecture Redesign 2023',
        description:
          'Initial drafts for the microservices migration. Includes service boundaries, event bus topology, and phased rollout plan for the legacy monolith.',
        folder: 'work',
        badge: 'DRAFT',
        note_date: '2023-12-12',
      },
      {
        type: 'text' as const,
        title: 'Q4 Marketing Campaign Wrap-up',
        description:
          'Final metrics, channel performance, and retrospective notes from the holiday campaign. All deliverables signed off.',
        folder: 'ideas',
        badge: 'COMPLETED',
        note_date: '2023-11-28',
      },
      {
        type: 'text' as const,
        title: 'External API Specs (Legacy)',
        description:
          'Deprecated REST documentation for v1 partner integrations. Kept for compliance and historical reference only.',
        folder: 'work',
        badge: 'REFERENCE',
        note_date: '2023-10-05',
      },
    ]

    for (const n of archived) {
      insertNote.run({
        type: n.type,
        title: n.title,
        description: n.description,
        code: null,
        url: null,
        folder: n.folder,
        badge: n.badge,
        is_pinned: 0,
        is_favorite: 0,
        is_archived: 1,
        note_date: n.note_date,
        attachment_names: null,
      })
    }
  })
  console.log(`Seed complete (${SEED_MARKER}).`)
  if (!keepOpen) closeDb()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase(process.argv.includes('--force'))
}
