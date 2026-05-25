import { useState } from 'react'
import './App.css'

// ─── Icon Components ───────────────────────────────────────────────────────────

const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

const IconStar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/>
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>
  </svg>
)

const IconTag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const IconArchive = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
)

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="16" y2="6"/>
    <line x1="6" y1="12" x2="18" y2="12"/>
    <line x1="8" y1="18" x2="14" y2="18"/>
  </svg>
)

const IconSliders = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
)

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconDots = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
  </svg>
)

const IconCommand = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
  </svg>
)

const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Data ──────────────────────────────────────────────────────────────────────

const navItems = [
  { id: 'all', label: 'All Notes', icon: <IconFile /> },
  { id: 'favorites', label: 'Favorites', icon: <IconStar /> },
  { id: 'pinned', label: 'Pinned', icon: <IconPin /> },
  { id: 'tags', label: 'Tags', icon: <IconTag /> },
  { id: 'archive', label: 'Archive', icon: <IconArchive /> },
]

const pinnedNotes = [
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

type NoteType = 'text' | 'code' | 'image' | 'checklist'

interface RecentNote {
  id: number
  type: NoteType
  title: string
  description?: string
  code?: string
  items?: string[]
  date: string
}

const recentNotes: RecentNote[] = [
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

const trendingTags = [
  { id: 1, label: 'Artificial Intelligence', accent: true },
  { id: 2, label: 'Productivity', accent: true },
  { id: 3, label: 'Rust', accent: false },
  { id: 4, label: 'Philosophy', accent: false },
]

// ─── Components ────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeNav: string
  setActiveNav: (id: string) => void
  open: boolean
  onClose: () => void
}

function Sidebar({ activeNav, setActiveNav, open, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <div className="sidebar-title">Second Brain</div>
          <div className="sidebar-subtitle">Knowledge Vault</div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <IconX />
        </button>
      </div>

      <button className="new-note-btn">
        <IconPlus />
        <span>New Note</span>
      </button>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? 'nav-item--active' : ''}`}
            onClick={() => {
              setActiveNav(item.id)
              onClose()
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">A</div>
        <div className="user-info">
          <span className="user-name">Alex Rivera</span>
          <span className="user-plan">PRO ACCOUNT</span>
        </div>
        <button className="settings-btn" aria-label="Settings">
          <IconSettings />
        </button>
      </div>
    </aside>
  )
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open sidebar">
        <IconMenu />
      </button>
      <div className="search-bar">
        <span className="search-icon"><IconSearch /></span>
        <span className="search-placeholder">Search your vault...</span>
        <kbd className="search-kbd">⌘K</kbd>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Filter"><IconFilter /></button>
        <button className="icon-btn" aria-label="Sort"><IconSliders /></button>
        <div className="topbar-divider" />
        <button className="icon-btn" aria-label="Notifications"><IconBell /></button>
      </div>
    </div>
  )
}

function PinnedNodes() {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-header-icon"><IconPin /></span>
        <span className="section-label">PINNED NODES</span>
      </div>
      <div className="pinned-scroll">
        {pinnedNotes.map(note => (
          <article key={note.id} className="pinned-card">
            <div className="pinned-card-top">
              <span className="badge">{note.badge}</span>
              <span className="last-edited">Last edited: {note.lastEdited}</span>
            </div>
            <h3 className="card-title">{note.title}</h3>
            <p className="card-desc">{note.description}</p>
            <div className="card-tags">
              {note.tags.map(tag => (
                <span key={tag} className="note-tag">{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function RecentActivity() {
  const topNotes = recentNotes.slice(0, 3)
  const imageNote = recentNotes[3]
  const checklistNote = recentNotes[4]

  return (
    <section className="section">
      <div className="section-header">
        <span className="section-header-icon"><IconClock /></span>
        <span className="section-label">RECENT ACTIVITY</span>
      </div>

      <div className="recent-grid-top">
        {topNotes.map(note => (
          <article key={note.id} className="recent-card">
            <div className="recent-card-header">
              <h4 className="recent-card-title">{note.title}</h4>
              <button className="dots-btn" aria-label="More options"><IconDots /></button>
            </div>
            {note.type === 'text' && (
              <p className="recent-card-desc">{note.description}</p>
            )}
            {note.type === 'code' && (
              <pre className="code-block"><code>{note.code}</code></pre>
            )}
            <span className="recent-card-date">{note.date}</span>
          </article>
        ))}
      </div>

      <div className="recent-grid-bottom">
        <article className="recent-card visual-research-card">
          <div className="vr-content">
            <span className="vr-label">{imageNote.title}</span>
          </div>
        </article>

        <article className="recent-card">
          <div className="recent-card-header">
            <h4 className="recent-card-title">{checklistNote.title}</h4>
            <button className="dots-btn" aria-label="More options"><IconDots /></button>
          </div>
          <div className="checklist">
            {checklistNote.items?.map(item => (
              <label key={item} className="checklist-item">
                <span className="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <span className="recent-card-date">{checklistNote.date}</span>
        </article>
      </div>
    </section>
  )
}

function QuickStats({ visible }: { visible: boolean }) {
  return (
    <aside className={`quick-stats ${visible ? 'quick-stats--visible' : ''}`}>
      <div className="qs-section-label">QUICK STATS</div>

      <div className="qs-stat-card">
        <span className="qs-stat-label">Total Knowledge Assets</span>
        <span className="qs-stat-value">1,284</span>
      </div>

      <div className="qs-divider" />

      <div className="qs-block">
        <div className="qs-block-label">Trending Tags</div>
        <div className="qs-tags">
          {trendingTags.map(tag => (
            <span key={tag.id} className={`qs-tag ${tag.accent ? 'qs-tag--accent' : ''}`}>
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div className="qs-divider" />

      <div className="qs-block">
        <div className="qs-block-label">Sync Status</div>
        <div className="qs-sync">
          <span className="sync-dot" />
          <span className="sync-text">All nodes encrypted &amp; synced</span>
        </div>
      </div>
    </aside>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [activeNav, setActiveNav] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="content-scroll">
          <PinnedNodes />
          <RecentActivity />
        </div>
      </main>

      <QuickStats visible={false} />

      <button className="quick-action-btn" aria-label="Quick action">
        <IconCommand />
        <span>Quick Action</span>
      </button>
    </div>
  )
}

export default App
