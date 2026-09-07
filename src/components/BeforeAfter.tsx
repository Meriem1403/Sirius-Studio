import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ChevronsLeftRight } from 'lucide-react'

const projects = [
  {
    name: 'Boutique Artisanale',
    category: 'E-commerce',
    before: { bg: 'from-zinc-800 to-zinc-900', accent: 'bg-zinc-600', text: 'text-zinc-500' },
    after: { bg: 'from-indigo-950 to-zinc-900', accent: 'bg-indigo-500/40', text: 'text-indigo-200' },
  },
  {
    name: 'Cabinet Médical',
    category: 'Site vitrine',
    before: { bg: 'from-zinc-800 to-zinc-900', accent: 'bg-zinc-600', text: 'text-zinc-500' },
    after: { bg: 'from-emerald-950 to-zinc-900', accent: 'bg-emerald-500/40', text: 'text-emerald-200' },
  },
  {
    name: 'Startup SaaS',
    category: 'Landing page',
    before: { bg: 'from-zinc-800 to-zinc-900', accent: 'bg-zinc-600', text: 'text-zinc-500' },
    after: { bg: 'from-violet-950 to-zinc-900', accent: 'bg-violet-500/40', text: 'text-violet-200' },
  },
]

export default function BeforeAfter() {
  const [activeProject, setActiveProject] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sliderRaw = useMotionValue(50)
  const sliderPos = useSpring(sliderRaw, { stiffness: 400, damping: 35, mass: 0.5 })
  const clipPath = useTransform(sliderPos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const handleLeft = useTransform(sliderPos, (v) => `${v}%`)

  const project = projects[activeProject]

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pos = ((clientX - rect.left) / rect.width) * 100
    sliderRaw.set(Math.min(Math.max(pos, 5), 95))
  }, [sliderRaw])

  return (
    <section id="transformations" className="section-wrap relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent pointer-events-none" />

      <div className="section-inner relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-4">Transformations</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Avant / Après
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Glissez pour découvrir la transformation. Chaque projet commence par une maquette gratuite.
          </p>
        </motion.div>

        {/* Project tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {projects.map((p, i) => (
            <motion.button
              key={p.name}
              onClick={() => { setActiveProject(i); sliderRaw.set(50) }}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                activeProject === i
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {p.name}
            </motion.button>
          ))}
        </div>

        {/* Before/After slider */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 select-none"
          onMouseMove={(e) => isDragging && handleMove(e.clientX)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
          {/* Browser chrome */}
          <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-zinc-800 rounded-md px-3 py-1 text-xs text-white/30 text-center">
                {project.name.toLowerCase().replace(' ', '')}.com
              </div>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[480px] cursor-col-resize">
            {/* After (full width background) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${project.after.bg} p-8`}>
              <MockupContent variant="after" project={project} />
            </div>

            {/* Before (clipped) */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${project.before.bg} p-8 overflow-hidden`}
              style={{ clipPath }}
            >
              <MockupContent variant="before" project={project} />
            </motion.div>

            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-col-resize z-20"
              style={{ left: handleLeft, x: '-50%' }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-105"
              >
                <ChevronsLeftRight size={16} className="text-zinc-700" strokeWidth={2} />
              </div>
            </motion.div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 text-xs text-white/60 z-10">Avant</div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-indigo-950/70 text-xs text-indigo-200 z-10">Après</div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-white/30 text-sm mt-6"
        >
          {project.category} — Maquette réalisée en 48h
        </motion.p>
      </div>
    </section>
  )
}

function MockupContent({ variant, project }: { variant: 'before' | 'after'; project: typeof projects[0] }) {
  const isAfter = variant === 'after'

  return (
    <div className="h-full flex flex-col">
      <div className={`flex items-center justify-between mb-8 ${isAfter ? '' : 'opacity-60'}`}>
        <div className={`h-4 rounded ${isAfter ? project.after.accent : project.before.accent} w-24`} />
        <div className="flex gap-4">
          {['Accueil', 'Services', 'Contact'].map((item) => (
            <span key={item} className={`text-xs ${isAfter ? project.after.text : project.before.text}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className={`h-8 rounded mb-3 ${isAfter ? project.after.accent : project.before.accent} ${isAfter ? 'w-3/4 shimmer' : 'w-2/3'}`} />
        <div className={`h-3 rounded mb-2 ${isAfter ? 'bg-white/10' : 'bg-zinc-700'} w-full`} />
        <div className={`h-3 rounded mb-2 ${isAfter ? 'bg-white/10' : 'bg-zinc-700'} w-5/6`} />
        <div className={`h-3 rounded mb-6 ${isAfter ? 'bg-white/10' : 'bg-zinc-700'} w-4/6`} />

        {isAfter ? (
          <div className={`h-10 rounded-full ${project.after.accent} w-40 border border-white/10`} />
        ) : (
          <div className="h-8 bg-zinc-700 rounded w-32" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-20 rounded-lg ${isAfter ? `${project.after.accent} border border-white/5` : 'bg-zinc-700/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
