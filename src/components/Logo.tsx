import { useId } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 32, text: 'text-base', gap: 'gap-2' },
  md: { icon: 38, text: 'text-lg', gap: 'gap-2.5' },
  lg: { icon: 44, text: 'text-xl', gap: 'gap-3' },
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const s = sizes[size]
  const iconSize = s.icon
  const gradId = useId()

  return (
    <a
      href="#"
      className={`group flex items-center ${s.gap} ${className}`}
      aria-label="Sirius Studio — Accueil"
    >
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <div
          className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            transform: 'scale(1.6)',
          }}
        />
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
          aria-hidden="true"
        >
          <circle cx="22" cy="22" r="20" stroke={`url(#${gradId})`} strokeWidth="0.75" strokeDasharray="3 5" opacity="0.5" />
          <circle cx="22" cy="22" r="14" stroke="rgba(129,140,248,0.25)" strokeWidth="0.5" strokeDasharray="2 6" />
          <path d="M22 8 L23 18 L22 20 L21 18 Z" fill="white" opacity="0.95" />
          <path d="M22 36 L23 26 L22 24 L21 26 Z" fill="white" opacity="0.5" />
          <path d="M8 22 L18 23 L20 22 L18 21 Z" fill="white" opacity="0.65" />
          <path d="M36 22 L26 23 L24 22 L26 21 Z" fill="white" opacity="0.65" />
          <circle cx="22" cy="22" r="3.5" fill="white" />
          <circle cx="22" cy="22" r="6" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="44" y2="44">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-semibold tracking-tight text-white group-hover:text-indigo-100 transition-colors duration-400`}>
            Sirius
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase text-indigo-300/70 group-hover:text-indigo-300/90 transition-colors duration-400">
            Studio
          </span>
        </div>
      )}
    </a>
  )
}
