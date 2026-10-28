import { Hono } from 'hono'
import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import { pool } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { hashPassword } from '../services/auth.js'

export const clientRoutes = new Hono()

clientRoutes.use('*', requireAdmin)

const blockSchema = z.object({
  reason: z.string().trim().min(3).max(500),
})

clientRoutes.get('/', async (c) => {
  const { rows } = await pool.query<{
    id: string
    email: string
    name: string
    company: string | null
    phone: string | null
    blocked_at: string | null
    block_reason: string | null
  }>(
    `SELECT id, email, name, company, phone, blocked_at, block_reason
     FROM users WHERE role = 'client' ORDER BY name ASC`,
  )

  return c.json({
    clients: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      company: r.company ?? undefined,
      phone: r.phone ?? undefined,
      blockedAt: r.blocked_at ?? undefined,
      blockReason: r.block_reason ?? undefined,
    })),
  })
})

clientRoutes.post('/:id/block', async (c) => {
  const body = blockSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Indiquez une raison (3 caractères minimum).' }, 400)

  const admin = c.get('user')
  const id = c.req.param('id')
  const { rows } = await pool.query<{ id: string; role: string }>(
    `SELECT id, role FROM users WHERE id = $1`,
    [id],
  )
  const target = rows[0]
  if (!target || target.role !== 'client') return c.json({ error: 'Client introuvable.' }, 404)

  await pool.query(
    `UPDATE users
     SET blocked_at = NOW(), block_reason = $2, blocked_by = $3
     WHERE id = $1`,
    [id, body.data.reason, admin.id],
  )
  return c.json({ ok: true })
})

clientRoutes.post('/:id/unblock', async (c) => {
  const id = c.req.param('id')
  const { rowCount } = await pool.query(
    `UPDATE users
     SET blocked_at = NULL, block_reason = NULL, blocked_by = NULL
     WHERE id = $1 AND role = 'client'`,
    [id],
  )
  if (!rowCount) return c.json({ error: 'Client introuvable.' }, 404)
  return c.json({ ok: true })
})

export async function anonymizeClientAccount(userId: string) {
  const { rows } = await pool.query<{ id: string; email: string; role: string }>(
    `SELECT id, email, role FROM users WHERE id = $1`,
    [userId],
  )
  const user = rows[0]
  if (!user || user.role !== 'client') return false

  const email = user.email
  const erasedEmail = `efface+${user.id}@invalid.local`
  const password = await hashPassword(randomBytes(32).toString('hex'))

  await pool.query(`DELETE FROM messages WHERE user_id = $1 OR from_user_id = $1`, [userId])
  await pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [userId])
  await pool.query(`DELETE FROM contact_leads WHERE LOWER(payload->>'email') = LOWER($1)`, [email])
  await pool.query(
    `UPDATE prospects
     SET name = 'Personne effacée', company = 'Effacé', email = $2, phone = NULL, notes = NULL
     WHERE converted_user_id = $1 OR LOWER(email) = LOWER($3)`,
    [userId, erasedEmail, email],
  )
  await pool.query(
    `UPDATE projects
     SET title = 'Projet effacé', description = '', next_step = '', mockup_url = NULL, validation = NULL
     WHERE user_id = $1`,
    [userId],
  )

  const drop = new Set([
    'activities',
    'notifications',
    'profiles',
    'deliveries',
    'documentRequests',
    'documents',
    'appointments',
  ])
  const keepMoney = new Set(['quotes', 'invoices', 'payments', 'refunds', 'accounting', 'projects'])
  const { rows: collections } = await pool.query<{ key: string; data: unknown }>(
    `SELECT key, data FROM workspace_collections`,
  )
  for (const collection of collections) {
    if (!Array.isArray(collection.data)) continue
    const next = collection.data.flatMap((item) => {
      if (!item || typeof item !== 'object') return [item]
      const record = item as Record<string, unknown>
      const owner = record.userId ?? record.user_id
      if (owner !== userId) return [item]
      if (drop.has(collection.key)) return []
      if (keepMoney.has(collection.key)) {
        return [
          {
            ...record,
            clientName: 'Compte effacé',
            name: collection.key === 'projects' ? 'Projet effacé' : 'Compte effacé',
            email: undefined,
            clientEmail: undefined,
            phone: undefined,
            description: '',
            title: collection.key === 'projects' ? 'Projet effacé' : record.title,
          },
        ]
      }
      return [item]
    })
    await pool.query(
      `UPDATE workspace_collections SET data = $2::jsonb, updated_at = NOW() WHERE key = $1`,
      [collection.key, JSON.stringify(next)],
    )
  }

  await pool.query(
    `UPDATE users
     SET email = $2,
         name = 'Compte effacé',
         company = NULL,
         phone = NULL,
         password_hash = $3,
         oauth_provider = NULL,
         oauth_subject = NULL,
         blocked_at = NOW(),
         block_reason = 'Compte effacé à la demande de la personne',
         blocked_by = $1
     WHERE id = $1`,
    [userId, erasedEmail, password],
  )
  return true
}
