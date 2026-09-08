import { INVOICE_STATUS_LABELS, QUOTE_STATUS_LABELS } from '../../fixtures/billing'
import type { Invoice, Quote } from '../../lib/auth/types'

type BillingStatus = Quote['status'] | Invoice['status']

const STATUS_CLASS: Record<string, string> = {
  draft: 'billing-status--draft',
  sent: 'billing-status--sent',
  signed: 'billing-status--signed',
  accepted: 'billing-status--signed',
  rejected: 'billing-status--danger',
  expired: 'billing-status--danger',
  converted: 'billing-status--done',
  partial: 'billing-status--partial',
  paid: 'billing-status--paid',
  overdue: 'billing-status--danger',
  cancelled: 'billing-status--draft',
  refunded: 'billing-status--partial',
}

interface BillingStatusBadgeProps {
  kind: 'quote' | 'invoice'
  status: BillingStatus
  compact?: boolean
}

export default function BillingStatusBadge({ kind, status, compact }: BillingStatusBadgeProps) {
  const fullLabel =
    kind === 'quote'
      ? QUOTE_STATUS_LABELS[status as Quote['status']]
      : INVOICE_STATUS_LABELS[status as Invoice['status']]

  const shortLabels: Partial<Record<BillingStatus, string>> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    signed: 'Signé',
    accepted: 'Accepté',
    converted: 'Facturé',
    partial: 'Partiel',
    paid: 'Payée',
    overdue: 'Retard',
    refunded: 'Remboursé',
  }

  const label = compact && shortLabels[status] ? shortLabels[status] : fullLabel

  return (
    <span className={`billing-status ${STATUS_CLASS[status] ?? 'billing-status--draft'}`}>
      {label}
    </span>
  )
}
