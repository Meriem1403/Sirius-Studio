import { Hono } from 'hono'
import { z } from 'zod'
import { pool } from '../db.js'
import { requireAuthAllowBlocked } from '../middleware/auth.js'
import { verifyPassword } from '../services/auth.js'
import { anonymizeClientAccount } from './clients.js'

export const privacyRoutes = new Hono()

const accessSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  action: z.enum(['export', 'erase']),
  confirm: z.string().optional(),
})

const attempts = new Map<string, { count: number; resetAt: number }>()

function limited(email: string) {
  const now = Date.now()
  const current = attempts.get(email)
  if (!current || current.resetAt < now) return false
  return current.count >= 8
}

function noteFailure(email: string) {
  const now = Date.now()
  const current = attempts.get(email)
  if (!current || current.resetAt < now) {
    attempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return
  }
  current.count += 1
}

privacyRoutes.post('/access', async (c) => {
  const body = accessSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)
  const email = body.data.email.trim().toLowerCase()
  if (limited(email)) return c.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, 429)

  const { rows } = await pool.query<{ id: string; role: string; password_hash: string }>(
    `SELECT id, role, password_hash FROM users WHERE LOWER(email) = $1`,
    [email],
  )
  const row = rows[0]
  if (!row?.password_hash || !(await verifyPassword(body.data.password, row.password_hash))) {
    noteFailure(email)
    return c.json({ error: 'Email ou mot de passe incorrect.' }, 401)
  }
  if (row.role !== 'client') return c.json({ error: 'Cette action concerne un compte client.' }, 403)
  attempts.delete(email)

  if (body.data.action === 'erase') {
    if (body.data.confirm !== 'EFFACER') return c.json({ error: 'Confirmation invalide.' }, 400)
    const ok = await anonymizeClientAccount(row.id)
    if (!ok) return c.json({ error: 'Compte introuvable.' }, 404)
    return c.json({
      ok: true,
      message: 'Votre compte est effacé. Les factures sont conservées sans vos coordonnées, pour l’obligation comptable.',
    })
  }

  return c.json(await exportForUser(row.id))
})

privacyRoutes.use('*', requireAuthAllowBlocked)

const eraseSchema = z.object({
  confirm: z.literal('EFFACER'),
})

privacyRoutes.get('/export', async (c) => {
  return c.json(await exportForUser(c.get('user').id))
})

privacyRoutes.post('/erase', async (c) => {
  const user = c.get('user')
  if (user.role !== 'client') {
    return c.json({ error: 'Seul un compte client peut être effacé depuis cet espace.' }, 403)
  }
  const body = eraseSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Confirmation invalide.' }, 400)

  const ok = await anonymizeClientAccount(user.id)
  if (!ok) return c.json({ error: 'Compte introuvable.' }, 404)
  return c.json({
    ok: true,
    message:
      'Votre compte est effacé. Les factures sont conservées sans vos coordonnées, pour l’obligation comptable.',
  })
})

async function exportForUser(userId: string) {
  const account = await pool.query(
    `SELECT id, email, name, company, phone, role, created_at FROM users WHERE id = $1`,
    [userId],
  )
  const projects = await pool.query(`SELECT * FROM projects WHERE user_id = $1`, [userId])
  const messages = await pool.query(
    `SELECT id, project_id, project_title, from_label, role, content, sent_at, read
     FROM messages WHERE user_id = $1 ORDER BY sent_at ASC`,
    [userId],
  )
  const { rows: collections } = await pool.query<{ key: string; data: unknown }>(
    `SELECT key, data FROM workspace_collections`,
  )
  const workspace: Record<string, unknown[]> = {}
  for (const collection of collections) {
    if (!Array.isArray(collection.data)) continue
    workspace[collection.key] = collection.data.filter((item) => {
      if (!item || typeof item !== 'object') return false
      const record = item as Record<string, unknown>
      return record.userId === userId || record.user_id === userId
    })
  }

  return {
    exportedAt: new Date().toISOString(),
    account: account.rows[0] ?? null,
    projects: projects.rows,
    messages: messages.rows,
    workspace,
  }
}
