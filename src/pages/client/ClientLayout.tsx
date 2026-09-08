import { Outlet } from 'react-router-dom'
import ClientSidebar from '../../components/client/ClientSidebar'
import WorkspaceShell from '../../components/workspace/WorkspaceShell'

export default function ClientLayout() {
  return (
    <WorkspaceShell variant="client" zoneLabel="Espace client" sidebar={<ClientSidebar />}>
      <Outlet />
    </WorkspaceShell>
  )
}
