import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Compass, LayoutTemplate, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CtaIcon } from './icons'

const paths: {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  features: string[]
  color: string
  border: string
  glow: string
}[] = [
  {
    id: 'existing',
    icon: LayoutTemplate,
    title: "J'ai déjà un site",
    subtitle: 'Refonte & modernisation',
    description: 'Votre site actuel ne reflète plus votre activité ? Sirius analyse, repense et transforme votre présence en ligne avec une maquette avant/après.',
    features: ['Audit visuel complet', 'Maquette avant/après', 'Performance & SEO'],
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
  {
    id: 'idea',
    icon: Lightbulb,
    title: "J'ai une idée / des besoins",
    subtitle: 'De l\'idée à la maquette',
    description: 'Vous avez une vision claire ? Décrivez vos besoins et Sirius les traduit en maquette interactive, fidèle à votre ambition.',
    features: ['Atelier de cadrage', 'Maquette sur mesure', 'Parcours utilisateur'],
    color: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/20',
    glow: 'shadow-indigo-500/10',
  },
  {
    id: 'unknown',
    icon: Compass,
    title: 'Je ne sais pas ce que je veux',
    subtitle: 'Sirius imagine pour vous',
    description: 'Pas de brief précis ? Sirius analyse votre activité, votre marché et imagine une proposition digitale adaptée à votre univers.',
    features: ['Analyse de votre secteur', 'Proposition créative', 'Maquette surprenante'],
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/20',
    glow: 'shadow-purple-500/10',
  },
]

export default function JourneyPaths() {
  const [active, setActive] = useState('idea')

  const activePath = paths.find((p) => p.id === active)!
  const ActiveIcon = activePath.icon

  return (
    <section id="parcours" className="section-wrap">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-4">Votre parcours</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Où en êtes-vous ?
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            Quelle que soit votre situation, Sirius part de là où vous êtes pour construire votre expérience digitale.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {paths.map((path) => {
            const Icon = path.icon
            return (
              <motion.button
                key={path.id}
                onClick={() => setActive(path.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative text-left p-6 rounded-2xl border cursor-pointer interactive-card ${
                  active === path.id
                    ? `glass ${path.border} shadow-lg ${path.glow}`
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
                }`}
                whileHover={{
                  borderColor: active === path.id ? undefined : 'rgba(255,255,255,0.15)',
                }}
                whileTap={{ scale: 0.99 }}
              >
                {active === path.id && (
                  <motion.div
                    layoutId="activePath"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${path.color} opacity-50`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative">
                  <div className="mb-3 text-indigo-300">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-medium mb-1">{path.title}</h3>
                  <p className="text-sm text-white/40">{path.subtitle}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${activePath.color} rounded-full blur-[100px] opacity-30 pointer-events-none`} />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="mb-4 text-purple-300">
                  <ActiveIcon size={32} strokeWidth={1.75} />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">{activePath.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed mb-6">{activePath.description}</p>
                <ul className="space-y-3 mb-8">
                  {activePath.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/60">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-indigo-400" strokeWidth={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="btn-primary inline-flex items-center gap-2">
                  <CtaIcon size={16} />
                  Demander ma maquette gratuite
                </a>
              </div>

              <div className="relative">
                <PathVisual type={active} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function PathVisual({ type }: { type: string }) {
  if (type === 'existing') {
    return (
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="bg-zinc-800 px-3 py-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-2 h-4 bg-zinc-700/80 rounded text-[8px] text-zinc-500 flex items-center px-2">ancien-site.fr</div>
            </div>
            <div className="p-4 space-y-2 bg-zinc-900/80 aspect-[16/10]">
              <div className="h-3 bg-zinc-700 rounded w-3/4" />
              <div className="h-2 bg-zinc-800 rounded w-full" />
              <div className="h-2 bg-zinc-800 rounded w-5/6" />
              <div className="h-12 bg-zinc-800 rounded mt-3" />
            </div>
            <div className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs text-center">Avant</div>
          </div>
          <div className="rounded-xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <div className="bg-zinc-900 px-3 py-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-2 h-4 bg-indigo-950/80 rounded text-[8px] text-indigo-400/60 flex items-center px-2">nouveau-site.fr</div>
            </div>
            <div className="p-4 space-y-2 bg-gradient-to-br from-indigo-950/50 to-zinc-900 aspect-[16/10]">
              <div className="h-3 bg-indigo-400/30 rounded w-3/4 shimmer" />
              <div className="h-2 bg-white/10 rounded w-full" />
              <div className="h-2 bg-white/10 rounded w-5/6" />
              <div className="h-12 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded mt-3 border border-indigo-500/20" />
            </div>
            <div className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 text-xs text-center">Après</div>
          </div>
        </div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center z-10 shadow-lg shadow-indigo-500/50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
      </div>
    )
  }

  if (type === 'idea') {
    return (
      <div className="space-y-3">
        {['Brief client', 'Wireframe', 'Maquette'].map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 font-medium">
              {i + 1}
            </div>
            <div className="flex-1 glass rounded-xl p-4">
              <p className="text-sm font-medium mb-2">{step}</p>
              <div className="space-y-1.5">
                <div className={`h-2 rounded bg-white/10 ${i === 0 ? 'w-full' : i === 1 ? 'w-4/5' : 'w-full shimmer'}`} />
                <div className={`h-2 rounded bg-white/5 ${i === 2 ? 'h-8 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/20' : 'w-3/5'}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center h-64">
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-dashed border-purple-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-dashed border-indigo-500/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative z-10 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/20 flex items-center justify-center text-indigo-300"
        >
          <Compass size={28} strokeWidth={1.75} />
        </motion.div>
        <p className="text-sm text-white/40">Sirius imagine<br />votre univers digital</p>
      </div>
    </div>
  )
}
