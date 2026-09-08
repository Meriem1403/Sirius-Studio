import { NavLink, Link } from 'react-router-dom'
import {
  Bell,
  Calendar,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
} from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useAuth } from '../../context/AuthContext'
import { countPendingClientBilling } from '../../lib/services/billingService'
import { countPendingRequestsForUser } from '../../lib/services/documentRequestService'
import { countUnreadMessages } from '../../lib/services/messageService'
import { countUnreadNotifications } from '../../lib/services/notificationService'
import { userInitials } from '../../lib/client/format'

const navMain = [
  { to: '/espace-client', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/espace-client/projets', label: 'Mes projets', icon: FolderKanban, end: false },
  { to: '/espace-client/messages', label: 'Messages', icon: MessageSquare, end: false, badge: 'messages' as const },
  { to: '/espace-client/documents', label: 'Documents', icon: FileText, end: false, badge: 'docs' as const },
  { to: '/espace-client/facturation', label: 'Devis & factures', icon: CreditCard, end: false, badge: 'billing' as const },
  { to: '/espace-client/agenda', label: 'Agenda', icon: Calendar, end: false, badge: 'agenda' as const },
  { to: '/espace-client/notifications', label: 'Notifications', icon: Bell, end: false, badge: 'notif' as const },
  { to: '/espace-client/profil', label: 'Mon profil', icon: User, end: false },
]

export default function ClientSidebar() {
  const { user, logout } = useAuth()
  const { appointments } = useWorkspace()
  if (!user) return null

  const unreadMsg = countUnreadMessages(user.id)
  const unreadNotif = countUnreadNotifications(user.id)
  const pendingDocs = countPendingRequestsForUser(user.id)
  const pendingBilling = countPendingClientBilling(user.id)
  const upcomingAgenda = appointments.filter(
    (a) => a.userId === user.id && new Date(a.startAt).getTime() >= Date.now(),
  ).length

  function badgeCount(type?: string) {
    if (type === 'messages') return unreadMsg
    if (type === 'notif') return unreadNotif
    if (type === 'docs') return pendingDocs
    if (type === 'billing') return pendingBilling
    if (type === 'agenda') return upcomingAgenda
    return 0
  }

  return (
    <aside className="workspace-sidebar workspace-sidebar--client">
      <div className="workspace-sidebar-brand">
        <span className="workspace-sidebar-mark">Sirius</span>
        <span className="workspace-sidebar-zone">Espace client</span>
      </div>

      <div className="client-sidebar-user">
        <span className="client-sidebar-avatar">{userInitials(user.name)}</span>
        <div className="min-w-0">
          <p className="client-sidebar-name">{user.name}</p>
          <p className="client-sidebar-email">{user.email}</p>
        </div>
      </div>

      <nav className="client-sidebar-nav">
        <p className="workspace-nav-label">Navigation</p>
        {navMain.map(({ to, label, icon: Icon, end, badge }) => {
          const count = badgeCount(badge)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `client-sidebar-link ${isActive ? 'client-sidebar-link--active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
              {count > 0 && <span className="client-sidebar-badge">{count}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="client-sidebar-footer">
        <Link to="/" className="client-sidebar-link">Site vitrine</Link>
        <button type="button" className="client-sidebar-link client-sidebar-link--logout" onClick={logout}>
          <LogOut size={18} strokeWidth={1.75} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
