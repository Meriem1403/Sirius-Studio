import type { ClientProject } from '../../lib/auth/types'
import { PROJECT_STATUS_LABELS } from '../../fixtures/projects'

interface StatusBadgeProps {
  status: ClientProject['status']
  /** Liste admin : pastille compacte, sans majuscules forcées */
  compact?: boolean
}

export default function StatusBadge({ status, compact }: StatusBadgeProps) {
  return (
    <span className={`client-status client-status--${status}${compact ? ' client-status--compact' : ''}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
