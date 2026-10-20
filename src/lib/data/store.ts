import type {
  AccountingEntry,
  AppNotification,
  Appointment,
  ClientActivity,
  ClientMessage,
  ClientProject,
  ClientDocument,
  DocumentRequest,
  Invoice,
  NotificationDelivery,
  NotificationPrefs,
  Payment,
  Prospect,
  Quote,
  Refund,
  UserProfile,
} from '../auth/types'
import { FIXTURE_ACTIVITIES, FIXTURE_PROJECTS } from '../../fixtures/projects'
import { FIXTURE_MESSAGES } from '../../fixtures/messages'
import { FIXTURE_PROFILES } from '../../fixtures/profiles'
import { FIXTURE_DOCUMENT_REQUESTS } from '../../fixtures/documentRequests'
import { FIXTURE_PROSPECTS } from '../../fixtures/prospects'
import { FIXTURE_APPOINTMENTS } from '../../fixtures/appointments'
import {
  FIXTURE_ACCOUNTING,
  FIXTURE_INVOICES,
  FIXTURE_PAYMENTS,
  FIXTURE_QUOTES,
  FIXTURE_REFUNDS,
} from '../../fixtures/billing'
import { isApiMode } from '../api/config'
import {
  enqueueWorkspacePersist,
  flushWorkspacePersist,
  getWorkspaceCache,
  patchWorkspaceCache,
} from '../api/workspaceSync'
import { FIXTURE_DOCUMENTS } from '../../fixtures/documents'

const KEYS = {
  projects: 'sirius_store_projects',
  messages: 'sirius_store_messages',
  activities: 'sirius_store_activities',
  notifications: 'sirius_store_notifications',
  profiles: 'sirius_store_profiles',
  deliveries: 'sirius_store_deliveries',
  documentRequests: 'sirius_store_document_requests',
  documents: 'sirius_store_documents',
  prospects: 'sirius_store_prospects',
  quotes: 'sirius_store_quotes',
  invoices: 'sirius_store_invoices',
  payments: 'sirius_store_payments',
  refunds: 'sirius_store_refunds',
  accounting: 'sirius_store_accounting',
  appointments: 'sirius_store_appointments',
  initialized: 'sirius_store_initialized',
} as const

export const STORE_EVENT = 'sirius-store-change'

type StoreSlice =
  | 'projects'
  | 'messages'
  | 'activities'
  | 'notifications'
  | 'profiles'
  | 'deliveries'
  | 'documentRequests'
  | 'documents'
  | 'prospects'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'refunds'
  | 'accounting'
  | 'appointments'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function emitChange(slice: StoreSlice) {
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { slice } }))
}

const STORE_VERSION = '6'

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-seed-1',
    userId: 'fixture-client-2',
    type: 'mockup_ready' as const,
    title: 'Votre maquette est prête',
    body: 'Consultez la maquette E-commerce Mercier & Co et indiquez si elle vous convient.',
    date: '2026-09-07T09:05:00',
    read: false,
    projectId: 'proj-3',
    link: '/espace-client/projets/proj-3',
  },
]

function ensureInitialized() {
  if (isApiMode()) return
  const version = localStorage.getItem('sirius_store_version')
  if (version === STORE_VERSION && localStorage.getItem(KEYS.initialized)) return

  write(KEYS.projects, FIXTURE_PROJECTS)
  write(KEYS.messages, FIXTURE_MESSAGES)
  write(KEYS.activities, FIXTURE_ACTIVITIES)
  write(KEYS.notifications, SEED_NOTIFICATIONS)
  write(KEYS.profiles, FIXTURE_PROFILES)
  write(KEYS.deliveries, [])
  write(KEYS.documentRequests, FIXTURE_DOCUMENT_REQUESTS)
  write(KEYS.documents, FIXTURE_DOCUMENTS)
  write(KEYS.prospects, FIXTURE_PROSPECTS)
  write(KEYS.quotes, FIXTURE_QUOTES)
  write(KEYS.invoices, FIXTURE_INVOICES)
  write(KEYS.payments, FIXTURE_PAYMENTS)
  write(KEYS.refunds, FIXTURE_REFUNDS)
  write(KEYS.accounting, FIXTURE_ACCOUNTING)
  write(KEYS.appointments, FIXTURE_APPOINTMENTS)
  localStorage.setItem(KEYS.initialized, '1')
  localStorage.setItem('sirius_store_version', STORE_VERSION)
}

ensureInitialized()

function persistCollection(
  key: Parameters<typeof enqueueWorkspacePersist>[0],
  data: unknown,
  slice: StoreSlice,
  optimistic?: Partial<WorkspaceState>,
) {
  if (optimistic) patchWorkspaceCache(optimistic)
  emitChange(slice)
  void enqueueWorkspacePersist(key, data)
}

export { flushWorkspacePersist }

type WorkspaceState = NonNullable<ReturnType<typeof getWorkspaceCache>>

export function getProjects(): ClientProject[] {
  if (isApiMode()) return getWorkspaceCache()?.projects ?? []
  ensureInitialized()
  return read<ClientProject[]>(KEYS.projects, FIXTURE_PROJECTS)
}

export function saveProjects(projects: ClientProject[]) {
  if (isApiMode()) {
    persistCollection('projects', projects, 'projects', { projects })
    return
  }
  write(KEYS.projects, projects)
  emitChange('projects')
}

export function updateProject(projectId: string, patch: Partial<ClientProject>) {
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === projectId)
  if (index === -1) return null
  projects[index] = { ...projects[index], ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
  saveProjects(projects)
  return projects[index]
}

export function getMessages(): ClientMessage[] {
  if (isApiMode()) return getWorkspaceCache()?.messages ?? []
  ensureInitialized()
  return read<ClientMessage[]>(KEYS.messages, FIXTURE_MESSAGES)
}

export function saveMessages(messages: ClientMessage[]) {
  if (isApiMode()) {
    patchWorkspaceCache({ messages })
    emitChange('messages')
    return
  }
  write(KEYS.messages, messages)
  emitChange('messages')
}

export function appendMessage(message: ClientMessage) {
  const messages = getMessages()
  messages.push(message)
  saveMessages(messages)
  return message
}

export function getActivities(): ClientActivity[] {
  if (isApiMode()) return getWorkspaceCache()?.activities ?? []
  ensureInitialized()
  return read<ClientActivity[]>(KEYS.activities, FIXTURE_ACTIVITIES)
}

export function saveActivities(activities: ClientActivity[]) {
  if (isApiMode()) {
    persistCollection('activities', activities, 'activities', { activities })
    return
  }
  write(KEYS.activities, activities)
  emitChange('activities')
}

export function appendActivity(activity: ClientActivity) {
  const activities = getActivities()
  activities.unshift(activity)
  saveActivities(activities)
  return activity
}

export function getNotifications(): AppNotification[] {
  if (isApiMode()) return getWorkspaceCache()?.notifications ?? []
  ensureInitialized()
  return read<AppNotification[]>(KEYS.notifications, [])
}

export function saveNotifications(notifications: AppNotification[]) {
  if (isApiMode()) {
    persistCollection('notifications', notifications, 'notifications', { notifications })
    return
  }
  write(KEYS.notifications, notifications)
  emitChange('notifications')
}

export function appendNotification(notification: AppNotification) {
  const notifications = getNotifications()
  notifications.unshift(notification)
  saveNotifications(notifications)
  return notification
}

export function getProfiles(): UserProfile[] {
  if (isApiMode()) return getWorkspaceCache()?.profiles ?? []
  ensureInitialized()
  return read<UserProfile[]>(KEYS.profiles, FIXTURE_PROFILES)
}

export function saveProfiles(profiles: UserProfile[]) {
  if (isApiMode()) {
    persistCollection('profiles', profiles, 'profiles', { profiles })
    return
  }
  write(KEYS.profiles, profiles)
  emitChange('profiles')
}

export function getProfile(userId: string): UserProfile {
  const profiles = getProfiles()
  const found = profiles.find((p) => p.userId === userId)
  if (found) return found
  const fallback: UserProfile = {
    userId,
    notificationPrefs: defaultNotificationPrefs(),
  }
  return fallback
}

export function updateProfile(userId: string, patch: Partial<UserProfile>) {
  const profiles = getProfiles()
  const index = profiles.findIndex((p) => p.userId === userId)
  if (index === -1) {
    profiles.push({ userId, notificationPrefs: defaultNotificationPrefs(), ...patch })
  } else {
    profiles[index] = { ...profiles[index], ...patch }
  }
  saveProfiles(profiles)
  return getProfile(userId)
}

export function getDeliveries(): NotificationDelivery[] {
  if (isApiMode()) return getWorkspaceCache()?.deliveries ?? []
  ensureInitialized()
  return read<NotificationDelivery[]>(KEYS.deliveries, [])
}

export function appendDelivery(delivery: NotificationDelivery) {
  const deliveries = [delivery, ...getDeliveries()]
  if (isApiMode()) {
    persistCollection('deliveries', deliveries, 'deliveries', { deliveries })
    return delivery
  }
  write(KEYS.deliveries, deliveries)
  emitChange('deliveries')
  return delivery
}

export function defaultNotificationPrefs(): NotificationPrefs {
  return {
    email: true,
    sms: true,
    mockupReady: true,
    messages: true,
    quotes: true,
    statusUpdates: true,
  }
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getDocumentRequests(): DocumentRequest[] {
  if (isApiMode()) return getWorkspaceCache()?.documentRequests ?? []
  ensureInitialized()
  return read<DocumentRequest[]>(KEYS.documentRequests, FIXTURE_DOCUMENT_REQUESTS)
}

export function saveDocumentRequests(requests: DocumentRequest[]) {
  if (isApiMode()) {
    persistCollection('documentRequests', requests, 'documentRequests', { documentRequests: requests })
    return
  }
  write(KEYS.documentRequests, requests)
  emitChange('documentRequests')
}

export function getDocuments(): ClientDocument[] {
  if (isApiMode()) return getWorkspaceCache()?.documents ?? []
  ensureInitialized()
  return read<ClientDocument[]>(KEYS.documents, FIXTURE_DOCUMENTS)
}

export function saveDocuments(documents: ClientDocument[]) {
  if (isApiMode()) {
    persistCollection('documents', documents, 'documents', { documents })
    return
  }
  write(KEYS.documents, documents)
  emitChange('documents')
}

export function getProspects(): Prospect[] {
  if (isApiMode()) return getWorkspaceCache()?.prospects ?? []
  ensureInitialized()
  return read<Prospect[]>(KEYS.prospects, FIXTURE_PROSPECTS)
}

export function saveProspects(prospects: Prospect[]) {
  if (isApiMode()) {
    patchWorkspaceCache({ prospects })
    emitChange('prospects')
    return
  }
  write(KEYS.prospects, prospects)
  emitChange('prospects')
}

export function getQuotes(): Quote[] {
  if (isApiMode()) return getWorkspaceCache()?.quotes ?? []
  ensureInitialized()
  return read<Quote[]>(KEYS.quotes, FIXTURE_QUOTES)
}

export function saveQuotes(quotes: Quote[]) {
  if (isApiMode()) {
    persistCollection('quotes', quotes, 'quotes', { quotes })
    return
  }
  write(KEYS.quotes, quotes)
  emitChange('quotes')
}

export function getInvoices(): Invoice[] {
  if (isApiMode()) return getWorkspaceCache()?.invoices ?? []
  ensureInitialized()
  return read<Invoice[]>(KEYS.invoices, FIXTURE_INVOICES)
}

export function saveInvoices(invoices: Invoice[]) {
  if (isApiMode()) {
    persistCollection('invoices', invoices, 'invoices', { invoices })
    return
  }
  write(KEYS.invoices, invoices)
  emitChange('invoices')
}

export function getPayments(): Payment[] {
  if (isApiMode()) return getWorkspaceCache()?.payments ?? []
  ensureInitialized()
  return read<Payment[]>(KEYS.payments, FIXTURE_PAYMENTS)
}

export function savePayments(payments: Payment[]) {
  if (isApiMode()) {
    persistCollection('payments', payments, 'payments', { payments })
    return
  }
  write(KEYS.payments, payments)
  emitChange('payments')
}

export function getRefunds(): Refund[] {
  if (isApiMode()) return getWorkspaceCache()?.refunds ?? []
  ensureInitialized()
  return read<Refund[]>(KEYS.refunds, FIXTURE_REFUNDS)
}

export function saveRefunds(refunds: Refund[]) {
  if (isApiMode()) {
    persistCollection('refunds', refunds, 'refunds', { refunds })
    return
  }
  write(KEYS.refunds, refunds)
  emitChange('refunds')
}

export function getAccountingEntries(): AccountingEntry[] {
  if (isApiMode()) return getWorkspaceCache()?.accounting ?? []
  ensureInitialized()
  return read<AccountingEntry[]>(KEYS.accounting, FIXTURE_ACCOUNTING)
}

export function saveAccountingEntries(entries: AccountingEntry[]) {
  if (isApiMode()) {
    persistCollection('accounting', entries, 'accounting', { accounting: entries })
    return
  }
  write(KEYS.accounting, entries)
  emitChange('accounting')
}

export function appendAccountingEntries(entries: AccountingEntry[]) {
  const current = getAccountingEntries()
  current.unshift(...entries)
  saveAccountingEntries(current)
}

export function getAppointments(): Appointment[] {
  if (isApiMode()) return getWorkspaceCache()?.appointments ?? []
  ensureInitialized()
  return read<Appointment[]>(KEYS.appointments, FIXTURE_APPOINTMENTS)
}

export function saveAppointments(appointments: Appointment[]) {
  if (isApiMode()) {
    persistCollection('appointments', appointments, 'appointments', { appointments })
    return
  }
  write(KEYS.appointments, appointments)
  emitChange('appointments')
}

export function appendAppointment(appointment: Appointment) {
  const items = getAppointments()
  items.push(appointment)
  saveAppointments(items)
  return appointment
}
