import { apiFetch } from './http'

export interface ClientAccount {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
}

export async function fetchClients() {
  const data = await apiFetch<{ clients: ClientAccount[] }>('/clients')
  return data.clients
}
