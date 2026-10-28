import { apiFetch } from './http'

export interface ClientAccount {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  blockedAt?: string
  blockReason?: string
}

export async function fetchClients() {
  const data = await apiFetch<{ clients: ClientAccount[] }>('/clients')
  return data.clients
}

export function blockClient(id: string, reason: string) {
  return apiFetch<{ ok: boolean }>(`/clients/${id}/block`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function unblockClient(id: string) {
  return apiFetch<{ ok: boolean }>(`/clients/${id}/unblock`, { method: 'POST' })
}
