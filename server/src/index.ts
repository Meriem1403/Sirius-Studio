import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { config } from './config.js'
import { pool, runMigrations } from './db.js'
import { seedIfEmpty } from './seed-full.js'
import { workspaceRoutes } from './routes/workspace.js'
import { authRoutes } from './routes/auth.js'
import { contactRoutes } from './routes/contact.js'
import { messageRoutes } from './routes/messages.js'
import { prospectRoutes } from './routes/prospects.js'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true, service: 'sirius-api' }))
app.route('/auth', authRoutes)
app.route('/contact', contactRoutes)
app.route('/messages', messageRoutes)
app.route('/prospects', prospectRoutes)
app.route('/workspace', workspaceRoutes)

async function main() {
  await pool.query('SELECT 1')
  await runMigrations()
  if (config.seedOnStart) await seedIfEmpty()

  serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.info(`[sirius-api] http://localhost:${info.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
