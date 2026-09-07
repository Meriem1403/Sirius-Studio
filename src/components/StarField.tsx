import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
  layer: number
  hue: number
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  life: number
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars: Star[] = []
    let shootingStars: ShootingStar[] = []
    let lastShootingStar = 0
    let rafId = 0
    let lastFrame = 0
    const fps = reducedMotion ? 15 : 30
    const frameInterval = 1000 / fps

    const mouse = { x: 0.5, y: 0.5 }
    const smooth = { x: 0.5, y: 0.5 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    const initStars = (w: number, h: number) => {
      const area = w * h
      stars = []

      const layers = [
        { count: Math.floor(area / 14000), sizeMin: 0.3, sizeMax: 0.9, layer: 0 },
        { count: Math.floor(area / 10000), sizeMin: 0.6, sizeMax: 1.5, layer: 1 },
        { count: Math.floor(area / 20000), sizeMin: 1.1, sizeMax: 2, layer: 2 },
      ]

      layers.forEach(({ count, sizeMin, sizeMax, layer }) => {
        for (let i = 0; i < count; i++) {
          const roll = Math.random()
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * (sizeMax - sizeMin) + sizeMin,
            opacity: Math.random() * 0.4 + (layer === 2 ? 0.35 : 0.15),
            twinkleSpeed: Math.random() * 0.012 + 0.004,
            twinkleOffset: Math.random() * Math.PI * 2,
            layer,
            hue: roll > 0.88 ? 240 : roll > 0.76 ? 260 : 0,
          })
        }
      })

      stars.sort((a, b) => a.layer - b.layer)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      initStars(w, h)
    }

    const spawnShootingStar = (time: number, w: number, h: number) => {
      if (reducedMotion) return
      if (time - lastShootingStar < 3500 + Math.random() * 5000) return
      if (Math.random() > 0.4) return

      lastShootingStar = time
      shootingStars.push({
        x: Math.random() * w * 0.85,
        y: Math.random() * h * 0.45,
        length: 90 + Math.random() * 110,
        speed: 7 + Math.random() * 7,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        life: 1,
      })
    }

    const drawStar = (
      star: Star,
      time: number,
      parallaxX: number,
      parallaxY: number,
    ) => {
      const depth = star.layer + 1
      const px = star.x + parallaxX * depth * 16
      const py = star.y + parallaxY * depth * 16
      const twinkle = reducedMotion
        ? 1
        : 0.65 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.35
      const opacity = star.opacity * twinkle

      ctx.fillStyle =
        star.hue === 0
          ? `rgba(255, 255, 255, ${opacity})`
          : `hsla(${star.hue}, 70%, 82%, ${opacity})`

      ctx.beginPath()
      ctx.arc(px, py, star.size, 0, Math.PI * 2)
      ctx.fill()

      if (star.layer === 2 && star.size > 1.5 && opacity > 0.45) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.12})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(px - star.size * 3.5, py)
        ctx.lineTo(px + star.size * 3.5, py)
        ctx.moveTo(px, py - star.size * 3.5)
        ctx.lineTo(px, py + star.size * 3.5)
        ctx.stroke()
      }
    }

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw)

      if (time - lastFrame < frameInterval) return
      lastFrame = time

      const w = window.innerWidth
      const h = window.innerHeight
      const lerp = reducedMotion ? 1 : 0.05

      smooth.x += (mouse.x - smooth.x) * lerp
      smooth.y += (mouse.y - smooth.y) * lerp

      const parallaxX = (smooth.x - 0.5) * 2
      const parallaxY = (smooth.y - 0.5) * 2

      ctx.clearRect(0, 0, w, h)
      stars.forEach((star) => drawStar(star, time, parallaxX, parallaxY))

      spawnShootingStar(time, w, h)

      shootingStars = shootingStars.filter((ss) => {
        ss.x += Math.cos(ss.angle) * ss.speed
        ss.y += Math.sin(ss.angle) * ss.speed
        ss.life -= 0.02

        if (ss.life <= 0) return false

        const gradient = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length,
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.life * 0.85})`)
        gradient.addColorStop(0.35, `rgba(165, 180, 252, ${ss.life * 0.35})`)
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length,
        )
        ctx.stroke()

        return true
      })
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
