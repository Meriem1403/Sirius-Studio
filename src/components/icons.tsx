import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'

interface CtaIconProps {
  className?: string
  size?: number
}

export function CtaIcon({ className = '', size = 16 }: CtaIconProps) {
  return <Sparkles className={className} size={size} strokeWidth={2} />
}

export function IconBadge({
  icon: Icon,
  className = '',
  iconClassName = '',
  size = 'md',
}: {
  icon: LucideIcon
  className?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 16 },
    md: { box: 'w-10 h-10', icon: 20 },
    lg: { box: 'w-16 h-16', icon: 28 },
  }

  const s = sizes[size]

  return (
    <div className={`${s.box} rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 ${className}`}>
      <Icon size={s.icon} className={iconClassName} strokeWidth={1.75} />
    </div>
  )
}
