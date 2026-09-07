interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Faible' }
  if (score <= 3) return { score: 2, label: 'Moyen' }
  return { score: 3, label: 'Fort' }
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const { score, label } = getStrength(password)

  return (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength-bars">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`auth-strength-bar ${score >= level ? `auth-strength-bar--${score}` : ''}`}
          />
        ))}
      </div>
      <span className={`auth-strength-label auth-strength-label--${score}`}>{label}</span>
    </div>
  )
}
