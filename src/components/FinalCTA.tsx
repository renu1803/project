import SplitText from './SplitText'
import LazyScene from './LazyScene'
import { Logo } from './Icons'
import { scrollToHash, useMagnetic, useReveal } from '../lib/motion'

export default function FinalCTA() {
  const body = useReveal<HTMLDivElement>(0.1)
  const primary = useMagnetic<HTMLAnchorElement>()
  const secondary = useMagnetic<HTMLAnchorElement>()

  return (
    <section aria-labelledby="cta-title" className="relative isolate flex min-h-[86svh] items-center overflow-hidden bg-black py-28">
      <LazyScene name="ribbon" className="absolute inset-0 -z-20" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(42%_40%_at_50%_45%,rgba(0,0,0,0.6),transparent_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black to-transparent" />

      <div className="shell flex flex-col items-center text-center">
        <div className="glass mb-8 grid h-14 w-14 place-items-center rounded-full">
          <Logo className="h-8 w-8" />
        </div>
        <SplitText id="cta-title" className="display text-[clamp(2.8rem,7vw,5.8rem)]">
          Start Your <em className="accent">Journey</em>
        </SplitText>
        <div ref={body} className="flex flex-col items-center">
          <p data-reveal className="mt-6 max-w-[30rem] text-[17px] leading-[1.6] text-white/80 [text-shadow:0_1px_16px_rgba(0,0,0,0.8)] sm:text-[19px]">
            Read what matters, write what lasts, and find the people who care about the same things you do.
          </p>
          <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              ref={primary}
              href="#hero-email"
              onClick={(e) => {
                e.preventDefault()
                scrollToHash('#top')
                setTimeout(() => document.getElementById('hero-email')?.focus({ preventScroll: true }), 900)
              }}
              className="btn-solid h-[52px] min-w-[176px] px-8 text-[15px]"
            >
              Subscribe Now
            </a>
            <a ref={secondary} href="mailto:hello@mindloop.example?subject=I%20want%20to%20write%20on%20Mindloop" className="btn-ghost h-[52px] min-w-[176px] px-8 text-[15px]">
              Start Writing
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
