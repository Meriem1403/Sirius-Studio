import { apiFetch } from './http'

export function exportMyData() {
  return apiFetch<Record<string, unknown>>('/privacy/export')
}

export function eraseMyAccount() {
  return apiFetch<{ ok: boolean; message: string }>('/privacy/erase', {
    method: 'POST',
    body: JSON.stringify({ confirm: 'EFFACER' }),
  })
}
