import { useState, type FormEvent } from 'react'
import { useMagnetic } from '../lib/motion'

type Status = 'idle' | 'error' | 'sending' | 'done'

/**
 * Glass email capture. There is no backend yet: `subscribe` is the single place
 * to connect your email provider (Buttondown, ConvertKit, Beehiiv, your own API).
 */
async function subscribe(email: string) {
  const endpoint = import.meta.env.VITE_SUBSCRIBE_URL as string | undefined
  if (!endpoint) {
    console.warn('[newsletter] VITE_SUBSCRIBE_URL is not set; signup for', email, 'was not sent.')
    return
  }
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
  if (!res.ok) throw new Error(`Subscribe failed: ${res.status}`)
}

export default function NewsletterForm({ id }: { id: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const btn = useMagnetic<HTMLButtonElement>(0.18)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      await subscribe(email.trim())
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const hintId = `${id}-hint`
  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div className="glass group flex items-center gap-2 rounded-[18px] p-1.5 pl-5 transition-[border-color,background-color,box-shadow] duration-500 focus-within:border-white/45 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          aria-invalid={status === 'error'}
          aria-describedby={hintId}
          disabled={status === 'done'}
          className="min-w-0 flex-1 bg-transparent py-3 text-[16px] text-white placeholder:text-white/55 focus:outline-none"
        />
        <button ref={btn} type="submit" disabled={status === 'sending' || status === 'done'} className="btn-solid h-12 shrink-0 px-6 text-[14px] uppercase tracking-[0.02em] disabled:opacity-80 sm:px-7">
          {status === 'sending' ? 'Sending…' : status === 'done' ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
      <p id={hintId} role="status" aria-live="polite" className={`mt-3 min-h-[1.25rem] text-[14px] ${status === 'error' ? 'text-[#ffb4b4]' : 'text-white/70'}`}>
        {status === 'error' && 'Please enter a valid email address.'}
        {status === 'done' && 'Thanks. Check your inbox to confirm your subscription.'}
      </p>
    </form>
  )
}
