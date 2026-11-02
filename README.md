# Mindloop

Dark editorial landing page: React 18, Vite, TypeScript, Tailwind v4, GSAP + ScrollTrigger, Lenis smooth scroll, and React Three Fiber for the procedural 3D scenes.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the build
```

## Structure

- `src/components/` — one file per section (Navbar, Hero, SearchSection, FloatingIsland, Philosophy, Solution, Features, FinalCTA, Footer), plus `SplitText` (masked word reveals), `LazyScene` (code-split WebGL that pauses off-screen) and `NewsletterForm`.
- `src/three/` — the four scenes, all generated in code (no model or HDR downloads): `HeroScene` (landscape + crystal star), `IslandScene`, `ObjectsScene` (crystals, shell-fur spheres, veined pod, tetrahedron, ribbed spiral), `RibbonScene`. `flora.tsx` holds the shared plant/rock builders and `shared.tsx` the noise, lighting and canvas wrapper.
- `src/lib/motion.ts` — Lenis/GSAP wiring, reveal, magnetic and in-view hooks.
- `src/content.ts` — the brand name.

## Before launch

- **Newsletter:** set `VITE_SUBSCRIBE_URL` to an endpoint that accepts `POST { email }` (your email provider or API). Without it the form validates and shows its success state but sends nothing.
- **Links:** social icons point at the networks' home pages; "Start Writing" and "Contact" use `hello@mindloop.example`; Privacy and Terms are `#` anchors with no page yet.
- **Social proof:** "7,000+ people already subscribed" and the avatar placeholders are sample content.

Motion respects `prefers-reduced-motion` (scenes hold still, reveals are skipped), and content stays visible if JavaScript fails.
