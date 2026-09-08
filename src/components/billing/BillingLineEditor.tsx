import { Plus, Trash2 } from 'lucide-react'
import type { BillingLineItem } from '../../lib/auth/types'
import { DEFAULT_VAT_RATE, lineTotalHT, lineTVA, newLineItem } from '../../lib/billing/calc'
import { formatMoney } from '../../lib/services/billingService'

interface BillingLineEditorProps {
  lines: BillingLineItem[]
  onChange: (lines: BillingLineItem[]) => void
  readOnly?: boolean
}

export default function BillingLineEditor({ lines, onChange, readOnly }: BillingLineEditorProps) {
  function updateLine(id: string, patch: Partial<BillingLineItem>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id))
  }

  function addLine() {
    onChange([...lines, newLineItem()])
  }

  const totalHT = lines.reduce((s, l) => s + lineTotalHT(l), 0)
  const totalTVA = lines.reduce((s, l) => s + lineTVA(l), 0)

  return (
    <div className="billing-lines">
      {lines.map((line, index) => (
        <article key={line.id} className="billing-line-card">
          <div className="billing-line-card-head">
            <span className="billing-line-index">Ligne {index + 1}</span>
            {!readOnly && (
              <button
                type="button"
                className="billing-line-remove"
                onClick={() => removeLine(line.id)}
                aria-label="Supprimer la ligne"
                disabled={lines.length <= 1}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {readOnly ? (
            <>
              <p className="billing-line-label">{line.label}</p>
              {line.description && <p className="client-message-hint">{line.description}</p>}
              <dl className="billing-line-readonly-grid">
                <div><dt>Qté</dt><dd>{line.quantity}</dd></div>
                <div><dt>P.U. HT</dt><dd>{formatMoney(line.unitPriceHT)}</dd></div>
                <div><dt>TVA</dt><dd>{line.vatRate} %</dd></div>
                <div><dt>Total HT</dt><dd>{formatMoney(lineTotalHT(line))}</dd></div>
              </dl>
            </>
          ) : (
            <>
              <label className="billing-field">
                <span className="billing-field-label">Désignation</span>
                <input
                  type="text"
                  className="admin-input"
                  value={line.label}
                  onChange={(e) => updateLine(line.id, { label: e.target.value })}
                  placeholder="Libellé de la prestation"
                />
              </label>
              <label className="billing-field">
                <span className="billing-field-label">Description</span>
                <input
                  type="text"
                  className="admin-input"
                  value={line.description ?? ''}
                  onChange={(e) => updateLine(line.id, { description: e.target.value })}
                  placeholder="Optionnel"
                />
              </label>
              <div className="billing-line-edit-grid">
                <label className="billing-field">
                  <span className="billing-field-label">Qté</span>
                  <input
                    type="number"
                    min={1}
                    className="admin-input"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, { quantity: Math.max(1, Number(e.target.value)) })}
                  />
                </label>
                <label className="billing-field">
                  <span className="billing-field-label">P.U. HT</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="admin-input"
                    value={line.unitPriceHT}
                    onChange={(e) => updateLine(line.id, { unitPriceHT: Math.max(0, Number(e.target.value)) })}
                  />
                </label>
                <label className="billing-field">
                  <span className="billing-field-label">TVA</span>
                  <select
                    className="admin-input"
                    value={line.vatRate}
                    onChange={(e) => updateLine(line.id, { vatRate: Number(e.target.value) })}
                  >
                    <option value={20}>{DEFAULT_VAT_RATE} %</option>
                    <option value={10}>10 %</option>
                    <option value={5.5}>5,5 %</option>
                    <option value={0}>0 %</option>
                  </select>
                </label>
                <div className="billing-field billing-field--total">
                  <span className="billing-field-label">Total HT</span>
                  <span className="billing-line-total">{formatMoney(lineTotalHT(line))}</span>
                </div>
              </div>
            </>
          )}
        </article>
      ))}

      {!readOnly && (
        <button type="button" className="btn-secondary billing-add-line" onClick={addLine}>
          <Plus size={14} />
          Ajouter une ligne
        </button>
      )}

      <footer className="billing-totals">
        <div className="billing-total-row">
          <span>Total HT</span>
          <span>{formatMoney(totalHT)}</span>
        </div>
        <div className="billing-total-row">
          <span>TVA</span>
          <span>{formatMoney(totalTVA)}</span>
        </div>
        <div className="billing-total-row billing-total-row--ttc">
          <span>Total TTC</span>
          <span>{formatMoney(totalHT + totalTVA)}</span>
        </div>
      </footer>
    </div>
  )
}
