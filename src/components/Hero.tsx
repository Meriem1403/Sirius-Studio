import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import OrbitalRings from './OrbitalRings'
import HeroVisual from './HeroVisual'

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-6 sm:pb-8">
      {/* Orbital decor — desktop right, mobile centered behind */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 lg:left-[70%] xl:left-[66%] 2xl:left-[62%] -translate-x-1/2 -translate-y-1/2 scale-[0.65] sm:scale-75 md:scale-90 lg:scale-90 xl:scale-100 2xl:scale-110 opacity-50 sm:opacity-60 lg:opacity-80 xl:opacity-100">
          <OrbitalRings />
        </div>
      </div>

      <div className="relative z-10 w-full section-inner px-4 sm:px-6 lg:px-8 2xl:px-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-x-12 xl:gap-x-16 2xl:gap-x-20 items-center w-full">
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
              className="text-base sm:text-lg xl:text-xl text-white/50 w-full mb-8 sm:mb-10 leading-relaxed"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto mb-2 sm:mb-0"
            >
              <a href="#contact" className="btn-primary w-full sm:w-auto shrink-0">
                Demander ma maquette gratuite
              </a>
              <a href="#parcours" className="btn-secondary w-full sm:w-auto shrink-0">
                Découvrir le parcours
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </motion.div>
          </div>

          {/* Visual */}
          <div className="min-w-0 order-1 lg:order-2 w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none lg:justify-self-end">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.a
        href="#parcours"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 shrink-0 mt-14 sm:mt-16 lg:mt-20 flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors duration-400"
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
