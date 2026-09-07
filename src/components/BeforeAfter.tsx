import { useState, useRef, useCallback, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronsLeftRight,
  HeartPulse,
  Rocket,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MotionValue } from 'framer-motion'

type ProjectTheme = {
  bg: string
  accent: string
  text: string
  muted: string
  border: string
  glow: string
}

type Project = {
  id: string
  name: string
  category: string
  slug: string
  icon: LucideIcon
  description: string
  improvements: string[]
  metrics: { label: string; before: string; after: string; highlight?: boolean }[]
  before: ProjectTheme
  after: ProjectTheme
}

const projects: Project[] = [
  {
    id: 'artisan',
    name: 'Boutique Artisanale',
    category: 'E-commerce',
    slug: 'boutique-artisanale.com',
    icon: ShoppingBag,
    description:
      'Une boutique en ligne datée, peu lisible sur mobile. Sirius a repensé le parcours d\'achat pour mettre les produits en avant.',
    improvements: ['Navigation simplifiée', 'Fiches produit clarifiées', 'Tunnel d\'achat fluide'],
    metrics: [
      { label: 'Chargement', before: '4,2 s', after: '1,1 s', highlight: true },
      { label: 'Rebond', before: '68 %', after: '32 %', highlight: true },
    ],
    before: {
      bg: 'from-zinc-800 to-zinc-900',
      accent: 'bg-zinc-600',
      text: 'text-zinc-500',
      muted: 'bg-zinc-700',
      border: 'border-zinc-700/50',
      glow: 'rgba(99, 102, 241, 0.35)',
    },
    after: {
      bg: 'from-indigo-950 via-[#0f0e1a] to-zinc-900',
      accent: 'bg-indigo-500/45',
      text: 'text-indigo-200',
      muted: 'bg-white/10',
      border: 'border-indigo-400/20',
      glow: 'rgba(99, 102, 241, 0.45)',
    },
  },
  {
    id: 'medical',
    name: 'Cabinet Médical',
    category: 'Site vitrine',
    slug: 'cabinet-dupont.fr',
    icon: HeartPulse,
    description:
      'Un site institutionnel rigide qui n\'inspirait pas confiance. La refonte met l\'accent sur la prise de rendez-vous et la réassurance patient.',
    improvements: ['Prise de RDV en ligne', 'Identité rassurante', 'Infos pratiques accessibles'],
    metrics: [
      { label: 'RDV en ligne', before: 'Non', after: 'Oui', highlight: true },
      { label: 'Appels', before: '+40 %', after: '−25 %', highlight: true },
    ],
    before: {
      bg: 'from-zinc-800 to-zinc-900',
      accent: 'bg-zinc-600',
      text: 'text-zinc-500',
      muted: 'bg-zinc-700',
      border: 'border-zinc-700/50',
      glow: 'rgba(52, 211, 153, 0.3)',
    },
    after: {
      bg: 'from-emerald-950 via-[#0a1210] to-zinc-900',
      accent: 'bg-emerald-500/40',
      text: 'text-emerald-200',
      muted: 'bg-white/10',
      border: 'border-emerald-400/20',
      glow: 'rgba(52, 211, 153, 0.4)',
    },
  },
  {
    id: 'saas',
    name: 'Startup SaaS',
    category: 'Landing page',
    slug: 'flowstack.io',
    icon: Rocket,
    description:
      'Une landing confuse qui ne convertissait pas. Sirius a clarifié le message, structuré la preuve sociale et renforcé le CTA principal.',
    improvements: ['Message principal net', 'Preuve sociale visible', 'CTA mis en avant'],
    metrics: [
      { label: 'Conversion', before: '1,2 %', after: '4,8 %', highlight: true },
      { label: 'Temps sur page', before: '28 s', after: '1 min 45', highlight: true },
    ],
    before: {
      bg: 'from-zinc-800 to-zinc-900',
      accent: 'bg-zinc-600',
      text: 'text-zinc-500',
      muted: 'bg-zinc-700',
      border: 'border-zinc-700/50',
      glow: 'rgba(139, 92, 246, 0.35)',
    },
    after: {
      bg: 'from-violet-950 via-[#100e1c] to-zinc-900',
      accent: 'bg-violet-500/40',
      text: 'text-violet-200',
      muted: 'bg-white/10',
      border: 'border-violet-400/20',
      glow: 'rgba(139, 92, 246, 0.45)',
    },
  },
]

function runSliderDemo(sliderRaw: MotionValue<number>) {
  return animate(sliderRaw, [50, 78, 22, 50], {
    duration: 2.8,
    ease: [0.22, 1, 0.36, 1],
    times: [0, 0.35, 0.7, 1],
  })
}

export default function BeforeAfter() {
  const [activeProject, setActiveProject] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sliderRaw = useMotionValue(50)
  const sliderPos = useSpring(sliderRaw, { stiffness: 380, damping: 32, mass: 0.45 })
  const clipPath = useTransform(sliderPos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const handleLeft = useTransform(sliderPos, (v) => `${v}%`)

  const project = projects[activeProject]
  const ProjectIcon = project.icon

  const handleMove = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const pos = ((clientX - rect.left) / rect.width) * 100
      sliderRaw.set(Math.min(Math.max(pos, 4), 96))
    },
    [sliderRaw],
  )

  const selectProject = (index: number) => {
    setActiveProject(index)
    sliderRaw.set(50)
  }

  useEffect(() => {
    const demo = runSliderDemo(sliderRaw)
    return () => demo.stop()
  }, [activeProject, sliderRaw])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') sliderRaw.set(Math.max(sliderRaw.get() - 5, 4))
      if (e.key === 'ArrowRight') sliderRaw.set(Math.min(sliderRaw.get() + 5, 96))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sliderRaw])

  return (
    <section id="transformations" className="section-wrap relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 40%, rgba(99, 102, 241, 0.09) 0%, transparent 68%)',
        }}
      />

      <div className="section-inner relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-12"
        >
          <span className="section-label mb-4">Transformations</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Avant et <span className="glow-text">Après</span>
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Glissez le curseur pour révéler la transformation. Chaque projet démarre par une maquette gratuite.
          </p>
        </motion.div>

        <div
          role="tablist"
          aria-label="Choisir un projet"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 lg:mb-10"
        >
          {projects.map((p, i) => {
            const Icon = p.icon
            const isActive = activeProject === i

            return (
              <motion.button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectProject(i)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`transform-tab interactive-card w-full text-left ${isActive ? 'transform-tab--active' : ''}`}
                whileTap={{ scale: 0.99 }}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="transformActiveBg"
                      className="absolute inset-0 rounded-2xl bg-indigo-500/[0.07] border border-indigo-400/15"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.55 }}
                    />
                    <motion.div layoutId="transformTabIndicator" className="transform-tab-indicator" />
                  </>
                )}

                <div className="relative flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-indigo-500/15 border-indigo-400/25 text-indigo-300'
                        : 'bg-white/[0.03] border-white/8 text-white/40'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 block mb-0.5">
                      {p.category}
                    </span>
                    <span className="text-sm font-medium text-white/85 block">{p.name}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8 xl:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="transform-stage min-w-0"
          >
            <div
              className="transform-stage-glow pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${project.after.glow} 0%, transparent 70%)`,
              }}
            />

            <div
              ref={containerRef}
              className="transform-slider relative w-full rounded-2xl overflow-hidden select-none"
              onMouseMove={(e) => isDragging && handleMove(e.clientX)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            >
              <div className="bg-[#0a0a12] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                </div>
                <div className="flex-1 mx-2 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center px-3">
                  <span className="text-[10px] text-white/30 truncate">{project.slug}</span>
                </div>
                <motion.span
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[9px] uppercase tracking-wider text-indigo-200/80 px-2 py-1 rounded-md border border-indigo-400/25 bg-indigo-500/15 flex items-center gap-1"
                >
                  <Sparkles size={9} strokeWidth={2} />
                  Live
                </motion.span>
              </div>

              <div className="relative h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] cursor-col-resize">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`after-${project.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`absolute inset-0 bg-gradient-to-br ${project.after.bg} p-6 sm:p-8`}
                  >
                    <MockupContent variant="after" project={project} />
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className={`absolute inset-0 transform-before-layer bg-gradient-to-br ${project.before.bg} p-6 sm:p-8 overflow-hidden`}
                  style={{ clipPath }}
                >
                  <MockupContent variant="before" project={project} />
                </motion.div>

                <motion.div
                  className="absolute top-0 bottom-0 transform-divider z-20 cursor-col-resize"
                  style={{ left: handleLeft, x: '-50%' }}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                >
                  <div className="transform-handle">
                    <ChevronsLeftRight size={15} className="text-zinc-700" strokeWidth={2.25} />
                  </div>
                </motion.div>

                <div className="absolute bottom-4 left-4 transform-label transform-label--before z-10">
                  Avant
                </div>
                <div className="absolute bottom-4 right-4 transform-label transform-label--after z-10">
                  Après
                </div>
              </div>
            </div>

            <p className="text-center text-white/25 text-xs mt-4 flex items-center justify-center gap-2">
              <ChevronsLeftRight size={12} strokeWidth={2} />
              Glissez pour révéler la transformation
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="transform-detail min-w-0"
              style={{
                boxShadow: `0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 48px ${project.after.glow.replace('0.45', '0.12').replace('0.4', '0.1').replace('0.35', '0.08')}`,
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl border flex items-center justify-center text-indigo-300"
                  style={{ background: `${project.after.glow.replace(/[\d.]+\)$/, '0.12)')}`, borderColor: `${project.after.glow.replace(/[\d.]+\)$/, '0.25)')}` }}
                >
                  <ProjectIcon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">{project.category}</p>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">{project.name}</h3>
                </div>
              </div>

              <p className="text-white/45 text-sm sm:text-base leading-relaxed mb-6">{project.description}</p>

              <p className="text-xs uppercase tracking-[0.15em] text-indigo-300/75 mb-3">Ce qui change</p>
              <ul className="space-y-2.5 mb-8">
                {project.improvements.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex items-center gap-2.5 text-sm text-white/55"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-indigo-300" strokeWidth={2.5} />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>

              <p className="text-xs uppercase tracking-[0.15em] text-indigo-300/75 mb-3">Impact mesuré</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {project.metrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.1 }}
                    className="transform-metric"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">{metric.label}</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-white/30 line-through decoration-white/15">{metric.before}</span>
                      <span className="text-base sm:text-lg font-semibold text-white/90 transform-metric-after">
                        {metric.after}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <a
                href="#contact"
                className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Obtenir ma maquette gratuite
                <ArrowRight size={14} strokeWidth={2} />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function MockupContent({ variant, project }: { variant: 'before' | 'after'; project: Project }) {
  const isAfter = variant === 'after'
  const theme = isAfter ? project.after : project.before

  if (project.id === 'artisan') return <ArtisanMockup isAfter={isAfter} theme={theme} />
  if (project.id === 'medical') return <MedicalMockup isAfter={isAfter} theme={theme} />
  return <SaasMockup isAfter={isAfter} theme={theme} />
}

function ArtisanMockup({ isAfter, theme }: { isAfter: boolean; theme: ProjectTheme }) {
  return (
    <div className={`h-full flex flex-col ${isAfter ? '' : 'opacity-80'}`}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className={`h-3 rounded ${theme.accent} ${isAfter ? 'w-24' : 'w-12'}`} />
        <div className="flex gap-2 sm:gap-3">
          {['Boutique', 'À propos', 'Panier'].map((item) => (
            <span key={item} className={`text-[10px] ${theme.text}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border ${theme.border} ${isAfter ? 'p-4 sm:p-5 mb-4 bg-white/[0.04] shadow-lg shadow-indigo-500/10' : 'p-3 mb-3'}`}>
        <div className={`h-6 sm:h-7 rounded mb-2.5 ${theme.accent} ${isAfter ? 'w-2/3 shimmer' : 'w-1/2'}`} />
        <div className={`h-2 rounded mb-1.5 ${theme.muted} w-full`} />
        <div className={`h-2 rounded ${theme.muted} w-4/5`} />
        {isAfter && (
          <div className={`h-8 rounded-full ${theme.accent} w-32 mt-4 border border-white/15 shadow-md shadow-indigo-500/20`} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={isAfter ? { opacity: 0, y: 8 } : false}
            animate={isAfter ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`rounded-lg border ${theme.border} ${isAfter ? 'p-2 sm:p-2.5 bg-white/[0.03]' : ''}`}
          >
            <div className={`aspect-[4/5] rounded-md ${isAfter ? theme.accent : theme.muted} mb-2`} />
            <div className={`h-1.5 rounded ${theme.muted} w-3/4 mb-1`} />
            {isAfter && <div className={`h-2 rounded ${theme.accent} w-1/2 opacity-70`} />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MedicalMockup({ isAfter, theme }: { isAfter: boolean; theme: ProjectTheme }) {
  return (
    <div className={`h-full flex flex-col ${isAfter ? '' : 'opacity-80'}`}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className={`h-3 rounded ${theme.accent} w-16`} />
        <div className="flex gap-2">
          {['Accueil', 'Équipe', 'Contact'].map((item) => (
            <span key={item} className={`text-[10px] ${theme.text}`}>{item}</span>
          ))}
        </div>
      </div>

      {isAfter ? (
        <>
          <div className={`rounded-xl border ${theme.border} p-4 sm:p-5 mb-4 bg-white/[0.04] shadow-lg shadow-emerald-500/10`}>
            <div className={`h-6 rounded ${theme.accent} w-3/4 mb-2.5 shimmer`} />
            <div className={`h-2 rounded ${theme.muted} w-full mb-2`} />
            <div className={`h-8 rounded-full ${theme.accent} w-40 mt-4 border border-white/15`} />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {['RDV', 'Urgences', 'Horaires'].map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className={`rounded-lg border ${theme.border} p-2.5 sm:p-3 text-center bg-white/[0.02]`}
              >
                <div className={`w-6 h-6 rounded-full ${theme.accent} mx-auto mb-1.5`} />
                <span className={`text-[9px] sm:text-[10px] ${theme.text}`}>{label}</span>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={`h-4 rounded ${theme.accent} w-1/2 mb-3`} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-2 rounded ${theme.muted} mb-2 ${i > 3 ? 'w-4/5' : 'w-full'}`} />
          ))}
          <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
            {[1, 2].map((i) => (
              <div key={i} className={`rounded-lg ${theme.muted} min-h-[72px]`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SaasMockup({ isAfter, theme }: { isAfter: boolean; theme: ProjectTheme }) {
  return (
    <div className={`h-full flex flex-col ${isAfter ? '' : 'opacity-80'}`}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className={`h-3 rounded ${theme.accent} ${isAfter ? 'w-16' : 'w-10'}`} />
        <div className="flex gap-2 sm:gap-3">
          {['Produit', 'Tarifs', 'Login'].map((item) => (
            <span key={item} className={`text-[10px] ${theme.text}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className={`flex-1 rounded-xl border ${theme.border} ${isAfter ? 'p-5 sm:p-6 bg-gradient-to-br from-violet-500/15 via-transparent to-indigo-500/5 shadow-lg shadow-violet-500/10' : 'p-4'}`}>
        <div className={`h-7 sm:h-8 rounded mb-3 ${theme.accent} ${isAfter ? 'w-4/5 shimmer' : 'w-3/5'}`} />
        <div className={`h-2 rounded mb-2 ${theme.muted} w-full`} />
        <div className={`h-2 rounded mb-5 ${theme.muted} w-2/3`} />
        {isAfter ? (
          <>
            <div className={`h-10 rounded-full ${theme.accent} w-36 mb-6 border border-white/15 shadow-md shadow-violet-500/20`} />
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className={`h-10 sm:h-12 rounded-lg ${theme.accent} opacity-80 mb-1.5`} />
                  <div className={`h-1.5 rounded ${theme.muted} w-full`} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className={`h-7 rounded ${theme.muted} w-24`} />
        )}
      </div>

      {isAfter && (
        <div className="flex gap-3 mt-4 justify-center opacity-60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-2 w-6 sm:w-8 rounded ${theme.muted}`} />
          ))}
        </div>
      )}
    </div>
  )
}
