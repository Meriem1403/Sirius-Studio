import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import ProjectCard from '../../components/client/ProjectCard'
import EmptyState from '../../components/client/EmptyState'
import { FolderKanban } from 'lucide-react'

export default function ClientProjectsPage() {
  const { user } = useAuth()
  const { projects } = useWorkspace()
  if (!user) return null

  const myProjects = projects.filter((p) => p.userId === user.id)
  const inProgress = myProjects.filter((p) => p.status === 'en_cours' || p.status === 'validation')
  const maquette = myProjects.filter((p) => p.status === 'maquette')
  const completed = myProjects.filter((p) => p.status === 'livre')

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Projets</p>
          <h1 className="client-page-title">Mes projets</h1>
          <p className="client-page-subtitle">
            Consultez l'avancement et validez vos maquettes en ligne.
          </p>
        </div>
      </header>

      {myProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Vos projets apparaîtront ici dès qu'un accompagnement sera lancé avec Sirius Studio."
          actionLabel="Retour au tableau de bord"
          actionHref="/espace-client"
        />
      ) : (
        <>
          {inProgress.length > 0 && (
            <section className="client-section">
              <h2 className="client-section-title mb-4">En cours</h2>
              <div className="client-project-grid">
                {inProgress.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {maquette.length > 0 && (
            <section className="client-section">
              <h2 className="client-section-title mb-4">Maquette</h2>
              <div className="client-project-grid">
                {maquette.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="client-section">
              <h2 className="client-section-title mb-4">Terminés</h2>
              <div className="client-project-grid">
                {completed.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
