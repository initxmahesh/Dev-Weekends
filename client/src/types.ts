export type NoteType = 'text' | 'code' | 'image' | 'checklist'

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
}

export interface TrendingTag {
  id: number
  label: string
  accent: boolean
}
