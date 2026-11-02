import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { SceneCanvas, Studio, Glow, fbm, isSmallScreen } from './shared'
import { Agave, Moss, Pod, Rock, crystalStarGeometry, lumpyGeometry } from './flora'
import { pointer, prefersReducedMotion } from '../lib/motion'

/** A ridge of mountains: a plane whose top edge follows an fbm silhouette, with relief pushed in z. */
function Ridge({ z, y, height, seed, color, width = 70 }: { z: number; y: number; height: number; seed: number; color: string; width?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 220, 50)
    const p = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      let vy = p.getY(i)
      const peak = height * 0.5 * (0.35 + 0.65 * Math.abs(fbm(x * 0.06 + seed, seed, 0, 5) * 1.6)) + fbm(x * 0.4, seed, 1, 3) * 0.35
      const top = -height / 2 + peak * 2
      if (vy > top) vy = top
      const relief = fbm(x * 0.35 + seed, vy * 0.45, seed, 5) * 1.4
      p.setXYZ(i, x, vy, relief)
    }
    g.computeVertexNormals()
    return g
  }, [height, seed, width])
  return (
    <mesh geometry={geo} position={[0, y + height / 2, z]}>
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
    </mesh>
  )
}

function CrystalStar({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => crystalStarGeometry(), [])
  const still = prefersReducedMotion()
  useFrame((_, dt) => {
    const m = ref.current
    if (!m || still) return
    m.rotation.y += dt * 0.12
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, 0.25 + pointer.y * 0.25, 0.04)
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, -0.2 - pointer.x * 0.2, 0.04)
  })
  return (
    <Float speed={still ? 0 : 1.2} floatIntensity={0.6} rotationIntensity={0.15}>
      <mesh ref={ref} geometry={geo} position={position} scale={scale} rotation={[0.25, 0.6, -0.2]}>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.1}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[250, 1000]}
          clearcoat={1}
          envMapIntensity={3}
          flatShading
        />
      </mesh>
      <Glow color="#cfd8ff" position={[position[0], position[1], position[2] - 0.5]} scale={scale * 4.5} opacity={0.26} />
    </Float>
  )
}

function Rig() {
  const still = prefersReducedMotion()
  useFrame(({ camera }) => {
    if (still) return
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.35, 0.03)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 - pointer.y * 0.18, 0.03)
    camera.lookAt(0, 0.1, -2)
  })
  return null
}

function Water() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.35, -4]}>
      <planeGeometry args={[80, 30]} />
      <meshStandardMaterial color="#020306" metalness={0.15} roughness={0.45} />
    </mesh>
  )
}

function Clusters() {
  const { viewport } = useThree()
  // keep the gardens hugging the screen edges at any aspect ratio
  const edge = Math.min(viewport.width / 2, 7.5)
  const small = isSmallScreen()
  const pebble = useMemo(() => lumpyGeometry(1, 2, 0.4, 2, 7), [])
  return (
    <group>
      {/* left garden */}
      <group position={[-edge + (small ? 0.1 : 1.2), small ? -2.9 : -2.3, 0.6]} scale={small ? 0.8 : 1}>
        <Rock position={[-0.9, 0.55, -0.6]} scale={[1.3, 1.1, 1]} color="#7a7368" seed={4} />
        <Rock position={[0.9, 0.3, -1.4]} scale={[1.1, 0.8, 0.9]} color="#8a8478" seed={8} />
        <Moss count={small ? 50 : 110} center={[-0.6, 1.1, -0.4]} spread={[2.2, 1.2, 1.4]} color="#6f7a22" alt="#a9a03a" seed={2} />
        <Moss count={small ? 30 : 70} center={[0.2, 0.25, 0.3]} spread={[3.2, 0.5, 1.2]} color="#3f5a28" alt="#7d8a33" seed={5} />
        <Agave position={[0.9, 0.2, 0.2]} scale={1.4} color="#4f8a7b" seed={6} />
        <Agave position={[-1.6, 0.25, 0.6]} scale={0.8} color="#6b8f4a" leaves={14} seed={11} />
        <mesh geometry={pebble} position={[1.8, 0.05, 0.9]} scale={0.18}>
          <meshStandardMaterial color="#e58a3a" emissive="#ff7a1a" emissiveIntensity={0.6} roughness={0.6} />
        </mesh>
        <Glow color="#ff8a3a" position={[1.8, 0.1, 1]} scale={1.1} opacity={0.35} />
      </group>

      {/* right garden */}
      <group position={[edge - (small ? -0.2 : 1.3), small ? -2.9 : -2.3, 0.4]} scale={small ? 0.75 : 1}>
        <Rock position={[0.6, 0.35, -1.6]} scale={[1.6, 1, 1]} color="#5e5852" seed={12} />
        <Moss count={small ? 40 : 90} center={[0, 0.25, -0.2]} spread={[3, 0.6, 1.6]} color="#4a5d2a" alt="#8b7d3a" seed={9} />
        <Agave position={[-1.2, 0.2, 0.3]} scale={1} color="#7b6aa8" leaves={16} seed={13} tilt={0.7} />
        <Agave position={[1.4, 0.2, 0.5]} scale={0.7} color="#c4794a" leaves={12} seed={14} tilt={0.8} />
        <Pod position={[0, 0.2, 0]} height={2.8} podSize={0.9} lean={-0.2} />
        <Pod position={[0.7, 0.2, -0.3]} height={2.1} podSize={0.7} lean={0.25} />
        <Pod position={[-0.5, 0.2, 0.4]} height={1.5} podSize={0.55} lean={-0.15} />
        <Pod position={[1.3, 0.2, 0.1]} height={1.1} podSize={0.42} lean={0.1} />
        <Glow color="#ff7aa6" position={[0, 2.6, 0]} scale={3.5} opacity={0.18} />
        <pointLight color="#ff88b0" intensity={6} distance={6} position={[0, 2, 1]} />
      </group>
    </group>
  )
}

function Scene() {
  const { viewport } = useThree()
  const small = isSmallScreen()
  const starX = small ? 0.75 : Math.min(viewport.width * 0.12, 1.9)
  return (
    <>
      <fog attach="fog" args={['#060714', 9, 34]} />
      <Studio intensity={1.2} base="#2a2d3e" />
      <hemisphereLight args={['#5a63a0', '#0a0806', 0.35]} />
      <directionalLight position={[-6, 6, 4]} intensity={1.4} color="#ffe6cc" />
      <directionalLight position={[6, 3, -8]} intensity={1.2} color="#8fa2ff" />
      <Rig />
      <Ridge z={-20} y={-3} height={10} seed={3.3} color="#3b3d4a" />
      <Ridge z={-13} y={-3} height={7} seed={7.1} color="#4a4746" />
      <Ridge z={-8} y={-2.6} height={4.2} seed={1.7} color="#3a3633" width={50} />
      <Water />
      <Clusters />
      <CrystalStar position={[starX, small ? 1.9 : 0.35, -0.5]} scale={small ? 0.55 : 1.05} />
    </>
  )
}

export default function HeroScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={{ position: [0, 0.2, 8], fov: 42 }}>
      <Scene />
    </SceneCanvas>
  )
}
