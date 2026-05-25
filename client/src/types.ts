export type NoteType = 'text' | 'code' | 'image' | 'checklist'

export type NoteSort = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

export interface NoteFilters {
  query: string
  type: NoteType | ''
  folder: string
  sort: NoteSort
}

export const defaultNoteFilters: NoteFilters = {
  query: '',
  type: '',
  folder: '',
  sort: 'newest',
}

export interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

export interface PinnedNote {
  id: number
  badge: string
  lastEdited: string
  title: string
  description: string
  tags: string[]
}

export interface RecentNote {
  id: number
  type: NoteType
  title: string
  description?: string
  code?: string
  items?: string[]
  date: string
  folder?: string
  tags?: string[]
  url?: string
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
}

export interface ArchiveStats {
  storageUsedMb: number
  storageLimitMb: number
  archivedTotal: number
  autoDeleteEnabled: boolean
}

export interface LinkedNote {
  id: number
  title: string
  description: string
}

export interface TrendingTag {
  id: number
  label: string
  accent: boolean
}

export interface TaxonomyTag {
  id: number
  tag: string
  noteCount: number
  samples: string[]
}

export const navTitles: Record<string, string> = {
  all: 'Recent Activity',
  favorites: 'Favorites',
  pinned: 'Pinned Notes',
  tags: 'Tagged Notes',
  archive: 'Archive',
}
