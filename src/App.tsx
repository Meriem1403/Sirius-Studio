import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CosmicBackground from './components/CosmicBackground'
import StarField from './components/StarField'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-[#030308]">
        <div className="bg-layer">
          <CosmicBackground />
          <StarField />
        </div>

        <div className="foreground-layer">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<SignupPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
