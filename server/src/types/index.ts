export type NoteType = 'text' | 'code' | 'image' | 'checklist'
export type NavFilter = 'all' | 'favorites' | 'pinned' | 'tags' | 'archive'

export interface NoteRow {
  id: number
  type: NoteType
  title: string
  description: string | null
  code: string | null
  url: string | null
  folder: string
  badge: string | null
  is_pinned: number
  is_favorite: number
  is_archived: number
  note_date: string
  reminder_at: string | null
  attachment_names: string | null
  created_at: string
  updated_at: string
}

export interface NoteItemRow {
  id: number
  note_id: number
  content: string
  sort_order: number
}

export interface NoteDto {
  id: number
  type: NoteType
  title: string
  description?: string
  code?: string
  items?: string[]
  url?: string
  date: string
  folder?: string
  tags?: string[]
  badge?: string
  lastEdited?: string
  createdAt?: string
  updatedAt?: string
  wordCount?: number
  readTimeMinutes?: number
  isPinned?: boolean
  isFavorite?: boolean
  isArchived?: boolean
  archivedAt?: string
  reminderAt?: string
  attachmentNames?: string[]
}

export interface LinkedNoteDto {
  id: number
  title: string
  description: string
}

export interface PinnedNoteDto {
  id: number
  badge: string
  lastEdited: string
  title: string
  description: string
  tags: string[]
}

export interface StatsDto {
  totalAssets: number
  addedThisWeek: number
  syncStatus: 'ok' | 'degraded'
  lastSyncAt: string
}

export interface TrendingTagDto {
  id: number
  label: string
  accent: boolean
  count: number
}

export interface TaxonomyTagDto {
  id: number
  tag: string
  noteCount: number
  samples: string[]
}

export interface ArchiveStatsDto {
  storageUsedMb: number
  storageLimitMb: number
  archivedTotal: number
  autoDeleteEnabled: boolean
}
