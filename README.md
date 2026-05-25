# Second Brain — Persistent mini-app

A full-stack notes dashboard (React + Express + SQLite) with persistent storage, filtering, tags, archive, and pinned notes.

---

## How to run

**Prerequisites:** [Node.js](https://nodejs.org/) **≥ 22.12** and **npm**.

### Development

**Terminal 1 — Backend**

```bash
cd server
npm install
npm run dev
```

The API listens on `http://localhost:3001`. On first start it creates `server/data/second-brain.db` and seeds sample notes. Optional: copy `server/.env` values from the defaults in `server/src/config.ts` if you need custom ports or paths.

**Terminal 2 — Frontend**

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the API (see `client/vite.config.ts`).

