import type { AccountingEntry } from '../../lib/auth/types'
import { formatMoney } from '../../lib/services/billingService'
import { formatDate } from '../../lib/client/format'

interface BillingLedgerViewProps {
  entries: AccountingEntry[]
}

export default function BillingLedgerView({ entries }: BillingLedgerViewProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  if (sorted.length === 0) {
    return <p className="client-muted">Aucune écriture pour le moment.</p>
  }

  return (
    <>
      <div className="billing-ledger-cards">
        {sorted.map((e) => (
          <article key={e.id} className="billing-ledger-card">
            <div className="billing-ledger-card-head">
              <time dateTime={e.date}>{formatDate(e.date)}</time>
              <span className="billing-ledger-ref">{e.reference}</span>
            </div>
            <p className="billing-ledger-card-label">{e.label}</p>
            <p className="billing-ledger-card-account">
              <code>{e.accountCode}</code> {e.accountLabel}
            </p>
            <div className="billing-ledger-card-amounts">
              {e.debit > 0 && <span className="billing-ledger-debit">D {formatMoney(e.debit)}</span>}
              {e.credit > 0 && <span className="billing-ledger-credit">C {formatMoney(e.credit)}</span>}
            </div>
          </article>
        ))}
      </div>

      <div className="billing-ledger-table-wrap">
        <table className="billing-ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th>Compte</th>
              <th>Débit</th>
              <th>Crédit</th>
              <th>Réf.</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.date)}</td>
                <td>{e.label}</td>
                <td><code className="billing-account-code">{e.accountCode}</code> {e.accountLabel}</td>
                <td>{e.debit > 0 ? formatMoney(e.debit) : '—'}</td>
                <td>{e.credit > 0 ? formatMoney(e.credit) : '—'}</td>
                <td>{e.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
