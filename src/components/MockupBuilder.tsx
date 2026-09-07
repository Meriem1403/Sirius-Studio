import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { CtaIcon } from './icons'

const buildSteps = [
  { label: 'Analyse', duration: 2000 },
  { label: 'Structure', duration: 2500 },
  { label: 'Design', duration: 3000 },
  { label: 'Maquette', duration: 2500 },
]

export default function MockupBuilder() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepDuration = buildSteps[currentStep].duration
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((s) => (s + 1) % buildSteps.length)
          return 0
        }
        return prev + (100 / (stepDuration / 50))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [currentStep])

  return (
    <section id="processus" className="section-wrap overflow-hidden">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-4">Notre processus</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Votre maquette se construit
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl xl:max-w-2xl mx-auto">
            De votre idée à une expérience visuelle concrète — en quelques jours, gratuitement.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps timeline */}
          <div className="space-y-6">
            {buildSteps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  currentStep === i ? 'glass border border-indigo-500/20' : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  currentStep === i ? 'bg-indigo-500/20 border border-indigo-500/40' : 'bg-white/5 border border-white/10'
                }`}>
                  {currentStep > i ? (
                    <Check size={16} className="text-indigo-400" strokeWidth={2.5} />
                  ) : (
                    <span className="text-sm text-white/60">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${currentStep === i ? 'text-white' : 'text-white/50'}`}>{step.label}</p>
                  {currentStep === i && (
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <a href="#contact" className="btn-primary inline-flex items-center gap-2">
                <CtaIcon size={16} />
                Lancer ma maquette gratuite
              </a>
            </motion.div>
          </div>

          {/* Live mockup preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl" />
            <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-zinc-900/80 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                </div>
                <span className="text-xs text-white/30 ml-2">maquette-sirius.preview</span>
              </div>

              <div className="p-6 min-h-[360px] relative bg-gradient-to-br from-zinc-900 to-indigo-950/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MockupStage step={currentStep} progress={progress} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MockupStage({ step, progress }: { step: number; progress: number }) {
  if (step === 0) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-indigo-300/60 uppercase tracking-wider mb-4">Analyse en cours...</p>
        {['Objectifs', 'Cible', 'Concurrence', 'Identité'].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: progress > i * 25 ? 1 : 0.2, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className={`w-2 h-2 rounded-full ${progress > i * 25 ? 'bg-indigo-400' : 'bg-white/10'}`} />
            <span className="text-sm text-white/50">{item}</span>
            {progress > i * 25 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="flex-1 h-px bg-indigo-500/30"
              />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  if (step === 1) {
    return (
      <div>
        <p className="text-xs text-indigo-300/60 uppercase tracking-wider mb-4">Structure...</p>
        <div className="grid grid-cols-4 gap-2 h-48">
          {['Header', 'Hero', 'Contenu', 'Footer'].map((block, i) => (
            <motion.div
              key={block}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: progress > i * 20 ? 1 : 0.2,
                scale: progress > i * 20 ? 1 : 0.9,
              }}
              className={`rounded-lg border border-dashed border-indigo-500/20 flex items-center justify-center ${
                i === 1 ? 'col-span-4 h-20' : i === 2 ? 'col-span-4 h-24' : 'col-span-4 h-8'
              }`}
            >
              <span className="text-[10px] text-white/30">{block}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div>
        <p className="text-xs text-indigo-300/60 uppercase tracking-wider mb-4">Design...</p>
        <div className="space-y-3">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-6 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded w-2/3 shimmer"
          />
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-4/5" />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="h-10 bg-indigo-500/20 rounded-full w-36 border border-indigo-500/30 mt-4"
          />
          <div className="grid grid-cols-3 gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: progress > i * 30 ? 1 : 0.2 }}
                className="h-16 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg border border-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-indigo-300/60 uppercase tracking-wider mb-4 flex items-center gap-2">
        Maquette finale
        <Sparkles size={12} className="text-indigo-400" strokeWidth={2} />
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-indigo-400/40 rounded w-20 shimmer" />
          <div className="flex gap-3">
            {['Accueil', 'Services', 'Contact'].map((n) => (
              <span key={n} className="text-[10px] text-indigo-200/50">{n}</span>
            ))}
          </div>
        </div>
        <div className="h-24 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-500/20 rounded-xl border border-indigo-500/20 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center"
          >
            <div className="h-4 bg-white/20 rounded w-32 mx-auto mb-2 shimmer" />
            <div className="h-8 bg-indigo-500/30 rounded-full w-24 mx-auto border border-indigo-400/30" />
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-white/5 rounded-lg border border-white/5 p-2">
              <div className="h-2 bg-indigo-400/20 rounded w-2/3 mb-1" />
              <div className="h-1.5 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
