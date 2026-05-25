import { unlinkSync, existsSync } from 'node:fs'
import { config } from '../config.js'
import { seedDatabase } from './seed.js'

if (existsSync(config.databasePath)) {
  unlinkSync(config.databasePath)
  console.log('Removed existing database.')
}

seedDatabase(true)
console.log('Database reset and seeded.')
