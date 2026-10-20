import { useState } from 'react'
import { Check, Copy, Mail, Phone, MessageSquare } from 'lucide-react'
import type { Prospect, ProspectStatus } from '../../lib/auth/types'
import { PROSPECT_SOURCE_LABELS, PROSPECT_STATUS_LABELS } from '../../fixtures/prospects'
import { formatDateTime } from '../../lib/client/format'
import { formatPhoneForTel, resolveLeadDisplay } from '../../lib/prospects/leadDisplay'

const STATUS_FLOW: ProspectStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']

interface ProspectCardProps {
  prospect: Prospect
  busy?: boolean
  onStatusChange: (id: string, status: ProspectStatus) => void | Promise<void>
}

export default function ProspectCard({ prospect, busy, onStatusChange }: ProspectCardProps) {
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null)
  const lead = resolveLeadDisplay(prospect)
  const phone = prospect.phone?.trim()

  async function copy(value: string, kind: 'email' | 'phone') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      window.prompt('Copier :', value)
    }
  }

  const mailSubject = encodeURIComponent(`Sirius Studio — ${prospect.company}`)
  const mailBody = encodeURIComponent(
    `Bonjour ${prospect.name},\n\nMerci pour votre demande via le site Sirius Studio.\n\n`,
  )

  return (
    <li className="prospect-card">
      <div className="prospect-card-top">
        <div className="prospect-card-identity min-w-0">
          <p className="prospect-name">{prospect.name}</p>
          <p className="prospect-company">{prospect.company}</p>
          <p className="prospect-sector">{prospect.sector}</p>
        </div>
        <div className="prospect-badges">
          <span className={`prospect-source prospect-source--${prospect.source}`}>
            {PROSPECT_SOURCE_LABELS[prospect.source]}
          </span>
          <span className={`prospect-status prospect-status--${prospect.status}`}>
            {PROSPECT_STATUS_LABELS[prospect.status]}
          </span>
          <span className="prospect-score" title="Score lead">
            {prospect.score}
          </span>
        </div>
      </div>

      <div className="prospect-contact-row">
        <a className="prospect-contact-link" href={`mailto:${prospect.email}?subject=${mailSubject}&body=${mailBody}`}>
          <Mail size={14} />
          {prospect.email}
        </a>
        <button type="button" className="prospect-icon-btn" aria-label="Copier l'email" onClick={() => copy(prospect.email, 'email')}>
          {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="prospect-contact-row">
        {phone ? (
          <>
            <a className="prospect-contact-link" href={`tel:${formatPhoneForTel(phone)}`}>
              <Phone size={14} />
              {phone}
            </a>
            <button type="button" className="prospect-icon-btn" aria-label="Copier le téléphone" onClick={() => copy(phone, 'phone')}>
              {copied === 'phone' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </>
        ) : (
          <span className="prospect-contact-missing">
            <Phone size={14} />
            Téléphone non renseigné
          </span>
        )}
      </div>

      <div className="prospect-meta">
        <span>Reçu le {formatDateTime(prospect.createdAt)}</span>
        {prospect.lastContactAt && <span>Suivi le {formatDateTime(prospect.lastContactAt)}</span>}
      </div>

      {lead && (
        <div className="prospect-lead-panel">
          {lead.message && (
            <div className="prospect-lead-block">
              <p className="prospect-lead-label">
                <MessageSquare size={14} />
                Message
              </p>
              <p className="prospect-lead-text">{lead.message}</p>
            </div>
          )}
          <dl className="prospect-lead-grid">
            {lead.situation && (
              <div>
                <dt>Situation</dt>
                <dd>{lead.situation}</dd>
              </div>
            )}
            {lead.website && (
              <div>
                <dt>Site actuel</dt>
                <dd>
                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="client-link">
                    {lead.website}
                  </a>
                </dd>
              </div>
            )}
            {lead.siret && (
              <div>
                <dt>SIREN / SIRET</dt>
                <dd>{lead.siret}</dd>
              </div>
            )}
          </dl>
          {lead.needs.length > 0 && (
            <div className="prospect-lead-tags">
              <span className="prospect-lead-tags-label">Besoins</span>
              {lead.needs.map((n) => (
                <span key={n} className="prospect-tag">
                  {n}
                </span>
              ))}
            </div>
          )}
          {lead.objectives.length > 0 && (
            <div className="prospect-lead-tags">
              <span className="prospect-lead-tags-label">Objectifs</span>
              {lead.objectives.map((o) => (
                <span key={o} className="prospect-tag prospect-tag--objective">
                  {o}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {!lead && prospect.notes && (
        <p className="prospect-notes">{prospect.notes}</p>
      )}

      <div className="prospect-actions">
        <p className="prospect-actions-label">Mettre à jour le statut</p>
        <div className="prospect-status-row">
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy || prospect.status === status}
              className={`prospect-status-btn ${prospect.status === status ? 'prospect-status-btn--active' : ''}`}
              onClick={() => onStatusChange(prospect.id, status)}
            >
              {PROSPECT_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>
    </li>
  )
}
