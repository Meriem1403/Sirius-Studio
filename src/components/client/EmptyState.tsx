import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="client-empty-state">
      <div className="client-empty-state-icon">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="client-empty-state-title">{title}</h3>
      <p className="client-empty-state-desc">{description}</p>
      {actionLabel && actionHref && (
        <Link to={actionHref} className="btn-primary inline-flex mt-4">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
