import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import type { RequestHandler } from 'express'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import pino from 'pino'
import { config } from './config.js'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'

const logger = pino({ level: config.logLevel })

const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      durationMs: Date.now() - start,
    })
  })
  next()
}

export function createApp() {
  const app = express()
  const serveClient = config.isProd && existsSync(config.clientDistPath)

  app.set('trust proxy', 1)

  app.use(requestLogger)

  app.use(helmet())
  app.use(
    cors({
      origin: serveClient ? true : config.corsOrigin,
      credentials: true,
    }),
  )
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))

  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: { code: 'RATE_LIMIT', message: 'Too many requests' },
      },
    }),
  )

  app.use('/api', apiRouter)

  if (serveClient) {
    app.use(express.static(config.clientDistPath))
    app.get(/^(?!\/api).*/, (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next()
        return
      }
      res.sendFile(join(config.clientDistPath, 'index.html'))
    })
  } else {
    app.get('/', (_req, res) => {
      res.json({
        name: 'Second Brain API',
        version: '1.0.0',
        docs: '/api/health',
      })
    })
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
