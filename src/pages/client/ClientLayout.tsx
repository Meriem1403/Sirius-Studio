import { Outlet } from 'react-router-dom'
import ClientSidebar from '../../components/client/ClientSidebar'
import ClientOnboardingGuard from '../../components/client/ClientOnboardingGuard'
import WorkspaceShell from '../../components/workspace/WorkspaceShell'

export default function ClientLayout() {
  return (
    <WorkspaceShell variant="client" zoneLabel="Espace client" sidebar={<ClientSidebar />}>
      <ClientOnboardingGuard>
        <Outlet />
      </ClientOnboardingGuard>
    </WorkspaceShell>
  )
}
