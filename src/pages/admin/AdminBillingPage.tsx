import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  CreditCard,
  Download,
  FileText,
  Plus,
  Receipt,
  RotateCcw,
  Send,
} from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import BillingDocCard from '../../components/billing/BillingDocCard'
import BillingLedgerView from '../../components/billing/BillingLedgerView'
import BillingLineEditor from '../../components/billing/BillingLineEditor'
import BillingStatusBadge from '../../components/billing/BillingStatusBadge'
import BillingTabNav from '../../components/billing/BillingTabNav'
import BillingWorkflowBar, {
  invoiceWorkflowSteps,
  quoteWorkflowSteps,
} from '../../components/billing/BillingWorkflowBar'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useAuth } from '../../context/AuthContext'
import { getAllProjects, getClientAccount } from '../../lib/services/projectService'
import {
  convertQuoteToInvoice,
  createQuoteFromProject,
  exportAccountingCsv,
  formatMoney,
  getBillingStats,
  getInvoiceById,
  getLedgerSummary,
  getPaymentsForInvoice,
  getQuoteById,
  PAYMENT_METHOD_LABELS,
  processRefund,
  releaseBalanceInvoice,
  sendInvoice,
  sendQuote,
  updateInvoice,
  updateQuote,
} from '../../lib/services/billingService'
import { formatDate, formatDateTime } from '../../lib/client/format'
import type { BillingLineItem } from '../../lib/auth/types'

type Tab = 'overview' | 'quotes' | 'invoices' | 'payments' | 'accounting'

const TABS = [
  { id: 'overview' as const, label: 'Vue d\'ensemble', shortLabel: 'Accueil', icon: Calculator },
  { id: 'quotes' as const, label: 'Devis', shortLabel: 'Devis', icon: FileText },
  { id: 'invoices' as const, label: 'Factures', shortLabel: 'Factures', icon: Receipt },
  { id: 'payments' as const, label: 'Paiements', shortLabel: 'Paiements', icon: CreditCard },
  { id: 'accounting' as const, label: 'Comptabilité', shortLabel: 'Compta', icon: ArrowUpRight },
]

function PayProgress({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  return (
    <div className="billing-pay-progress">
      <div className="billing-pay-progress-track">
        <div className="billing-pay-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="billing-pay-progress-labels">
        <span>{formatMoney(paid)} payé</span>
        <span>{pct} % · {formatMoney(total - paid)} restant</span>
      </div>
    </div>
  )
}

export default function AdminBillingPage() {
  const { refresh, accounting, quotes, invoices } = useWorkspace()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [newProjectId, setNewProjectId] = useState('')
  const [editLines, setEditLines] = useState<BillingLineItem[] | null>(null)

  const tab = (searchParams.get('tab') as Tab) || 'overview'
  const selectedQuoteId = searchParams.get('quote')
  const selectedInvoiceId = searchParams.get('invoice')
  const selectedProjectId = searchParams.get('project')

  const stats = getBillingStats()
  const ledger = getLedgerSummary()
  const projects = getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')

  const selectedQuote = selectedQuoteId ? quotes.find((q) => q.id === selectedQuoteId) ?? getQuoteById(selectedQuoteId) : null
  const selectedInvoice = selectedInvoiceId ? invoices.find((i) => i.id === selectedInvoiceId) ?? getInvoiceById(selectedInvoiceId) : null

  const activeLines = useMemo(() => {
    if (selectedQuote) return editLines ?? selectedQuote.lines
    if (selectedInvoice) return editLines ?? selectedInvoice.lines
    return null
  }, [selectedQuote, selectedInvoice, editLines])

  useEffect(() => {
    setEditLines(null)
  }, [selectedQuoteId, selectedInvoiceId])

  useEffect(() => {
    if (selectedProjectId && !newProjectId) setNewProjectId(selectedProjectId)
  }, [selectedProjectId, newProjectId])

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams)
    params.set('tab', next)
    params.delete('quote')
    params.delete('invoice')
    setSearchParams(params)
    setEditLines(null)
  }

  function openQuote(id: string) {
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'quotes')
    params.set('quote', id)
    params.delete('invoice')
    setSearchParams(params)
  }

  function openInvoice(id: string) {
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'invoices')
    params.set('invoice', id)
    params.delete('quote')
    setSearchParams(params)
  }

  function closeDetail() {
    const params = new URLSearchParams(searchParams)
    params.delete('quote')
    params.delete('invoice')
    setSearchParams(params)
    setEditLines(null)
  }

  function handleCreateQuote() {
    const projectId = newProjectId || selectedProjectId
    if (!projectId) return
    const quote = createQuoteFromProject(projectId)
    if (quote) {
      refresh()
      openQuote(quote.id)
    }
  }

  function handleExportCsv() {
    const csv = exportAccountingCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sirius-comptabilite-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const actionItems = [
    ...quotes.filter((q) => q.status === 'draft').map((q) => ({ type: 'quote' as const, item: q })),
    ...invoices.filter((i) => i.status === 'overdue').map((i) => ({ type: 'invoice' as const, item: i })),
    ...invoices.filter((i) => i.status === 'draft').map((i) => ({ type: 'invoice' as const, item: i })),
  ]

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.id === 'quotes' ? quotes.filter((q) => ['draft', 'sent'].includes(q.status)).length
      : t.id === 'invoices' ? invoices.filter((i) => i.amountPaid < i.totalTTC && i.status !== 'cancelled').length
      : undefined,
  }))

  const showDetail = selectedQuote || selectedInvoice

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Administration"
        title="Facturation & comptabilité"
        subtitle="Devis, factures, encaissements et journal comptable automatique."
        icon={Receipt}
      />

      {!showDetail && (
        <div className="client-stats">
          <div className="client-stat-card workspace-stat-card">
            <div className="client-stat-icon client-stat-icon--green"><ArrowUpRight size={20} /></div>
            <div>
              <p className="client-stat-value">{formatMoney(stats.totalRevenue)}</p>
              <p className="client-stat-label">CA HT</p>
            </div>
          </div>
          <div className="client-stat-card workspace-stat-card">
            <div className="client-stat-icon client-stat-icon--amber"><Receipt size={20} /></div>
            <div>
              <p className="client-stat-value">{formatMoney(stats.totalOutstanding)}</p>
              <p className="client-stat-label">Encours</p>
            </div>
          </div>
          <div className="client-stat-card workspace-stat-card">
            <div className="client-stat-icon client-stat-icon--red"><ArrowDownLeft size={20} /></div>
            <div>
              <p className="client-stat-value">{formatMoney(stats.totalOverdue)}</p>
              <p className="client-stat-label">En retard</p>
            </div>
          </div>
          <div className="client-stat-card workspace-stat-card">
            <div className="client-stat-icon client-stat-icon--cyan"><CreditCard size={20} /></div>
            <div>
              <p className="client-stat-value">{formatMoney(stats.paymentsThisMonth)}</p>
              <p className="client-stat-label">Ce mois</p>
            </div>
          </div>
        </div>
      )}

      <BillingTabNav tabs={tabsWithCounts} active={tab} onChange={setTab} />

      {showDetail && (
        <section className="client-detail-panel client-section billing-detail">
          <div className="billing-detail-header">
            <div className="min-w-0">
              <p className="client-page-eyebrow">
                {selectedQuote ? 'Devis' : 'Facture'} {selectedQuote?.number ?? selectedInvoice?.number}
              </p>
              <h2 className="client-section-title">{selectedQuote?.projectTitle ?? selectedInvoice?.projectTitle}</h2>
              <p className="client-page-subtitle">
                {selectedQuote?.clientName ?? selectedInvoice?.clientName}
                {(selectedQuote?.clientCompany ?? selectedInvoice?.clientCompany) &&
                  ` · ${selectedQuote?.clientCompany ?? selectedInvoice?.clientCompany}`}
              </p>
            </div>
            <div className="billing-detail-actions">
              {selectedQuote && <BillingStatusBadge kind="quote" status={selectedQuote.status} compact />}
              {selectedInvoice && <BillingStatusBadge kind="invoice" status={selectedInvoice.status} compact />}
              <button type="button" className="btn-secondary" onClick={closeDetail}>Fermer</button>
            </div>
          </div>

          {selectedQuote && <BillingWorkflowBar steps={quoteWorkflowSteps(selectedQuote.status)} />}
          {selectedInvoice && (
            <>
              <BillingWorkflowBar steps={invoiceWorkflowSteps(selectedInvoice.status, selectedInvoice.amountPaid, selectedInvoice.totalTTC)} />
              <PayProgress paid={selectedInvoice.amountPaid} total={selectedInvoice.totalTTC} />
            </>
          )}

          {activeLines && (
            <BillingLineEditor
              lines={activeLines}
              onChange={setEditLines}
              readOnly={selectedQuote?.status === 'converted' || selectedInvoice?.status === 'paid'}
            />
          )}

          {selectedQuote && selectedQuote.status !== 'converted' && (
            <div className="billing-action-row">
              <button type="button" className="btn-secondary" onClick={() => { if (selectedQuote && activeLines) { updateQuote(selectedQuote.id, { lines: activeLines }); refresh(); setEditLines(null) } }}>Enregistrer</button>
              {selectedQuote.status === 'draft' && (
                <button type="button" className="btn-primary" onClick={() => { sendQuote(selectedQuote.id); refresh() }}>
                  <Send size={14} /> Envoyer
                </button>
              )}
              {['sent', 'signed'].includes(selectedQuote.status) && !selectedQuote.depositInvoiceId && (
                <>
                  <button type="button" className="btn-secondary" onClick={() => { const inv = convertQuoteToInvoice(selectedQuote.id, { isDeposit: true, depositPercent: 30 }); if (inv) { refresh(); openInvoice(inv.id) } }}>Acompte 30 %</button>
                  <button type="button" className="btn-primary" onClick={() => { const inv = convertQuoteToInvoice(selectedQuote.id); if (inv) { refresh(); openInvoice(inv.id) } }}>Convertir en facture</button>
                </>
              )}
              {selectedQuote.depositInvoiceId && (
                <>
                  <button type="button" className="btn-secondary" onClick={() => openInvoice(selectedQuote.depositInvoiceId!)}>Facture acompte</button>
                  {selectedQuote.balanceInvoiceId && (
                    <button type="button" className="btn-secondary" onClick={() => openInvoice(selectedQuote.balanceInvoiceId!)}>Facture solde</button>
                  )}
                </>
              )}
            </div>
          )}

          {selectedInvoice && selectedInvoice.status !== 'paid' && (
            <div className="billing-action-row">
              <button type="button" className="btn-secondary" onClick={() => { if (activeLines) { updateInvoice(selectedInvoice.id, { lines: activeLines }); refresh(); setEditLines(null) } }}>Enregistrer</button>
              {selectedInvoice.status === 'draft' && (
                <button type="button" className="btn-primary" onClick={() => { sendInvoice(selectedInvoice.id); refresh() }}>
                  <Send size={14} /> Émettre
                </button>
              )}
            </div>
          )}

          {selectedInvoice && (
            <dl className="billing-meta-grid">
              <div className="billing-meta-item"><dt>Échéance</dt><dd>{selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : '—'}</dd></div>
              <div className="billing-meta-item"><dt>Reste dû</dt><dd>{formatMoney(selectedInvoice.totalTTC - selectedInvoice.amountPaid)}</dd></div>
              {selectedInvoice.phase && (
                <div className="billing-meta-item"><dt>Phase</dt><dd>{selectedInvoice.phase === 'deposit' ? 'Acompte production' : selectedInvoice.phase === 'balance' ? 'Solde livraison' : 'Facture complète'}</dd></div>
              )}
            </dl>
          )}

          {selectedInvoice?.phase === 'balance' && selectedInvoice.status === 'draft' && selectedInvoice.quoteId && (
            <div className="billing-action-row">
              <button type="button" className="btn-primary" onClick={() => { releaseBalanceInvoice(selectedInvoice.quoteId!); refresh() }}>
                Émettre le solde au client (livraison)
              </button>
            </div>
          )}

          {selectedInvoice && getPaymentsForInvoice(selectedInvoice.id).length > 0 && (
            <div className="billing-payments-list">
              <h3 className="billing-section-title">Paiements</h3>
              {getPaymentsForInvoice(selectedInvoice.id).map((p) => (
                <div key={p.id} className="billing-payment-row">
                  <div>
                    <p className="billing-payment-ref">{p.reference}</p>
                    <p className="client-message-hint">
                      {formatMoney(p.amount)} · {PAYMENT_METHOD_LABELS[p.method]}
                      {p.cardLast4 && ` · **** ${p.cardLast4}`} · {formatDateTime(p.completedAt ?? p.createdAt)}
                    </p>
                  </div>
                  <button type="button" className="btn-secondary billing-refund-btn" onClick={() => { setSelectedPaymentId(p.id); setRefundAmount(String(p.amount)) }}>
                    <RotateCcw size={14} /> Rembourser
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedPaymentId && user && (
            <div className="billing-refund-form">
              <h3 className="billing-section-title">Remboursement</h3>
              <div className="billing-refund-fields">
                <label className="auth-field block">
                  <span className="auth-label">Montant (€)</span>
                  <input type="number" className="admin-input" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} min={0} step={0.01} />
                </label>
                <label className="auth-field block">
                  <span className="auth-label">Motif</span>
                  <input type="text" className="admin-input" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Ex. annulation partielle" />
                </label>
              </div>
              <div className="billing-action-row">
                <button type="button" className="btn-secondary" onClick={() => setSelectedPaymentId(null)}>Annuler</button>
                <button type="button" className="btn-primary" onClick={() => {
                  const amount = parseFloat(refundAmount)
                  if (amount && refundReason.trim()) {
                    processRefund({ paymentId: selectedPaymentId, amount, reason: refundReason, admin: user })
                    refresh()
                    setSelectedPaymentId(null)
                    setRefundReason('')
                    setRefundAmount('')
                  }
                }}>Confirmer</button>
              </div>
            </div>
          )}
        </section>
      )}

      {!showDetail && tab === 'overview' && (
        <section className="client-section">
          <div className="billing-create-row">
            <select className="admin-input billing-project-select" value={newProjectId || selectedProjectId || ''} onChange={(e) => setNewProjectId(e.target.value)}>
              <option value="">Choisir un projet client…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title} — {getClientAccount(p.userId)?.name}</option>
              ))}
            </select>
            <button type="button" className="btn-primary" onClick={handleCreateQuote} disabled={!newProjectId && !selectedProjectId}>
              <Plus size={14} /> Nouveau devis
            </button>
          </div>

          {actionItems.length > 0 && (
            <div className="mt-6">
              <h2 className="billing-section-title">À traiter</h2>
              <ul className="billing-doc-list billing-action-list">
                {actionItems.slice(0, 5).map(({ type, item }) => (
                  <li key={item.id}>
                    <BillingDocCard
                      number={type === 'quote' ? (item as typeof quotes[0]).number : (item as typeof invoices[0]).number}
                      subtitle={type === 'quote' ? `Devis brouillon · ${(item as typeof quotes[0]).clientName}` : `Facture · ${(item as typeof invoices[0]).clientName}`}
                      amount={formatMoney(item.totalTTC)}
                      badge={<BillingStatusBadge kind={type === 'quote' ? 'quote' : 'invoice'} status={item.status} compact />}
                      icon={type === 'quote' ? FileText : Receipt}
                      onClick={() => type === 'quote' ? openQuote(item.id) : openInvoice(item.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="billing-action-hint mt-4">
            Journal : {accounting.length} écritures · Balance {ledger.balanced ? 'équilibrée' : 'à vérifier'} · TVA {formatMoney(ledger.vat)}
          </p>
        </section>
      )}

      {!showDetail && tab === 'quotes' && (
        <section className="client-section">
          <ul className="billing-doc-list">
            {quotes.map((q) => (
              <li key={q.id}>
                <BillingDocCard
                  number={q.number}
                  subtitle={`${q.clientName} · ${q.projectTitle}`}
                  amount={formatMoney(q.totalTTC)}
                  badge={<BillingStatusBadge kind="quote" status={q.status} compact />}
                  icon={FileText}
                  onClick={() => openQuote(q.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!showDetail && tab === 'invoices' && (
        <section className="client-section">
          <ul className="billing-doc-list">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <BillingDocCard
                  number={`${inv.number}${inv.isDeposit ? ' (acompte)' : ''}`}
                  subtitle={`${inv.clientName} · échéance ${inv.dueDate ? formatDate(inv.dueDate) : '—'}`}
                  amount={formatMoney(inv.totalTTC)}
                  badge={<BillingStatusBadge kind="invoice" status={inv.status} compact />}
                  icon={Receipt}
                  onClick={() => openInvoice(inv.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!showDetail && tab === 'payments' && (
        <section className="client-section">
          <ul className="billing-doc-list">
            {invoices.flatMap((inv) =>
              getPaymentsForInvoice(inv.id).map((p) => (
                <li key={p.id}>
                  <BillingDocCard
                    number={p.reference}
                    subtitle={`${inv.number} · ${PAYMENT_METHOD_LABELS[p.method]}`}
                    amount={formatMoney(p.amount)}
                    badge={<span className="billing-status billing-status--paid">Encaissé</span>}
                    icon={CreditCard}
                    onClick={() => openInvoice(inv.id)}
                  />
                </li>
              )),
            )}
          </ul>
        </section>
      )}

      {!showDetail && tab === 'accounting' && (
        <section className="client-section workspace-panel">
          <div className="billing-accounting-header">
            <div>
              <h2 className="client-section-title">Journal comptable</h2>
              <p className="client-page-subtitle">Écritures auto à chaque facture, encaissement et remboursement.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={handleExportCsv}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="billing-ledger-summary">
            <span>Débit {formatMoney(ledger.totalDebit)}</span>
            <span>Crédit {formatMoney(ledger.totalCredit)}</span>
            <span>CA {formatMoney(ledger.revenue)}</span>
            <span>TVA {formatMoney(ledger.vat)}</span>
          </div>
          <BillingLedgerView entries={accounting} />
        </section>
      )}
    </>
  )
}
