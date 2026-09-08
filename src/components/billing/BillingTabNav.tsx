import type { LucideIcon } from 'lucide-react'

export interface BillingTabItem<T extends string> {
  id: T
  label: string
  shortLabel?: string
  icon: LucideIcon
  count?: number
}

interface BillingTabNavProps<T extends string> {
  tabs: BillingTabItem<T>[]
  active: T
  onChange: (id: T) => void
}

export default function BillingTabNav<T extends string>({
  tabs,
  active,
  onChange,
}: BillingTabNavProps<T>) {
  return (
    <div className="billing-tab-nav" role="tablist" aria-label="Sections facturation">
      {tabs.map(({ id, label, shortLabel, icon: Icon, count }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`billing-tab ${active === id ? 'billing-tab--active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className="billing-tab-label">{label}</span>
          {shortLabel && <span className="billing-tab-label-short">{shortLabel}</span>}
          {count !== undefined && count > 0 && (
            <span className="billing-tab-count">{count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
