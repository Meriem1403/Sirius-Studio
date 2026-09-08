import { Outlet } from 'react-router-dom'
import ClientSidebar from '../../components/client/ClientSidebar'

export default function ClientLayout() {
  return (
    <div className="workspace-shell workspace-shell--client pt-24 sm:pt-28 pb-12 px-4 sm:px-6">
      <div className="workspace-shell-inner section-inner">
        <ClientSidebar />
        <div className="workspace-main workspace-main--client">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
