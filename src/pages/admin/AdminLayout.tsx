import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="workspace-shell workspace-shell--admin pt-24 sm:pt-28 pb-12 px-4 sm:px-6">
      <div className="workspace-shell-inner section-inner">
        <AdminSidebar />
        <div className="workspace-main workspace-main--admin">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
