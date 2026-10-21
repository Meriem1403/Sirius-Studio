import type { ClientProject } from '../auth/types'
import { apiFetch } from './http'

export type ClientRequestPayload = {
  title: string
  type: string
  message: string
  needs?: string[]
}

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
