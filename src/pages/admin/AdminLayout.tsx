import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import WorkspaceShell from '../../components/workspace/WorkspaceShell'

export default function AdminLayout() {
  return (
    <WorkspaceShell variant="admin" zoneLabel="Administration" sidebar={<AdminSidebar />}>
      <Outlet />
    </WorkspaceShell>
  )
}
