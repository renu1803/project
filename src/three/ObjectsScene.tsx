import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { SceneCanvas, Studio } from './shared'
import { lumpyGeometry, podGeometry, prismGeometry } from './flora'
import { pointer, prefersReducedMotion } from '../lib/motion'

/* ---------- fur: shell texturing on an instanced mesh, one instance per shell ---------- */

const SHELLS = 36

const furVertex = /* glsl */ `
  uniform float uLength;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  varying float vH;
  void main() {
    float h = float(gl_InstanceID) / ${SHELLS.toFixed(1)};
    vH = h;
    vPos = position;
    vec3 n = normalize(normal);
    vec3 p = position + n * h * uLength;
    // a little droop and breeze toward the tips
    p.y -= h * h * uLength * 0.35;
    p.x += sin(uTime * 1.3 + position.y * 4.0) * h * h * uLength * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * n);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const furFragment = /* glsl */ `
  uniform vec3 uRoot;
  uniform vec3 uTip;
  uniform float uDensity;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vView;
  varying float vH;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main() {
    // strands sit on a latitude/longitude grid, so no region of the surface lies flat against the cells
    vec3 n = normalize(vPos);
    vec2 g = vec2(atan(n.z, n.x) / 6.2832 * uDensity * 3.0, acos(clamp(n.y, -1.0, 1.0)) / 3.1416 * uDensity * 1.5);
    vec2 cell = floor(g);
    vec2 local = fract(g) - 0.5;
    float rnd = hash(vec3(cell, 1.0));
    float strand = rnd * 0.7 + 0.3;
    // thin each strand toward its tip
    float radius = (1.0 - vH / strand) * 0.55;
    if (vH > strand || length(local) > radius + 0.05) discard;
    vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
    float diff = max(dot(vNormal, L), 0.0) * 0.75 + 0.25;
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
    float ao = mix(0.25, 1.0, vH);
    vec3 col = mix(uRoot, uTip, vH) * diff * ao + rim * uTip * 0.45;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function Fur({ geometry, root, tip, length = 0.18, density = 70 }: { geometry: THREE.BufferGeometry; root: string; tip: string; length?: number; density?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: furVertex,
        fragmentShader: furFragment,
        uniforms: {
          uLength: { value: length },
          uTime: { value: 0 },
          uDensity: { value: density },
          uRoot: { value: new THREE.Color(root) },
          uTip: { value: new THREE.Color(tip) },
        },
      }),
    [root, tip, length, density],
  )
  useFrame(({ clock }) => (mat.uniforms.uTime.value = clock.elapsedTime))
  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={root} />
      </mesh>
      <instancedMesh args={[geometry, mat, SHELLS]} frustumCulled={false} />
    </group>
  )
}

/* ---------- veined botanical pod ---------- */

const veinFragment = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  vec3 h3(vec3 p) { p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453); }
  float worley(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    float d1 = 8.0, d2 = 8.0;
    for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++) {
      vec3 g = vec3(float(x), float(y), float(z));
      float d = length(g + h3(i + g) - f);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
    }
    return d2 - d1;
  }
  void main() {
    float w = worley(vPos * vec3(9.0, 5.0, 9.0));
    float vein = 1.0 - smoothstep(0.02, 0.12, w);
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
    vec3 L = normalize(vec3(-0.3, 0.8, 0.6));
    float diff = max(dot(vNormal, L), 0.0) * 0.6 + 0.4;
    vec3 skin = vec3(0.93, 0.55, 0.62) * diff;
    vec3 col = mix(skin, vec3(1.0, 0.86, 0.9), vein * 0.85) + fres * vec3(1.0, 0.7, 0.8) * 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
const veinVertex = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vPos = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

function VeinPod() {
  const geo = useMemo(() => {
    const g = podGeometry(1.5, 0.55, 64)
    g.translate(0, -0.75, 0)
    return g
  }, [])
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: veinVertex, fragmentShader: veinFragment }), [])
  return <mesh geometry={geo} material={mat} rotation={[0, 0, Math.PI]} scale={1.25} />
}

/* ---------- ribbed spiral shell ---------- */

function spiralGeometry() {
  const turns = 2.3
  const steps = 260
  const radial = 28
  const pos: number[] = []
  const idx: number[] = []
  const frame = new THREE.Vector3()
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    const R = 0.75 * Math.exp(-t * 1.25) // spiral radius shrinks inward
    const r = 0.36 * Math.exp(-t * 1.3) * (1 + 0.09 * Math.cos(t * 150)) // ribbed tube
    const cx = Math.cos(a) * R, cy = Math.sin(a) * R, cz = t * 0.35
    const tangent = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0.05).normalize()
    const nrm = new THREE.Vector3(Math.cos(a), Math.sin(a), 0)
    const bin = new THREE.Vector3().crossVectors(tangent, nrm).normalize()
    for (let j = 0; j <= radial; j++) {
      const b = (j / radial) * Math.PI * 2
      frame.copy(nrm).multiplyScalar(Math.cos(b) * r).addScaledVector(bin, Math.sin(b) * r)
      pos.push(cx + frame.x, cy + frame.y, cz + frame.z)
    }
  }
  for (let i = 0; i < steps; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  g.center()
  return g
}

/* ---------- objects ---------- */

const glass = {
  color: '#e8ecff',
  metalness: 0.8,
  roughness: 0.05,
  iridescence: 1,
  iridescenceIOR: 1.7,
  iridescenceThicknessRange: [150, 800] as [number, number],
  clearcoat: 1,
  envMapIntensity: 2.8,
  flatShading: true,
}

function Crystals() {
  const parts = useMemo(
    () =>
      [
        [1.5, 0.2, 0, 0, 0.1],
        [1.1, 0.16, -0.25, -0.05, 0.45],
        [0.9, 0.14, 0.25, 0.05, -0.4],
        [0.7, 0.12, -0.05, 0.25, 0.8],
        [0.6, 0.11, 0.1, -0.25, -0.75],
      ].map(([len, r, x, z, tilt]) => ({ geo: prismGeometry(len, r), x, z, tilt })),
    [],
  )
  return (
    <group position={[0, -0.8, 0]}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geo} position={[p.x, 0, p.z]} rotation={[p.z, 0, p.tilt]}>
          <meshPhysicalMaterial {...glass} />
        </mesh>
      ))}
    </group>
  )
}

function Tetra() {
  return (
    <mesh rotation={[0.95, 0.35, -0.25]} scale={1.1}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial {...glass} />
    </mesh>
  )
}

function Spiral() {
  const geo = useMemo(() => spiralGeometry(), [])
  return (
    <mesh geometry={geo} rotation={[0.9, -0.6, 0.2]} scale={1.15}>
      <meshPhysicalMaterial color="#f0938f" roughness={0.45} sheen={1} sheenColor="#ffd0c8" clearcoat={0.3} />
    </mesh>
  )
}

/** Each object leans toward the cursor and drifts on its own phase. */
function Exhibit({ x, y = 0, scale = 1, phase = 0, children }: { x: number; y?: number; scale?: number; phase?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const still = prefersReducedMotion()
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g || still) return
    const t = clock.elapsedTime
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.5 + Math.sin(t * 0.3 + phase) * 0.25, 0.05)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.y * 0.3, 0.05)
  })
  return (
    <group position={[x, y, 0]} scale={scale}>
      <Float speed={still ? 0 : 1.4} floatIntensity={0.7} rotationIntensity={0.2} floatingRange={[-0.08, 0.08]}>
        <group ref={ref}>{children}</group>
      </Float>
    </group>
  )
}

function Row() {
  const { viewport } = useThree()
  const orange = useMemo(() => lumpyGeometry(0.85, 5, 0.06, 1.4, 1), [])
  const dark = useMemo(() => lumpyGeometry(0.85, 5, 0.28, 1.1, 5), [])
  const narrow = viewport.width < 7
  // six exhibits across one row on wide screens, two rows of three on narrow ones
  const items = [
    <Crystals key="c" />,
    <Fur key="o" geometry={orange} root="#a63f06" tip="#ffa04a" length={0.22} density={70} />,
    <VeinPod key="p" />,
    <Tetra key="t" />,
    <Fur key="d" geometry={dark} root="#0d0d10" tip="#4c4c56" length={0.2} density={75} />,
    <Spiral key="s" />,
  ]
  if (narrow) {
    const cols = 3
    const gap = viewport.width / cols
    const s = Math.min(0.75, gap / 2.3)
    return (
      <>
        {items.map((el, i) => (
          <Exhibit key={i} x={(i % cols - 1) * gap} y={i < cols ? 1.05 : -1.05} scale={s} phase={i}>
            {el}
          </Exhibit>
        ))}
      </>
    )
  }
  const span = Math.min(viewport.width * 0.7, 11.5)
  const gap = span / 5
  const s = Math.min(0.95, gap / 2.2)
  return (
    <>
      {items.map((el, i) => (
        <Exhibit key={i} x={-span / 2 + i * gap} scale={s} phase={i}>
          {el}
        </Exhibit>
      ))}
    </>
  )
}

export default function ObjectsScene({ active }: { active: boolean }) {
  return (
    <SceneCanvas active={active} camera={{ position: [0, 0, 9], fov: 35 }}>
      <Studio intensity={1.3} base="#2a2d3e" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[-4, 5, 5]} intensity={2.2} />
      <directionalLight position={[5, -2, 2]} intensity={0.8} color="#ffc6d8" />
      <Row />
    </SceneCanvas>
  )
}
