import type { Prospect } from '../auth/types'
import { apiFetch } from './http'

export async function fetchProspects() {
  const data = await apiFetch<{ prospects: Prospect[] }>('/prospects')
  return data.prospects
}

export async function createProspectApi(input: {
  name: string
  company: string
  email: string
  phone?: string
  sector?: string
  notes?: string
}) {
  const data = await apiFetch<{ prospect: Prospect }>('/prospects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.prospect
}

export async function updateProspectApi(id: string, patch: Partial<Pick<Prospect, 'status' | 'notes' | 'score'>>) {
  const data = await apiFetch<{ prospect: Prospect }>(`/prospects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  return data.prospect
}

export async function convertProspectApi(
  id: string,
  input: { projectTitle: string; projectType: string },
) {
  return apiFetch<{
    userId: string
    projectId: string
    tempPassword?: string
    email: string
    name: string
    createdAccount: boolean
    prospect: Prospect
  }>(`/prospects/${id}/convert`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
