import { useEffect, useState } from 'react'
import { ShieldBan, ShieldCheck } from 'lucide-react'
import WorkspacePageHeader from '../../components/workspace/WorkspacePageHeader'
import { ApiError } from '../../lib/api/http'
import { blockClient, fetchClients, unblockClient, type ClientAccount } from '../../lib/api/clients'
import { isApiMode } from '../../lib/api/config'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientAccount[]>([])
  const [query, setQuery] = useState('')
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState<string | null>(null)

  async function load() {
    const rows = await fetchClients()
    setClients(rows)
  }

  useEffect(() => {
    if (!isApiMode()) return
    load().catch((err: unknown) => {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger les clients.')
    })
  }, [])

  const visible = clients.filter((client) => {
    const haystack = `${client.name} ${client.email} ${client.company ?? ''}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  async function onBlock(client: ClientAccount) {
    const reason = (reasons[client.id] ?? '').trim()
    if (reason.length < 3) {
      setError('Indiquez pourquoi ce client est suspendu.')
      return
    }
    setPending(client.id)
    setError('')
    try {
      await blockClient(client.id, reason)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La suspension a échoué.')
    } finally {
      setPending(null)
    }
  }

  async function onUnblock(client: ClientAccount) {
    setPending(client.id)
    setError('')
    try {
      await unblockClient(client.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La réactivation a échoué.')
    } finally {
      setPending(null)
    }
  }

  return (
    <>
      <WorkspacePageHeader
        variant="admin"
        icon={ShieldBan}
        eyebrow="Administration"
        title="Clients"
        subtitle="Suspendez un accès. Les données restent jusqu’à une demande d’effacement."
      />

      {!isApiMode() && (
        <p className="workspace-panel client-card-meta">La liste noire fonctionne avec les comptes réels, pas avec les comptes de démonstration.</p>
      )}

      <label className="client-search">
        <span className="sr-only">Rechercher un client</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, e-mail, société"
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <ul className="client-list">
        {visible.map((client) => (
          <li key={client.id} className="client-card">
            <div>
              <p className="client-card-name">
                {client.name}
                {client.blockedAt && <span className="client-card-flag">Liste noire</span>}
              </p>
              <p className="client-card-meta">{client.email}</p>
              {client.company && <p className="client-card-meta">{client.company}</p>}
              {client.blockReason && <p className="client-card-reason">{client.blockReason}</p>}
            </div>
            {client.blockedAt ? (
              <button type="button" className="btn-secondary" disabled={pending === client.id} onClick={() => onUnblock(client)}>
                <ShieldCheck size={16} />
                Réactiver
              </button>
            ) : (
              <div className="client-card-block">
                <input
                  value={reasons[client.id] ?? ''}
                  onChange={(event) => setReasons((current) => ({ ...current, [client.id]: event.target.value }))}
                  placeholder="Raison de la suspension"
                  maxLength={500}
                />
                <button type="button" className="btn-danger" disabled={pending === client.id} onClick={() => onBlock(client)}>
                  <ShieldBan size={16} />
                  Liste noire
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {isApiMode() && visible.length === 0 && <p className="client-card-meta">Aucun client ne correspond.</p>}
    </>
  )
}
