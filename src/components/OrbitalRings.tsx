import { motion } from 'framer-motion'

const rings = [
  { radius: 180, duration: 25, opacity: 0.15 },
  { radius: 260, duration: 35, opacity: 0.09 },
  { radius: 340, duration: 45, opacity: 0.05 },
  { radius: 420, duration: 55, opacity: 0.03 },
]

export default function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="relative w-[840px] h-[840px]">
        {rings.map((ring, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-indigo-400/20 border-dashed"
            style={{
              margin: `${(840 - ring.radius * 2) / 2}px`,
              opacity: ring.opacity,
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {[0, 72, 144, 216, 288].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{ transformOrigin: '0 0' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 18 + i * 4, repeat: Infinity, ease: 'linear', delay: i * 1.5 }}
          >
            <div
              className="rounded-full"
              style={{
                width: 4,
                height: 4,
                transform: `translateX(${160 + i * 35}px)`,
                background: 'rgba(165, 180, 252, 0.5)',
                boxShadow: '0 0 8px rgba(129, 140, 248, 0.4)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
