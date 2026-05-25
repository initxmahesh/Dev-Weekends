import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'
import { ValidationError } from '../utils/errors.js'

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(new ValidationError('Invalid request body', result.error.flatten()))
      return
    }
    req.validatedBody = result.data
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      next(new ValidationError('Invalid query parameters', result.error.flatten()))
      return
    }
    req.validatedQuery = result.data
    next()
  }
}

export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      next(new ValidationError('Invalid route parameters', result.error.flatten()))
      return
    }
    req.validatedParams = result.data
    next()
  }
}
