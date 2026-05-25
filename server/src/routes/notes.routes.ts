import { Router } from 'express'
import {
  createNoteSchema,
  idParamSchema,
  listNotesQuerySchema,
  updateNoteSchema,
} from '../schemas/note.schema.js'
import * as notesService from '../services/notes.service.js'
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js'
import type { z } from 'zod'

export const notesRouter = Router()

notesRouter.get('/pinned', (_req, res) => {
  res.json({ data: notesService.listPinnedNotes() })
})

notesRouter.get('/', validateQuery(listNotesQuerySchema), (req, res) => {
  const query = req.validatedQuery as z.infer<typeof listNotesQuerySchema>
  const result = notesService.listNotes(query)
  res.json({
    data: result.notes,
    meta: { total: result.total, limit: query.limit, offset: query.offset },
  })
})

notesRouter.get('/:id/related', validateParams(idParamSchema), (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idParamSchema>
  res.json({ data: notesService.getRelatedNotes(id) })
})

notesRouter.get('/:id', validateParams(idParamSchema), (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idParamSchema>
  res.json({ data: notesService.getNoteById(id) })
})

notesRouter.post('/', validateBody(createNoteSchema), (req, res) => {
  const body = req.validatedBody as z.infer<typeof createNoteSchema>
  const note = notesService.createNote(body)
  res.status(201).json({ data: note })
})

notesRouter.patch(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateNoteSchema),
  (req, res) => {
    const { id } = req.validatedParams as z.infer<typeof idParamSchema>
    const body = req.validatedBody as z.infer<typeof updateNoteSchema>
    const note = notesService.updateNote(id, body)
    res.json({ data: note })
  },
)

notesRouter.delete('/:id', validateParams(idParamSchema), (req, res) => {
  const { id } = req.validatedParams as z.infer<typeof idParamSchema>
  notesService.deleteNote(id)
  res.status(204).send()
})
