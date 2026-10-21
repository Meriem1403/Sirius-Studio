import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LOGIN_MAQUETTE_URL, SIGNUP_MAQUETTE_URL } from '../lib/auth/maquetteEntry'

export default function Contact() {

  return (
    <section id="contact" className="section-wrap relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 50% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 62%)',
        }}
      />

      <div className="section-inner relative max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label mb-4">Commencer</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4">
            Recevez votre maquette
            <br />
            <span className="glow-text">gratuitement.</span>
          </h2>
          <p className="text-white/40 text-lg xl:text-xl max-w-xl mx-auto mb-8">
            Compte obligatoire. Sur la page suivante : Google, Apple, Microsoft, GitHub ou email,{' '}
            <strong className="text-white/70">plus votre demande de maquette</strong> en un seul formulaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={SIGNUP_MAQUETTE_URL} className="btn-primary inline-flex justify-center">
              Demander ma maquette
            </Link>
            <Link to={LOGIN_MAQUETTE_URL} className="btn-secondary inline-flex justify-center">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
