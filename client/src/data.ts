import { FileText, Star, Pin, Tag, Archive } from 'lucide-react'
import type { NavItem, PinnedNote, RecentNote, TrendingTag } from './types'

export const navItems: NavItem[] = [
  { id: 'all',       label: 'All Notes',  icon: FileText },
  { id: 'favorites', label: 'Favorites',  icon: Star     },
  { id: 'pinned',    label: 'Pinned',     icon: Pin      },
  { id: 'tags',      label: 'Tags',       icon: Tag      },
  { id: 'archive',   label: 'Archive',    icon: Archive  },
]

export const pinnedNotes: PinnedNote[] = [
  {
    id: 1,
    badge: 'SYSTEM',
    lastEdited: '2h ago',
    title: 'Architectural Principles for Neural Networks',
    description:
      'A consolidated list of heuristics for designing scalable transformer-based architectures. Includes notes on attention sparsity, residual connection scaling, and layer normalization placement strategies.',
    tags: ['#deeplearning', '#research'],
  },
  {
    id: 2,
    badge: 'REFERENCE',
    lastEdited: '1d ago',
    title: 'Machine Learning Optimization Techniques',
    description:
      'Overview of gradient descent variants, learning rate schedules, and regularization methods for production model training pipelines.',
    tags: ['#ml', '#optimization'],
  },
]

export const recentNotes: RecentNote[] = [
  {
    id: 1,
    type: 'text',
    title: 'Obsidian Plugin Ideas',
    description:
      'Brainstorming a visual graph filter that highlights notes based on semantic similarity rather than just explicit tags.',
    date: 'May 24, 2024',
  },
  {
    id: 2,
    type: 'text',
    title: 'Stoic Reflections on Resilience',
    description:
      'Meditations on Marcus Aurelius: "The impediment to action advances action. What stands in the way becomes the way."',
    date: 'May 23, 2024',
  },
  {
    id: 3,
    type: 'code',
    title: 'Rust Memory Safety Snippets',
    code: 'fn main() {\n  let mut s =\n  String...\n}',
    date: 'May 22, 2024',
  },
  {
    id: 4,
    type: 'image',
    title: 'VISUAL RESEARCH',
    date: 'May 21, 2024',
  },
  {
    id: 5,
    type: 'checklist',
    title: 'Weekly Review Checklist',
    items: ['Clear Physical Inboxes', 'Review Active Projects'],
    date: 'May 20, 2024',
  },
]

export const trendingTags: TrendingTag[] = [
  { id: 1, label: 'Artificial Intelligence', accent: true  },
  { id: 2, label: 'Productivity',            accent: true  },
  { id: 3, label: 'Rust',                    accent: false },
  { id: 4, label: 'Philosophy',              accent: false },
]
