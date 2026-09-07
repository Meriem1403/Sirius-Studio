import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  LayoutTemplate,
  Lightbulb,
  Sparkles,
  Wand2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CtaIcon } from './icons'

type JourneyPath = {
  id: string
  icon: LucideIcon
  step: string
  title: string
  subtitle: string
  description: string
  deliverable: string
  features: string[]
  timeline: { title: string; detail: string }[]
  color: string
  border: string
  glow: string
  iconClass: string
  badge?: string
}

const paths: JourneyPath[] = [
  {
    id: 'existing',
    icon: LayoutTemplate,
    step: '01',
    title: "J'ai déjà un site",
    subtitle: 'Refonte & modernisation',
    deliverable: 'Maquette avant / après',
    description:
      'Votre site actuel ne reflète plus votre activité ? Sirius audite, repense et transforme votre présence en ligne — avec une maquette avant/après pour visualiser le changement.',
    features: ['Audit visuel complet', 'Maquette avant/après', 'Performance & SEO'],
    timeline: [
      { title: 'Diagnostic', detail: 'Analyse de votre site actuel et de vos objectifs.' },
      { title: 'Proposition', detail: 'Maquette avant/après pour valider la direction.' },
      { title: 'Lancement', detail: 'Développement et mise en ligne optimisée.' },
    ],
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/25',
    glow: 'shadow-blue-500/15',
    iconClass: 'text-blue-300',
  },
  {
    id: 'idea',
    icon: Lightbulb,
    step: '02',
    title: "J'ai une idée / des besoins",
    subtitle: 'De l\'idée à la maquette',
    deliverable: 'Maquette sur mesure',
    description:
      'Vous avez une vision claire ? Décrivez vos besoins et Sirius les traduit en maquette interactive, fidèle à votre ambition — sans engagement.',
    features: ['Atelier de cadrage', 'Maquette sur mesure', 'Parcours utilisateur'],
    timeline: [
      { title: 'Brief', detail: 'Échange rapide pour comprendre votre projet.' },
      { title: 'Wireframe', detail: 'Structure et parcours utilisateur validés.' },
      { title: 'Maquette', detail: 'Design complet livré sous 48h, gratuitement.' },
    ],
    color: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/25',
    glow: 'shadow-indigo-500/15',
    iconClass: 'text-indigo-300',
    badge: 'Le plus demandé',
  },
  {
    id: 'unknown',
    icon: Compass,
    step: '03',
    title: 'Je ne sais pas ce que je veux',
    subtitle: 'Sirius imagine pour vous',
    deliverable: 'Proposition créative',
    description:
      'Pas de brief précis ? Sirius analyse votre activité, votre marché et imagine une proposition digitale surprenante, adaptée à votre univers.',
    features: ['Analyse de votre secteur', 'Proposition créative', 'Maquette surprenante'],
    timeline: [
      { title: 'Exploration', detail: 'Compréhension de votre activité et de votre marché.' },
      { title: 'Direction', detail: 'Proposition créative alignée sur vos enjeux.' },
      { title: 'Révélation', detail: 'Maquette qui matérialise la piste retenue.' },
    ],
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/25',
    glow: 'shadow-purple-500/15',
    iconClass: 'text-purple-300',
  },
]

export default function JourneyPaths() {
  const [active, setActive] = useState('idea')

  const activePath = paths.find((p) => p.id === active)!
  const ActiveIcon = activePath.icon
  const activeIndex = paths.findIndex((p) => p.id === active)

  return (
    <section id="parcours" className="section-wrap relative">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 62%)',
        }}
      />

      <div className="section-inner relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-12"
        >
          <span className="section-label mb-4">Votre parcours</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Où en êtes-vous ?
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Choisissez votre situation. Sirius adapte la démarche et vous envoie une première maquette
            gratuite sous 48h.
          </p>
        </motion.div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Choisissez votre situation"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8"
        >
          {paths.map((path, index) => {
            const Icon = path.icon
            const isActive = active === path.id

            return (
              <motion.button
                key={path.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`journey-panel-${path.id}`}
                id={`journey-tab-${path.id}`}
                onClick={() => setActive(path.id)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`journey-tab interactive-card w-full pb-4 ${
                  isActive ? `journey-tab--active ${path.border} shadow-lg ${path.glow}` : ''
                }`}
                whileTap={{ scale: 0.99 }}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="journeyActiveBg"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${path.color} opacity-40`}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.55 }}
                    />
                    <motion.div layoutId="journeyTabIndicator" className="journey-tab-indicator" />
                  </>
                )}

                <div className="relative flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${
                      isActive ? 'bg-white/10 border-white/15' : 'bg-white/[0.03] border-white/8'
                    }`}
                  >
                    <Icon size={20} className={path.iconClass} strokeWidth={1.75} />
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium tracking-[0.2em] text-white/30 uppercase">
                        {path.step}
                      </span>
                      {path.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-opacity duration-300 ${
                            isActive
                              ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200'
                              : 'bg-white/[0.03] border-white/8 text-white/35 opacity-70'
                          }`}
                        >
                          {path.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base lg:text-[1.05rem] font-medium leading-snug mb-0.5">
                      {path.title}
                    </h3>
                    <p className="text-sm text-white/40 mb-2">{path.subtitle}</p>
                    <p className={`text-xs ${isActive ? 'text-indigo-300/70' : 'text-white/25'}`}>
                      → {path.deliverable}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 mt-1 transition-all duration-300 ${
                      isActive ? 'text-indigo-300 opacity-100 translate-x-0' : 'text-white/15 opacity-0 -translate-x-1'
                    }`}
                    strokeWidth={2}
                  />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Progress dots — mobile hint */}
        <div className="flex justify-center gap-2 mb-6 md:mb-8" aria-hidden="true">
          {paths.map((path, i) => (
            <button
              key={path.id}
              type="button"
              onClick={() => setActive(path.id)}
              className={`h-1.5 rounded-full transition-all duration-400 ${
                i === activeIndex ? 'w-8 bg-indigo-400' : 'w-1.5 bg-white/15 hover:bg-white/25'
              }`}
            />
          ))}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            id={`journey-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`journey-tab-${active}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="journey-panel relative overflow-hidden"
          >
            <div
              className={`absolute -top-24 -right-24 w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br ${activePath.color} rounded-full blur-[100px] opacity-40 pointer-events-none`}
            />

            <div className="relative p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 xl:gap-14 items-start">
                {/* Copy */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${activePath.iconClass}`}
                    >
                      <ActiveIcon size={24} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35 mb-0.5">
                        Parcours {activePath.step} · {activePath.deliverable}
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                        {activePath.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                    {activePath.description}
                  </p>

                  {/* Timeline */}
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-[0.15em] text-indigo-300/80 mb-5">
                      Comment ça se passe
                    </p>
                    <JourneyTimeline timeline={activePath.timeline} />
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {activePath.features.map((feature, i) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm text-white/55 bg-white/[0.04] border border-white/[0.06]"
                      >
                        <Check size={12} className="text-indigo-400 shrink-0" strokeWidth={2.5} />
                        {feature}
                      </motion.span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    <a href="#contact" className="btn-primary w-full sm:w-auto shrink-0">
                      <CtaIcon size={16} />
                      Demander ma maquette gratuite
                    </a>
                    <a
                      href="#contact"
                      className="btn-secondary w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2"
                    >
                      Parler de mon projet
                      <ArrowRight size={14} strokeWidth={2} />
                    </a>
                  </div>
                </div>

                {/* Visual */}
                <div className="min-w-0 w-full">
                  <div className="journey-visual-frame">
                    <PathVisual type={active} path={activePath} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function JourneyTimeline({
  timeline,
}: {
  timeline: { title: string; detail: string }[]
}) {
  return (
    <div className="journey-timeline">
      <div className="journey-timeline-grid">
        {timeline.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="journey-timeline-step"
          >
            <span className="journey-timeline-index">
              Étape {String(i + 1).padStart(2, '0')}
            </span>
            <p className="journey-timeline-title">{item.title}</p>
            <p className="journey-timeline-detail">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4 text-center lg:text-left">
      {children}
    </p>
  )
}

function PathVisual({ type, path }: { type: string; path: JourneyPath }) {
  if (type === 'existing') {
    return (
      <div className="relative">
        <VisualLabel>Aperçu transformation</VisualLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a12]"
          >
            <div className="bg-zinc-800/90 px-3 py-2.5 flex items-center gap-1.5 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-2 h-5 bg-zinc-700/80 rounded-md text-[9px] text-zinc-500 flex items-center px-2 truncate">
                ancien-site.fr
              </div>
            </div>
            <div className="p-4 space-y-2 bg-zinc-900/90 aspect-[4/3]">
              <div className="h-3 bg-zinc-700 rounded w-3/4" />
              <div className="h-2 bg-zinc-800 rounded w-full" />
              <div className="h-2 bg-zinc-800 rounded w-5/6" />
              <div className="h-14 bg-zinc-800 rounded mt-4" />
            </div>
            <div className="px-3 py-2 bg-red-500/10 text-red-400/90 text-xs text-center font-medium">
              Avant
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl overflow-hidden border ${path.border} shadow-lg ${path.glow} bg-[#0a0a12]`}
          >
            <div className="bg-zinc-900/90 px-3 py-2.5 flex items-center gap-1.5 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-2 h-5 bg-indigo-950/80 rounded-md text-[9px] text-indigo-400/70 flex items-center px-2 truncate">
                nouveau-site.fr
              </div>
            </div>
            <div className="p-4 space-y-2 bg-gradient-to-br from-indigo-950/60 to-zinc-900 aspect-[4/3]">
              <div className="h-3 bg-indigo-400/35 rounded w-3/4 shimmer" />
              <div className="h-2 bg-white/10 rounded w-full" />
              <div className="h-2 bg-white/10 rounded w-5/6" />
              <div className="h-14 bg-gradient-to-r from-indigo-500/25 to-purple-500/20 rounded-lg mt-4 border border-indigo-500/20" />
            </div>
            <div className="px-3 py-2 bg-indigo-500/10 text-indigo-300 text-xs text-center font-medium">
              Après — maquette Sirius
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center z-10 shadow-lg shadow-indigo-500/40 hidden sm:flex"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowRight size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
      </div>
    )
  }

  if (type === 'idea') {
    return (
      <div>
        <VisualLabel>Votre projet prend forme</VisualLabel>
        <div className={`rounded-2xl overflow-hidden border ${path.border} bg-[#0a0a12]`}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[#0a0a12]">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400/50" />
              <span className="w-2 h-2 rounded-full bg-yellow-400/50" />
              <span className="w-2 h-2 rounded-full bg-green-400/50" />
            </div>
            <div className="flex-1 mx-2 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2">
              <span className="text-[10px] text-indigo-300/50 truncate">votre-projet.sirius.preview</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {['Brief client', 'Wireframe', 'Maquette finale'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`relative flex items-stretch gap-3 ${i < 2 ? 'pb-1' : ''}`}
              >
                {i < 2 && (
                  <div className="absolute left-[1.125rem] top-10 bottom-0 w-px bg-indigo-500/20" />
                )}
                <div className="relative z-10 w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-semibold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 glass rounded-xl p-4 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium">{step}</p>
                    {i === 2 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                        48h · Gratuit
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div
                      className={`h-2 rounded bg-white/10 ${i === 0 ? 'w-full' : i === 1 ? 'w-4/5' : 'w-full shimmer'}`}
                    />
                    <div
                      className={`rounded ${
                        i === 2
                          ? 'h-10 bg-gradient-to-r from-indigo-500/20 to-purple-500/15 border border-indigo-500/20'
                          : 'h-2 bg-white/5 w-3/5'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <VisualLabel>De la page blanche à votre proposition</VisualLabel>

      <div className={`relative rounded-2xl overflow-hidden border ${path.border} shadow-lg ${path.glow} bg-[#0a0a12]`}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a12]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 mx-2 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center px-3 min-w-0">
            <span className="text-[10px] text-purple-300/60 truncate">proposition.sirius.preview</span>
          </div>
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-200 shrink-0">
            <Sparkles size={10} strokeWidth={2} />
            Sirius
          </span>
        </div>

        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#0c0c16] via-[#120e1a] to-purple-950/40 min-h-[240px] sm:min-h-[260px]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300">
              <Wand2 size={14} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] text-white/35 uppercase tracking-wider">Direction créative</p>
              <p className="text-sm font-medium text-white/80">Proposition sur mesure</p>
            </div>
          </motion.div>

          <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-4 sm:p-5 mb-4">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="h-3 w-2/3 max-w-[220px] rounded bg-white/15 mb-3 origin-left shimmer"
            />
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="h-2 w-full rounded bg-white/8 mb-2 origin-left"
            />
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="h-2 w-4/5 rounded bg-white/6 mb-4 origin-left"
            />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.45 }}
              className="h-9 w-32 rounded-full bg-gradient-to-r from-purple-500/35 to-indigo-500/30 border border-purple-400/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1 }}
                className="h-12 sm:h-14 rounded-lg bg-white/[0.03] border border-white/[0.05] p-2"
              >
                <div className="h-1.5 w-2/3 rounded bg-purple-400/20 mb-1.5" />
                <div className="h-1 w-full rounded bg-white/5" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/[0.06] bg-[#08080f]">
          {[
            { label: 'Analyse', sub: 'Votre secteur' },
            { label: 'Direction', sub: 'Piste créative' },
            { label: 'Maquette', sub: 'Livrée en 48h' },
          ].map((phase, i) => (
            <motion.div
              key={phase.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className={`px-3 py-3 text-center ${i < 2 ? 'border-r border-white/[0.05]' : ''}`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Check size={10} className="text-purple-400" strokeWidth={2.5} />
                <span className="text-[11px] font-medium text-white/70">{phase.label}</span>
              </div>
              <p className="text-[10px] text-white/30">{phase.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/35 text-center lg:text-left">
        Sirius part de votre activité pour imaginer une proposition concrète — sans brief à rédiger.
      </p>
    </div>
  )
}
