import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Clock,
  FolderKanban,
  LayoutTemplate,
  LogOut,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getActivitiesForUser,
  getProjectsForUser,
  PROJECT_STATUS_LABELS,
} from '../fixtures/projects'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function ClientSpacePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  const projects = getProjectsForUser(user.id)
  const activities = getActivitiesForUser(user.id)
  const inProgress = projects.filter((p) => p.status === 'en_cours' || p.status === 'maquette').length
  const inValidation = projects.filter((p) => p.status === 'validation').length

  return (
    <main className="client-space pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="section-inner max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="client-header"
        >
          <div>
            <p className="client-eyebrow">
              <Sparkles size={14} className="inline -mt-0.5 mr-1" />
              Espace client
            </p>
            <h1 className="client-title">
              Bonjour, {user.name.split(' ')[0]}
            </h1>
            <p className="client-subtitle">
              {user.company ? `${user.company} · ` : ''}
              {user.role === 'admin' ? 'Vue administrateur' : 'Suivez vos projets Sirius en un coup d\'œil.'}
            </p>
          </div>
          <div className="client-header-actions">
            <Link to="/" className="btn-secondary inline-flex items-center gap-2">
              Site vitrine
              <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
            <button type="button" className="client-logout-btn" onClick={logout}>
              <LogOut size={16} strokeWidth={2} />
              Déconnexion
            </button>
          </div>
        </motion.div>

        <div className="client-stats">
          {[
            { label: 'Projets actifs', value: inProgress, icon: FolderKanban },
            { label: 'En validation', value: inValidation, icon: LayoutTemplate },
            { label: 'Activités récentes', value: activities.length, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="client-stat-card"
            >
              <Icon size={18} className="client-stat-icon" strokeWidth={1.75} />
              <span className="client-stat-value">{value}</span>
              <span className="client-stat-label">{label}</span>
            </motion.div>
          ))}
        </div>

        <div className="client-grid">
          <section className="client-panel">
            <h2 className="client-panel-title">Mes projets</h2>
            {projects.length === 0 ? (
              <p className="client-empty">Aucun projet pour le moment. Demandez une maquette depuis le site.</p>
            ) : (
              <ul className="client-project-list">
                {projects.map((project, i) => (
                  <motion.li
                    key={project.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="client-project-card"
                  >
                    <div className="client-project-top">
                      <div>
                        <h3 className="client-project-title">{project.title}</h3>
                        <p className="client-project-type">{project.type}</p>
                      </div>
                      <span className={`client-status client-status--${project.status}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    <div className="client-progress-wrap">
                      <div className="client-progress-bar">
                        <span className="client-progress-fill" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="client-progress-label">{project.progress}%</span>
                    </div>
                    <p className="client-project-next">
                      <Clock size={13} strokeWidth={2} className="inline -mt-0.5 mr-1" />
                      {project.nextStep}
                    </p>
                    <p className="client-project-date">Mis à jour le {formatDate(project.updatedAt)}</p>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>

          <section className="client-panel">
            <h2 className="client-panel-title">Activité récente</h2>
            {activities.length === 0 ? (
              <p className="client-empty">Aucune activité récente.</p>
            ) : (
              <ul className="client-activity-list">
                {activities.map((activity, i) => (
                  <motion.li
                    key={activity.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="client-activity-item"
                  >
                    <span className={`client-activity-dot client-activity-dot--${activity.type}`} />
                    <div>
                      <p className="client-activity-label">{activity.label}</p>
                      <p className="client-activity-date">{formatDateTime(activity.date)}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
