import Hero from '../components/Hero'
import JourneyPaths from '../components/JourneyPaths'
import BeforeAfter from '../components/BeforeAfter'
import MockupBuilder from '../components/MockupBuilder'
import Services from '../components/Services'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <JourneyPaths />
        <BeforeAfter />
        <MockupBuilder />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
