import { motion } from 'framer-motion'

const stars = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: (i % 3) + 1,
  opacity: 0.15 + (i % 5) * 0.12,
  delay: (i % 8) * 0.4,
}))

export default function AuthVisual() {
  return (
    <div className="auth-visual-scene">
      <div className="auth-visual-nebula auth-visual-nebula--1" />
      <div className="auth-visual-nebula auth-visual-nebula--2" />
      <div className="auth-visual-nebula auth-visual-nebula--3" />

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="auth-visual-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          animate={{ opacity: [star.opacity, star.opacity + 0.35, star.opacity] }}
          transition={{ duration: 2.5 + star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="auth-visual-rings">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="auth-visual-ring"
            style={{ inset: `${12 + i * 10}%` }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 28 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="auth-visual-core">
        <motion.div
          className="auth-visual-glow"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg viewBox="0 0 120 120" className="auth-visual-star-icon" aria-hidden="true">
          <circle cx="60" cy="60" r="54" stroke="rgba(129,140,248,0.2)" strokeWidth="0.75" strokeDasharray="3 6" fill="none" />
          <circle cx="60" cy="60" r="38" stroke="rgba(129,140,248,0.12)" strokeWidth="0.5" strokeDasharray="2 8" fill="none" />
          <path d="M60 22 L63 52 L60 58 L57 52 Z" fill="white" opacity="0.95" />
          <path d="M60 98 L63 68 L60 62 L57 68 Z" fill="white" opacity="0.45" />
          <path d="M22 60 L52 63 L58 60 L52 57 Z" fill="white" opacity="0.65" />
          <path d="M98 60 L68 63 L62 60 L68 57 Z" fill="white" opacity="0.65" />
          <circle cx="60" cy="60" r="8" fill="white" />
          <circle cx="60" cy="60" r="14" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      <div className="auth-visual-vignette" />
    </div>
  )
}
