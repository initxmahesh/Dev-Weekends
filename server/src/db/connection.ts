import { DatabaseSync } from 'node:sqlite'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from '../config.js'

let db: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

export function withTransaction<T>(fn: () => T): T {
  const database = getDb()
  database.exec('BEGIN IMMEDIATE')
  try {
    const result = fn()
    database.exec('COMMIT')
    return result
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

export function initDb(): DatabaseSync {
  if (db) return db

  const dir = dirname(config.databasePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  db = new DatabaseSync(config.databasePath)
  db.exec('PRAGMA foreign_keys = ON')
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA synchronous = NORMAL')

  runMigrations(db)
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

function runMigrations(database: DatabaseSync): void {
  const schemaPath = new URL('./schema.sql', import.meta.url)
  const schema = readFileSync(schemaPath, 'utf-8')
  database.exec(schema)

  const version = 1
  const row = database
    .prepare('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1')
    .get() as { version: number } | undefined

  if (!row) {
    database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version)
  }
}
