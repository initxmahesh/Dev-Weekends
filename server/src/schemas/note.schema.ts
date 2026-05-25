import { z } from 'zod'

export const noteTypeSchema = z.enum(['text', 'code', 'image', 'checklist'])
export const navFilterSchema = z.enum(['all', 'favorites', 'pinned', 'tags', 'archive'])
export const createTabSchema = z.enum(['note', 'task', 'link'])

export const noteSortSchema = z.enum(['newest', 'oldest', 'title-asc', 'title-desc'])

export const listNotesQuerySchema = z.object({
  nav: navFilterSchema.default('all'),
  tag: z.string().optional(),
  folder: z.string().optional(),
  type: noteTypeSchema.optional(),
  q: z.string().trim().max(200).optional(),
  sort: noteSortSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const createNoteSchema = z
  .object({
    tab: createTabSchema.default('note'),
    type: noteTypeSchema.optional(),
    title: z.string().trim().min(1).max(500),
    body: z.string().max(50_000).optional().default(''),
    description: z.string().max(50_000).optional(),
    code: z.string().max(50_000).optional(),
    url: z.string().url().max(2000).optional(),
    items: z.array(z.string().trim().min(1).max(500)).max(100).optional(),
    folder: z.string().trim().min(1).max(64).default('inbox'),
    tags: z.array(z.string().trim().min(1).max(64)).max(32).default([]),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    badge: z.string().trim().max(32).optional(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    reminder: z.string().max(64).optional(),
    attachmentNames: z.array(z.string().max(255)).max(20).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.tab === 'link') {
      const url = (data.url ?? data.body ?? '').trim()
      if (!url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'URL is required for link notes',
          path: ['body'],
        })
      } else {
        try {
          const parsed = new URL(url)
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new Error('invalid protocol')
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid http(s) URL',
            path: ['body'],
          })
        }
      }
    }
    if (data.tab === 'task') {
      const hasItems = (data.items?.length ?? 0) > 0
      const hasBody = data.body.trim().length > 0
      if (!hasItems && !hasBody) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one checklist item is required',
          path: ['body'],
        })
      }
    }
  })

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    description: z.string().max(50_000).nullable().optional(),
    code: z.string().max(50_000).nullable().optional(),
    url: z.string().url().max(2000).nullable().optional(),
    items: z.array(z.string().trim().min(1).max(500)).max(100).optional(),
    folder: z.string().trim().min(1).max(64).optional(),
    tags: z.array(z.string().trim().min(1).max(64)).max(32).optional(),
    noteDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    badge: z.string().trim().max(32).nullable().optional(),
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    reminder: z.string().max(64).nullable().optional(),
    attachmentNames: z.array(z.string().max(255)).max(20).optional(),
  })
  .refine(obj => Object.keys(obj).length > 0, { message: 'At least one field required' })

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})
