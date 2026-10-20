import type {
  AccountingEntry,
  Appointment,
  AppNotification,
  ClientActivity,
  ClientDocument,
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
  documents: ClientDocument[]
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
    documents: [],
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
  | 'documents'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'refunds'
  | 'accounting'
  | 'appointments'

let persistChain: Promise<void> = Promise.resolve()

/** Attendre la fin de toutes les écritures workspace en cours (mode API). */
export function flushWorkspacePersist(): Promise<void> {
  return persistChain
}

export function enqueueWorkspacePersist(key: WorkspaceCollectionKey, data: unknown): Promise<void> {
  if (!isApiMode()) return Promise.resolve()
  const run = persistChain.then(async () => {
    cache = await apiFetch<WorkspaceState>(`/workspace/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { slice: key } }))
  })
  persistChain = run.catch(async (err) => {
    console.error('[workspace] persist failed', key, err)
    await syncWorkspace()
  })
  return run
}

export async function pushWorkspaceCollection(key: WorkspaceCollectionKey, data: unknown) {
  await enqueueWorkspacePersist(key, data)
}
