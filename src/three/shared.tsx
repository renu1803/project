import { Component, Suspense, type ReactNode } from 'react'
import * as THREE from 'three'
import { Canvas, type CanvasProps } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/* ---------- deterministic noise ---------- */

export function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}
const fade = (t: number) => t * t * (3 - 2 * t)

/** Smooth 3D value noise in [-1, 1]. */
export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi)
  const l = (a: number, b: number, t: number) => a + (b - a) * t
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz)
  return (
    l(
      l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
      l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
      zf,
    ) *
      2 -
    1
  )
}

export function fbm(x: number, y: number, z: number, oct = 4) {
  let a = 0.5, f = 1, s = 0
  for (let i = 0; i < oct; i++) {
    s += a * noise3(x * f, y * f, z * f)
    f *= 2.03
    a *= 0.5
  }
  return s
}

/* ---------- textures ---------- */

let glowTex: THREE.Texture | null = null
/** Soft radial sprite used for additive glows (cheaper than bloom). */
export function getGlowTexture() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  glowTex = new THREE.CanvasTexture(c)
  glowTex.colorSpace = THREE.SRGBColorSpace
  return glowTex
}

export function Glow({ color, scale = 1, opacity = 0.6, position }: { color: string; scale?: number; opacity?: number; position: [number, number, number] }) {
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={getGlowTexture()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

/* ---------- lighting ---------- */

/** A procedural studio: soft boxes and coloured strips that glass and iridescent surfaces reflect. */
export function Studio({ tint = '#8b7cff', warm = '#ffb4c8', intensity = 1, base = '#000' }: { tint?: string; warm?: string; intensity?: number; base?: string }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={[base]} />
      <Lightformer form="rect" intensity={1.6 * intensity} position={[0, 2, -6]} scale={[12, 4, 1]} />
      <Lightformer form="circle" intensity={2.5 * intensity} color="#ffffff" position={[3, 4, 3]} scale={1.5} />
      <Lightformer form="rect" intensity={3 * intensity} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2 * intensity} color={tint} position={[-5, 1, -1]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2 * intensity} color={warm} position={[5, 1, -1]} scale={[3, 8, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="ring" intensity={1.5 * intensity} position={[0, 0, 6]} scale={3} />
      <Lightformer form="rect" intensity={0.6 * intensity} color="#9fd7ff" position={[0, -4, 2]} scale={[8, 1, 1]} rotation-x={-Math.PI / 2} />
    </Environment>
  )
}

/* ---------- canvas wrapper ---------- */

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export const isWebGLAvailable = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Transparent canvas that renders only while on screen; falls back to nothing if WebGL fails. */
export function SceneCanvas({ active, children, ...props }: CanvasProps & { active: boolean }) {
  if (!isWebGLAvailable()) return null
  return (
    <GLBoundary>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, Math.min(window.devicePixelRatio, 1.75)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        {...props}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </GLBoundary>
  )
}

export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 768
