import { Children, cloneElement, isValidElement, useEffect, useRef, type ElementType, type ReactElement, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

type Props = {
  as?: ElementType
  className?: string
  children: ReactNode
  /** Start immediately (hero) instead of on scroll. */
  immediate?: boolean
  delay?: number
  id?: string
}

/** Wraps each word (including words inside <em className="accent">) in a masked span. */
function split(node: ReactNode, key = 'w'): ReactNode {
  return Children.map(node, (child, i) => {
    if (typeof child === 'string') {
      return child.split(/(\s+)/).map((part, j) =>
        /^\s+$/.test(part) || part === '' ? (
          part
        ) : (
          <span key={`${key}-${i}-${j}`} className="split-word">
            <span className="split-inner">{part}</span>
          </span>
        ),
      )
    }
    if (isValidElement(child)) {
      const el = child as ReactElement<{ children?: ReactNode }>
      if (el.type === 'br') return el
      return cloneElement(el, { key: `${key}-${i}` }, split(el.props.children, `${key}-${i}`))
    }
    return child
  })
}

export default function SplitText({ as: Tag = 'h2', className = '', children, immediate, delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const words = el.querySelectorAll('.split-inner')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.25,
          ease: 'expo.out',
          stagger: 0.06,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [immediate, delay])

  return (
    <Tag ref={ref} id={id} className={className}>
      {split(children)}
    </Tag>
  )
}
