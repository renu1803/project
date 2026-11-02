import { BRAND } from '../content'

const links = [
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
  { label: 'Contact', href: 'mailto:hello@mindloop.example' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.1] bg-black">
      <div className="shell flex flex-col-reverse gap-6 py-10 text-[15px] text-[#8f8f8f] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND}. All rights reserved.
        </p>
        <ul className="flex gap-7">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="nav-link !text-[#a8a8a8] hover:!text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
