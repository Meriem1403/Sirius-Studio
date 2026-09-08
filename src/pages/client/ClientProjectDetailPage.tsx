import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getProjectById,
  getActivitiesForProject,
} from '../../lib/services/projectService'
import { getMessagesForProject } from '../../lib/services/messageService'
import { getDocumentsForProject } from '../../fixtures/documents'
import StatusBadge from '../../components/client/StatusBadge'
import MockupValidationPanel from '../../components/client/MockupValidationPanel'
import { DOCUMENT_KIND_LABELS } from '../../fixtures/documents'
import { formatDate, formatDateTime } from '../../lib/client/format'

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { projects } = useWorkspace()
  if (!user || !id) return null

  const project = getProjectById(id) ?? projects.find((p) => p.id === id)
  if (!project || project.userId !== user.id) {
    return (
      <div className="client-section">
        <p className="client-muted">Projet introuvable.</p>
        <Link to="/espace-client/projets" className="client-link mt-4 inline-flex">
          <ArrowLeft size={14} /> Retour aux projets
        </Link>
      </div>
    )
  }

  const activities = getActivitiesForProject(id)
  const messages = getMessagesForProject(id)
  const documents = getDocumentsForProject(id)
  const showValidation = project.mockupUrl && project.status === 'validation'

  return (
    <>
      <Link to="/espace-client/projets" className="client-back-link">
        <ArrowLeft size={16} /> Mes projets
      </Link>

      <header className="client-page-header client-page-header--detail">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="client-page-title">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="client-page-subtitle">{project.type}</p>
          {project.description && (
            <p className="client-detail-desc">{project.description}</p>
          )}
        </div>
      </header>

      {showValidation && <MockupValidationPanel project={project} />}

      <div className="client-detail-meta">
        <div className="client-detail-meta-item">
          <Calendar size={16} />
          <span>Démarré le {formatDate(project.startedAt)}</span>
        </div>
        {project.deadline && (
          <div className="client-detail-meta-item">
            <Clock size={16} />
            <span>Échéance {formatDate(project.deadline)}</span>
          </div>
        )}
      </div>

      <div className="client-detail-progress">
        <div className="flex justify-between items-center mb-2">
          <span className="client-detail-progress-label">Avancement global</span>
          <span className="client-progress-label">{project.progress}%</span>
        </div>
        <div className="client-progress-bar client-progress-bar--lg">
          <span className="client-progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <p className="client-project-next mt-3">
          <Clock size={13} className="inline -mt-0.5 mr-1" />
          Prochaine étape : {project.nextStep}
        </p>
      </div>

      <div className="client-detail-grid">
        <section className="client-detail-panel">
          <h2 className="client-section-title mb-4">Étapes du projet</h2>
          <ul className="client-milestones">
            {project.milestones.map((m, i) => {
              const isCurrent = !m.done && project.milestones.slice(0, i).every((prev) => prev.done)
              return (
                <li key={m.id} className={`client-milestone client-milestone--${m.done ? 'done' : isCurrent ? 'current' : 'pending'}`}>
                  {m.done ? (
                    <CheckCircle2 size={18} className="client-milestone-icon client-milestone-icon--done" />
                  ) : isCurrent ? (
                    <Circle size={18} className="client-milestone-icon client-milestone-icon--current" />
                  ) : (
                    <Circle size={18} className="client-milestone-icon client-milestone-icon--pending" />
                  )}
                  <div>
                    <p className="client-milestone-title">{m.label}</p>
                    {m.date && <p className="client-milestone-date">{formatDate(m.date)}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="client-detail-panel">
          <h2 className="client-section-title mb-4">Messages récents</h2>
          {messages.length === 0 ? (
            <p className="client-muted">Aucun message pour ce projet.</p>
          ) : (
            <ul className="client-message-preview">
              {messages.slice(-3).map((m) => (
                <li key={m.id} className={`client-message-preview-item client-message-preview-item--${m.role}`}>
                  <p className="client-message-preview-from">{m.from}</p>
                  <p className="client-message-preview-text">{m.content}</p>
                  <p className="client-message-preview-date">{formatDateTime(m.date)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/espace-client/messages?project=${id}`} className="client-link mt-4 inline-flex">
            Voir tous les messages
          </Link>
        </section>
      </div>

      {documents.length > 0 && (
        <section className="client-section">
          <h2 className="client-section-title mb-4">Documents du projet</h2>
          <ul className="client-doc-list">
            {documents.map((d) => (
              <li key={d.id} className="client-doc-item">
                <div>
                  <p className="client-doc-name">{d.name}</p>
                  <p className="client-doc-meta">
                    {DOCUMENT_KIND_LABELS[d.kind]} · {d.size} · {formatDate(d.date)}
                  </p>
                </div>
                <button type="button" className="client-doc-btn" disabled>
                  Télécharger
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activities.length > 0 && (
        <section className="client-section">
          <h2 className="client-section-title mb-4">Historique</h2>
          <ul className="client-activity-list">
            {activities.map((a) => (
              <li key={a.id} className="client-activity-item">
                <span className="client-activity-dot" />
                <div>
                  <p className="client-activity-text">{a.label}</p>
                  <p className="client-activity-date">{formatDateTime(a.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
