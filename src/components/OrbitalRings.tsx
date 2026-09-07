import { motion } from 'framer-motion'

const rings = [
  { radius: 180, duration: 25, opacity: 0.15, dash: '4 8' },
  { radius: 260, duration: 35, opacity: 0.1, dash: '2 12' },
  { radius: 340, duration: 45, opacity: 0.06, dash: '1 16' },
]

export default function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="relative w-[700px] h-[700px]">
        {rings.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-indigo-400/20 border-dashed"
            style={{
              margin: `${(700 - ring.radius * 2) / 2}px`,
              opacity: ring.opacity,
              borderStyle: 'dashed',
            } as React.CSSProperties}
            animate={{ rotate: 360 }}
            transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Sirius star glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="w-4 h-4 rounded-full bg-white"
            style={{ boxShadow: '0 0 40px 20px rgba(255,255,255,0.3), 0 0 80px 40px rgba(99,102,241,0.2)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Orbiting particles */}
        {[0, 120, 240].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1"
            style={{ transformOrigin: '0 0' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 2 }}
          >
            <div
              className="rounded-full bg-indigo-400/60"
              style={{
                width: 6 - i,
                height: 6 - i,
                transform: `translateX(${180 + i * 40}px)`,
                boxShadow: '0 0 10px rgba(129,140,248,0.5)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
