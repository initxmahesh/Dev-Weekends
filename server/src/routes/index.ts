import { Router } from 'express'
import { healthRouter } from './health.routes.js'
import { notesRouter } from './notes.routes.js'
import { statsRouter } from './stats.routes.js'
import { tagsRouter } from './tags.routes.js'
import { archiveRouter } from './archive.routes.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/notes', notesRouter)
apiRouter.use('/stats', statsRouter)
apiRouter.use('/tags', tagsRouter)
apiRouter.use('/archive', archiveRouter)
