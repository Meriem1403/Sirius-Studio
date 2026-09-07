import { useEffect, useRef } from 'react'

const nebulae = [
  { top: '8%', left: '12%', size: 520, color: 'rgba(124, 127, 245, 0.22)' },
  { top: '55%', left: '72%', size: 640, color: 'rgba(192, 132, 252, 0.16)' },
  { top: '72%', left: '18%', size: 480, color: 'rgba(56, 189, 248, 0.12)' },
  { top: '30%', left: '85%', size: 360, color: 'rgba(167, 139, 250, 0.1)' },
]

const orbitArcs = [
  { width: 900, height: 900, top: '-10%', left: '50%', opacity: 0.04 },
  { width: 1200, height: 600, top: '40%', left: '-15%', opacity: 0.03 },
  { width: 700, height: 700, top: '65%', left: '60%', opacity: 0.035 },
]

export default function CosmicBackground() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const smooth = useRef({ x: 0.5, y: 0.5 })
  const rafId = useRef(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.04
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.04

      const el = parallaxRef.current
      if (el) {
        const x = (smooth.current.x - 0.5) * 24
        const y = (smooth.current.y - 0.5) * 16
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }

      rafId.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={parallaxRef} className="absolute inset-[-30px] will-change-transform">
        <div className="absolute inset-0 bg-[#030308]" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(49, 46, 129, 0.35) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 80% 80%, rgba(76, 29, 149, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 10% 60%, rgba(30, 58, 138, 0.15) 0%, transparent 45%),
              linear-gradient(180deg, #050508 0%, #030308 40%, #020206 100%)
            `,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          }}
        />

        {nebulae.map((nebula, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: nebula.top,
              left: nebula.left,
              width: nebula.size,
              height: nebula.size,
              background: `radial-gradient(circle, ${nebula.color} 0%, transparent 65%)`,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(80px)',
            }}
          />
        ))}

        {orbitArcs.map((arc, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-indigo-400/30 border-dashed"
            style={{
              width: arc.width,
              height: arc.height,
              top: arc.top,
              left: arc.left,
              transform: 'translate(-50%, -50%)',
              opacity: arc.opacity,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <div className="absolute inset-0 cosmic-noise opacity-[0.035] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#030308]/80 to-transparent pointer-events-none" />
    </div>
  )
}
