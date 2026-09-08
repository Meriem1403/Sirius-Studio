import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser } from 'lucide-react'

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void
  disabled?: boolean
}

export default function SignaturePad({ onChange, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasStroke, setHasStroke] = useState(false)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      const ratio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  function pos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return
    e.preventDefault()
    drawing.current = true
    const ctx = getCtx()
    if (!ctx) return
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || disabled) return
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx) return
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    setHasStroke(true)
    onChange(canvasRef.current?.toDataURL('image/png') ?? null)
  }

  function end() {
    drawing.current = false
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasStroke(false)
    onChange(null)
  }

  return (
    <div className="billing-signature">
      <p className="billing-signature-label">Signature électronique</p>
      <canvas
        ref={canvasRef}
        className="billing-signature-canvas"
        aria-label="Zone de signature. Dessinez avec la souris ou le doigt."
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="billing-signature-actions">
        <button type="button" className="btn-secondary billing-signature-clear" onClick={clear} disabled={!hasStroke || disabled}>
          <Eraser size={14} />
          Effacer
        </button>
        {!hasStroke && <span className="client-message-hint">Signez dans le cadre ci-dessus</span>}
      </div>
    </div>
  )
}
