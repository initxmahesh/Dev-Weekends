import type { ArchiveStats } from '../types'
import { apiRequest } from './client'

interface ItemResponse<T> {
  data: T
}

export async function fetchArchiveStats(): Promise<ArchiveStats> {
  const res = await apiRequest<ItemResponse<ArchiveStats>>('/archive/stats')
  return res.data
}

export async function emptyArchive(): Promise<number> {
  const res = await apiRequest<ItemResponse<{ deleted: number }>>('/archive', {
    method: 'DELETE',
  })
  return res.data.deleted
}
