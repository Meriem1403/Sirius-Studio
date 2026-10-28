import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { config } from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const pool = new pg.Pool({ connectionString: config.databaseUrl })

export async function runMigrations() {
  for (const file of ['001_initial.sql', '002_workspace.sql', '003_oauth_users.sql', '004_password_resets.sql']) {
    const sqlPath = path.join(__dirname, '../migrations', file)
    const sql = fs.readFileSync(sqlPath, 'utf8')
    await pool.query(sql)
  }
}

export function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`
}
