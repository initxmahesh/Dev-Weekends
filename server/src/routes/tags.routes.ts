import { Router } from 'express'
import { getTrendingTags, listTaxonomyTags } from '../services/tags.service.js'

export const tagsRouter = Router()

tagsRouter.get('/', (_req, res) => {
  res.json({ data: listTaxonomyTags() })
})

tagsRouter.get('/trending', (_req, res) => {
  res.json({ data: getTrendingTags() })
})
