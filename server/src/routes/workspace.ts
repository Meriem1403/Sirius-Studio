import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import {
  COLLECTION_KEYS,
  loadWorkspaceState,
  saveWorkspaceCollection,
  upsertAppointments,
  type CollectionKey,
} from '../workspace/state.js'

export const workspaceRoutes = new Hono()

workspaceRoutes.use('*', requireAuth)

workspaceRoutes.get('/state', async (c) => {
  const user = c.get('user')
  const state = await loadWorkspaceState(user)
  return c.json(state)
})

const keySchema = z.enum(COLLECTION_KEYS)

workspaceRoutes.put('/:key', async (c) => {
  const user = c.get('user')
  const parsed = keySchema.safeParse(c.req.param('key'))
  if (!parsed.success) return c.json({ error: 'Collection inconnue.' }, 400)

  const key = parsed.data as CollectionKey
  const body = await c.req.json()

  try {
    if (key === 'appointments') {
      await upsertAppointments(Array.isArray(body) ? body : body.data, user)
    } else {
      await saveWorkspaceCollection(key, Array.isArray(body) ? body : body.data, user)
    }
    const state = await loadWorkspaceState(user)
    return c.json(state)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur'
    if (msg === 'FORBIDDEN') return c.json({ error: 'Accès refusé.' }, 403)
    throw e
  }
})
