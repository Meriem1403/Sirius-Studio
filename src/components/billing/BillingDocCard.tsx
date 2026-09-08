import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface BillingDocCardProps {
  number: string
  subtitle: string
  amount: string
  badge?: ReactNode
  icon?: LucideIcon
  onClick?: () => void
  to?: string
}

export default function BillingDocCard({
  number,
  subtitle,
  amount,
  badge,
  icon: Icon,
  onClick,
  to,
}: BillingDocCardProps) {
  const inner = (
    <>
      {Icon && (
        <span className="billing-doc-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      )}
      <span className="billing-doc-body">
        <span className="billing-doc-top">
          <span className="billing-doc-number">{number}</span>
          <span className="billing-doc-amount">{amount}</span>
        </span>
        <span className="billing-doc-sub">{subtitle}</span>
        {badge && <span className="billing-doc-badge-wrap">{badge}</span>}
      </span>
      <ChevronRight size={16} className="billing-doc-chevron" aria-hidden="true" />
    </>
  )

  if (to) {
    return (
      <Link to={to} className="billing-doc-card">
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" className="billing-doc-card" onClick={onClick}>
      {inner}
    </button>
  )
}
