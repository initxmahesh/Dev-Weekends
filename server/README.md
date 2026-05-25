# Second Brain API

Production-oriented Express API with SQLite (WAL mode).

## Setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Database is created at `server/data/second-brain.db` on first start and seeded with sample notes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (port 3001) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:migrate` | Apply schema |
| `npm run db:seed` | Seed sample data (skips if notes exist) |
| `npm run db:reset` | Delete DB and re-seed |

## API

Base URL: `http://localhost:3001/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health + DB check |
| GET | `/notes` | List notes (`?nav=all\|favorites\|pinned\|archive\|tags&tag=#foo`) |
| GET | `/notes/pinned` | Pinned notes for sidebar cards |
| GET | `/notes/:id` | Single note |
| POST | `/notes` | Create note (supports `tab`: note, task, link) |
| PATCH | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Delete note |
| GET | `/stats` | Dashboard stats |
| GET | `/tags/trending` | Trending tags |

### Create note body

```json
{
  "tab": "note",
  "title": "My idea",
  "body": "Details here",
  "folder": "inbox",
  "tags": ["productivity"],
  "date": "2026-05-25",
  "attachmentNames": [],
  "reminder": "2026-05-26T09:00"
}
```

## Production

- Set `NODE_ENV=production`
- Point `DATABASE_PATH` to a persistent volume
- Set `CORS_ORIGIN` to your frontend origin
- Run `npm run build && npm start`
- Put behind HTTPS reverse proxy (nginx, Caddy)
