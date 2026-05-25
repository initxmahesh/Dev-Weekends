import { Router } from 'express'
import * as archiveService from '../services/archive.service.js'

export const archiveRouter = Router()

archiveRouter.get('/stats', (_req, res) => {
  res.json({ data: archiveService.getArchiveStats() })
})

archiveRouter.delete('/', (_req, res) => {
  const deleted = archiveService.emptyArchive()
  res.json({ data: { deleted } })
})
