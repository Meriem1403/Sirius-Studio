import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import { apiForgotPassword } from '../lib/api/auth'
import { ApiError } from '../lib/api/http'

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateEmail(email.trim())) {
      setError('Indiquez une adresse email valide.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await apiForgotPassword(email.trim())
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible. Réessayez dans un instant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="auth-form-eyebrow">Mot de passe</p>
        <h1 className="auth-form-title">Réinitialiser l’accès</h1>
        <p className="auth-form-subtitle">
          Indiquez l’email de votre compte. S’il existe, vous recevez un lien valable 1 heure.
        </p>

        {message ? (
          <p className="auth-form-subtitle" role="status">
            {message}
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="auth-form-error" role="alert">
                {error}
              </p>
            )}
            <AuthField
              id="forgot-email"
              label="Email"
              type="email"
              name="email"
              icon={Mail}
              autoComplete="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={setEmail}
            />
            <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
              {loading ? 'Envoi en cours…' : 'Recevoir le lien'}
              {!loading && <ArrowRight size={16} strokeWidth={2} />}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/connexion">Retour à la connexion</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
