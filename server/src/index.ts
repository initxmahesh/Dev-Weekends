import { createApp } from './app.js'
import { config } from './config.js'
import { initDb, closeDb } from './db/connection.js'
import { seedDatabase } from './db/seed.js'

initDb()
seedDatabase(false, true)

const app = createApp()
const server = app.listen(config.port, config.host, () => {
  console.log(`API listening on http://${config.host}:${config.port}`)
})

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`)
  server.close(() => {
    closeDb()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
