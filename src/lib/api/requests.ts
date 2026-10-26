import type { ClientProject } from '../auth/types'
import { apiFetch } from './http'

import type { RegisterProjectRequest } from '../auth/types'

export type ClientRequestPayload = RegisterProjectRequest

export async function submitClientProjectRequest(payload: ClientRequestPayload) {
  return apiFetch<{
    ok: boolean
    projectId: string
    project: ClientProject
    projects: ClientProject[]
  }>('/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
