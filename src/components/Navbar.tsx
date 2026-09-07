import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { CtaIcon } from './icons'

const navLinks = [
  { label: 'Parcours', href: '#parcours' },
  { label: 'Transformations', href: '#transformations' },
  { label: 'Processus', href: '#processus' },
  { label: 'Services', href: '#services' },
]

const sectionIds = navLinks.map((l) => l.href.replace('#', ''))

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 sm:pt-5"
      >
        <nav
          className={`nav-shell mx-auto section-inner transition-all duration-500 ${
            scrolled ? 'nav-shell--scrolled' : 'nav-shell--top'
          }`}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3 sm:py-3.5">
            <Logo size="md" />

            {/* Desktop & large tablet */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-6">
              <div className="nav-pill flex items-center gap-1 p-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.replace('#', '')
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className={`nav-pill-link relative px-4 py-2 text-sm rounded-full transition-colors duration-400 ${
                        isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navActive"
                          className="absolute inset-0 rounded-full nav-pill-active"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-[1]">{link.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* CTA desktop */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <a href="#contact" className="nav-cta inline-flex items-center gap-2 text-sm">
                <CtaIcon size={14} />
                Ma maquette gratuite
              </a>
            </div>

            {/* Tablet CTA compact */}
            <a
              href="#contact"
              className="hidden md:inline-flex lg:hidden nav-cta nav-cta--compact items-center gap-1.5 text-xs flex-shrink-0"
            >
              <CtaIcon size={12} />
              Ma maquette
            </a>

            {/* Mobile / small tablet menu button */}
            <button
              type="button"
              className="lg:hidden nav-menu-btn flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] lg:hidden mobile-nav-overlay"
          >
            <button
              type="button"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={closeMobile}
              aria-label="Fermer le menu"
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-4 mt-[4.5rem] sm:mx-6 mobile-nav-panel rounded-2xl overflow-hidden"
            >
              <div className="px-6 pt-8 pb-6 border-b border-white/[0.06]">
                <Logo size="lg" />
                <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
                  Création de sites web, apps mobiles et logiciels sur mesure.
                </p>
              </div>

              <div className="px-4 py-6 flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = activeSection === link.href.replace('#', '')
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
                      className={`mobile-nav-link flex items-center justify-between px-4 py-3.5 rounded-xl text-base ${
                        isActive ? 'mobile-nav-link--active' : ''
                      }`}
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight size={16} className={isActive ? 'text-indigo-300' : 'text-white/20'} />
                    </motion.a>
                  )
                })}
              </div>

              <div className="px-6 pb-8 pt-2">
                <motion.a
                  href="#contact"
                  onClick={closeMobile}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="nav-cta w-full justify-center py-3.5 text-base"
                >
                  <CtaIcon size={16} />
                  Demander ma maquette gratuite
                </motion.a>
                <p className="text-center text-xs text-white/25 mt-4">
                  Gratuit · Sans engagement · Réponse sous 48h
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
