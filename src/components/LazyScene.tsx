import { Suspense, lazy, useEffect, useState, type ComponentType } from 'react'
import { useInView } from '../lib/motion'

type SceneModule = { default: ComponentType<{ active: boolean }> }

const loaders = {
  hero: () => import('../three/HeroScene'),
  island: () => import('../three/IslandScene'),
  objects: () => import('../three/ObjectsScene'),
  ribbon: () => import('../three/RibbonScene'),
} satisfies Record<string, () => Promise<SceneModule>>

const scenes = Object.fromEntries(Object.entries(loaders).map(([k, l]) => [k, lazy(l)])) as unknown as Record<keyof typeof loaders, ComponentType<{ active: boolean }>>

/**
 * Mounts a WebGL scene once it nears the viewport (code-split, so the first paint
 * carries no three.js), then pauses its render loop whenever it scrolls away.
 */
export default function LazyScene({ name, className = '', eager = false }: { name: keyof typeof loaders; className?: string; eager?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>('300px')
  const [mounted, setMounted] = useState(eager)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (inView) setMounted(true)
  }, [inView])

  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => setShown(true), 120)
    return () => clearTimeout(t)
  }, [mounted])

  const Scene = scenes[name]
  return (
    <div ref={ref} className={`${className} transition-opacity duration-[1600ms] ease-out ${shown ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
      {mounted && (
        <Suspense fallback={null}>
          <Scene active={inView} />
        </Suspense>
      )}
    </div>
  )
}
