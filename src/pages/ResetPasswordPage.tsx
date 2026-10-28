import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import AuthField from '../components/auth/AuthField'
import { apiResetPassword } from '../lib/api/auth'
import { ApiError } from '../lib/api/http'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      setError('Ce lien est incomplet. Redemandez un email de réinitialisation.')
      return
    }
    if (password.length < 8) {
      setError('8 caractères minimum.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await apiResetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Réinitialisation impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="auth-form-eyebrow">Mot de passe</p>
        <h1 className="auth-form-title">Nouveau mot de passe</h1>
        <p className="auth-form-subtitle">Choisissez un mot de passe d’au moins 8 caractères.</p>

        {done ? (
          <p className="auth-switch">
            Mot de passe mis à jour. <Link to="/connexion">Se connecter</Link>
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="auth-form-error" role="alert">
                {error}
              </p>
            )}
            <AuthField
              id="reset-password"
              label="Nouveau mot de passe"
              type="password"
              name="password"
              icon={Lock}
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={setPassword}
            />
            <AuthField
              id="reset-confirm"
              label="Confirmer"
              type="password"
              name="confirm"
              icon={Lock}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={setConfirm}
            />
            <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
              {!loading && <ArrowRight size={16} strokeWidth={2} />}
            </button>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  )
}
