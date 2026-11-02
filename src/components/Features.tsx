import { useReveal } from '../lib/motion'

const features = [
  { title: 'Curated Feed', body: 'A reading feed tuned to what you care about, not what shouts loudest.' },
  { title: 'Writer Tools', body: 'Draft, schedule and publish in one place, with the formatting out of your way.' },
  { title: 'Community', body: 'Comments, replies and shared threads that turn readers into regulars.' },
  { title: 'Distribution', body: 'Reach inboxes, the web and answer engines from a single publish.' },
]

export default function Features() {
  const ref = useReveal<HTMLUListElement>(0.09)
  return (
    <section aria-labelledby="features-title" className="relative bg-black pb-12 pt-10 sm:pb-16">
      <div className="shell">
        <h2 id="features-title" className="sr-only">
          What the platform includes
        </h2>
        <ul ref={ref} className="grid border-t border-white/[0.1] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <li
              key={f.title}
              data-reveal
              className={`group relative py-9 sm:pr-8 lg:py-10 ${i > 0 ? 'border-t border-white/[0.1] sm:border-t-0' : ''} ${i % 2 === 1 ? 'sm:border-l sm:pl-8' : ''} ${i >= 2 ? 'sm:border-t sm:border-white/[0.1] lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:pl-8' : ''} border-white/[0.1]`}
            >
              <span className="absolute left-0 top-0 h-px w-0 bg-white/70 transition-[width] duration-700 ease-[var(--ease-out-expo)] group-hover:w-full" aria-hidden="true" />
              <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="mt-3 max-w-[30ch] text-[16px] leading-[1.55] text-[#a8a8a8]">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
