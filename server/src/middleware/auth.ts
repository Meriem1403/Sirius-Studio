import type { Context, Next } from 'hono'
import { pool } from '../db.js'
import { verifyToken } from '../services/auth.js'

export type AuthUser = {
  id: string
  email: string
  name: string
  company: string | null
  role: 'client' | 'admin'
  phone: string | null
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

async function loadUser(c: Context, allowBlocked: boolean) {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return c.json({ error: 'Non authentifié.' }, 401)

  const userId = await verifyToken(token)
  if (!userId) return c.json({ error: 'Session expirée.' }, 401)

  const { rows } = await pool.query<AuthUser & { blocked_at: string | null }>(
    `SELECT id, email, name, company, role, phone, blocked_at FROM users WHERE id = $1`,
    [userId],
  )
  const user = rows[0]
  if (!user) return c.json({ error: 'Utilisateur introuvable.' }, 401)
  if (user.blocked_at && !allowBlocked) {
    return c.json(
      { error: 'Votre accès est suspendu. Pour toute question ou pour exercer vos droits : contact@studio-sirius.fr' },
      403,
    )
  }

  c.set('user', user)
  return null
}

export async function requireAuth(c: Context, next: Next) {
  const denied = await loadUser(c, false)
  if (denied) return denied
  await next()
}

export async function requireAuthAllowBlocked(c: Context, next: Next) {
  const denied = await loadUser(c, true)
  if (denied) return denied
  await next()
}

export async function requireAdmin(c: Context, next: Next) {
  const denied = await loadUser(c, false)
  if (denied) return denied
  if (c.get('user').role !== 'admin') return c.json({ error: 'Accès refusé.' }, 403)
  await next()
}
