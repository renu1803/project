type P = { className?: string }

export const Logo = ({ className = '' }: P) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16" cy="16" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

export const Instagram = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

export const LinkedIn = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.4c0-3.1-1.65-4.55-3.86-4.55-1.78 0-2.58.98-3.02 1.67V8.5h-3.38c.04.95 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.69.13-.93.27-.69.89-1.4 1.93-1.4 1.36 0 1.9 1.04 1.9 2.56V20h3.38l-.46-6.6Z" />
  </svg>
)

export const Twitter = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M22 5.9c-.74.33-1.53.55-2.36.65a4.12 4.12 0 0 0 1.8-2.27c-.8.47-1.68.81-2.61 1a4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3.4 4.75a4.1 4.1 0 0 0 1.27 5.48 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.4a11.6 11.6 0 0 0 6.29 1.84c7.55 0 11.67-6.25 11.67-11.67l-.01-.53A8.3 8.3 0 0 0 22 5.9Z" />
  </svg>
)

/* Abstract answer-engine marks: original drawings, not the companies' logos. */

export const OrbitMark = ({ className = '' }: P) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden="true">
    <ellipse cx="32" cy="32" rx="26" ry="11" />
    <ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(60 32 32)" />
    <ellipse cx="32" cy="32" rx="26" ry="11" transform="rotate(120 32 32)" />
  </svg>
)

export const FacetMark = ({ className = '' }: P) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden="true">
    <ellipse cx="32" cy="32" rx="12" ry="25" />
    <ellipse cx="32" cy="32" rx="12" ry="25" transform="rotate(45 32 32)" />
    <ellipse cx="32" cy="32" rx="12" ry="25" transform="rotate(90 32 32)" />
    <ellipse cx="32" cy="32" rx="12" ry="25" transform="rotate(135 32 32)" />
    <line x1="32" y1="8" x2="32" y2="56" />
  </svg>
)

export const SparkMark = ({ className = '' }: P) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
    <path d="M32 4c1.6 14.6 13.4 26.4 28 28-14.6 1.6-26.4 13.4-28 28-1.6-14.6-13.4-26.4-28-28C18.6 30.4 30.4 18.6 32 4Z" />
  </svg>
)

export const Menu = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const Close = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const Arrow = ({ className = '' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
