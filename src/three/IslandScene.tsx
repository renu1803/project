import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { SceneCanvas, Studio, Glow, fbm, mulberry, isSmallScreen } from './shared'
import { Agave, Daisies, Moss, Mushroom, Pod, lumpyGeometry } from './flora'
import { pointer, prefersReducedMotion } from '../lib/motion'

const LEN = 3.1 // half length
const WID = 1.05 // half depth
const BEND = 0.2 // crescent curvature

/** Height of the island's top surface; plants are planted on it. */
const topY = (x: number, z: number) => {
  const e = Math.max(0, 1 - (x / LEN) ** 2 - (z / WID) ** 2)
  return 0.32 * Math.sqrt(e) + BEND * x * x
}

function useIslandGeometry() {
  return useMemo(() => {
    const g = new THREE.SphereGeometry(1, 128, 64)
    const p = g.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(p.count * 3)
    const moss = new THREE.Color('#3d5a1e')
    const earth = new THREE.Color('#2a1d14')
    const deep = new THREE.Color('#120c09')
    const c = new THREE.Color()
    for (let i = 0; i < p.count; i++) {
      const sx = p.getX(i), sy = p.getY(i), sz = p.getZ(i)
      const x = sx * LEN, z = sz * WID
      let y: number
      if (sy >= 0) {
        y = sy * 0.32 + fbm(x * 2, z * 2, 3, 3) * 0.05
      } else {
        // underside hangs into roots and drips
        const drip = 0.9 + 1.1 * Math.max(0, fbm(x * 1.4, z * 1.4, 9, 4) + 0.35)
        y = sy * drip * (1.05 - 0.25 * Math.abs(sx))
        const n = fbm(x * 3, y * 3, z * 3, 3) * 0.12
        p.setX(i, x * (1 + n))
        p.setZ(i, z * (1 + n))
      }
      if (sy >= 0) {
        p.setX(i, x)
        p.setZ(i, z)
      }
      const bent = y + BEND * p.getX(i) ** 2
      p.setY(i, bent)
      const t = THREE.MathUtils.clamp((sy + 0.15) / 0.35, 0, 1)
      c.copy(deep).lerp(earth, THREE.MathUtils.clamp(sy + 1, 0, 1)).lerp(moss, t)
      c.multiplyScalar(0.8 + fbm(x * 4, y * 4, z * 4, 2) * 0.4)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

function Roots() {
  const geo = useMemo(() => {
    const r = mulberry(42)
    const tubes: THREE.TubeGeometry[] = []
    for (let i = 0; i < 26; i++) {
      const x = (r() - 0.5) * LEN * 1.5
      const z = (r() - 0.5) * WID * 1.2
      const y0 = BEND * x * x - 0.4
      const len = 0.6 + r() * 1.2
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, y0, z),
        new THREE.Vector3(x + (r() - 0.5) * 0.3, y0 - len * 0.5, z + (r() - 0.5) * 0.3),
        new THREE.Vector3(x + (r() - 0.5) * 0.5, y0 - len, z + (r() - 0.5) * 0.4),
      ])
      tubes.push(new THREE.TubeGeometry(curve, 10, 0.012 + r() * 0.02, 4, false))
    }
    return tubes
  }, [])
  return (
    <group>
      {geo.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#2b2118" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function Cactus({ position, scale = 1, color = '#3f7a5a' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const geo = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.12, 0.25, 6, 12)
    return g
  }, [])
  return (
    <mesh geometry={geo} position={position} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.7} flatShading />
    </mesh>
  )
}

function Island() {
  const geo = useIslandGeometry()
  const group = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  const still = prefersReducedMotion()
  const small = isSmallScreen()
  const fit = Math.min(0.88, viewport.width / (small ? 6.4 : 7.8))
  const flower = useMemo(() => lumpyGeometry(1, 1, 0.3, 3, 2), [])

  useFrame(() => {
    const g = group.current
    if (!g || still) return
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.25, 0.03)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.12 + pointer.y * 0.08, 0.03)
  })

  const at = (x: number, z: number, lift = 0): [number, number, number] => [x, topY(x, z) + lift, z]

  return (
    <group ref={group} scale={fit} rotation={[0.12, 0, 0]}>
      <Float speed={still ? 0 : 1} floatIntensity={0.5} rotationIntensity={0.08}>
        <mesh geometry={geo}>
          <meshStandardMaterial vertexColors roughness={1} />
        </mesh>
        <Roots />

        {/* moss carpet following the crescent */}
        {[-2.4, -1.2, 0, 1.2, 2.4].map((x, i) => (
          <Moss key={x} count={small ? 40 : 80} center={at(x, 0, 0.02)} spread={[1.3, 0.12, 1.6]} color="#3e6b22" alt="#7a8f2a" size={[0.07, 0.2]} seed={20 + i} flatten={0.55} />
        ))}

        {/* succulents and agaves */}
        <Agave position={at(-0.9, -0.1)} scale={1.25} color="#4f8a86" leaves={20} seed={21} tilt={0.35} />
        <Agave position={at(1.1, -0.25)} scale={1.05} color="#5d9a8a" leaves={18} seed={22} tilt={0.45} />
        <Agave position={at(0.1, 0.35)} scale={0.8} color="#7aa36a" leaves={14} seed={23} tilt={0.6} />
        <Agave position={at(-2.2, 0.3)} scale={0.55} color="#c46a7a" leaves={14} seed={24} tilt={0.9} />
        <Agave position={at(2.3, 0.2)} scale={0.6} color="#8a6ab8" leaves={14} seed={25} tilt={0.9} />
        <Agave position={at(1.9, -0.45)} scale={0.45} color="#d9a07a" leaves={12} seed={26} tilt={1} />
        <Cactus position={at(-1.7, -0.35, 0.18)} scale={1.2} />
        <Cactus position={at(-1.45, -0.2, 0.12)} scale={0.8} color="#5a8a4a" />
        <Cactus position={at(2.65, -0.15, 0.15)} scale={0.9} color="#3c6e6a" />

        {/* glowing mushrooms in the hollow */}
        <Mushroom position={at(-0.55, 0.25)} scale={0.95} color="#ff5fa8" />
        <Mushroom position={at(-0.25, 0.4)} scale={0.6} color="#ff7ab8" />
        <Mushroom position={at(0.45, 0.15)} scale={0.85} color="#38f0a0" />
        <Mushroom position={at(0.7, 0.4)} scale={0.5} color="#5affc0" />
        <Glow color="#ff5fa8" position={at(-0.45, 0.3, 0.45)} scale={1.6} opacity={0.35} />
        <Glow color="#38f0a0" position={at(0.55, 0.25, 0.4)} scale={1.5} opacity={0.35} />
        <pointLight color="#ff6fb0" intensity={3} distance={2.5} position={at(-0.45, 0.5, 0.6)} />
        <pointLight color="#3cf2a5" intensity={3} distance={2.5} position={at(0.55, 0.5, 0.6)} />

        {/* pink pods at each tip */}
        <Pod position={at(-2.55, 0)} height={0.9} podSize={0.5} lean={-0.08} glow={1} sway={0.6} />
        <Pod position={at(-2.25, 0.25)} height={0.6} podSize={0.36} lean={0.06} glow={1} sway={0.6} />
        <Pod position={at(2.55, -0.1)} height={1.3} podSize={0.62} lean={0.05} glow={1} sway={0.6} />
        <Pod position={at(2.2, 0.15)} height={0.85} podSize={0.42} lean={-0.08} glow={1} sway={0.6} />
        <Glow color="#ff7aa6" position={at(-2.4, 0, 0.9)} scale={1.8} opacity={0.3} />
        <Glow color="#ff7aa6" position={at(2.5, 0, 1.3)} scale={2.2} opacity={0.3} />

        {/* tiny blooms on the rim */}
        {[-1.9, -1.1, 0.9, 1.6, 2.0].map((x, i) => (
          <mesh key={x} geometry={flower} position={at(x, i % 2 ? 0.75 : -0.7, 0.04)} scale={0.06}>
            <meshStandardMaterial color={i % 2 ? '#f7c3d6' : '#f2f0e6'} emissive="#ffffff" emissiveIntensity={0.1} />
          </mesh>
        ))}

        {/* white flowers spilling off the underside */}
        <Daisies count={small ? 24 : 40} center={[-2.1, BEND * 4.4 - 0.75, 0.6]} spread={[0.6, 0.9, 0.5]} seed={3} />
        <Daisies count={small ? 24 : 40} center={[2.2, BEND * 4.8 - 0.7, 0.6]} spread={[0.7, 1, 0.5]} seed={4} />
        <Daisies count={small ? 16 : 30} center={[0.1, -1.35, 0.7]} spread={[1.2, 0.5, 0.4]} seed={5} />
      </Float>
    </group>
  )
}

export default function IslandScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={{ position: [0, 0.6, 9], fov: 36 }}>
      <Studio intensity={0.5} />
      <ambientLight intensity={0.15} />
      <spotLight position={[0, 8, 4]} angle={0.5} penumbra={0.8} intensity={60} color="#fff2e6" />
      <directionalLight position={[-5, 2, -4]} intensity={1.4} color="#8fa2ff" />
      <directionalLight position={[5, 1, 3]} intensity={0.6} color="#ffc6d8" />
      <group position={[0, -0.1, 0]}>
        <Island />
      </group>
    </SceneCanvas>
  )
}
