import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import SplitText from './SplitText'
import LazyScene from './LazyScene'
import NewsletterForm from './NewsletterForm'

function Avatars() {
  // neutral portrait placeholders, as in the reference; swap for real subscriber photos if you have consent
  return (
    <div className="flex -space-x-2.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="grid h-8 w-8 place-items-end overflow-hidden rounded-full border-2 border-black bg-[radial-gradient(circle_at_50%_35%,#cfcfcf,#7b7b7b)]">
          <svg viewBox="0 0 32 32" className="h-[26px] w-8 text-white/90" fill="currentColor">
            <circle cx="16" cy="12" r="6" />
            <path d="M4 32c0-7 5.4-11 12-11s12 4 12 11Z" />
          </svg>
        </span>
      ))}
    </div>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const scene = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-hero-fade]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.55 })
      gsap.fromTo('[data-hero-proof]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.15 })
      // landscape sinks and the copy lifts away as you scroll out of the hero
      gsap.to(scene.current, { yPercent: 18, scale: 1.06, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-hero-copy]', { yPercent: -18, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={root} className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#0b0d22_0%,#05060f_45%,#000_100%)]">
      <div ref={scene} className="absolute inset-0 -z-20 origin-bottom">
        <LazyScene name="hero" eager className="absolute inset-0" />
      </div>

      {/* readability: a soft pool of shadow behind the copy, and a fade into the page below */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_50%_52%,rgba(0,0,0,0.55),transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-linear-to-b from-transparent to-black" />

      <div data-hero-copy className="shell flex flex-col items-center pb-16 pt-32 text-center sm:pt-36">
        <div data-hero-proof className="mb-7 flex items-center gap-3 text-[14px] text-white/75 sm:text-[15px]">
          <Avatars />
          <p>7,000+ people already subscribed</p>
        </div>

        <SplitText as="h1" immediate delay={0.25} className="display max-w-[12ch] text-[clamp(3.1rem,9.4vw,7.6rem)] text-white">
          Get <em className="accent">Inspired</em> with Us
        </SplitText>

        <p data-hero-fade className="mt-7 max-w-[34rem] text-[17px] leading-[1.6] text-white/90 [text-shadow:0_1px_18px_rgba(0,0,0,0.7)] sm:text-[19px]">
          Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction.
        </p>

        <div data-hero-fade className="mt-10 w-full max-w-[32rem]">
          <NewsletterForm id="hero-email" />
        </div>
      </div>
    </section>
  )
}
