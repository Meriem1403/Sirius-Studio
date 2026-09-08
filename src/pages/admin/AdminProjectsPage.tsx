import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { getAllProjects, getClientAccount } from '../../lib/services/projectService'
import { PROJECT_STATUS_LABELS } from '../../fixtures/projects'
import { MOCKUP_CHOICE_LABELS } from '../../lib/client/validation'
import StatusBadge from '../../components/client/StatusBadge'

export default function AdminProjectsPage() {
  const projects = getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')

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

      <ul className="admin-project-list admin-project-list--full">
        {projects.map((p) => {
          const client = getClientAccount(p.userId)
          return (
            <li key={p.id}>
              <Link to={`/espace-admin/projets/${p.id}`} className="admin-project-card">
                <div className="admin-project-card-top">
                  <div>
                    <h3 className="client-project-title">{p.title}</h3>
                    <p className="client-project-type">{client?.name}{client?.company ? ` · ${client.company}` : ''}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="admin-project-card-meta">
                  <span>{PROJECT_STATUS_LABELS[p.status]}</span>
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
