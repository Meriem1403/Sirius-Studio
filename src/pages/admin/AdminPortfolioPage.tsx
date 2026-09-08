import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, TrendingUp, Users } from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import { getClientPortfolio, getPortfolioSummary } from '../../lib/services/portfolioService'
import { formatDateTime } from '../../lib/client/format'

export default function AdminPortfolioPage() {
  const portfolio = getClientPortfolio()
  const summary = getPortfolioSummary()

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        eyebrow="Clients"
        title="Portefeuille clients"
        subtitle="Vue consolidée de vos clients actifs, projets en cours et documents en attente."
        icon={Briefcase}
      />

      <div className="client-stats">
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--violet">
            <Users size={20} />
          </div>
          <div>
            <p className="client-stat-value">{summary.clientCount}</p>
            <p className="client-stat-label">Clients actifs</p>
          </div>
        </div>
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--cyan">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="client-stat-value">{summary.activeProjects}</p>
            <p className="client-stat-label">Projets en cours</p>
          </div>
        </div>
        <div className="client-stat-card workspace-stat-card">
          <div className="client-stat-icon client-stat-icon--amber">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="client-stat-value">{summary.avgProgress}%</p>
            <p className="client-stat-label">Avancement moyen</p>
          </div>
        </div>
      </div>

      <div className="portfolio-grid">
        {portfolio.map((client) => (
          <article key={client.id} className="portfolio-card">
            <div className="portfolio-card-header">
              <div className="portfolio-avatar">{client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
              <div className="min-w-0 flex-1">
                <h3 className="portfolio-name">{client.name}</h3>
                <p className="portfolio-company">{client.company ?? client.email}</p>
              </div>
              <span className="portfolio-progress">{client.totalProgress}%</span>
            </div>

            <dl className="portfolio-metrics">
              <div><dt>Projets</dt><dd>{client.projectCount}</dd></div>
              <div><dt>Actifs</dt><dd>{client.activeProjects}</dd></div>
              <div><dt>Docs en attente</dt><dd>{client.pendingDocs}</dd></div>
              <div><dt>Messages</dt><dd>{client.unreadMessages > 0 ? `${client.unreadMessages} non lus` : 'À jour'}</dd></div>
            </dl>

            <ul className="portfolio-projects">
              {client.projects.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link to={`/espace-admin/projets/${p.id}`} className="portfolio-project-link">
                    {p.title}
                    <ArrowRight size={12} />
                  </Link>
                </li>
              ))}
            </ul>

            {client.lastActivity && (
              <p className="portfolio-last">Dernière activité · {formatDateTime(client.lastActivity)}</p>
            )}

            <div className="portfolio-actions">
              <Link to={`/espace-admin/messages?client=${client.id}`} className="client-link">
                Messages
              </Link>
              {client.projects[0] && (
                <Link to={`/espace-admin/projets/${client.projects[0].id}`} className="client-link">
                  Voir projet
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
