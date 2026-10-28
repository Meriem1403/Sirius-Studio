import { Hono } from 'hono'
import { z } from 'zod'
import { pool, uid } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { notifyAdminNewClientMessage, notifyUserNewReply } from '../services/email.js'

function mapMessage(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    projectId: row.project_id as string,
    projectTitle: row.project_title as string,
    from: row.from_label as string,
    fromUserId: row.from_user_id as string,
    role: row.role as 'client' | 'team',
    content: row.content as string,
    date: (row.sent_at as Date).toISOString(),
    read: row.read as boolean,
    attachments: row.attachments ?? undefined,
    documentRequestId: row.document_request_id ?? undefined,
  }
}

export const messageRoutes = new Hono()

messageRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')
  const projectId = c.req.query('project')

  let query = `SELECT * FROM messages`
  const params: string[] = []

  if (user.role === 'admin') {
    if (projectId) {
      query += ` WHERE project_id = $1`
      params.push(projectId)
    }
  } else {
    query += ` WHERE user_id = $1`
    params.push(user.id)
    if (projectId) {
      query += ` AND project_id = $2`
      params.push(projectId)
    }
  }

  query += ` ORDER BY sent_at ASC`
  const { rows } = await pool.query(query, params)
  return c.json({ messages: rows.map(mapMessage) })
})

const sendSchema = z.object({
  projectId: z.string(),
  projectTitle: z.string(),
  clientUserId: z.string(),
  content: z.string().min(1),
  attachments: z.array(z.unknown()).optional(),
  documentRequestId: z.string().optional(),
})

messageRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user')
  const body = sendSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Message invalide.' }, 400)

  const role = user.role === 'admin' ? 'team' : 'client'
  const fromLabel = user.role === 'admin' ? `${user.name} · Sirius Studio` : user.name

  if (user.role === 'client' && body.data.clientUserId !== user.id) {
    return c.json({ error: 'Accès refusé.' }, 403)
  }

  const id = uid('msg')
  await pool.query(
    `INSERT INTO messages (id, user_id, project_id, project_title, from_label, from_user_id, role, content, attachments, document_request_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)`,
    [
      id,
      body.data.clientUserId,
      body.data.projectId,
      body.data.projectTitle,
      fromLabel,
      user.id,
      role,
      body.data.content.trim(),
      body.data.attachments ? JSON.stringify(body.data.attachments) : null,
      body.data.documentRequestId ?? null,
    ],
  )

  if (role === 'team') {
    const { rows } = await pool.query<{ email: string; name: string }>(
      `SELECT email, name FROM users WHERE id = $1`,
      [body.data.clientUserId],
    )
    const client = rows[0]
    if (client) {
      await notifyUserNewReply({
        to: client.email,
        name: client.name,
        projectTitle: body.data.projectTitle,
        preview: body.data.content.trim().slice(0, 280),
      })
    }
  } else {
    await notifyAdminNewClientMessage({
      clientName: user.name,
      projectTitle: body.data.projectTitle,
      preview: body.data.content.trim().slice(0, 280),
      projectId: body.data.projectId,
    })
  }

  const { rows } = await pool.query(`SELECT * FROM messages WHERE id = $1`, [id])
  return c.json({ message: mapMessage(rows[0]) }, 201)
})

messageRoutes.post('/mark-read', requireAuth, async (c) => {
  const user = c.get('user')
  const projectId = c.req.query('project')

  if (user.role === 'admin') {
    if (projectId) {
      await pool.query(`UPDATE messages SET read = TRUE WHERE role = 'client' AND project_id = $1`, [projectId])
    }
  } else {
    let q = `UPDATE messages SET read = TRUE WHERE user_id = $1 AND role = 'team'`
    const params: string[] = [user.id]
    if (projectId) {
      q += ` AND project_id = $2`
      params.push(projectId)
    }
    await pool.query(q, params)
  }

  return c.json({ ok: true })
})

messageRoutes.get('/projects', requireAuth, async (c) => {
  const user = c.get('user')
  const { rows } =
    user.role === 'admin'
      ? await pool.query(`SELECT p.*, u.name AS client_name, u.email AS client_email FROM projects p JOIN users u ON u.id = p.user_id ORDER BY p.updated_at DESC`)
      : await pool.query(`SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`, [user.id])

  return c.json({ projects: rows })
})

messageRoutes.get('/unread-count', requireAuth, async (c) => {
  const user = c.get('user')
  const { rows } =
    user.role === 'admin'
      ? await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM messages WHERE role = 'client' AND read = FALSE`)
      : await pool.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM messages WHERE user_id = $1 AND role = 'team' AND read = FALSE`,
          [user.id],
        )
  return c.json({ count: Number(rows[0]?.count ?? 0) })
})
