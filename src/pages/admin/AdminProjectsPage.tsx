import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { getClientDisplayName } from '../../lib/services/projectService'
import { MOCKUP_CHOICE_LABELS } from '../../lib/client/validation'
import StatusBadge from '../../components/client/StatusBadge'
import { isApiMode } from '../../lib/api/config'
import { syncWorkspace } from '../../lib/api/workspaceSync'

export default function AdminProjectsPage() {
  const { projects: workspaceProjects, refresh } = useWorkspace()
  const projects = workspaceProjects.filter((p) => p.userId !== 'fixture-admin-1')

  useEffect(() => {
    if (!isApiMode()) return
    void syncWorkspace().then(() => refresh())
  }, [refresh])

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Projets</p>
          <h1 className="client-page-title">Projets clients</h1>
          <p className="client-page-subtitle">
            Ajoutez le lien Netlify de la maquette et publiez-la pour que le client puisse valider.
          </p>
        </div>
      </header>

      {projects.length === 0 && (
        <p className="client-muted client-section">
          Aucun projet client pour l’instant. Créez-en un depuis{' '}
          <Link to="/espace-admin/prospection" className="client-link">Prospection</Link>
          {' '}→ « Créer compte client + projet ».
        </p>
      )}

      <ul className="admin-project-list admin-project-list--full">
        {projects.map((p) => {
          const clientName = getClientDisplayName(p.userId, p)
          return (
            <li key={p.id}>
              <Link to={`/espace-admin/projets/${p.id}`} className="admin-project-card">
                <div className="admin-project-card-top">
                  <div className="min-w-0 flex-1">
                    <h3 className="client-project-title">{p.title}</h3>
                    <p className="client-project-type">
                      {clientName}
                      {p.type ? ` · ${p.type}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={p.status} compact />
                </div>
                <p className="admin-project-card-progress">
                  <span className="admin-project-card-progress-pct">{p.progress} %</span>
                  <span className="admin-project-card-progress-step">{p.nextStep}</span>
                </p>
                <div className="admin-project-card-meta">
                  {p.mockupUrl && (
                    <span className="admin-mockup-chip">
                      <ExternalLink size={12} /> Maquette liée
                    </span>
                  )}
                  {p.validation && p.validation.choice !== 'pending' && (
                    <span className="admin-mockup-chip admin-mockup-chip--feedback">
                      {MOCKUP_CHOICE_LABELS[p.validation.choice]}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
