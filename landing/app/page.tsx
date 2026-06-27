import Hero from '@/components/Hero'
import CaptureSurfaces from '@/components/CaptureSurfaces'
import ContextEngine from '@/components/ContextEngine'
import EngineDemo from '@/components/EngineDemo'
import Problem from '@/components/Problem'
import Solution from '@/components/Solution'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Privacy from '@/components/Privacy'
import CtaSection from '@/components/CtaSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <CaptureSurfaces />
      <ContextEngine />
      <EngineDemo />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Privacy />
      <CtaSection />
      <Footer />
    </>
  )
}
