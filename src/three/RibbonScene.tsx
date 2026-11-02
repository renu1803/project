import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { SceneCanvas, Studio, isSmallScreen } from './shared'
import { pointer, prefersReducedMotion } from '../lib/motion'

/** A long flat band that twists and waves; vertices recomputed on the CPU each frame. */
function Ribbon({ width, depth, phase, y, z, twist, amp, color, opacity = 1 }: {
  width: number; depth: number; phase: number; y: number; z: number; twist: number; amp: number; color: string; opacity?: number
}) {
  const small = isSmallScreen()
  const segX = small ? 160 : 320
  const segY = small ? 14 : 24
  const geo = useMemo(() => new THREE.PlaneGeometry(width, depth, segX, segY), [width, depth, segX, segY])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo])
  const still = prefersReducedMotion()
  const timeRef = useRef(phase * 10)

  const deform = (t: number) => {
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1]
      const u = bx / width // -0.5..0.5
      const ang = Math.sin(u * twist + t * 0.35 + phase) * 1.35 + u * 2.2
      const cy = Math.sin(u * 5.2 + t * 0.42 + phase) * amp + Math.sin(u * 11 + t * 0.2) * amp * 0.25
      const cz = Math.cos(u * 4.1 + t * 0.3 + phase) * amp * 0.9
      p.setXYZ(i, bx, cy + by * Math.cos(ang), cz + by * Math.sin(ang))
    }
    p.needsUpdate = true
    geo.computeVertexNormals()
  }

  // shape the band once before the first frame (also the reduced-motion pose)
  useMemo(() => deform(timeRef.current), [geo])

  useFrame((_, dt) => {
    if (still) return
    timeRef.current += Math.min(dt, 0.05)
    deform(timeRef.current)
  })

  return (
    <mesh geometry={geo} position={[0, y, z]} rotation={[0.15, 0, -0.18]}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.55}
        roughness={0.14}
        iridescence={1}
        iridescenceIOR={1.4}
        iridescenceThicknessRange={[250, 750]}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={1.7}
        side={THREE.DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}

function Rig() {
  const still = prefersReducedMotion()
  useFrame(({ camera }) => {
    if (still) return
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.4, 0.03)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointer.y * 0.25, 0.03)
    camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  const { viewport } = useThree()
  const w = Math.max(viewport.width * 1.6, 16)
  return (
    <>
      <Studio tint="#6c5cff" warm="#ffb0c4" intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#ffe2f0" />
      <directionalLight position={[-5, -2, 2]} intensity={1.2} color="#7d6bff" />
      <Rig />
      <Ribbon width={w} depth={2.6} phase={0} y={0.2} z={0} twist={6.5} amp={1.1} color="#b8a8ff" />
      <Ribbon width={w * 0.9} depth={1.1} phase={2.1} y={-1.4} z={-2.5} twist={8} amp={0.8} color="#8f7bd8" opacity={0.7} />
    </>
  )
}

export default function RibbonScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={{ position: [0, 0, 8], fov: 40 }}>
      <Scene />
    </SceneCanvas>
  )
}
