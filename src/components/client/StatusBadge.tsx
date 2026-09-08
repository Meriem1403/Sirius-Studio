import type { ClientProject } from '../../lib/auth/types'
import { PROJECT_STATUS_LABELS } from '../../fixtures/projects'

export default function StatusBadge({ status }: { status: ClientProject['status'] }) {
  return (
    <span className={`client-status client-status--${status}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  )
}
