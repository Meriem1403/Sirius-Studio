import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { apiBaseUrl } from '../lib/api/config'

function downloadJson(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sirius-mes-donnees.json'
  link.click()
  URL.revokeObjectURL(url)
}

function RightsForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(action: 'export' | 'erase') {
    setMessage('')
    if (action === 'erase') {
      const typed = window.prompt('Cette action efface le compte. Écrivez EFFACER pour confirmer.')
      if (typed !== 'EFFACER') return
    }
    setPending(true)
    try {
      const res = await fetch(`${apiBaseUrl()}/privacy/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          action,
          confirm: action === 'erase' ? 'EFFACER' : undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) {
        setMessage(data.error ?? 'Action impossible.')
        return
      }
      if (action === 'export') downloadJson(data)
      setPassword('')
      setMessage(action === 'erase' ? (data.message ?? 'Compte effacé.') : 'Fichier téléchargé.')
    } catch {
      setMessage('Action impossible pour le moment.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="rights-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        E-mail
        <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label>
        Mot de passe
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      <div className="privacy-actions">
        <button type="button" className="btn-secondary" disabled={pending} onClick={() => submit('export')}>
          Télécharger mes données
        </button>
        <button type="button" className="btn-danger" disabled={pending} onClick={() => submit('erase')}>
          Effacer mon compte
        </button>
      </div>
      {message && <p className="client-card-meta">{message}</p>}
    </form>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <article className="section-inner px-4 sm:px-6 lg:px-8 pt-28 pb-16 legal-page">
        <p className="text-sm text-white/45 mb-3">Sirius Studio</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4">Confidentialité et mentions</h1>
        <p className="text-white/70 leading-relaxed max-w-3xl mb-10">
          Cette page décrit les données réellement traitées par Sirius Studio pour faire fonctionner
          studio-sirius.fr. Elle n’est pas un label. Vous pouvez exercer vos droits à tout moment.
        </p>

        <section>
          <h2>Qui est responsable</h2>
          <p>
            Sirius Studio, contact <a href="mailto:contact@studio-sirius.fr">contact@studio-sirius.fr</a>.
            Le site public est servi par Netlify. L’application et la base de données sont hébergées chez
            Hetzner. Les e-mails partent par Resend, depuis contact@studio-sirius.fr.
          </p>
        </section>

        <section>
          <h2>Quelles données</h2>
          <p>
            Compte (nom, e-mail, téléphone, société), description de projet, messages, documents que vous
            déposez, rendez-vous, devis et factures. Le mot de passe est stocké sous forme d’empreinte, jamais
            en clair. Une session technique est conservée dans votre navigateur le temps de la connexion.
          </p>
        </section>

        <section>
          <h2>Pourquoi</h2>
          <p>
            Pour créer votre espace, échanger sur le projet, planifier les rendez-vous, établir les devis et
            factures, et sécuriser l’accès. Sirius Studio ne vend pas ces données et ne les utilise pas pour
            de la publicité.
          </p>
        </section>

        <section>
          <h2>Combien de temps</h2>
          <p>
            Le compte et les échanges restent pendant la relation, puis sont effacés ou anonymisés sur demande.
            Les factures sont conservées dix ans, sans les coordonnées devenues inutiles, parce que la
            comptabilité l’exige.
          </p>
        </section>

        <section>
          <h2>Vos droits</h2>
          <p>
            Accès, rectification, effacement, limitation, opposition et portabilité. Depuis votre profil vous
            pouvez télécharger vos données ou effacer le compte. Un compte suspendu peut encore le faire
            ci-dessous, avec l’e-mail et le mot de passe. Vous pouvez aussi écrire à
            contact@studio-sirius.fr. Une réclamation est possible auprès de la CNIL.
          </p>
          <RightsForm />
          <p>
            Un compte suspendu (liste noire) ne peut plus ouvrir l’espace client. La suspension n’efface pas
            les données.
          </p>
        </section>

        <section>
          <h2>Sécurité</h2>
          <p>
            Accès par mot de passe, session limitée dans le temps, tentatives de connexion freinées, et refus
            des comptes suspendus. Signalez toute anomalie à contact@studio-sirius.fr.
          </p>
        </section>

        <p className="mt-10">
          <Link to="/" className="footer-legal-link">
            Retour à l’accueil
          </Link>
        </p>
      </article>
      <Footer />
    </>
  )
}
