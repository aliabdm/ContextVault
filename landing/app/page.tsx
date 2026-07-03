import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Solution from '@/components/Solution'
import CaptureSurfaces from '@/components/CaptureSurfaces'
import ContextEngine from '@/components/ContextEngine'
import HowItWorks from '@/components/HowItWorks'
import EngineDemo from '@/components/EngineDemo'
import DesktopSection from '@/components/DesktopSection'
import Privacy from '@/components/Privacy'
import CtaSection from '@/components/CtaSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <CaptureSurfaces />
      <ContextEngine />
      <HowItWorks />
      <EngineDemo />
      <DesktopSection />
      <Privacy />
      <CtaSection />
      <Footer />
    </>
  )
}