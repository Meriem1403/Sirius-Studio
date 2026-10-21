import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Check, Copy, FolderKanban, Mail, Phone, MessageSquare, UserPlus } from 'lucide-react'
import type { Prospect, ProspectStatus } from '../../lib/auth/types'
import { PROSPECT_SOURCE_LABELS, PROSPECT_STATUS_LABELS } from '../../fixtures/prospects'
import { formatDateTime } from '../../lib/client/format'
import { formatPhoneForTel, resolveLeadDisplay } from '../../lib/prospects/leadDisplay'
import { isApiMode } from '../../lib/api/config'
import { convertProspectApi } from '../../lib/api/prospects'
import { applyWorkspaceProjects, syncWorkspace } from '../../lib/api/workspaceSync'

const STATUS_FLOW: ProspectStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']

interface ProspectCardProps {
  prospect: Prospect
  busy?: boolean
  linkedProjectId?: string
  onStatusChange: (id: string, status: ProspectStatus) => void | Promise<void>
  onConverted?: () => void
}

export default function ProspectCard({ prospect, busy, linkedProjectId, onStatusChange, onConverted }: ProspectCardProps) {
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null)
  const [showConvert, setShowConvert] = useState(false)
  const [convertBusy, setConvertBusy] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertResult, setConvertResult] = useState<{
    tempPassword?: string
    email: string
    projectId: string
    userId: string
  } | null>(null)
  const lead = resolveLeadDisplay(prospect)
  const defaultProjectTitle = lead?.needs[0] ? `Projet ${lead.needs[0]}` : `Projet ${prospect.company}`
  const [projectTitle, setProjectTitle] = useState(defaultProjectTitle)
  const [projectType, setProjectType] = useState(lead?.needs[0] ?? 'Site web')
  const phone = prospect.phone?.trim()
  const isClient = Boolean(prospect.convertedUserId || prospect.status === 'converted')

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault()
    if (!isApiMode()) {
      setConvertError('Disponible uniquement avec l’API (production).')
      return
    }
    setConvertBusy(true)
    setConvertError(null)
    try {
      const result = await convertProspectApi(prospect.id, {
        projectTitle: projectTitle.trim(),
        projectType: projectType.trim() || 'Site web',
      })
      applyWorkspaceProjects(result.projects)
      setConvertResult({
        tempPassword: result.tempPassword,
        email: result.email,
        projectId: result.projectId,
        userId: result.userId,
      })
      await syncWorkspace().catch(() => undefined)
      onConverted?.()
    } catch {
      setConvertError('Conversion impossible. Vérifiez que l’email n’est pas déjà utilisé autrement.')
    } finally {
      setConvertBusy(false)
    }
  }

  const activeUserId = prospect.convertedUserId ?? convertResult?.userId
  const activeProjectId = linkedProjectId ?? convertResult?.projectId
  const planifierHref =
    activeUserId && activeProjectId
      ? `/espace-admin/agenda?planifier=1&userId=${activeUserId}&projectId=${activeProjectId}&title=${encodeURIComponent(`RDV — ${prospect.name}`)}`
      : null

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

      <div className="prospect-workflow-actions">
        {!isClient && !showConvert && (
          <button type="button" className="btn-primary prospect-workflow-btn" disabled={busy || convertBusy} onClick={() => setShowConvert(true)}>
            <UserPlus size={14} /> Créer compte client + projet
          </button>
        )}
        {activeProjectId && (isClient || convertResult) && (
          <Link to={`/espace-admin/projets/${activeProjectId}`} className="btn-secondary prospect-workflow-btn">
            <FolderKanban size={14} /> Ouvrir le projet
          </Link>
        )}
        {(isClient || convertResult) && planifierHref && (
          <Link to={planifierHref} className="btn-secondary prospect-workflow-btn">
            <CalendarPlus size={14} /> Planifier un RDV
          </Link>
        )}
      </div>

      {showConvert && !isClient && (
        <form className="prospect-convert-panel" onSubmit={handleConvert}>
          <p className="prospect-actions-label">Conversion en client Sirius</p>
          <p className="client-message-hint mb-2">
            Crée le compte (email du prospect), un projet dans « Projets clients », et passe le statut à Converti.
          </p>
          {convertError && <p className="client-alert-desc text-red-300">{convertError}</p>}
          {convertResult ? (
            <div className="prospect-convert-success">
              <p className="client-message-hint">Compte prêt pour <strong>{convertResult.email}</strong></p>
              {convertResult.tempPassword && (
                <p className="prospect-temp-password">
                  Mot de passe temporaire à communiquer au client :{' '}
                  <code>{convertResult.tempPassword}</code>
                </p>
              )}
              <button type="button" className="btn-secondary mt-2" onClick={() => setShowConvert(false)}>Fermer</button>
            </div>
          ) : (
            <>
              <label className="billing-field block">
                <span className="billing-field-label">Titre du projet</span>
                <input className="admin-input" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
              </label>
              <label className="billing-field block mt-2">
                <span className="billing-field-label">Type</span>
                <input className="admin-input" value={projectType} onChange={(e) => setProjectType(e.target.value)} required />
              </label>
              <div className="billing-action-row mt-3">
                <button type="button" className="btn-secondary" onClick={() => setShowConvert(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={convertBusy}>{convertBusy ? 'Création…' : 'Confirmer'}</button>
              </div>
            </>
          )}
        </form>
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
