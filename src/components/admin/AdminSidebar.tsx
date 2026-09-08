import { NavLink, Link } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  Calendar,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Receipt,
  Target,
} from 'lucide-react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { useAuth } from '../../context/AuthContext'
import { countBillingActions } from '../../lib/services/billingService'
import { countUnreadMessagesForAdmin } from '../../lib/services/messageService'
import { countUnreadNotifications } from '../../lib/services/notificationService'
import { countPendingValidations } from '../../lib/services/projectService'
import { prospectStats } from '../../lib/services/prospectService'
import { userInitials } from '../../lib/client/format'

const navMain = [
  { to: '/espace-admin', label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
  { to: '/espace-admin/portefeuille', label: 'Portefeuille', icon: Briefcase, end: false },
  { to: '/espace-admin/prospection', label: 'Prospection', icon: Target, end: false, badge: 'prospects' as const },
  { to: '/espace-admin/projets', label: 'Projets clients', icon: FolderKanban, end: false, badge: 'validations' as const },
  { to: '/espace-admin/facturation', label: 'Facturation', icon: Receipt, end: false, badge: 'billing' as const },
  { to: '/espace-admin/agenda', label: 'Agenda', icon: Calendar, end: false, badge: 'agenda' as const },
  { to: '/espace-admin/messages', label: 'Messages', icon: MessageSquare, end: false, badge: 'messages' as const },
  { to: '/espace-admin/notifications', label: 'Notifications', icon: Bell, end: false, badge: 'notif' as const },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const { appointments } = useWorkspace()
  if (!user) return null

  const unreadMsg = countUnreadMessagesForAdmin()
  const unreadNotif = countUnreadNotifications(user.id)
  const pending = countPendingValidations()
  const newProspects = prospectStats().new
  const billingActions = countBillingActions()
  const upcomingAgenda = appointments.filter((a) => new Date(a.startAt).getTime() >= Date.now()).length

  function badgeCount(type?: string) {
    if (type === 'messages') return unreadMsg
    if (type === 'notif') return unreadNotif
    if (type === 'validations') return pending
    if (type === 'prospects') return newProspects
    if (type === 'billing') return billingActions
    if (type === 'agenda') return upcomingAgenda
    return 0
  }

  return (
    <aside className="workspace-sidebar workspace-sidebar--admin">
      <div className="workspace-sidebar-brand workspace-sidebar-brand--admin">
        <span className="workspace-sidebar-mark">Sirius</span>
        <span className="workspace-sidebar-zone">Administration</span>
      </div>

      <div className="client-sidebar-user">
        <span className="client-sidebar-avatar admin-sidebar-avatar">{userInitials(user.name)}</span>
        <div className="min-w-0">
          <p className="client-sidebar-name">{user.name}</p>
          <p className="client-sidebar-email">Chef de projet</p>
        </div>
      </div>

      <nav className="client-sidebar-nav">
        <p className="workspace-nav-label">Pilotage</p>
        {navMain.map(({ to, label, icon: Icon, end, badge }) => {
          const count = badgeCount(badge)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `client-sidebar-link admin-sidebar-link ${isActive ? 'client-sidebar-link--active admin-sidebar-link--active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
              {count > 0 && <span className="client-sidebar-badge admin-sidebar-badge">{count}</span>}
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
