import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getDeliveriesForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/services/notificationService'
import EmptyState from '../../components/client/EmptyState'
import { formatDateTime } from '../../lib/client/format'

export default function ClientNotificationsPage() {
  const { user } = useAuth()
  const { notifications, refresh } = useWorkspace()

  if (!user) return null

  const mine = notifications.filter((n) => n.userId === user.id)
  const deliveries = getDeliveriesForUser(user.id)

  function handleRead(id: string) {
    markNotificationRead(id)
    refresh()
  }

  function handleReadAll() {
    if (!user) return
    markAllNotificationsRead(user.id)
    refresh()
  }

  return (
    <>
      <header className="client-page-header">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="client-page-eyebrow">Alertes</p>
            <h1 className="client-page-title">Notifications</h1>
            <p className="client-page-subtitle">
              Maquettes prêtes, réponses de l'équipe et mises à jour de vos projets.
            </p>
          </div>
          {mine.some((n) => !n.read) && (
            <button type="button" className="btn-secondary" onClick={handleReadAll}>
              Tout marquer comme lu
            </button>
          )}
        </div>
      </header>

      {mine.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous serez alerté par email et SMS quand une maquette sera prête ou quand l'équipe répondra."
        />
      ) : (
        <ul className="notif-list notif-list--full">
          {mine.map((n) => (
            <li key={n.id} className={`notif-item ${n.read ? 'notif-item--read' : ''}`}>
              <div className="notif-item-main">
                <p className="notif-item-title">{n.title}</p>
                <p className="notif-item-body">{n.body}</p>
                <p className="notif-item-date">{formatDateTime(n.date)}</p>
              </div>
              <div className="notif-item-actions">
                {n.link && (
                  <Link to={n.link} className="client-link" onClick={() => handleRead(n.id)}>
                    Ouvrir
                  </Link>
                )}
                {!n.read && (
                  <button type="button" className="client-link" onClick={() => handleRead(n.id)}>
                    Marquer lu
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="client-section mt-8">
        <h2 className="client-section-title mb-4">Historique email et SMS</h2>
        {deliveries.length === 0 ? (
          <p className="client-muted">Les envois apparaîtront ici en mode démo.</p>
        ) : (
          <ul className="delivery-list">
            {deliveries.map((d) => (
              <li key={d.id} className="delivery-item">
                <span className={`delivery-channel delivery-channel--${d.channel}`}>
                  {d.channel === 'email' ? 'Email' : 'SMS'}
                </span>
                <div>
                  <p className="delivery-subject">{d.subject}</p>
                  <p className="delivery-body">{d.body}</p>
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
