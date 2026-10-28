import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { config } from './config.js'
import { pool, runMigrations } from './db.js'
import { ensureBootstrapAdmin } from './services/bootstrapAdmin.js'
import { ensureWorkspaceDocuments, seedIfEmpty } from './seed-full.js'
import { workspaceRoutes } from './routes/workspace.js'
import { authRoutes } from './routes/auth.js'
import { contactRoutes } from './routes/contact.js'
import { messageRoutes } from './routes/messages.js'
import { prospectRoutes } from './routes/prospects.js'
import { clientRoutes } from './routes/clients.js'
import { requestRoutes } from './routes/requests.js'
import { oauthRoutes } from './routes/oauth.js'
import { privacyRoutes } from './routes/privacy.js'

const app = new Hono()

app.use('*', logger())
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('X-Frame-Options', 'DENY')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})
app.use(
  '*',
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

app.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'sirius-api',
    email: config.resendApiKey ? 'resend' : 'simulated',
    publicAppUrl: config.publicAppUrl,
  }),
)
app.route('/auth', authRoutes)
app.route('/auth/oauth', oauthRoutes)
app.route('/contact', contactRoutes)
app.route('/messages', messageRoutes)
app.route('/prospects', prospectRoutes)
app.route('/clients', clientRoutes)
app.route('/privacy', privacyRoutes)
app.route('/requests', requestRoutes)
app.route('/workspace', workspaceRoutes)

async function main() {
  await pool.query('SELECT 1')
  await runMigrations()
  if (config.seedOnStart) await seedIfEmpty()
  await ensureBootstrapAdmin()
  await ensureWorkspaceDocuments()

  serve({ fetch: app.fetch, port: config.port }, (info) => {
    console.info(`[sirius-api] http://localhost:${info.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
