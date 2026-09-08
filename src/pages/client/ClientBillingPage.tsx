import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, FileText, PenLine, Receipt } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import BillingDocCard from '../../components/billing/BillingDocCard'
import BillingLineEditor from '../../components/billing/BillingLineEditor'
import BillingStatusBadge from '../../components/billing/BillingStatusBadge'
import BillingWorkflowBar, { invoiceWorkflowSteps, quoteWorkflowSteps } from '../../components/billing/BillingWorkflowBar'
import SignaturePad from '../../components/billing/SignaturePad'
import EmptyState from '../../components/client/EmptyState'
import {
  formatMoney,
  getPaymentsForInvoice,
  getQuoteById,
  PAYMENT_METHOD_LABELS,
  CLIENT_PAYMENT_METHODS,
  recordPayment,
  signInvoice,
  signQuote,
} from '../../lib/services/billingService'
import { formatDate, formatDateTime } from '../../lib/client/format'
import type { PaymentMethod } from '../../lib/auth/types'

export default function ClientBillingPage() {
  const { user } = useAuth()
  const { refresh, quotes: allQuotes, invoices: allInvoices } = useWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [paying, setPaying] = useState(false)
  const [billingNotice, setBillingNotice] = useState<string | null>(null)

  if (!user) return null

  const quotes = allQuotes.filter((q) => q.userId === user.id)
  const invoices = allInvoices.filter((i) => i.userId === user.id)
  const selectedQuoteId = searchParams.get('quote')
  const selectedInvoiceId = searchParams.get('invoice')
  const selectedQuote = selectedQuoteId ? quotes.find((q) => q.id === selectedQuoteId) ?? null : null
  const selectedInvoice = selectedInvoiceId ? invoices.find((i) => i.id === selectedInvoiceId) ?? null : null

  const pendingQuotes = quotes.filter((q) => q.status === 'sent')
  const pendingInvoices = invoices.filter(
    (i) => ['sent', 'signed', 'partial', 'overdue'].includes(i.status) && i.amountPaid < i.totalTTC,
  )

  function closeDetail() {
    setSignatureData(null)
    setBillingNotice(null)
    setSearchParams({})
  }

  function handleSignQuote() {
    if (!selectedQuote || !signatureData || !user) return
    signQuote(selectedQuote.id, {
      signedAt: new Date().toISOString(),
      signedBy: user.name,
      signatureDataUrl: signatureData,
    })
    refresh()
    setSignatureData(null)
    const updated = getQuoteById(selectedQuote.id)
    if (updated?.depositInvoiceId) {
      setBillingNotice('Devis signé. Votre facture d’acompte est prête — réglez-la pour lancer la production.')
      setSearchParams({ invoice: updated.depositInvoiceId })
    } else {
      closeDetail()
    }
  }

  function handleSignInvoice() {
    if (!selectedInvoice || !signatureData || !user) return
    signInvoice(selectedInvoice.id, {
      signedAt: new Date().toISOString(),
      signedBy: user.name,
      signatureDataUrl: signatureData,
    })
    refresh()
    setSignatureData(null)
  }

  function handlePay() {
    if (!selectedInvoice) return
    const remaining = selectedInvoice.totalTTC - selectedInvoice.amountPaid
    if (remaining <= 0) return
    setPaying(true)
    setTimeout(() => {
      recordPayment({
        invoiceId: selectedInvoice.id,
        amount: remaining,
        method: payMethod,
        cardLast4: payMethod === 'card' ? cardNumber.slice(-4) || '4242' : undefined,
      })
      setPaying(false)
      refresh()
      closeDetail()
    }, 1200)
  }

  const canPay =
    selectedInvoice &&
    ['sent', 'signed', 'partial', 'overdue'].includes(selectedInvoice.status) &&
    selectedInvoice.amountPaid < selectedInvoice.totalTTC

  const needsQuoteSignature = selectedQuote?.status === 'sent' && !selectedQuote.signature
  const needsInvoiceSignature =
    selectedInvoice &&
    !selectedInvoice.signature &&
    ['sent', 'partial', 'overdue'].includes(selectedInvoice.status)

  const payPct = selectedInvoice
    ? Math.min(100, Math.round((selectedInvoice.amountPaid / selectedInvoice.totalTTC) * 100))
    : 0

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Finances"
        title="Devis & factures"
        subtitle="Signez et réglez vos documents en quelques clics."
        icon={Receipt}
      />

      {(pendingQuotes.length > 0 || pendingInvoices.length > 0) && !selectedQuote && !selectedInvoice && (
        <section className="client-alert client-section">
          <p className="client-alert-title">Actions en attente</p>
          <p className="client-alert-desc">
            {pendingQuotes.length > 0 && `${pendingQuotes.length} devis à signer`}
            {pendingQuotes.length > 0 && pendingInvoices.length > 0 && ' · '}
            {pendingInvoices.length > 0 && `${pendingInvoices.length} facture(s) à régler`}
          </p>
        </section>
      )}

      {billingNotice && (
        <section className="client-alert client-section" role="status">
          <p className="client-alert-desc">{billingNotice}</p>
        </section>
      )}

      {(selectedQuote || selectedInvoice) && (
        <section className="client-detail-panel client-section billing-detail">
          <div className="billing-detail-header">
            <div className="min-w-0">
              <p className="client-page-eyebrow">
                {selectedQuote ? 'Devis' : 'Facture'} {selectedQuote?.number ?? selectedInvoice?.number}
              </p>
              <h2 className="client-section-title">{selectedQuote?.projectTitle ?? selectedInvoice?.projectTitle}</h2>
            </div>
            <div className="billing-detail-actions">
              {selectedQuote && <BillingStatusBadge kind="quote" status={selectedQuote.status} compact />}
              {selectedInvoice && <BillingStatusBadge kind="invoice" status={selectedInvoice.status} compact />}
              <button type="button" className="btn-secondary" onClick={closeDetail}>Retour</button>
            </div>
          </div>

          {selectedQuote && <BillingWorkflowBar steps={quoteWorkflowSteps(selectedQuote.status)} />}
          {selectedInvoice && (
            <>
              <BillingWorkflowBar steps={invoiceWorkflowSteps(selectedInvoice.status, selectedInvoice.amountPaid, selectedInvoice.totalTTC)} />
              <div className="billing-pay-progress">
                <div className="billing-pay-progress-track">
                  <div className="billing-pay-progress-fill" style={{ width: `${payPct}%` }} />
                </div>
                <div className="billing-pay-progress-labels">
                  <span>{formatMoney(selectedInvoice.amountPaid)} payé</span>
                  <span>{formatMoney(selectedInvoice.totalTTC - selectedInvoice.amountPaid)} restant</span>
                </div>
              </div>
            </>
          )}

          {selectedQuote && (
            <>
              <BillingLineEditor lines={selectedQuote.lines} onChange={() => {}} readOnly />
              {selectedQuote.notes && <p className="client-message-hint mt-3">{selectedQuote.notes}</p>}
              {selectedQuote.validUntil && (
                <p className="client-message-hint">Valable jusqu'au {formatDate(selectedQuote.validUntil)}</p>
              )}
              {selectedQuote.signature && (
                <div className="billing-signed-block">
                  <PenLine size={16} />
                  Signé par {selectedQuote.signature.signedBy} le {formatDateTime(selectedQuote.signature.signedAt)}
                  {selectedQuote.signature.signatureDataUrl && (
                    <img src={selectedQuote.signature.signatureDataUrl} alt="Signature" className="billing-signature-preview" />
                  )}
                </div>
              )}
              {needsQuoteSignature && (
                <>
                  <SignaturePad onChange={setSignatureData} />
                  <button type="button" className="btn-primary billing-action-row mt-3" onClick={handleSignQuote} disabled={!signatureData}>
                    Signer le devis
                  </button>
                </>
              )}
            </>
          )}

          {selectedInvoice && (
            <>
              <BillingLineEditor lines={selectedInvoice.lines} onChange={() => {}} readOnly />
              {selectedInvoice.dueDate && (
                <p className="client-message-hint mt-3">Échéance : {formatDate(selectedInvoice.dueDate)}</p>
              )}
              {selectedInvoice.phase === 'deposit' && (
                <p className="client-alert-desc mt-2">Acompte production — le solde sera demandé à la livraison.</p>
              )}
              {selectedInvoice.phase === 'balance' && (
                <p className="client-alert-desc mt-2">Solde final — à régler pour finaliser la livraison.</p>
              )}
              {getPaymentsForInvoice(selectedInvoice.id).map((p) => (
                <p key={p.id} className="client-message-hint">
                  Paiement {formatMoney(p.amount)} · {formatDateTime(p.completedAt ?? p.createdAt)}
                </p>
              ))}
              {needsInvoiceSignature && (
                <>
                  <SignaturePad onChange={setSignatureData} />
                  <button type="button" className="btn-secondary mt-3" onClick={handleSignInvoice} disabled={!signatureData}>
                    Signer la facture
                  </button>
                </>
              )}
              {canPay && (
                <div className="billing-pay-block">
                  <h3 className="billing-section-title">Règlement en ligne</h3>
                  <div className="billing-pay-methods">
                    {CLIENT_PAYMENT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`client-filter-chip ${payMethod === m ? 'client-filter-chip--active' : ''}`}
                        onClick={() => setPayMethod(m)}
                      >
                        {m === 'apple_pay' ? ' Apple Pay' : PAYMENT_METHOD_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  {payMethod === 'card' && (
                    <label className="auth-field block mt-4">
                      <span className="auth-label">Carte (simulation)</span>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className="btn-primary mt-4"
                    onClick={handlePay}
                    disabled={paying || (payMethod === 'card' && cardNumber.length < 12)}
                  >
                    <CreditCard size={14} />
                    {paying
                      ? 'Traitement…'
                      : payMethod === 'apple_pay'
                        ? `Apple Pay · ${formatMoney(selectedInvoice.totalTTC - selectedInvoice.amountPaid)}`
                        : `Payer ${formatMoney(selectedInvoice.totalTTC - selectedInvoice.amountPaid)}`}
                  </button>
                  <p className="client-message-hint mt-2">Paiement simulé — aucun débit réel.</p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {!selectedQuote && !selectedInvoice && (
        quotes.length === 0 && invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Aucun document financier"
            description="Vos devis et factures apparaîtront ici dès qu'ils seront émis par Sirius Studio."
          />
        ) : (
          <>
            {quotes.length > 0 && (
              <section className="client-section workspace-panel">
                <h2 className="billing-section-title">Mes devis</h2>
                <ul className="billing-doc-list">
                  {quotes.map((q) => (
                    <li key={q.id}>
                      <BillingDocCard
                        number={q.number}
                        subtitle={q.projectTitle}
                        amount={formatMoney(q.totalTTC)}
                        badge={<BillingStatusBadge kind="quote" status={q.status} compact />}
                        icon={FileText}
                        onClick={() => setSearchParams({ quote: q.id })}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {invoices.length > 0 && (
              <section className="client-section workspace-panel">
                <h2 className="billing-section-title">Mes factures</h2>
                <ul className="billing-doc-list">
                  {invoices.map((inv) => (
                    <li key={inv.id}>
                      <BillingDocCard
                        number={inv.number}
                        subtitle={inv.projectTitle}
                        amount={formatMoney(inv.totalTTC)}
                        badge={<BillingStatusBadge kind="invoice" status={inv.status} compact />}
                        icon={Receipt}
                        onClick={() => setSearchParams({ invoice: inv.id })}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )
      )}
    </>
  )
}
