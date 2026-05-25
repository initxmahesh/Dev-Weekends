import { initDb, closeDb } from './connection.js'

initDb()
console.log('Migrations applied.')
closeDb()
