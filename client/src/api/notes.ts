import type { NewNotePayload } from '../components/NewNoteModal'
import type { LinkedNote, NoteFilters, RecentNote, TrendingTag } from '../types'
import { apiRequest } from './client'

interface ListResponse {
  data: RecentNote[]
  meta: { total: number; limit: number; offset: number }
}

interface ItemResponse<T> {
  data: T
}

export interface StatsResponse {
  totalAssets: number
  addedThisWeek: number
  syncStatus: 'ok' | 'degraded'
  lastSyncAt: string
}

export type NoteUpdatePayload = Partial<{
  title: string
  description: string | null
  code: string | null
  url: string | null
  items: string[]
  folder: string
  tags: string[]
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
}>

export async function fetchNotes(
  nav = 'all',
  options?: { tag?: string; filters?: Partial<NoteFilters> },
): Promise<RecentNote[]> {
  const params = new URLSearchParams({ nav })
  if (options?.tag) params.set('tag', options.tag)
  const f = options?.filters
  if (f?.query?.trim()) params.set('q', f.query.trim())
  if (f?.type) params.set('type', f.type)
  if (f?.folder) params.set('folder', f.folder)
  if (f?.sort && f.sort !== 'newest') params.set('sort', f.sort)
  const res = await apiRequest<ListResponse>(`/notes?${params}`)
  return res.data
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await apiRequest<ItemResponse<StatsResponse>>('/stats')
  return res.data
}

export async function fetchTrendingTags(): Promise<TrendingTag[]> {
  const res = await apiRequest<ItemResponse<TrendingTag[]>>('/tags/trending')
  return res.data
}

export async function createNote(payload: NewNotePayload): Promise<RecentNote> {
  const res = await apiRequest<ItemResponse<RecentNote>>('/notes', {
    method: 'POST',
    body: JSON.stringify({
      tab: payload.tab,
      title: payload.title,
      body: payload.body,
      folder: payload.folder,
      tags: payload.tags,
      date: payload.date,
      attachmentNames: payload.attachmentNames,
      reminder: payload.reminder,
    }),
  })
  return res.data
}

export async function fetchNoteById(id: number): Promise<RecentNote> {
  const res = await apiRequest<ItemResponse<RecentNote>>(`/notes/${id}`)
  return res.data
}

export async function fetchRelatedNotes(id: number): Promise<LinkedNote[]> {
  const res = await apiRequest<ItemResponse<LinkedNote[]>>(`/notes/${id}/related`)
  return res.data
}

export async function updateNote(id: number, patch: NoteUpdatePayload): Promise<RecentNote> {
  const res = await apiRequest<ItemResponse<RecentNote>>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return res.data
}

export async function deleteNote(id: number): Promise<void> {
  await apiRequest(`/notes/${id}`, { method: 'DELETE' })
}
