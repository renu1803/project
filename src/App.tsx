import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SearchSection from './components/SearchSection'
import FloatingIsland from './components/FloatingIsland'
import Philosophy from './components/Philosophy'
import Solution from './components/Solution'
import Features from './components/Features'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import { ScrollTrigger, useSmoothScroll } from './lib/motion'

export default function App() {
  useSmoothScroll()

  useEffect(() => {
    // fonts and lazily mounted canvases change section heights; re-measure triggers once they settle
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const t = setTimeout(() => ScrollTrigger.refresh(), 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <SearchSection />
        <FloatingIsland />
        <Philosophy />
        <Solution />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
