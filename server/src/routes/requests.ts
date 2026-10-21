import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { createClientProjectRequest } from '../services/clientProjectRequest.js'

const requestSchema = z.object({
  title: z.string().min(3).max(120),
  type: z.string().min(2).max(80),
  message: z.string().min(10).max(8000),
  needs: z.array(z.string()).max(12).optional(),
})

export const requestRoutes = new Hono()

requestRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user')
  if (user.role !== 'client') {
    return c.json({ error: 'Réservé aux comptes client.' }, 403)
  }

  const body = requestSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Demande invalide. Vérifiez le titre et le message (10 caractères min.).' }, 400)

  const result = await createClientProjectRequest(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company ?? null,
      phone: user.phone ?? null,
    },
    {
      title: body.data.title,
      type: body.data.type,
      message: body.data.message,
      needs: body.data.needs,
      source: 'portal',
    },
  )

  return c.json(
    {
      ok: true,
      projectId: result.projectId,
      project: result.project,
      projects: result.projects,
    },
    201,
  )
})
