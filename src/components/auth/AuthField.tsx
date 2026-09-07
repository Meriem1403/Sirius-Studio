import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'

interface AuthFieldProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  name: string
  placeholder?: string
  icon: LucideIcon
  autoComplete?: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

export default function AuthField({
  id,
  label,
  type = 'text',
  name,
  placeholder,
  icon: Icon,
  autoComplete,
  value,
  onChange,
  error,
  hint,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <label className="auth-field block" htmlFor={id}>
      <span className="auth-label">{label}</span>
      <span className={`auth-input-wrap ${error ? 'auth-input-wrap--error' : ''}`}>
        <Icon size={16} className="auth-input-icon" strokeWidth={1.75} />
        <input
          id={id}
          type={inputType}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`auth-input ${isPassword ? 'auth-input--password' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
          </button>
        )}
      </span>
      {error && (
        <span id={`${id}-error`} className="auth-field-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${id}-hint`} className="auth-field-hint">
          {hint}
        </span>
      )}
    </label>
  )
}
