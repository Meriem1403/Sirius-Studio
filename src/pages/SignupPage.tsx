import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Mail, User } from 'lucide-react'

export default function SignupPage() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center px-4 sm:px-6 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card w-full max-w-md p-6 sm:p-8"
      >
        <Link to="/" className="auth-back-link inline-flex items-center gap-2 text-sm mb-8">
          <ArrowLeft size={16} strokeWidth={2} />
          Retour à l&apos;accueil
        </Link>

        <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/75 mb-2">Espace client</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
          S&apos;inscrire
        </h1>
        <p className="text-sm text-white/45 mb-8">
          Créez votre compte pour suivre vos demandes et vos maquettes en un seul endroit.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <label className="auth-field block">
            <span className="auth-label">Nom complet</span>
            <span className="auth-input-wrap">
              <User size={16} className="auth-input-icon" strokeWidth={1.75} />
              <input type="text" name="name" autoComplete="name" placeholder="Jean Dupont" className="auth-input" />
            </span>
          </label>

          <label className="auth-field block">
            <span className="auth-label">Email</span>
            <span className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" strokeWidth={1.75} />
              <input type="email" name="email" autoComplete="email" placeholder="vous@exemple.com" className="auth-input" />
            </span>
          </label>

          <label className="auth-field block">
            <span className="auth-label">Mot de passe</span>
            <span className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" strokeWidth={1.75} />
              <input type="password" name="password" autoComplete="new-password" placeholder="••••••••" className="auth-input" />
            </span>
          </label>

          <button type="submit" className="btn-primary w-full mt-2">
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-indigo-300 hover:text-indigo-200 transition-colors">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
