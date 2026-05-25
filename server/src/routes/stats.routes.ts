import { Router } from 'express'
import { getStats } from '../services/stats.service.js'

export const statsRouter = Router()

statsRouter.get('/', (_req, res) => {
  res.json({ data: getStats() })
})
