const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = (await res.json().catch(() => ({}))) as T & ApiErrorBody

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.error?.message ?? res.statusText,
      body.error?.code,
      body.error?.details,
    )
  }

  return body
}
