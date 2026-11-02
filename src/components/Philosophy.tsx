import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

const statement =
  "We're building a space where curiosity meets clarity, where readers find depth, writers find reach, and every newsletter becomes a conversation worth having."
const support = 'A platform where content, community, and insight flow together, with less noise, less friction, and more meaning for everyone involved.'

const words = (text: string) => text.split(' ').map((w, i) => (
  <span key={i} className="ph-word inline-block">
    {w}
    {' '}
  </span>
))

/** Words light up one by one as the section scrolls through the viewport. */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-scrub]')
      lines.forEach((line) => {
        gsap.fromTo(
          line.querySelectorAll('.ph-word'),
          { opacity: 0.16 },
          { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: line, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 } },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="philosophy" ref={root} aria-labelledby="philosophy-title" className="relative bg-black py-24 sm:py-36">
      <div className="shell text-center">
        <h2 id="philosophy-title" className="sr-only">
          Our philosophy
        </h2>
        <p data-scrub className="mx-auto max-w-[24ch] text-[clamp(1.9rem,4.3vw,3.6rem)] font-medium leading-[1.12] tracking-[-0.035em] text-white">
          <span className="sr-only">{statement}</span>
          <span aria-hidden="true">{words(statement)}</span>
        </p>
        <p data-scrub className="mx-auto mt-12 max-w-[34ch] text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-[1.25] tracking-[-0.025em] text-white">
          <span className="sr-only">{support}</span>
          <span aria-hidden="true">{words(support)}</span>
        </p>
      </div>
    </section>
  )
}
