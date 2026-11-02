import SplitText from './SplitText'
import LazyScene from './LazyScene'
import { useReveal } from '../lib/motion'

export default function Solution() {
  const label = useReveal<HTMLDivElement>()
  return (
    <section id="use-cases" aria-labelledby="solution-title" className="relative bg-black pt-24 sm:pt-28">
      <div className="shell">
        <div ref={label}>
          <p data-reveal className="mb-5 text-[13px] font-medium uppercase tracking-[0.28em] text-[#9a9a9a]">
            Solution
          </p>
        </div>
        <SplitText id="solution-title" className="display max-w-[14ch] text-[clamp(2.7rem,6.6vw,5.6rem)]">
          The platform for <em className="accent">meaningful</em> content
        </SplitText>
      </div>

      {/* six sculptures, each standing for something the platform holds */}
      <div className="relative mx-auto mt-6 h-[430px] w-full max-w-[1500px] md:mt-2 md:h-[clamp(320px,36vw,460px)]">
        <LazyScene name="objects" className="absolute inset-0" />
      </div>
    </section>
  )
}
