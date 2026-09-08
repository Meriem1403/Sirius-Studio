import { Link } from 'react-router-dom'
import { ArrowRight, Bell, FolderKanban, MessageSquare, Receipt } from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { countPendingValidations, getAllProjects, getClientAccount } from '../../lib/services/projectService'
import { getAllMessagesForAdmin } from '../../lib/services/messageService'
import { getBillingStats, formatMoney } from '../../lib/services/billingService'
import { PROJECT_STATUS_LABELS } from '../../fixtures/projects'
import { MOCKUP_CHOICE_LABELS } from '../../lib/client/validation'
import { formatDateTime } from '../../lib/client/format'

export default function AdminDashboardPage() {
  const { notifications } = useWorkspace()
  const projects = getAllProjects().filter((p) => p.userId !== 'fixture-admin-1')
  const clientProjects = projects
  const pending = countPendingValidations()
  const recentMessages = getAllMessagesForAdmin().slice(0, 5)
  const unreadNotifs = notifications.filter((n) => n.userId === 'fixture-admin-1' && !n.read).slice(0, 5)
  const billing = getBillingStats()

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Administration</p>
          <h1 className="client-page-title">Vue d'ensemble</h1>
          <p className="client-page-subtitle">
            Publiez les maquettes Netlify, suivez les validations clients et répondez aux messages.
          </p>
        </div>
      </header>

      <div className="client-stats">
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--violet">
            <FolderKanban size={20} />
          </div>
          <div>
            <p className="client-stat-value">{clientProjects.length}</p>
            <p className="client-stat-label">Projets clients</p>
          </div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--amber">
            <Bell size={20} />
          </div>
          <div>
            <p className="client-stat-value">{pending}</p>
            <p className="client-stat-label">Validations en attente</p>
          </div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-icon client-stat-icon--cyan">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="client-stat-value">{recentMessages.filter((m) => m.role === 'client' && !m.read).length}</p>
            <p className="client-stat-label">Messages non lus</p>
          </div>
        </div>
        <Link to="/espace-admin/facturation" className="client-stat-card client-stat-card--link">
          <div className="client-stat-icon client-stat-icon--green">
            <Receipt size={20} />
          </div>
          <div>
            <p className="client-stat-value">{formatMoney(billing.totalOutstanding)}</p>
            <p className="client-stat-label">Encours · Facturation →</p>
          </div>
        </Link>
      </div>

      {pending > 0 && (
        <section className="client-section">
          <div className="client-section-header">
            <h2 className="client-section-title">Validations en attente</h2>
            <Link to="/espace-admin/projets" className="client-link">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="admin-project-list">
            {clientProjects
              .filter((p) => p.status === 'validation' && p.validation?.choice === 'pending')
              .map((p) => (
                <li key={p.id}>
                  <Link to={`/espace-admin/projets/${p.id}`} className="admin-project-row">
                    <div>
                      <p className="admin-project-row-title">{p.title}</p>
                      <p className="admin-project-row-meta">
                        {getClientAccount(p.userId)?.name} · {PROJECT_STATUS_LABELS[p.status]}
                      </p>
                    </div>
                    <span className="admin-badge admin-badge--amber">Retour attendu</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="client-detail-grid">
        <section className="client-detail-panel">
          <h2 className="client-section-title mb-4">Messages récents</h2>
          <ul className="client-message-preview">
            {recentMessages.map((m) => (
              <li key={m.id} className="client-message-preview-item">
                <p className="client-message-preview-from">{m.from} · {m.projectTitle}</p>
                <p className="client-message-preview-text">{m.content}</p>
                <p className="client-message-preview-date">{formatDateTime(m.date)}</p>
              </li>
            ))}
          </ul>
          <Link to="/espace-admin/messages" className="client-link mt-4 inline-flex">
            Ouvrir la messagerie
          </Link>
        </section>

        <section className="client-detail-panel">
          <h2 className="client-section-title mb-4">Notifications récentes</h2>
          {unreadNotifs.length === 0 ? (
            <p className="client-muted">Aucune notification récente.</p>
          ) : (
            <ul className="notif-list">
              {unreadNotifs.map((n) => (
                <li key={n.id} className="notif-item">
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-body">{n.body}</p>
                  <p className="notif-item-date">{formatDateTime(n.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="client-section">
        <h2 className="client-section-title mb-4">Retours maquette enregistrés</h2>
        <ul className="admin-project-list">
          {clientProjects
            .filter((p) => p.validation && p.validation.choice !== 'pending')
            .map((p) => (
              <li key={p.id}>
                <Link to={`/espace-admin/projets/${p.id}`} className="admin-project-row">
                  <div>
                    <p className="admin-project-row-title">{p.title}</p>
                    <p className="admin-project-row-meta">{MOCKUP_CHOICE_LABELS[p.validation!.choice]}</p>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  )
}
