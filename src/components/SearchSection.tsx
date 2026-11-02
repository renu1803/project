import { useRef, type ComponentType, type PointerEvent } from 'react'
import SplitText from './SplitText'
import { useReveal, gsap, prefersReducedMotion } from '../lib/motion'
import { FacetMark, OrbitMark, SparkMark } from './Icons'

const engines: { name: string; body: string; Icon: ComponentType<{ className?: string }> }[] = [
  {
    name: 'ChatGPT',
    body: "Millions ask it before they ask anyone else. If your answer isn't in the model, you're not in the conversation.",
    Icon: OrbitMark,
  },
  {
    name: 'Perplexity',
    body: 'It cites its sources out loud. Be one of them, or watch a competitor get the citation instead.',
    Icon: FacetMark,
  },
  {
    name: 'Google AI',
    body: 'The answer now sits above the links. The page that earns the summary earns the reader.',
    Icon: SparkMark,
  },
]

/** Icon tile with a light that follows the cursor across its glass border. */
function Tile({ Icon }: { Icon: ComponentType<{ className?: string }> }) {
  const ref = useRef<HTMLDivElement>(null)
  const icon = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent) => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    gsap.to(icon.current, { x: (x / r.width - 0.5) * 14, y: (y / r.height - 0.5) * 14, rotate: (x / r.width - 0.5) * 8, duration: 0.8, ease: 'expo.out' })
  }
  const leave = () => gsap.to(icon.current, { x: 0, y: 0, rotate: 0, duration: 1, ease: 'expo.out' })
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className="tile relative mx-auto grid aspect-square w-[min(100%,208px)] place-items-center overflow-hidden rounded-[38px] border border-white/[0.16] bg-[#060606] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      <div ref={icon} className="text-white">
        <Icon className="h-[72px] w-[72px]" />
      </div>
    </div>
  )
}

export default function SearchSection() {
  const cols = useReveal<HTMLDivElement>(0.1)
  const intro = useReveal<HTMLDivElement>()
  const coda = useReveal<HTMLParagraphElement>()
  return (
    <section id="how-it-works" aria-labelledby="search-title" className="relative bg-black pb-28 pt-36 sm:pb-40 sm:pt-52">
      <div className="shell text-center">
        <SplitText id="search-title" className="display mx-auto max-w-[15ch] text-[clamp(2.5rem,8.2vw,7.4rem)]">
          Search has <em className="accent">changed.</em> Have you?
        </SplitText>
        <div ref={intro}>
          <p data-reveal className="mx-auto mt-8 max-w-[42rem] text-[17px] leading-[1.6] text-[#b4b4b4] sm:text-[19px]">
            People used to type keywords and scroll. Now they ask a question and read one answer. Make sure it sounds like you.
          </p>
        </div>

        <div ref={cols} className="mx-auto mt-28 grid max-w-[1040px] gap-16 sm:mt-40 md:grid-cols-3 md:gap-10">
          {engines.map(({ name, body, Icon }) => (
            <article key={name} data-reveal className="flex flex-col items-center">
              <Tile Icon={Icon} />
              <h3 className="mt-10 text-[20px] font-semibold tracking-[-0.02em]">{name}</h3>
              <p className="mt-3 max-w-[22rem] text-[16px] leading-[1.55] text-[#a8a8a8]">{body}</p>
            </article>
          ))}
        </div>

        <p ref={coda} className="mt-24 text-[16px] text-[#a8a8a8] sm:mt-28">
          <span data-reveal className="inline-block">If you don't answer the questions, someone else will.</span>
        </p>
      </div>
    </section>
  )
}
