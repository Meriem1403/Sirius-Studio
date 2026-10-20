import type {
  AccountingEntry,
  Appointment,
  AppNotification,
  ClientActivity,
  ClientMessage,
  ClientProject,
  DocumentRequest,
  Invoice,
  NotificationDelivery,
  Payment,
  Prospect,
  Quote,
  Refund,
  UserProfile,
} from '../auth/types'
import { STORE_EVENT } from '../data/store'
import { isApiMode } from './config'
import { apiFetch } from './http'

export interface WorkspaceState {
  projects: ClientProject[]
  messages: ClientMessage[]
  activities: ClientActivity[]
  notifications: AppNotification[]
  profiles: UserProfile[]
  deliveries: NotificationDelivery[]
  documentRequests: DocumentRequest[]
  prospects: Prospect[]
  quotes: Quote[]
  invoices: Invoice[]
  payments: Payment[]
  refunds: Refund[]
  accounting: AccountingEntry[]
  appointments: Appointment[]
}

let cache: WorkspaceState | null = null

export function clearWorkspaceCache() {
  cache = null
}

export function getWorkspaceCache() {
  return cache
}

export function patchWorkspaceCache(patch: Partial<WorkspaceState>) {
  if (!cache) cache = emptyState()
  cache = { ...cache, ...patch }
}

export function emptyState(): WorkspaceState {
  return {
    projects: [],
    messages: [],
    activities: [],
    notifications: [],
    profiles: [],
    deliveries: [],
    documentRequests: [],
    prospects: [],
    quotes: [],
    invoices: [],
    payments: [],
    refunds: [],
    accounting: [],
    appointments: [],
  }
}

export async function syncWorkspace() {
  if (!isApiMode()) return
  try {
    cache = await apiFetch<WorkspaceState>('/workspace/state')
  } catch {
    cache = emptyState()
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { slice: 'projects' } }))
}

export type WorkspaceCollectionKey =
  | 'projects'
  | 'activities'
  | 'notifications'
  | 'profiles'
  | 'deliveries'
  | 'documentRequests'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'refunds'
  | 'accounting'
  | 'appointments'

export async function pushWorkspaceCollection(key: WorkspaceCollectionKey, data: unknown) {
  if (!isApiMode()) return
  cache = await apiFetch<WorkspaceState>(`/workspace/${key}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { slice: key } }))
}
