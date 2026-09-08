import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface WorkspacePageHeaderProps {
  eyebrow: string
  title: string
  subtitle: string
  icon?: LucideIcon
  action?: ReactNode
  variant?: 'client' | 'admin'
}

export default function WorkspacePageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
  variant = 'client',
}: WorkspacePageHeaderProps) {
  return (
    <header className={`workspace-page-header workspace-page-header--${variant}`}>
      <div className="workspace-page-header-main">
        {Icon && (
          <span className={`workspace-page-icon workspace-page-icon--${variant}`}>
            <Icon size={22} strokeWidth={1.75} />
          </span>
        )}
        <div>
          <p className="client-page-eyebrow">{eyebrow}</p>
          <h1 className="client-page-title">{title}</h1>
          <p className="client-page-subtitle">{subtitle}</p>
        </div>
      </div>
      {action && <div className="workspace-page-header-action">{action}</div>}
    </header>
  )
}
