import { Hono } from 'hono'
import { pool } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

export const clientRoutes = new Hono()

clientRoutes.use('*', requireAdmin)

clientRoutes.get('/', async (c) => {
  const { rows } = await pool.query<{
    id: string
    email: string
    name: string
    company: string | null
    phone: string | null
  }>(`SELECT id, email, name, company, phone FROM users WHERE role = 'client' ORDER BY name ASC`)

  return c.json({
    clients: rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      company: r.company ?? undefined,
      phone: r.phone ?? undefined,
    })),
  })
})
