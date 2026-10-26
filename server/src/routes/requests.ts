import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { createClientProjectRequest } from '../services/clientProjectRequest.js'
import { maquetteBriefSchema, resolveBriefTitle, resolveBriefType } from '../schemas/maquetteBrief.js'

export const requestRoutes = new Hono()

requestRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user')
  if (user.role !== 'client') {
    return c.json({ error: 'Réservé aux comptes client.' }, 403)
  }

  const body = maquetteBriefSchema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: 'Demande invalide. Vérifiez vos besoins et votre message.' }, 400)

  const pr = body.data
  const result = await createClientProjectRequest(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company ?? null,
      phone: user.phone ?? null,
    },
    {
      title: resolveBriefTitle(pr, user.company),
      type: resolveBriefType(pr),
      message: pr.message.trim(),
      needs: pr.needs,
      situation: pr.situation,
      website: pr.website,
      objectives: pr.objectives,
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
