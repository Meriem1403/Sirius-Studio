import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CosmicBackground from './components/CosmicBackground'
import StarField from './components/StarField'
import Navbar from './components/Navbar'
import SkipLink from './components/SkipLink'
import AccessibilityToolbar from './components/AccessibilityToolbar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import { AuthProvider } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClientLayout from './pages/client/ClientLayout'
import ClientDashboardPage from './pages/client/ClientDashboardPage'
import ClientProjectsPage from './pages/client/ClientProjectsPage'
import ClientProjectDetailPage from './pages/client/ClientProjectDetailPage'
import ClientMessagesPage from './pages/client/ClientMessagesPage'
import ClientDocumentsPage from './pages/client/ClientDocumentsPage'
import ClientProfilePage from './pages/client/ClientProfilePage'
import ClientNotificationsPage from './pages/client/ClientNotificationsPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProjectsPage from './pages/admin/AdminProjectsPage'
import AdminProjectDetailPage from './pages/admin/AdminProjectDetailPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage'
import AdminProspectionPage from './pages/admin/AdminProspectionPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminBillingPage from './pages/admin/AdminBillingPage'
import AdminAgendaPage from './pages/admin/AdminAgendaPage'
import ClientBillingPage from './pages/client/ClientBillingPage'
import ClientAgendaPage from './pages/client/ClientAgendaPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <SkipLink />
          <div className="relative min-h-screen bg-[#141820]">
            <div className="bg-layer" aria-hidden="true">
              <CosmicBackground />
              <StarField />
            </div>

            <div className="foreground-layer">
              <Navbar />
              <main id="main-content" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/inscription" element={<SignupPage />} />
                <Route
                  path="/espace-client"
                  element={
                    <ProtectedRoute>
                      <ClientLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ClientDashboardPage />} />
                  <Route path="projets" element={<ClientProjectsPage />} />
                  <Route path="projets/:id" element={<ClientProjectDetailPage />} />
                  <Route path="messages" element={<ClientMessagesPage />} />
                  <Route path="documents" element={<ClientDocumentsPage />} />
                  <Route path="facturation" element={<ClientBillingPage />} />
                  <Route path="agenda" element={<ClientAgendaPage />} />
                  <Route path="notifications" element={<ClientNotificationsPage />} />
                  <Route path="profil" element={<ClientProfilePage />} />
                </Route>
                <Route
                  path="/espace-admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="portefeuille" element={<AdminPortfolioPage />} />
                  <Route path="prospection" element={<AdminProspectionPage />} />
                  <Route path="projets" element={<AdminProjectsPage />} />
                  <Route path="projets/:id" element={<AdminProjectDetailPage />} />
                  <Route path="messages" element={<AdminMessagesPage />} />
                  <Route path="facturation" element={<AdminBillingPage />} />
                  <Route path="agenda" element={<AdminAgendaPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                </Route>
              </Routes>
              </main>
              <AccessibilityToolbar />
            </div>
          </div>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
