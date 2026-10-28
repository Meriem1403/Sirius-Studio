import { useState } from 'react'
import { Building2, Download, Mail, Phone, Trash2, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWorkspace } from '../../context/WorkspaceContext'
import { getProjectsForUser } from '../../lib/services/projectService'
import { getProfile, updateProfile } from '../../lib/data/store'
import { getDeliveriesForUser } from '../../lib/services/notificationService'
import { userInitials } from '../../lib/client/format'
import { isApiMode } from '../../lib/api/config'
import { eraseMyAccount, exportMyData } from '../../lib/api/privacy'
import { ApiError } from '../../lib/api/http'
import type { NotificationPrefs } from '../../lib/auth/types'

export default function ClientProfilePage() {
  const { user, logout } = useAuth()
  const { refresh } = useWorkspace()
  const [saved, setSaved] = useState(false)
  const [privacyError, setPrivacyError] = useState('')
  const [privacyPending, setPrivacyPending] = useState(false)

  if (!user) return null

  const projects = getProjectsForUser(user.id)
  const profile = getProfile(user.id)
  const deliveries = getDeliveriesForUser(user.id).slice(0, 5)
  const userId = user.id

  function handlePrefChange(key: keyof NotificationPrefs, value: boolean) {
    updateProfile(userId, {
      notificationPrefs: { ...profile.notificationPrefs, [key]: value },
    })
    setSaved(true)
    refresh()
    setTimeout(() => setSaved(false), 1500)
  }

  function handlePhoneChange(phone: string) {
    updateProfile(userId, { phone })
    setSaved(true)
    refresh()
    setTimeout(() => setSaved(false), 1500)
  }

  async function handleExport() {
    setPrivacyError('')
    setPrivacyPending(true)
    try {
      const data = await exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sirius-mes-donnees.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setPrivacyError(err instanceof ApiError ? err.message : 'Le téléchargement a échoué.')
    } finally {
      setPrivacyPending(false)
    }
  }

  async function handleErase() {
    const typed = window.prompt('Cette action efface votre compte. Écrivez EFFACER pour confirmer.')
    if (typed !== 'EFFACER') return
    setPrivacyError('')
    setPrivacyPending(true)
    try {
      await eraseMyAccount()
      logout()
    } catch (err) {
      setPrivacyError(err instanceof ApiError ? err.message : 'L’effacement a échoué.')
      setPrivacyPending(false)
    }
  }

  return (
    <>
      <header className="client-page-header">
        <div>
          <p className="client-page-eyebrow">Compte</p>
          <h1 className="client-page-title">Mon profil</h1>
          <p className="client-page-subtitle">
            Gérez vos coordonnées et vos préférences de notification email et SMS.
          </p>
        </div>
      </header>

      <div className="client-profile-grid">
        <section className="client-detail-panel">
          <div className="client-profile-header">
            <span className="client-profile-avatar">{userInitials(user.name)}</span>
            <div>
              <h2 className="client-profile-name">{user.name}</h2>
              <p className="client-profile-role">Client Sirius Studio</p>
            </div>
          </div>

          <ul className="client-profile-fields">
            <li className="client-profile-field">
              <Mail size={16} />
              <div>
                <p className="client-profile-field-label">Email</p>
                <p className="client-profile-field-value">{user.email}</p>
              </div>
            </li>
            <li className="client-profile-field">
              <Phone size={16} />
              <div className="flex-1">
                <p className="client-profile-field-label">Téléphone (SMS)</p>
                <input
                  type="tel"
                  className="admin-input mt-1"
                  defaultValue={profile.phone ?? ''}
                  placeholder="+33 6 00 00 00 00"
                  onBlur={(e) => handlePhoneChange(e.target.value)}
                />
              </div>
            </li>
            <li className="client-profile-field">
              <User size={16} />
              <div>
                <p className="client-profile-field-label">Nom complet</p>
                <p className="client-profile-field-value">{user.name}</p>
              </div>
            </li>
            {user.company && (
              <li className="client-profile-field">
                <Building2 size={16} />
                <div>
                  <p className="client-profile-field-label">Entreprise</p>
                  <p className="client-profile-field-value">{user.company}</p>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="client-detail-panel">
          <h2 className="client-section-title mb-4">Notifications</h2>
          <ul className="pref-list">
            {[
              { key: 'email' as const, label: 'Notifications email', desc: 'Recevoir les alertes par email' },
              { key: 'sms' as const, label: 'Notifications SMS', desc: 'Recevoir les alertes par SMS' },
              { key: 'mockupReady' as const, label: 'Maquette prête', desc: 'Quand une maquette est publiée' },
              { key: 'messages' as const, label: 'Messages', desc: 'Réponses de l\'équipe Sirius' },
              { key: 'quotes' as const, label: 'Devis', desc: 'Suivi des demandes de devis' },
              { key: 'statusUpdates' as const, label: 'Statut projet', desc: 'Changements d\'avancement' },
            ].map(({ key, label, desc }) => (
              <li key={key} className="pref-item">
                <div>
                  <p className="pref-label">{label}</p>
                  <p className="pref-desc">{desc}</p>
                </div>
                <label className="pref-toggle">
                  <input
                    type="checkbox"
                    checked={profile.notificationPrefs[key]}
                    onChange={(e) => handlePrefChange(key, e.target.checked)}
                  />
                  <span className="pref-toggle-track" />
                </label>
              </li>
            ))}
          </ul>
          {saved && <p className="client-message-hint mt-3">Préférences enregistrées.</p>}
        </section>
      </div>

      <section className="client-detail-panel client-section">
        <h2 className="client-section-title mb-4">Résumé</h2>
        <dl className="client-profile-summary">
          <div className="client-profile-summary-row">
            <dt>Projets total</dt>
            <dd>{projects.length}</dd>
          </div>
          <div className="client-profile-summary-row">
            <dt>En cours</dt>
            <dd>{projects.filter((p) => p.status === 'en_cours' || p.status === 'validation' || p.status === 'maquette').length}</dd>
          </div>
          <div className="client-profile-summary-row">
            <dt>Terminés</dt>
            <dd>{projects.filter((p) => p.status === 'livre').length}</dd>
          </div>
        </dl>
      </section>

      {deliveries.length > 0 && (
        <section className="client-section">
          <h2 className="client-section-title mb-4">Derniers envois email et SMS</h2>
          <ul className="delivery-list">
            {deliveries.map((d) => (
              <li key={d.id} className="delivery-item">
                <span className={`delivery-channel delivery-channel--${d.channel}`}>
                  {d.channel === 'email' ? 'Email' : 'SMS'}
                </span>
                <div>
                  <p className="delivery-subject">{d.subject}</p>
                  <p className="delivery-meta">{d.recipient}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="client-section">
        <h2 className="client-section-title mb-2">Vos données</h2>
        <p className="client-card-meta mb-4">
          Téléchargez une copie, ou effacez le compte. Les factures restent anonymisées, pour la comptabilité.
          Le détail est sur la page confidentialité.
        </p>
        {privacyError && <p className="form-error">{privacyError}</p>}
        <div className="privacy-actions">
          <a className="btn-secondary" href="/confidentialite">
            Confidentialité
          </a>
          {isApiMode() && (
            <>
              <button type="button" className="btn-secondary" disabled={privacyPending} onClick={handleExport}>
                <Download size={16} />
                Télécharger mes données
              </button>
              <button type="button" className="btn-danger" disabled={privacyPending} onClick={handleErase}>
                <Trash2 size={16} />
                Effacer mon compte
              </button>
            </>
          )}
        </div>
      </section>
    </>
  )
}
