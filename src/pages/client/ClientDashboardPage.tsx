import { Link } from 'react-router-dom'
import { ArrowRight, Bell, FolderKanban, MessageSquare, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import { getActivitiesForUser } from '../../lib/services/projectService'
import ProjectCard from '../../components/client/ProjectCard'
import { formatDateTime } from '../../lib/client/format'
import { countUnreadMessages } from '../../lib/services/messageService'
import { countUnreadNotifications } from '../../lib/services/notificationService'

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const { projects } = useWorkspace()
  if (!user) return null

  const myProjects = projects.filter((p) => p.userId === user.id)
  const activities = getActivitiesForUser(user.id).slice(0, 5)
  const unreadMsg = countUnreadMessages(user.id)
  const unreadNotif = countUnreadNotifications(user.id)
  const activeProjects = myProjects.filter((p) => p.status === 'en_cours' || p.status === 'maquette' || p.status === 'validation')
  const pendingValidation = myProjects.filter((p) => p.mockupUrl && p.validation?.choice === 'pending')
  const avgProgress = myProjects.length
    ? Math.round(myProjects.reduce((s, p) => s + p.progress, 0) / myProjects.length)
    : 0

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Espace client</p>
          <h1 className="client-page-title">Bonjour, {user.name.split(' ')[0]}</h1>
          <p className="client-page-subtitle">
            Suivez l'avancement de vos projets, validez vos maquettes et échangez avec l'équipe.
          </p>
        </div>
      </header>

      {pendingValidation.length > 0 && (
        <section className="client-alert-banner">
          <Bell size={18} />
          <div className="flex-1">
            <p className="client-alert-title">Maquette à valider</p>
            <p className="client-alert-desc">
              {pendingValidation.length} projet{pendingValidation.length > 1 ? 's' : ''} en attente de votre retour.
            </p>
          </div>
          <Link to={`/espace-client/projets/${pendingValidation[0].id}`} className="btn-primary">
            Voir la maquette
          </Link>
        </section>
      )}

      <div className="client-stats">
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--violet">
            <FolderKanban size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="client-stat-value">{activeProjects.length}</p>
            <p className="client-stat-label">Projets actifs</p>
          </div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--cyan">
            <Zap size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="client-stat-value">{avgProgress}%</p>
            <p className="client-stat-label">Avancement moyen</p>
          </div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--amber">
            <MessageSquare size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="client-stat-value">{unreadMsg}</p>
            <p className="client-stat-label">Messages non lus</p>
          </div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--green">
            <Bell size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="client-stat-value">{unreadNotif}</p>
            <p className="client-stat-label">Notifications</p>
          </div>
        </div>
      </div>

      <section className="client-section">
        <div className="client-section-header">
          <h2 className="client-section-title">Projets en cours</h2>
          <Link to="/espace-client/projets" className="client-link">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="client-project-grid">
          {activeProjects.length > 0 ? (
            activeProjects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p className="client-muted">Aucun projet actif pour le moment.</p>
          )}
        </div>
      </section>

      <section className="client-section">
        <div className="client-section-header">
          <h2 className="client-section-title">Activité récente</h2>
        </div>
        <ul className="client-activity-list">
          {activities.map((a) => (
            <li key={a.id} className="client-activity-item">
              <span className={`client-activity-dot client-activity-dot--${a.type === 'validation' ? 'status' : a.type}`} />
              <div>
                <p className="client-activity-text">{a.label}</p>
                <p className="client-activity-date">{formatDateTime(a.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
