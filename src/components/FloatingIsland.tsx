import { useEffect, useRef } from 'react'
import LazyScene from './LazyScene'
import { gsap, prefersReducedMotion } from '../lib/motion'

/** A quiet exhibition room: one floating garden, suspended in the dark. */
export default function FloatingIsland() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(stage.current, { yPercent: 12, scale: 0.92 }, { yPercent: -8, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} aria-label="A floating garden, suspended in darkness" className="relative h-[58svh] min-h-[420px] overflow-hidden bg-black sm:h-[92svh] sm:min-h-[640px]">
      <div ref={stage} className="absolute inset-0">
        <LazyScene name="island" className="absolute inset-0" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent" />
    </section>
  )
}
