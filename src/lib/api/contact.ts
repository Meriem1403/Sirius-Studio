import { apiFetch } from './http'

export type ContactPayload = {
  name: string
  email: string
  phone?: string
  company?: string
  siret?: string
  situation: 'existing' | 'idea' | 'unknown'
  website?: string
  needs: string[]
  objectives: string[]
  message?: string
}

export async function submitContactLead(payload: ContactPayload) {
  return apiFetch<{ ok: boolean; prospectId: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
