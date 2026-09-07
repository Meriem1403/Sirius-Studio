import { motion } from 'framer-motion'
import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import Logo from './Logo'
import { CtaIcon } from './icons'

const navigation = [
  { label: 'Parcours', href: '#parcours' },
  { label: 'Transformations', href: '#transformations' },
  { label: 'Processus', href: '#processus' },
  { label: 'Expertise', href: '#services' },
  { label: 'Commencer', href: '#contact' },
]

const expertise = [
  'Sites web sur mesure',
  'Applications mobiles',
  'Logiciels & dashboards',
  'Refonte & modernisation',
  'Maquettes gratuites',
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer relative z-10 mt-8 pb-6">
      <div className="footer-glow pointer-events-none" aria-hidden="true" />

      <div className="section-inner relative px-4 sm:px-6 lg:px-8">
        {/* CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="footer-cta"
        >
          <div className="footer-cta-copy">
            <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/75 mb-2">
              Prêt à démarrer ?
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
              Votre prochain site commence ici.
            </h2>
            <p className="text-white/40 text-sm sm:text-base max-w-xl">
              Décrivez votre projet et recevez une première maquette sous 48h, gratuitement.
            </p>
          </div>
          <a href="#contact" className="btn-primary footer-cta-btn shrink-0 inline-flex items-center justify-center gap-2">
            <CtaIcon size={16} />
            Demander ma maquette
            <ArrowUpRight size={15} strokeWidth={2} />
          </a>
        </motion.div>

        {/* Main grid */}
        <div className="footer-grid">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="footer-brand"
          >
            <Logo size="md" />
            <p className="text-sm text-white/40 leading-relaxed mt-5 max-w-xs">
              Sirius Studio conçoit des expériences digitales sur mesure, de la maquette gratuite au
              produit final.
            </p>
            <div className="flex flex-col gap-2.5 mt-6">
              <a href="#contact" className="footer-contact-link">
                <Mail size={14} strokeWidth={1.75} />
                Formulaire de contact
              </a>
              <span className="footer-contact-link footer-contact-link--static">
                <MapPin size={14} strokeWidth={1.75} />
                France · Projets à distance
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <p className="footer-col-title">Navigation</p>
            <ul className="footer-links">
              {navigation.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                    <ArrowUpRight size={12} className="footer-link-icon" strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <p className="footer-col-title">Expertise</p>
            <ul className="footer-list">
              {expertise.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <p className="footer-col-title">Sirius Studio</p>
            <ul className="footer-list">
              <li>Maquette offerte sous 48h</li>
              <li>Sans engagement initial</li>
              <li>Accompagnement sur mesure</li>
              <li>Sites, apps et logiciels</li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="text-xs text-white/25">
            © {year} Sirius Studio. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="#contact" className="footer-legal-link">
              Contact
            </a>
            <a href="#" className="footer-legal-link">
              Mentions légales
            </a>
            <a href="#" className="footer-legal-link">
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
