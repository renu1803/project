import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { fbm, mulberry } from './shared'

type V3 = [number, number, number]
const tmp = new THREE.Object3D()
const col = new THREE.Color()

/* ---------- geometry builders ---------- */

/** Icosphere pushed around by fbm: rocks, moss clumps, blobs. */
export function lumpyGeometry(radius = 1, detail = 3, amount = 0.25, freq = 1.6, seed = 0) {
  // icospheres are non-indexed; weld them so normals smooth across faces
  const src = new THREE.IcosahedronGeometry(radius, detail)
  src.deleteAttribute('normal')
  src.deleteAttribute('uv')
  const g = mergeVertices(src)
  const p = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = fbm(v.x * freq + seed, v.y * freq + seed * 2, v.z * freq - seed, 4)
    v.multiplyScalar(1 + n * amount)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

/** Teardrop pod profile, revolved. */
export function podGeometry(height = 1, width = 0.32, segments = 40) {
  const pts: THREE.Vector2[] = []
  const n = 32
  for (let i = 0; i <= n; i++) {
    const t = i / n
    // bulb low, long tapering tip
    const r = width * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 1.1) * (1 - 0.35 * t)
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), t * height))
  }
  const g = new THREE.LatheGeometry(pts, segments)
  g.computeVertexNormals()
  return g
}

/** Faceted multi-point crystal star built from four-sided spikes. */
export function crystalStarGeometry() {
  const spike = (len: number, r: number, dir: THREE.Vector3) => {
    const g = new THREE.ConeGeometry(r, len, 4, 1)
    g.translate(0, len / 2, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    g.applyQuaternion(q)
    return g.toNonIndexed()
  }
  const parts = [
    spike(1.9, 0.34, new THREE.Vector3(0, 1, 0)),
    spike(1.5, 0.3, new THREE.Vector3(0, -1, 0)),
    spike(2.2, 0.32, new THREE.Vector3(1, 0.05, 0)),
    spike(1.7, 0.3, new THREE.Vector3(-1, 0.1, 0)),
    spike(1.0, 0.28, new THREE.Vector3(0, 0, 1)),
    spike(1.0, 0.28, new THREE.Vector3(0, 0, -1)),
    spike(0.9, 0.18, new THREE.Vector3(0.7, 0.7, 0.2)),
    spike(0.8, 0.16, new THREE.Vector3(-0.6, -0.7, 0.3)),
  ]
  const g = mergeGeometries(parts)!
  g.computeVertexNormals()
  return g
}

/** Hexagonal crystal prism with a pointed tip. */
export function prismGeometry(len = 1, r = 0.15) {
  const body = new THREE.CylinderGeometry(r, r * 1.05, len, 6, 1).toNonIndexed()
  body.translate(0, len / 2, 0)
  const tip = new THREE.ConeGeometry(r, r * 2.2, 6, 1).toNonIndexed()
  tip.translate(0, len + r * 1.1, 0)
  const g = mergeGeometries([body, tip])!
  g.computeVertexNormals()
  return g
}

/* ---------- components ---------- */

export function Moss({ count = 60, center, spread, color = '#5f6e2c', alt = '#8a8f3a', size = [0.12, 0.32], seed = 1, flatten = 0.65 }: {
  count?: number; center: V3; spread: V3; color?: string; alt?: string; size?: [number, number]; seed?: number; flatten?: number
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => lumpyGeometry(1, 3, 0.3, 2.6, seed), [seed])
  useLayoutEffect(() => {
    const m = ref.current!
    const r = mulberry(seed * 977)
    for (let i = 0; i < count; i++) {
      const s = size[0] + r() * (size[1] - size[0])
      tmp.position.set(center[0] + (r() - 0.5) * spread[0], center[1] + (r() - 0.5) * spread[1], center[2] + (r() - 0.5) * spread[2])
      tmp.scale.set(s, s * flatten, s)
      tmp.rotation.set(r() * 6, r() * 6, r() * 6)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
      col.set(color).lerp(new THREE.Color(alt), r()).multiplyScalar(0.7 + r() * 0.5)
      m.setColorAt(i, col)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [count, center, spread, color, alt, size, seed, flatten])
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]}>
      <meshStandardMaterial roughness={1} />
    </instancedMesh>
  )
}

/** Rosette of spiky leaves (agave / succulent). */
export function Agave({ position, scale = 1, color = '#4e7f70', leaves = 18, seed = 3, tilt = 0.55 }: {
  position: V3; scale?: number; color?: string; leaves?: number; seed?: number; tilt?: number
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.07, 1, 4, 1)
    g.translate(0, 0.5, 0)
    g.scale(1, 1, 0.35)
    return g
  }, [])
  useLayoutEffect(() => {
    const m = ref.current!
    const r = mulberry(seed * 131)
    for (let i = 0; i < leaves; i++) {
      const a = (i / leaves) * Math.PI * 2 + r() * 0.4
      const ring = i % 3
      const len = (0.6 + r() * 0.6) * (1 - ring * 0.18)
      tmp.position.set(0, 0, 0)
      tmp.rotation.set(0, 0, 0)
      tmp.rotateY(a)
      tmp.rotateX(tilt * (0.5 + ring * 0.45) + r() * 0.2)
      tmp.scale.set(1 + r() * 0.4, len, 1)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
      col.set(color).multiplyScalar(0.75 + r() * 0.5)
      m.setColorAt(i, col)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [leaves, seed, color, tilt])
  return (
    <instancedMesh ref={ref} args={[geo, undefined, leaves]} position={position} scale={scale}>
      <meshStandardMaterial roughness={0.55} metalness={0.05} flatShading />
    </instancedMesh>
  )
}

/** Glowing translucent pink pod on a curved stalk. */
export function Pod({ position, height = 1.4, podSize = 0.55, lean = 0.15, glow = 0.6, sway = 1 }: {
  position: V3; height?: number; podSize?: number; lean?: number; glow?: number; sway?: number
}) {
  const group = useRef<THREE.Group>(null)
  const pod = useMemo(() => podGeometry(podSize, podSize * 0.34), [podSize])
  const core = useMemo(() => podGeometry(podSize * 0.6, podSize * 0.16), [podSize])
  const stalk = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(lean * 0.4, height * 0.4, 0),
      new THREE.Vector3(lean, height, 0),
    ])
    return new THREE.TubeGeometry(curve, 24, 0.025, 6, false)
  }, [height, lean])
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.6 + seed) * 0.03 * sway
  })
  return (
    <group ref={group} position={position}>
      <mesh geometry={stalk}>
        <meshStandardMaterial color="#e9a2b2" roughness={0.6} emissive="#a03a5c" emissiveIntensity={0.2} />
      </mesh>
      <group position={[lean, height - podSize * 0.15, 0]}>
        <mesh geometry={pod}>
          <meshPhysicalMaterial color="#f6b3c2" roughness={0.35} transmission={0.45} thickness={0.4} sheen={1} sheenColor="#ffd6e2" emissive="#ff5d8f" emissiveIntensity={0.18 * glow} transparent opacity={0.92} />
        </mesh>
        <mesh geometry={core} position={[0, podSize * 0.12, 0]}>
          <meshBasicMaterial color="#ffd9e4" toneMapped={false} transparent opacity={0.85 * glow} />
        </mesh>
      </group>
    </group>
  )
}

export function Mushroom({ position, scale = 1, color = '#ff6fae', glow = 1 }: { position: V3; scale?: number; color?: string; glow?: number }) {
  const cap = useMemo(() => {
    const g = new THREE.SphereGeometry(0.32, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)
    g.scale(1, 0.55, 1)
    return g
  }, [])
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.44, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5 * glow} roughness={0.5} />
      </mesh>
      <mesh geometry={cap} position={[0, 0.42, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9 * glow} roughness={0.35} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Small white flowers, used hanging under the island. */
export function Daisies({ count = 30, center, spread, seed = 9 }: { count?: number; center: V3; spread: V3; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => {
    const petals: THREE.BufferGeometry[] = []
    for (let i = 0; i < 8; i++) {
      const p = new THREE.CircleGeometry(0.014, 6)
      p.scale(1, 2.6, 1)
      p.translate(0, 0.036, 0)
      p.rotateZ((i / 8) * Math.PI * 2)
      petals.push(p.toNonIndexed())
    }
    return mergeGeometries(petals)!
  }, [])
  useLayoutEffect(() => {
    const m = ref.current!
    const r = mulberry(seed)
    for (let i = 0; i < count; i++) {
      tmp.position.set(center[0] + (r() - 0.5) * spread[0], center[1] + (r() - 0.5) * spread[1], center[2] + (r() - 0.5) * spread[2])
      // face the camera, loosely
      tmp.rotation.set((r() - 0.5) * 1.2, (r() - 0.5) * 1.2, r() * 6)
      tmp.scale.setScalar(0.7 + r() * 0.6)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [count, center, spread, seed])
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]}>
      <meshStandardMaterial color="#f4f1ea" side={THREE.DoubleSide} roughness={0.8} emissive="#ffffff" emissiveIntensity={0.15} />
    </instancedMesh>
  )
}

export function Rock({ position, scale = [1, 1, 1], color = '#6b6660', seed = 2, rotation = [0, 0, 0] }: {
  position: V3; scale?: V3; color?: string; seed?: number; rotation?: V3
}) {
  const geo = useMemo(() => lumpyGeometry(1, 4, 0.3, 1.3, seed), [seed])
  return (
    <mesh geometry={geo} position={position} scale={scale} rotation={rotation}>
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  )
}
