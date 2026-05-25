## 1. How to run

**Install first**

- [Node.js](https://nodejs.org/) **≥ 22.12**
- **npm** (bundled with Node)

**Clone and start (development)**

Terminal 1 — Backend:

```bash
git clone <your-repo-url>
cd dev-week/server
npm install
npm run dev
```

API: `http://localhost:3001`. On first start it creates `server/data/second-brain.db`, runs the schema, and seeds sample notes (only when the DB is empty).

Terminal 2 — UI:

```bash
cd dev-week/client
npm install
npm run dev
```

UI: `http://localhost:5173`. The Vite dev server proxies `/api` to port 3001 (`client/vite.config.ts`).

No `.env` file is required for local dev; defaults live in `server/src/config.ts` (`PORT=3001`, `CORS_ORIGIN=http://localhost:5173`, `DATABASE_PATH=./data/second-brain.db`).

---

## 2. Stack choice

**Chosen stack:** React + TypeScript + Vite (client), Express 5 + TypeScript + SQLite via Node’s built-in `node:sqlite` (server).

**Why it fits this task**

- **Persistence without ops overhead** — SQLite is a real database on disk (`server/data/second-brain.db`), which matches “persistent mini-app” better than browser-only storage.

- **Typed boundaries** — TypeScript on both sides plus Zod validation on API inputs reduces bad payloads before they hit SQL.
- **Small deploy surface** — One Node process can serve REST + static SPA in production (`server/src/app.ts`).

**A worse choice (for this scope)**

- **Frontend-only + `localStorage`** — Notes would not survive another browser/device and there is no shared API contract; weak for a “persistent” assessment.
- **Next.js + hosted Postgres** — Strong platform, but heavier boilerplate, migrations hosting, and connection strings for a focused notes dashboard.
- **MongoDB + Mongoose** — Document model adds little over relational notes/tags/items for this UI and increases setup cost for anyone cloning the repo.

---

## 3. One real edge case

**Edge case:** The `attachment_names` column stores JSON text. Older rows, manual DB edits, or partial writes can leave **invalid JSON** in that column.

**Handling:** `parseAttachments` catches `JSON.parse` failures and returns `undefined` instead of throwing.

**Location:** `server/src/services/notes.service.ts`, lines **21–28** (used when mapping a row at line **73**).

```21:28:server/src/services/notes.service.ts
function parseAttachments(raw: string | null): string[] | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.map(String) : undefined
  } catch {
    return undefined
  }
}
```

**Without this handling:** Listing or loading a note with corrupt `attachment_names` would throw inside `rowToDto`, bubble up as an unhandled exception, and the client would get a **500** for that note (or the whole list if one bad row is included). With it, the note still loads; attachments are simply omitted.

---

## 4. AI usage

The heavy lifting below was **Cursor** (Claude agent in the IDE). Everything after that I built myself on top of the scaffold—create-note modal, archive/tags/detail views, note CRUD wiring, production static serving, Zod validation, seed logic, and the attachment JSON guard in §3.

| # | What I asked | What AI produced | Repo impact |
|---|----------------|------------------|-------------|
| 1 | Build the dashboard UI sample from stitch | UI Design| Full UI Design sample 
| 2 | “Fully responsive… search and filter” | Breakpoints, debounced search, filter panel wiring | `App.tsx`, layout components, filter state |
| 3 | Setup the SQLite DB with schema writing | SQLite schema, services | `server/` + `client/src/api/*` |

---

## 5. Honest gap

**Gap:** There are **no automated tests** (no API integration tests, no client tests). Regressions in note CRUD, tag normalization, or filter/query behavior would only show up through manual clicking.

**Fix with another day**

- Add **Vitest + supertest** (or `node:test` + `fetch`) for the API: create note → list with `?q=` → update → archive → delete, plus seed-skip and invalid JSON attachment behavior.
- Add one **React Testing Library** test for debounced search (mock `fetchNotes`, assert it is not called on every keystroke).
- Wire **`npm test`** in CI so reviewers and future me get a green check before merge.

