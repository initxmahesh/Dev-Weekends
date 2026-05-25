import { Router } from 'express'
import { getDb } from '../db/connection.js'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    getDb().prepare('SELECT 1').get()
  } catch {
    dbStatus = 'error'
  }

  const healthy = dbStatus === 'ok'
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: { database: dbStatus },
  })
})
