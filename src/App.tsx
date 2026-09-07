import CosmicBackground from './components/CosmicBackground'
import StarField from './components/StarField'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import JourneyPaths from './components/JourneyPaths'
import BeforeAfter from './components/BeforeAfter'
import MockupBuilder from './components/MockupBuilder'
import Services from './components/Services'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#030308]">
      <div className="bg-layer">
        <CosmicBackground />
        <StarField />
      </div>

      <div className="foreground-layer">
        <Navbar />
        <main>
          <Hero />
          <JourneyPaths />
          <BeforeAfter />
          <MockupBuilder />
          <Services />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  )
}
