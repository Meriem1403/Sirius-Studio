import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, FileText, Receipt } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getClientAccount,
  getProjectById,
  publishMockup,
  setMockupUrl,
} from '../../lib/services/projectService'
import { sendMessage } from '../../lib/services/messageService'
import MessageThread from '../../components/workspace/MessageThread'
import MessageComposer from '../../components/workspace/MessageComposer'
import DocumentRequestForm from '../../components/workspace/DocumentRequestForm'
import type { MessageAttachment } from '../../lib/auth/types'
import StatusBadge from '../../components/client/StatusBadge'
import { MOCKUP_CHOICE_LABELS } from '../../lib/client/validation'
import { formatDateTime } from '../../lib/client/format'
import { getMessagesForProject } from '../../lib/services/messageService'
import { getDeliveriesForUser } from '../../lib/services/notificationService'
import {
  createQuoteFromProject,
  formatMoney,
  getInvoicesForProject,
  getQuotesForProject,
} from '../../lib/services/billingService'
import BillingStatusBadge from '../../components/billing/BillingStatusBadge'
import BillingDocCard from '../../components/billing/BillingDocCard'

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { refresh } = useWorkspace()
  const [url, setUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)

  if (!id || !user) return null

  const project = getProjectById(id)
  if (!project) {
    return (
      <div className="client-section">
        <p className="client-muted">Projet introuvable.</p>
        <Link to="/espace-admin/projets" className="client-link mt-4 inline-flex">
          <ArrowLeft size={14} /> Retour
        </Link>
      </div>
    )
  }

  const client = getClientAccount(project.userId)
  const messages = getMessagesForProject(id)
  const deliveries = getDeliveriesForUser(project.userId).slice(0, 5)
  const projectQuotes = getQuotesForProject(id)
  const projectInvoices = getInvoicesForProject(id)
  const currentUrl = url || project.mockupUrl || ''

  function handleSaveUrl(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUrl.trim()) return
    setMockupUrl(id!, currentUrl.trim())
    setSaved(true)
    refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  function handlePublish() {
    if (!currentUrl.trim() || !user) return
    setPublishing(true)
    setMockupUrl(id!, currentUrl.trim())
    publishMockup(id!, user)
    setPublishing(false)
    refresh()
  }

  return (
    <>
      <Link to="/espace-admin/projets" className="client-back-link">
        <ArrowLeft size={16} /> Projets clients
      </Link>

      <header className="client-page-header client-page-header--detail">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="client-page-title">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="client-page-subtitle">
          Client : {client?.name} · {client?.email}
        </p>
      </header>

      <section className="client-detail-panel client-section">
        <h2 className="client-section-title mb-4">Lien maquette Netlify</h2>
        <form className="admin-mockup-form" onSubmit={handleSaveUrl}>
          <input
            type="url"
            className="admin-input"
            placeholder="https://votre-projet.netlify.app"
            value={currentUrl}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-3 mt-3">
            <button type="submit" className="btn-secondary">
              {saved ? 'Enregistré' : 'Enregistrer le lien'}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!currentUrl.trim() || publishing}
              onClick={handlePublish}
            >
              Publier au client
            </button>
          </div>
        </form>
        <p className="client-message-hint mt-3">
          La publication envoie une notification in-app, email et SMS au client avec le lien de la maquette.
        </p>
        {project.mockupUrl && (
          <a href={project.mockupUrl} target="_blank" rel="noopener noreferrer" className="client-mockup-link mt-4">
            <ExternalLink size={16} />
            Prévisualiser la maquette
          </a>
        )}
        {project.mockupPublishedAt && (
          <p className="client-muted mt-2">Publiée le {formatDateTime(project.mockupPublishedAt)}</p>
        )}
      </section>

      {project.validation && (
        <section className="client-detail-panel client-section">
          <h2 className="client-section-title mb-2">Retour client</h2>
          <p className="admin-feedback-status">{MOCKUP_CHOICE_LABELS[project.validation.choice]}</p>
          {project.validation.feedback && (
            <p className="client-detail-desc mt-2">{project.validation.feedback}</p>
          )}
          {project.validation.submittedAt && (
            <p className="client-muted mt-2">Envoyé le {formatDateTime(project.validation.submittedAt)}</p>
          )}
        </section>
      )}

      <section className="client-detail-panel client-section">
        <div className="client-section-header">
          <h2 className="client-section-title">Facturation</h2>
          <Link to={`/espace-admin/facturation?project=${id}`} className="client-link">
            <Receipt size={14} /> Espace facturation
          </Link>
        </div>
        {projectQuotes.length === 0 && projectInvoices.length === 0 ? (
          <div>
            <p className="client-muted mb-3">Aucun devis ni facture pour ce projet.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                createQuoteFromProject(id)
                refresh()
              }}
            >
              Créer un devis
            </button>
          </div>
        ) : (
          <ul className="billing-doc-list">
            {projectQuotes.map((q) => (
              <li key={q.id}>
                <BillingDocCard
                  to={`/espace-admin/facturation?quote=${q.id}`}
                  number={q.number}
                  subtitle="Devis"
                  amount={formatMoney(q.totalTTC)}
                  badge={<BillingStatusBadge kind="quote" status={q.status} compact />}
                  icon={FileText}
                />
              </li>
            ))}
            {projectInvoices.map((inv) => (
              <li key={inv.id}>
                <BillingDocCard
                  to={`/espace-admin/facturation?invoice=${inv.id}`}
                  number={inv.number}
                  subtitle="Facture"
                  amount={formatMoney(inv.totalTTC)}
                  badge={<BillingStatusBadge kind="invoice" status={inv.status} compact />}
                  icon={Receipt}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="client-detail-panel client-section workspace-panel">
        <h2 className="client-section-title mb-4">Messagerie projet</h2>
        <MessageThread messages={messages} />
        <DocumentRequestForm
          admin={user}
          clientUserId={project.userId}
          projectId={id}
          projectTitle={project.title}
          onCreated={refresh}
        />
        <MessageComposer
          placeholder="Répondre au client..."
          hint="Joignez des fichiers avec description et motif."
          onSend={async (content, attachments) => {
            sendMessage({
              sender: user,
              clientUserId: project.userId,
              projectId: id,
              projectTitle: project.title,
              content: content || 'Pièce(s) jointe(s) transmise(s).',
              attachments: attachments as MessageAttachment[],
            })
            refresh()
          }}
        />
      </section>

      <section className="client-detail-panel">
        <h2 className="client-section-title mb-4">Notifications envoyées au client</h2>
        {deliveries.length === 0 ? (
          <p className="client-muted">Aucun envoi pour le moment.</p>
        ) : (
          <ul className="delivery-list">
            {deliveries.map((d) => (
              <li key={d.id} className="delivery-item">
                <span className={`delivery-channel delivery-channel--${d.channel}`}>
                  {d.channel === 'email' ? 'Email' : 'SMS'}
                </span>
                <div>
                  <p className="delivery-subject">{d.subject}</p>
                  <p className="delivery-meta">{d.recipient} · {formatDateTime(d.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
