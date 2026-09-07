import { FIXTURE_ACCOUNTS } from '../../fixtures/users'

interface AuthFixturesPanelProps {
  onSelect: (email: string, password: string) => void
}

export default function AuthFixturesPanel({ onSelect }: AuthFixturesPanelProps) {
  return (
    <div className="auth-fixtures">
      <div className="auth-fixtures-header">
        <span className="auth-fixtures-badge">Fixtures de test</span>
        <p className="auth-fixtures-desc">
          Comptes de démonstration pour accéder à l&apos;espace client.
        </p>
      </div>
      <ul className="auth-fixtures-list">
        {FIXTURE_ACCOUNTS.map((account) => (
          <li key={account.id}>
            <button
              type="button"
              className="auth-fixtures-item"
              onClick={() => onSelect(account.email, account.password)}
            >
              <span className="auth-fixtures-item-top">
                <strong>{account.name}</strong>
                <span className={`auth-fixtures-role auth-fixtures-role--${account.role}`}>
                  {account.role === 'admin' ? 'Admin' : 'Client'}
                </span>
              </span>
              <span className="auth-fixtures-item-email">{account.email}</span>
              <span className="auth-fixtures-item-meta">{account.description}</span>
              <span className="auth-fixtures-item-password">Mot de passe : {account.password}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
