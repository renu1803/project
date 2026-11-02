import { useEffect, useState, type MouseEvent } from 'react'
import { BRAND } from '../content'
import { scrollToHash, getLenis } from '../lib/motion'
import { Close, Instagram, LinkedIn, Logo, Menu, Twitter } from './Icons'

const links = [
  { label: 'Home', href: '#top' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Use Cases', href: '#use-cases' },
]

const socials = [
  { label: `${BRAND} on Instagram`, href: 'https://instagram.com', Icon: Instagram },
  { label: `${BRAND} on LinkedIn`, href: 'https://linkedin.com', Icon: LinkedIn },
  { label: `${BRAND} on X (Twitter)`, href: 'https://x.com', Icon: Twitter },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    // unlock scrolling first: the open menu pauses Lenis and the body
    document.body.style.overflow = ''
    getLenis()?.start()
    setOpen(false)
    scrollToHash(href)
    history.replaceState(null, '', href === '#top' ? location.pathname : href)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* fading veil so links stay legible over any section */}
      <div
        className={`pointer-events-none absolute inset-0 h-28 bg-linear-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-700 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
      />
      <nav className="shell relative flex h-20 items-center justify-between" aria-label="Primary">
        <div className="flex items-center gap-10">
          <a href="#top" onClick={(e) => go(e, '#top')} className="flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.03em]" aria-label={`${BRAND}, back to top`}>
            <Logo className="h-[30px] w-[30px]" />
            {BRAND}
          </a>
          <ul className="hidden items-center gap-7 text-[15px] md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={(e) => go(e, l.href)} className="nav-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ul className="hidden items-center gap-2 md:flex">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="icon-btn">
                <Icon className="h-[15px] w-[15px]" />
              </a>
            </li>
          ))}
        </ul>

        <button type="button" className="icon-btn md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 top-0 -z-10 bg-black/95 backdrop-blur-xl transition-[opacity,visibility] duration-500 md:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="shell flex h-full flex-col justify-between pb-10 pt-28">
          <ul className="flex flex-col gap-2">
            {links.map((l, i) => (
              <li key={l.href} style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }} className={`transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                <a href={l.href} onClick={(e) => go(e, l.href)} tabIndex={open ? 0 : -1} className="block py-2 text-[40px] leading-tight tracking-[-0.04em]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label} tabIndex={open ? 0 : -1} className="icon-btn">
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
