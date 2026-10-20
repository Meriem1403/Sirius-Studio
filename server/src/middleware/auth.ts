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

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return c.json({ error: 'Non authentifié.' }, 401)

  const userId = await verifyToken(token)
  if (!userId) return c.json({ error: 'Session expirée.' }, 401)

  const { rows } = await pool.query<AuthUser>(
    `SELECT id, email, name, company, role, phone FROM users WHERE id = $1`,
    [userId],
  )
  const user = rows[0]
  if (!user) return c.json({ error: 'Utilisateur introuvable.' }, 401)

  c.set('user', user)
  await next()
}

export async function requireAdmin(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return c.json({ error: 'Non authentifié.' }, 401)

  const userId = await verifyToken(token)
  if (!userId) return c.json({ error: 'Session expirée.' }, 401)

  const { rows } = await pool.query<AuthUser>(
    `SELECT id, email, name, company, role, phone FROM users WHERE id = $1`,
    [userId],
  )
  const user = rows[0]
  if (!user) return c.json({ error: 'Utilisateur introuvable.' }, 401)
  if (user.role !== 'admin') return c.json({ error: 'Accès refusé.' }, 403)

  c.set('user', user)
  await next()
}
