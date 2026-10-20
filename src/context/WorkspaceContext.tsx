import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AccountingEntry,
  Appointment,
  AppNotification,
  ClientActivity,
  ClientMessage,
  ClientProject,
  ClientDocument,
  DocumentRequest,
  Invoice,
  NotificationDelivery,
  Payment,
  Prospect,
  Quote,
  Refund,
  UserProfile,
} from '../lib/auth/types'
import { isApiMode } from '../lib/api/config'
import { syncWorkspace } from '../lib/api/workspaceSync'
import {
  getActivities,
  getMessages,
  getNotifications,
  getProfiles,
  getProjects,
  getDeliveries,
  getDocumentRequests,
  getDocuments,
  getProspects,
  getQuotes,
  getInvoices,
  getPayments,
  getRefunds,
  getAccountingEntries,
  getAppointments,
  STORE_EVENT,
} from '../lib/data/store'

interface WorkspaceContextValue {
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
  refresh: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    if (isApiMode()) {
      void syncWorkspace().finally(() => setTick((t) => t + 1))
      return
    }
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener(STORE_EVENT, handler)
    return () => window.removeEventListener(STORE_EVENT, handler)
  }, [])

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      projects: getProjects(),
      messages: getMessages(),
      activities: getActivities(),
      notifications: getNotifications(),
      profiles: getProfiles(),
      deliveries: getDeliveries(),
      documentRequests: getDocumentRequests(),
      documents: getDocuments(),
      prospects: getProspects(),
      quotes: getQuotes(),
      invoices: getInvoices(),
      payments: getPayments(),
      refunds: getRefunds(),
      accounting: getAccountingEntries(),
      appointments: getAppointments(),
      refresh,
    }),
    [tick, refresh],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
