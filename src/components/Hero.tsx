import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Clock, Shield, Sparkles } from 'lucide-react'
import OrbitalRings from './OrbitalRings'
import HeroVisual, { HeroExpertise } from './HeroVisual'
import { CtaIcon } from './icons'

const trustPoints = [
  { icon: Sparkles, text: 'Maquette offerte' },
  { icon: Clock, text: 'Réponse 48h' },
  { icon: Shield, text: 'Sans engagement' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
      {/* Orbital decor — desktop right, mobile centered behind */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 lg:left-[70%] xl:left-[66%] 2xl:left-[62%] -translate-x-1/2 -translate-y-1/2 scale-[0.65] sm:scale-75 md:scale-90 lg:scale-90 xl:scale-100 2xl:scale-110 opacity-50 sm:opacity-60 lg:opacity-80 xl:opacity-100">
          <OrbitalRings />
        </div>
      </div>

      <div className="relative z-10 w-full section-inner px-4 sm:px-6 lg:px-8 2xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-x-12 xl:gap-x-16 2xl:gap-x-20 items-center">
          {/* Copy */}
          <div className="min-w-0 order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none xl:max-w-[44rem] 2xl:max-w-[48rem]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 sm:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              L&apos;étoile la plus brillante du digital
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="text-[1.875rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl 2xl:text-6xl font-semibold tracking-tight mb-5 sm:mb-6 w-full"
            >
              Votre idée mérite
              <br />
              <span className="glow-text">d&apos;être visible.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg xl:text-xl text-white/50 w-full mb-6 sm:mb-8 leading-relaxed"
            >
              Sirius Studio transforme vos idées en expériences digitales concrètes.
              <span className="block mt-2 text-white/65">
                <span className="text-indigo-300">Sites web</span>
                <span className="text-white/25 mx-2">·</span>
                <span className="text-violet-300">Applications mobiles</span>
                <span className="text-white/25 mx-2">·</span>
                <span className="text-sky-300">Logiciels sur mesure</span>
              </span>
            </motion.p>

            {/* Offer highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hero-offer-card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 rounded-2xl mb-8 sm:mb-10 w-full text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 text-indigo-300">
                <CtaIcon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-medium text-white">
                  Première maquette offerte
                </p>
                <p className="text-xs sm:text-sm text-white/45 mt-0.5">
                  Visualisez votre futur site avant de vous engager, gratuitement.
                </p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto mb-8 sm:mb-10"
            >
              <a href="#contact" className="btn-primary w-full sm:w-auto shrink-0">
                <CtaIcon size={16} />
                Demander ma maquette gratuite
              </a>
              <a href="#parcours" className="btn-secondary w-full sm:w-auto shrink-0">
                Découvrir le parcours
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 sm:gap-x-6 mb-8 lg:mb-0 w-full"
            >
              {trustPoints.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-xs sm:text-sm text-white/35 whitespace-nowrap">
                  <Icon size={14} className="text-indigo-400/70 shrink-0" strokeWidth={1.75} />
                  {text}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="hidden lg:block mt-8 xl:mt-10 w-full"
            >
              <HeroExpertise />
            </motion.div>
          </div>

          {/* Visual */}
          <div className="min-w-0 order-1 lg:order-2 w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none lg:justify-self-end">
            <HeroVisual />
          </div>
        </div>

        {/* Mobile / tablet expertise */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="lg:hidden flex justify-center mt-8 max-w-xl mx-auto"
        >
          <HeroExpertise />
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.a
        href="#parcours"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors duration-400"
        aria-label="Défiler vers le parcours"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Explorer</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.div>
      </motion.a>
    </section>
  )
}
