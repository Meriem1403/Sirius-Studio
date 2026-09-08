import type {
  BillingLineItem,
  BillingStats,
  ElectronicSignature,
  Invoice,
  Payment,
  PaymentMethod,
  Quote,
  User,
} from '../auth/types'
import {
  entriesForInvoiceSent,
  entriesForPayment,
  entriesForRefund,
  summarizeLedger,
} from '../billing/accounting'
import { computeTotals, newLineItem } from '../billing/calc'
import {
  appendAccountingEntries,
  appendActivity,
  getAccountingEntries,
  getInvoices,
  getPayments,
  getProjects,
  getQuotes,
  getRefunds,
  saveInvoices,
  savePayments,
  saveProjects,
  saveQuotes,
  saveRefunds,
  uid,
} from '../data/store'
import { FIXTURE_ACCOUNTS } from '../../fixtures/users'
import { notifyAdmins, notifyUser } from './notificationService'

function getProjectById(projectId: string) {
  return getProjects().find((p) => p.id === projectId)
}

function getClientAccount(userId: string) {
  return FIXTURE_ACCOUNTS.find((a) => a.id === userId)
}

function nextNumber(prefix: 'DEV' | 'FAC', items: { number: string }[]) {
  const year = new Date().getFullYear()
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`)
  const max = items.reduce((m, item) => {
    const match = item.number.match(pattern)
    return match ? Math.max(m, parseInt(match[1], 10)) : m
  }, 0)
  return `${prefix}-${year}-${String(max + 1).padStart(3, '0')}`
}

function nextPaymentRef() {
  const payments = getPayments()
  const max = payments.reduce((m, p) => {
    const match = p.reference.match(/PAY-\d+-(\d+)/)
    return match ? Math.max(m, parseInt(match[1], 10)) : m
  }, 0)
  return `PAY-${new Date().getFullYear()}-${String(max + 1).padStart(4, '0')}`
}

function syncInvoiceTotals(invoice: Invoice): Invoice {
  const totals = computeTotals(invoice.lines)
  return { ...invoice, ...totals }
}

function syncQuoteTotals(quote: Quote): Quote {
  const totals = computeTotals(quote.lines)
  return { ...quote, ...totals }
}

function markOverdueInvoices() {
  const now = new Date()
  const invoices = getInvoices()
  let changed = false
  const updated = invoices.map((inv) => {
    if (
      inv.dueDate &&
      ['sent', 'signed', 'partial'].includes(inv.status) &&
      inv.amountPaid < inv.totalTTC &&
      new Date(inv.dueDate) < now
    ) {
      changed = true
      return { ...inv, status: 'overdue' as const }
    }
    return inv
  })
  if (changed) saveInvoices(updated)
}

export function getAllQuotes() {
  return getQuotes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getQuoteById(id: string) {
  return getQuotes().find((q) => q.id === id)
}

export function getQuotesForUser(userId: string) {
  return getAllQuotes().filter((q) => q.userId === userId)
}

export function getQuotesForProject(projectId: string) {
  return getAllQuotes().filter((q) => q.projectId === projectId)
}

export function getAllInvoices() {
  markOverdueInvoices()
  return getInvoices().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getInvoiceById(id: string) {
  markOverdueInvoices()
  return getInvoices().find((i) => i.id === id)
}

export function getInvoicesForUser(userId: string) {
  return getAllInvoices().filter((i) => i.userId === userId)
}

export function getInvoicesForProject(projectId: string) {
  return getAllInvoices().filter((i) => i.projectId === projectId)
}

export function getPaymentsForInvoice(invoiceId: string) {
  return getPayments().filter((p) => p.invoiceId === invoiceId)
}

export function getRefundsForPayment(paymentId: string) {
  return getRefunds().filter((r) => r.paymentId === paymentId)
}

export function createQuoteFromProject(projectId: string, lines?: BillingLineItem[]) {
  const project = getProjectById(projectId)
  if (!project) return null
  const client = getClientAccount(project.userId)
  if (!client) return null

  const defaultLines = lines ?? [
    newLineItem({
      label: `Prestation — ${project.type}`,
      description: project.description.slice(0, 120),
      quantity: 1,
      unitPriceHT: 0,
    }),
  ]
  const totals = computeTotals(defaultLines)
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)

  const quote: Quote = {
    id: uid('quote'),
    number: nextNumber('DEV', getQuotes()),
    userId: project.userId,
    projectId,
    projectTitle: project.title,
    clientName: client.name,
    clientCompany: client.company,
    status: 'draft',
    lines: defaultLines,
    ...totals,
    validUntil: validUntil.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    notes: 'Validité 30 jours. Acompte de 30 % à la commande.',
  }

  const quotes = getQuotes()
  quotes.unshift(quote)
  saveQuotes(quotes)

  appendActivity({
    id: uid('act'),
    userId: project.userId,
    projectId,
    label: `Devis ${quote.number} créé`,
    date: new Date().toISOString(),
    type: 'file',
  })

  return quote
}

export function updateQuote(quoteId: string, patch: Partial<Pick<Quote, 'lines' | 'notes' | 'validUntil'>>) {
  const quotes = getQuotes()
  const index = quotes.findIndex((q) => q.id === quoteId)
  if (index === -1) return null
  let updated = { ...quotes[index], ...patch }
  if (patch.lines) updated = syncQuoteTotals(updated)
  quotes[index] = updated
  saveQuotes(quotes)
  return updated
}

export function sendQuote(quoteId: string) {
  const quotes = getQuotes()
  const index = quotes.findIndex((q) => q.id === quoteId)
  if (index === -1 || quotes[index].status === 'converted') return null

  const now = new Date().toISOString()
  quotes[index] = { ...quotes[index], status: 'sent', sentAt: now }
  saveQuotes(quotes)
  const quote = quotes[index]

  notifyUser({
    userId: quote.userId,
    type: 'quote_sent',
    title: `Devis ${quote.number} disponible`,
    body: `Consultez et signez votre devis pour « ${quote.projectTitle} » (${formatMoney(quote.totalTTC)} TTC).`,
    projectId: quote.projectId,
    link: `/espace-client/facturation?quote=${quote.id}`,
  })

  appendActivity({
    id: uid('act'),
    userId: quote.userId,
    projectId: quote.projectId,
    label: `Devis ${quote.number} envoyé`,
    date: now,
    type: 'file',
  })

  return quote
}

export function signQuote(quoteId: string, signature: ElectronicSignature) {
  const quotes = getQuotes()
  const index = quotes.findIndex((q) => q.id === quoteId)
  if (index === -1) return null
  if (!['sent', 'draft'].includes(quotes[index].status)) return null

  const now = signature.signedAt
  quotes[index] = {
    ...quotes[index],
    status: 'signed',
    signedAt: now,
    signature,
  }
  saveQuotes(quotes)
  const quote = quotes[index]

  notifyAdmins({
    type: 'quote_signed',
    title: `Devis signé · ${quote.number}`,
    body: `${quote.clientName} a signé le devis (${formatMoney(quote.totalTTC)} TTC).`,
    projectId: quote.projectId,
    link: `/espace-admin/facturation?quote=${quote.id}`,
  })

  appendActivity({
    id: uid('act'),
    userId: quote.userId,
    projectId: quote.projectId,
    label: `Devis ${quote.number} signé électroniquement`,
    date: now,
    type: 'validation',
  })

  issuePaymentPlanFromQuote(quoteId)

  return getQuoteById(quoteId)
}

/** À la signature : facture d'acompte (production) + facture de solde (livraison). */
export function issuePaymentPlanFromQuote(quoteId: string) {
  const quote = getQuoteById(quoteId)
  if (!quote || quote.depositInvoiceId) return null

  const depositPercent = quote.depositPercent ?? 30
  const balancePercent = 100 - depositPercent

  const depositLines = quote.lines.map((l) => ({
    ...l,
    id: uid('line'),
    label: `Acompte ${depositPercent} % — ${l.label}`,
    description: 'Paiement requis pour lancer la production',
    unitPriceHT: Math.round(l.unitPriceHT * (depositPercent / 100) * 100) / 100,
  }))

  const balanceLines = quote.lines.map((l) => ({
    ...l,
    id: uid('line'),
    label: `Solde ${balancePercent} % — ${l.label}`,
    description: 'À régler à la livraison du projet',
    unitPriceHT: Math.round(l.unitPriceHT * (balancePercent / 100) * 100) / 100,
  }))

  const depositTotals = computeTotals(depositLines)
  const balanceTotals = computeTotals(balanceLines)
  const dueDeposit = new Date()
  dueDeposit.setDate(dueDeposit.getDate() + 7)
  const dueBalance = new Date()
  dueBalance.setDate(dueBalance.getDate() + 60)

  const depositInvoice: Invoice = {
    id: uid('inv'),
    number: nextNumber('FAC', getInvoices()),
    userId: quote.userId,
    projectId: quote.projectId,
    projectTitle: quote.projectTitle,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    quoteId: quote.id,
    status: 'draft',
    lines: depositLines,
    ...depositTotals,
    amountPaid: 0,
    dueDate: dueDeposit.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    phase: 'deposit',
    isDeposit: true,
    depositPercent,
    notes: `Acompte de ${depositPercent} % — production lancée après paiement.`,
  }

  const balanceInvoice: Invoice = {
    id: uid('inv'),
    number: nextNumber('FAC', [...getInvoices(), depositInvoice]),
    userId: quote.userId,
    projectId: quote.projectId,
    projectTitle: quote.projectTitle,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    quoteId: quote.id,
    status: 'draft',
    lines: balanceLines,
    ...balanceTotals,
    amountPaid: 0,
    dueDate: dueBalance.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    phase: 'balance',
    notes: `Solde de ${balancePercent} % — à régler à la livraison.`,
  }

  const invoices = getInvoices()
  invoices.unshift(balanceInvoice, depositInvoice)
  saveInvoices(invoices)

  const quotes = getQuotes()
  const qIdx = quotes.findIndex((q) => q.id === quoteId)
  if (qIdx !== -1) {
    quotes[qIdx] = {
      ...quotes[qIdx],
      status: 'accepted',
      depositInvoiceId: depositInvoice.id,
      balanceInvoiceId: balanceInvoice.id,
    }
    saveQuotes(quotes)
  }

  sendInvoice(depositInvoice.id)

  return { depositInvoice: getInvoiceById(depositInvoice.id)!, balanceInvoice: getInvoiceById(balanceInvoice.id)! }
}

export function releaseBalanceInvoice(quoteId: string) {
  const quote = getQuoteById(quoteId)
  if (!quote?.balanceInvoiceId) return null
  const inv = getInvoiceById(quote.balanceInvoiceId)
  if (!inv || inv.status !== 'draft') return inv
  return sendInvoice(quote.balanceInvoiceId)
}

export function convertQuoteToInvoice(quoteId: string, options?: { isDeposit?: boolean; depositPercent?: number }) {
  const quote = getQuoteById(quoteId)
  if (!quote || !['signed', 'accepted', 'sent'].includes(quote.status)) return null

  const isDeposit = options?.isDeposit ?? false
  const depositPercent = options?.depositPercent ?? 30

  let lines = quote.lines
  if (isDeposit) {
    lines = quote.lines.map((l) => ({
      ...l,
      id: uid('line'),
      label: `Acompte ${depositPercent} % — ${l.label}`,
      unitPriceHT: Math.round(l.unitPriceHT * (depositPercent / 100) * 100) / 100,
    }))
  }

  const totals = computeTotals(lines)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  const invoice: Invoice = {
    id: uid('inv'),
    number: nextNumber('FAC', getInvoices()),
    userId: quote.userId,
    projectId: quote.projectId,
    projectTitle: quote.projectTitle,
    clientName: quote.clientName,
    clientCompany: quote.clientCompany,
    quoteId: quote.id,
    status: 'draft',
    lines,
    ...totals,
    amountPaid: 0,
    dueDate: dueDate.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    isDeposit,
    depositPercent: isDeposit ? depositPercent : undefined,
  }

  const invoices = getInvoices()
  invoices.unshift(invoice)
  saveInvoices(invoices)

  const quotes = getQuotes()
  const qIndex = quotes.findIndex((q) => q.id === quoteId)
  if (qIndex !== -1) {
    quotes[qIndex] = { ...quotes[qIndex], status: 'converted', convertedInvoiceId: invoice.id }
    saveQuotes(quotes)
  }

  return invoice
}

export function createInvoiceFromProject(projectId: string, lines: BillingLineItem[]) {
  const project = getProjectById(projectId)
  if (!project) return null
  const client = getClientAccount(project.userId)
  if (!client) return null

  const totals = computeTotals(lines)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)

  const invoice: Invoice = syncInvoiceTotals({
    id: uid('inv'),
    number: nextNumber('FAC', getInvoices()),
    userId: project.userId,
    projectId,
    projectTitle: project.title,
    clientName: client.name,
    clientCompany: client.company,
    status: 'draft',
    lines,
    ...totals,
    amountPaid: 0,
    dueDate: dueDate.toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  })

  const invoices = getInvoices()
  invoices.unshift(invoice)
  saveInvoices(invoices)
  return invoice
}

export function updateInvoice(invoiceId: string, patch: Partial<Pick<Invoice, 'lines' | 'notes' | 'dueDate'>>) {
  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === invoiceId)
  if (index === -1 || invoices[index].status === 'paid') return null
  let updated = { ...invoices[index], ...patch }
  if (patch.lines) updated = syncInvoiceTotals(updated)
  invoices[index] = updated
  saveInvoices(invoices)
  return updated
}

export function sendInvoice(invoiceId: string) {
  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === invoiceId)
  if (index === -1) return null

  const now = new Date().toISOString()
  const invoice = syncInvoiceTotals({ ...invoices[index], status: 'sent', sentAt: now })
  invoices[index] = invoice
  saveInvoices(invoices)

  appendAccountingEntries(entriesForInvoiceSent(invoice))

  notifyUser({
    userId: invoice.userId,
    type: 'invoice_sent',
    title: `Facture ${invoice.number}`,
    body: `Facture de ${formatMoney(invoice.totalTTC)} TTC pour « ${invoice.projectTitle} ». Échéance : ${invoice.dueDate ?? '—'}.`,
    projectId: invoice.projectId,
    link: `/espace-client/facturation?invoice=${invoice.id}`,
  })

  appendActivity({
    id: uid('act'),
    userId: invoice.userId,
    projectId: invoice.projectId,
    label: `Facture ${invoice.number} émise`,
    date: now,
    type: 'file',
  })

  return invoice
}

export function signInvoice(invoiceId: string, signature: ElectronicSignature) {
  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === invoiceId)
  if (index === -1) return null

  invoices[index] = {
    ...invoices[index],
    status: invoices[index].status === 'draft' ? 'signed' : invoices[index].status,
    signedAt: signature.signedAt,
    signature,
  }
  saveInvoices(invoices)
  return invoices[index]
}

export function recordPayment(input: {
  invoiceId: string
  amount: number
  method: PaymentMethod
  cardLast4?: string
}) {
  const invoice = getInvoiceById(input.invoiceId)
  if (!invoice) return null

  const remaining = Math.round((invoice.totalTTC - invoice.amountPaid) * 100) / 100
  if (input.amount <= 0 || input.amount > remaining + 0.01) return null

  const now = new Date().toISOString()
  const payment: Payment = {
    id: uid('pay'),
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    userId: invoice.userId,
    amount: input.amount,
    method: input.method,
    status: 'completed',
    reference: nextPaymentRef(),
    createdAt: now,
    completedAt: now,
    cardLast4: input.cardLast4,
  }

  const payments = getPayments()
  payments.unshift(payment)
  savePayments(payments)

  const newPaid = Math.round((invoice.amountPaid + input.amount) * 100) / 100
  const fullyPaid = newPaid >= invoice.totalTTC - 0.01
  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === invoice.id)
  invoices[index] = {
    ...invoices[index],
    amountPaid: newPaid,
    status: fullyPaid ? 'paid' : 'partial',
    paidAt: fullyPaid ? now : invoices[index].paidAt,
  }
  saveInvoices(invoices)
  const updatedInvoice = invoices[index]

  appendAccountingEntries(entriesForPayment(payment, updatedInvoice))

  notifyUser({
    userId: invoice.userId,
    type: 'payment_received',
    title: `Paiement reçu · ${formatMoney(input.amount)}`,
    body: `Votre règlement pour la facture ${invoice.number} a bien été enregistré.`,
    projectId: invoice.projectId,
    link: `/espace-client/facturation?invoice=${invoice.id}`,
  })

  notifyAdmins({
    type: 'invoice_paid',
    title: fullyPaid ? `Facture soldée · ${invoice.number}` : `Paiement partiel · ${invoice.number}`,
    body: `${formatMoney(input.amount)} encaissé (${PAYMENT_METHOD_LABELS[input.method]}).`,
    projectId: invoice.projectId,
    link: `/espace-admin/facturation?invoice=${invoice.id}`,
  })

  appendActivity({
    id: uid('act'),
    userId: invoice.userId,
    projectId: invoice.projectId,
    label: `Paiement ${formatMoney(input.amount)} · ${invoice.number}`,
    date: now,
    type: 'status',
  })

  if (updatedInvoice.phase === 'deposit' && fullyPaid) {
    const projects = getProjects()
    const pIdx = projects.findIndex((p) => p.id === invoice.projectId)
    if (pIdx !== -1) {
      projects[pIdx] = {
        ...projects[pIdx],
        status: 'en_cours',
        nextStep: 'Production lancée — acompte reçu',
        progress: Math.max(projects[pIdx].progress, 40),
      }
      saveProjects(projects)
    }
    notifyAdmins({
      type: 'invoice_paid',
      title: `Acompte reçu · production lancée`,
      body: `${invoice.clientName} a réglé l'acompte (${formatMoney(input.amount)}).`,
      projectId: invoice.projectId,
      link: `/espace-admin/projets/${invoice.projectId}`,
    })
  }

  if (updatedInvoice.phase === 'balance' && fullyPaid) {
    const projects = getProjects()
    const pIdx = projects.findIndex((p) => p.id === invoice.projectId)
    if (pIdx !== -1) {
      projects[pIdx] = {
        ...projects[pIdx],
        status: 'livre',
        nextStep: 'Projet soldé et livré',
        progress: 100,
      }
      saveProjects(projects)
    }
  }

  return { payment, invoice: updatedInvoice }
}

export function processRefund(input: {
  paymentId: string
  amount: number
  reason: string
  admin: User
}) {
  const payment = getPayments().find((p) => p.id === input.paymentId)
  if (!payment || payment.status !== 'completed') return null

  const existingRefunds = getRefundsForPayment(payment.id)
  const alreadyRefunded = existingRefunds
    .filter((r) => r.status === 'completed')
    .reduce((s, r) => s + r.amount, 0)
  if (input.amount <= 0 || input.amount > payment.amount - alreadyRefunded) return null

  const invoice = getInvoiceById(payment.invoiceId)
  if (!invoice) return null

  const now = new Date().toISOString()
  const refund = {
    id: uid('ref'),
    paymentId: payment.id,
    invoiceId: invoice.id,
    userId: invoice.userId,
    amount: input.amount,
    reason: input.reason.trim(),
    status: 'completed' as const,
    createdAt: now,
    completedAt: now,
  }

  const refunds = getRefunds()
  refunds.unshift(refund)
  saveRefunds(refunds)

  const invoices = getInvoices()
  const index = invoices.findIndex((i) => i.id === invoice.id)
  const newPaid = Math.round((invoices[index].amountPaid - input.amount) * 100) / 100
  invoices[index] = {
    ...invoices[index],
    amountPaid: Math.max(0, newPaid),
    status: newPaid <= 0 ? 'refunded' : newPaid >= invoices[index].totalTTC ? 'paid' : 'partial',
  }
  saveInvoices(invoices)

  appendAccountingEntries(entriesForRefund(refund, payment, invoices[index]))

  notifyUser({
    userId: invoice.userId,
    type: 'refund_processed',
    title: `Remboursement · ${formatMoney(input.amount)}`,
    body: `Un remboursement a été effectué sur la facture ${invoice.number}. Motif : ${input.reason}`,
    projectId: invoice.projectId,
    link: `/espace-client/facturation?invoice=${invoice.id}`,
  })

  appendActivity({
    id: uid('act'),
    userId: invoice.userId,
    projectId: invoice.projectId,
    label: `Remboursement ${formatMoney(input.amount)} · ${invoice.number}`,
    date: now,
    type: 'status',
  })

  return refund
}

export function autoCreateQuoteOnRequest(projectId: string) {
  const existing = getQuotesForProject(projectId).find((q) =>
    ['draft', 'sent'].includes(q.status),
  )
  if (existing) return existing
  return createQuoteFromProject(projectId, [
    newLineItem({
      label: 'Prestation digitale sur mesure',
      description: 'Devis généré automatiquement suite à votre demande',
      quantity: 1,
      unitPriceHT: 0,
    }),
  ])
}

export function getBillingStats(): BillingStats {
  markOverdueInvoices()
  const invoices = getInvoices()
  const payments = getPayments()
  const refunds = getRefunds()
  const quotes = getQuotes()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalRevenue = getAccountingEntries()
    .filter((e) => e.type === 'revenue')
    .reduce((s, e) => s + e.credit, 0)

  const totalOutstanding = invoices
    .filter((i) => ['sent', 'signed', 'partial', 'overdue'].includes(i.status))
    .reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0)

  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((s, i) => s + (i.totalTTC - i.amountPaid), 0)

  const paymentsThisMonth = payments
    .filter((p) => p.status === 'completed' && new Date(p.completedAt ?? p.createdAt) >= monthStart)
    .reduce((s, p) => s + p.amount, 0)

  const refundsThisMonth = refunds
    .filter((r) => r.status === 'completed' && new Date(r.completedAt ?? r.createdAt) >= monthStart)
    .reduce((s, r) => s + r.amount, 0)

  return {
    totalRevenue,
    totalOutstanding,
    totalOverdue,
    quotesPending: quotes.filter((q) => ['draft', 'sent'].includes(q.status)).length,
    invoicesUnpaid: invoices.filter((i) => i.amountPaid < i.totalTTC && i.status !== 'cancelled').length,
    paymentsThisMonth,
    refundsThisMonth,
  }
}

export function countBillingActions() {
  const stats = getBillingStats()
  return stats.quotesPending + stats.invoicesUnpaid
}

export function countPendingClientBilling(userId: string) {
  const quotes = getQuotesForUser(userId).filter((q) => q.status === 'sent')
  const invoices = getInvoicesForUser(userId).filter(
    (i) => ['sent', 'signed', 'partial', 'overdue'].includes(i.status) && i.amountPaid < i.totalTTC,
  )
  return quotes.length + invoices.length
}

export function exportAccountingCsv() {
  const entries = getAccountingEntries().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const header = 'Date;Libellé;Compte;Libellé compte;Débit;Crédit;Référence;Type'
  const rows = entries.map(
    (e) =>
      `${e.date.slice(0, 10)};${e.label};${e.accountCode};${e.accountLabel};${e.debit.toFixed(2)};${e.credit.toFixed(2)};${e.reference};${e.type}`,
  )
  return [header, ...rows].join('\n')
}

export function getLedgerSummary() {
  return summarizeLedger(getAccountingEntries())
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Carte bancaire',
  apple_pay: 'Apple Pay',
}

export const CLIENT_PAYMENT_METHODS: PaymentMethod[] = ['card', 'apple_pay']

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

export { PAYMENT_METHOD_LABELS }
