import { Hono } from 'hono'
import { z } from 'zod'
import { pool } from '../db.js'
import { uid } from '../db.js'
import { hashPassword, signToken, verifyPassword } from '../services/auth.js'
import { requireAuth } from '../middleware/auth.js'
import { notifyClientWelcome } from '../services/email.js'
import { createClientProjectRequest } from '../services/clientProjectRequest.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const projectRequestSchema = z.object({
  title: z.string().min(3).max(120),
  type: z.string().min(2).max(80),
  message: z.string().min(10).max(8000),
  needs: z.array(z.string()).max(12).optional(),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  company: z.string().optional(),
  phone: z.string().optional(),
  projectRequest: projectRequestSchema.optional(),
})

export const authRoutes = new Hono()

authRoutes.post('/login', async (c) => {
  const body = loginSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  const email = body.data.email.trim().toLowerCase()
  const { rows } = await pool.query<{
    id: string
    email: string
    name: string
    company: string | null
    role: 'client' | 'admin'
    phone: string | null
    password_hash: string
  }>(`SELECT * FROM users WHERE LOWER(email) = $1`, [email])

  const row = rows[0]
  if (!row || !(await verifyPassword(body.data.password, row.password_hash))) {
    return c.json({ error: 'Email ou mot de passe incorrect.' }, 401)
  }

  const token = await signToken(row.id)
  const user = {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company ?? undefined,
    role: row.role,
    phone: row.phone ?? undefined,
  }

  return c.json({ token, user })
})

authRoutes.post('/register', async (c) => {
  const body = registerSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Données invalides.' }, 400)

  const email = body.data.email.trim().toLowerCase()
  const exists = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = $1', [email])
  if (exists.rowCount) return c.json({ error: 'Un compte existe déjà avec cet email.' }, 409)

  const id = uid('user')
  const password_hash = await hashPassword(body.data.password)
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, company, phone, role) VALUES ($1,$2,$3,$4,$5,$6,'client')`,
    [id, body.data.email.trim(), password_hash, body.data.name.trim(), body.data.company?.trim() ?? null, body.data.phone?.trim() ?? null],
  )

  const token = await signToken(id)
  const user = {
    id,
    email: body.data.email.trim(),
    name: body.data.name.trim(),
    company: body.data.company?.trim(),
    role: 'client' as const,
    phone: body.data.phone?.trim(),
  }

  await notifyClientWelcome({ to: user.email, name: user.name })

  let projectId: string | undefined
  if (body.data.projectRequest) {
    const created = await createClientProjectRequest(
      {
        id,
        email: user.email,
        name: user.name,
        company: user.company ?? null,
        phone: user.phone ?? null,
      },
      { ...body.data.projectRequest, source: 'signup' },
    )
    projectId = created.projectId
  }

  return c.json({ token, user, projectId }, 201)
})

authRoutes.get('/me', requireAuth, (c) => {
  const user = c.get('user')
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company ?? undefined,
      role: user.role,
      phone: user.phone ?? undefined,
    },
  })
})
