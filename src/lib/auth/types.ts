export type UserRole = 'client' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: UserRole
  phone?: string
}

export interface Session {
  user: User
  remember: boolean
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  company?: string
  phone?: string
}

export interface NotificationPrefs {
  email: boolean
  sms: boolean
  mockupReady: boolean
  messages: boolean
  quotes: boolean
  statusUpdates: boolean
}

export interface UserProfile {
  userId: string
  phone?: string
  notificationPrefs: NotificationPrefs
}

export type ProjectStatus = 'maquette' | 'en_cours' | 'validation' | 'livre'

export type MockupClientChoice =
  | 'pending'
  | 'quote_requested'
  | 'revision_colors'
  | 'revision_layout'
  | 'revision_content'
  | 'revision_typography'
  | 'revision_other'
  | 'new_direction'
  | 'pause_project'
  | 'abandon'

export interface MockupValidation {
  choice: MockupClientChoice
  feedback?: string
  submittedAt?: string
}

export interface ProjectMilestone {
  id: string
  label: string
  done: boolean
  date?: string
}

export interface ClientProject {
  id: string
  userId: string
  title: string
  type: string
  status: ProjectStatus
  progress: number
  updatedAt: string
  nextStep: string
  description: string
  startedAt: string
  deadline?: string
  milestones: ProjectMilestone[]
  mockupUrl?: string
  mockupPublishedAt?: string
  validation?: MockupValidation
}

export interface ClientActivity {
  id: string
  userId: string
  projectId?: string
  label: string
  date: string
  type: 'message' | 'file' | 'status' | 'validation' | 'notification'
}

export interface MessageAttachment {
  id: string
  name: string
  size: string
  mimeType: string
  label: string
  reason: string
  dataUrl?: string
}

export interface ClientMessage {
  id: string
  userId: string
  projectId: string
  projectTitle: string
  from: string
  fromUserId: string
  role: 'client' | 'team'
  content: string
  date: string
  read: boolean
  attachments?: MessageAttachment[]
  documentRequestId?: string
}

export type DocumentRequestStatus = 'pending' | 'fulfilled' | 'cancelled'

export interface DocumentRequest {
  id: string
  userId: string
  projectId: string
  projectTitle: string
  requestedBy: string
  requestedByName: string
  title: string
  reason: string
  status: DocumentRequestStatus
  createdAt: string
  fulfilledAt?: string
  responseMessageId?: string
}

export type ProspectSource = 'auto' | 'manual'
export type ProspectStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface Prospect {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  sector: string
  source: ProspectSource
  status: ProspectStatus
  score: number
  notes?: string
  createdAt: string
  lastContactAt?: string
  convertedUserId?: string
}

export interface ClientDocument {
  id: string
  userId: string
  projectId: string
  projectTitle: string
  name: string
  kind: 'maquette' | 'devis' | 'contrat' | 'livraison'
  size: string
  date: string
  url?: string
}

export type NotificationType =
  | 'mockup_ready'
  | 'validation_received'
  | 'quote_requested'
  | 'revision_requested'
  | 'message'
  | 'status'
  | 'quote_sent'
  | 'document_request'
  | 'document_received'
  | 'attachment'
  | 'invoice_sent'
  | 'invoice_paid'
  | 'payment_received'
  | 'refund_processed'
  | 'quote_signed'

export type NotificationChannel = 'in_app' | 'email' | 'sms'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  date: string
  read: boolean
  projectId?: string
  link?: string
}

export interface NotificationDelivery {
  id: string
  userId: string
  channel: 'email' | 'sms'
  subject: string
  body: string
  date: string
  status: 'sent' | 'failed'
  recipient: string
}

/* ── Facturation & comptabilité ── */

export interface BillingLineItem {
  id: string
  label: string
  description?: string
  quantity: number
  unitPriceHT: number
  vatRate: number
}

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'signed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'signed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'card' | 'apple_pay'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type RefundStatus = 'pending' | 'completed' | 'failed'

export interface ElectronicSignature {
  signedAt: string
  signedBy: string
  signatureDataUrl: string
}

export interface Quote {
  id: string
  number: string
  userId: string
  projectId: string
  projectTitle: string
  clientName: string
  clientCompany?: string
  status: QuoteStatus
  lines: BillingLineItem[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  notes?: string
  validUntil?: string
  createdAt: string
  sentAt?: string
  signedAt?: string
  signature?: ElectronicSignature
  convertedInvoiceId?: string
  depositPercent?: number
  depositInvoiceId?: string
  balanceInvoiceId?: string
}

export interface Invoice {
  id: string
  number: string
  userId: string
  projectId: string
  projectTitle: string
  clientName: string
  clientCompany?: string
  quoteId?: string
  status: InvoiceStatus
  lines: BillingLineItem[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  amountPaid: number
  dueDate?: string
  notes?: string
  createdAt: string
  sentAt?: string
  signedAt?: string
  paidAt?: string
  signature?: ElectronicSignature
  phase?: 'deposit' | 'balance' | 'full'
  isDeposit?: boolean
  depositPercent?: number
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  userId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference: string
  createdAt: string
  completedAt?: string
  cardLast4?: string
}

export interface Refund {
  id: string
  paymentId: string
  invoiceId: string
  userId: string
  amount: number
  reason: string
  status: RefundStatus
  createdAt: string
  completedAt?: string
}

export type AccountingEntryType =
  | 'revenue'
  | 'receivable'
  | 'payment'
  | 'refund'
  | 'vat_collected'
  | 'vat_refund'

export interface AccountingEntry {
  id: string
  date: string
  label: string
  type: AccountingEntryType
  accountCode: string
  accountLabel: string
  debit: number
  credit: number
  reference: string
  invoiceId?: string
  paymentId?: string
  refundId?: string
  quoteId?: string
  userId?: string
  autoGenerated: boolean
}

export interface BillingStats {
  totalRevenue: number
  totalOutstanding: number
  totalOverdue: number
  quotesPending: number
  invoicesUnpaid: number
  paymentsThisMonth: number
  refundsThisMonth: number
}

export type AppointmentType = 'discovery' | 'review' | 'delivery' | 'kickoff' | 'other'

export interface Appointment {
  id: string
  title: string
  description?: string
  startAt: string
  endAt: string
  userId: string
  clientName: string
  projectId?: string
  projectTitle?: string
  createdBy: string
  location?: string
  meetingUrl?: string
  type: AppointmentType
}
