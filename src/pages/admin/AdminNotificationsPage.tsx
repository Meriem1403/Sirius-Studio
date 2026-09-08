import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import {
  getDeliveriesForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/services/notificationService'
import { formatDateTime } from '../../lib/client/format'

export default function AdminNotificationsPage() {
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
              Retours maquette, demandes de devis et messages clients.
            </p>
          </div>
          {mine.some((n) => !n.read) && (
            <button type="button" className="btn-secondary" onClick={handleReadAll}>
              Tout marquer comme lu
            </button>
          )}
        </div>
      </header>

      <section className="client-section">
        <h2 className="client-section-title mb-4">Centre de notifications</h2>
        {mine.length === 0 ? (
          <p className="client-muted">Aucune notification.</p>
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
                      Voir
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
      </section>

      <section className="client-section">
        <h2 className="client-section-title mb-4">Journal email et SMS (démo)</h2>
        {deliveries.length === 0 ? (
          <p className="client-muted">Aucun envoi enregistré.</p>
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
