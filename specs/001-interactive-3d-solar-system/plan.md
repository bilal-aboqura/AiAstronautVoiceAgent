# Implementation Plan: Interactive 3D Solar System

**Branch**: `001-interactive-3d-solar-system` | **Date**: 2026-11-23 | **Spec**: [specs/001-interactive-3d-solar-system/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-interactive-3d-solar-system/spec.md`

## Summary

Build the foundational full-screen interactive 3D solar system using Vite, React, TypeScript, Three.js, React Three Fiber (R3F), Drei, and Tailwind CSS. The scene renders a luminous central Sun, starfield, all 8 planets with distinct materials, Saturn's rings, the Earth's Moon, orbital animations, interactive planet selection with smooth camera fly-to and tracking, a reset-view control, and responsive desktop/mobile layouts. The implementation is cleanly decoupled with a headless state store (`useSolarSystemStore`), ensuring day-one readiness for future Egyptian Astronaut Voice Agent integration.

## Technical Context

**Language/Version**: TypeScript 5.4+, React 18 / 19
**Primary Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`, `zustand`
**Styling**: `tailwindcss`, `@tailwindcss/vite` (or PostCSS)
**Storage**: N/A (Static client-side assets and in-memory state)
**Testing**: Manual acceptance walkthroughs & automated type-check validation (`tsc --noEmit`, `vite build`)
**Target Platform**: Modern desktop & mobile browsers (WebGL 2.0 capable)
**Project Type**: Web Application (Frontend SPA in `frontend/`)
**Performance Goals**: $\ge 50\text{ fps}$ on desktop, $\ge 30\text{ fps}$ on mobile, $< 3\text{s}$ initial render
**Constraints**: Free textures only (Solar System Scope & NASA JPL), zero paid APIs, zero leak of voice logic
**Scale/Scope**: 1 central star (Sun), 8 major planets, 1 ring system (Saturn), 1 sub-orbiting moon (Earth), 1 starfield

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Technology Stack)**: Frontend strictly uses Vite, React, TypeScript, Three.js, `@react-three/fiber`, `@react-three/drei`, and Tailwind CSS.
- [x] **Principle II (Architecture)**: Dedicated `frontend/` directory created. Voice logic is completely excluded and decoupled; 3D rendering interacts only with an abstract state store (`useSolarSystemStore`).
- [x] **Principle III (Scientific Accuracy)**: Accurate relative planetary ordering, axial tilts, and authentic celestial textures from verified NASA / Solar System Scope public archives.
- [x] **Principle IV (Voice Experience)**: Voice features deferred to subsequent milestones. The state store provides clean event hooks ready for future voice agent control.
- [x] **Principle V (Security & Privacy)**: Zero API keys, zero external paid services, purely client-side static assets.
- [x] **Principle VI (Quality Assurance)**: Complete acceptance criteria and verification guide provided in `quickstart.md`.
- [x] **Principle VII (Documentation)**: Full architecture, contracts, data model, and texture credits documented.
- [x] **Principle VIII (Scope)**: Strictly adheres to Feature 001 requirements. Voice, Gemini API, RAG, and Search are excluded.

## Project Structure

### Documentation (this feature)

```text
specs/001-interactive-3d-solar-system/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (architectural decisions & best practices)
├── data-model.md        # Phase 1 output (entities & TypeScript schemas)
├── quickstart.md        # Phase 1 output (runnable validation scenarios)
├── contracts/           # Phase 1 output (store & data schemas)
│   ├── solar-system-store.contract.md
│   └── planet-data.contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
frontend/
├── public/
│   ├── textures/
│   │   └── planets/     # Public domain textures (Sun, Mercury, Venus, etc.)
│   └── CREDITS.md       # Attribution for NASA & Solar System Scope assets
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── SolarSystemCanvas.tsx  # R3F Canvas wrapper & scene manager
│   │   │   ├── Starfield.tsx          # 3D starfield backdrop
│   │   │   ├── Sun.tsx                # Luminous Sun & central light source
│   │   │   ├── Planet.tsx             # Reusable planetary body with orbit & spin
│   │   │   ├── SaturnRings.tsx        # Double-sided tilted ring geometry
│   │   │   ├── Moon.tsx               # Earth sub-orbiting lunar body
│   │   │   ├── OrbitLine.tsx          # Faint orbital track guide
│   │   │   └── CameraController.tsx   # Smooth fly-to and orbital tracking
│   │   └── ui/
│   │       ├── SceneControls.tsx      # Minimal HUD (Reset View, Orbit Pause, Planet Label)
│   │       └── CreditsModal.tsx       # Asset attribution dialog/link
│   ├── data/
│   │   └── planets.ts                 # Centralized planet configuration records
│   ├── store/
│   │   └── useSolarSystemStore.ts     # Headless state management (Zustand)
│   ├── types/
│   │   └── solar-system.ts            # Strongly-typed TypeScript interfaces
│   ├── App.tsx                        # Root layout component
│   ├── index.css                      # Tailwind CSS entrypoint
│   └── main.tsx                       # Vite React root mounting
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

**Structure Decision**: Web application layout with the client code contained inside `frontend/`. This cleanly separates the frontend application from the future Node.js/Express backend required by Constitution Principle II.

## Component Responsibilities

1. **`SolarSystemCanvas`**: Host `<Canvas>`, sets up WebGL renderer, perspective camera defaults (`fov: 45`, `position: [0, 50, 90]`), ambient lighting, and groups all celestial elements.
2. **`CameraController`**: Uses `useFrame` to calculate dynamic camera offset vectors. When `selectedPlanetId` is active, it damps camera position and look-at vectors toward the moving planet; when `null`, it smoothly damps back to overview.
3. **`Sun`**: Luminous sphere (`meshBasicMaterial`), emits point light (`pointLight` with tuned decay), and renders a glowing corona layer.
4. **`Planet`**: Reusable R3F component. Renders spherical mesh with texture map and fallback color. Updates its own orbital revolution angle and self-spin on each frame. Detects pointer clicks/taps to dispatch `selectPlanet(id)`.
5. **`SaturnRings`**: Renders concentric ring geometry attached to Saturn, tilted at $26.7^\circ$ with double-sided alpha transparency.
6. **`Moon`**: Nested inside Earth's group, revolving around Earth's center at relative speed.
7. **`OrbitLine`**: Renders a thin, non-intrusive circle along each planet's orbital radius for spatial orientation.
8. **`SceneControls`**: Absolute-positioned HTML HUD with Tailwind styling:
   - "Reset View" button (active/visible when a planet is selected).
   - "Pause/Resume Orbit" toggle.
   - Selected planet name indicator (English and Egyptian Arabic).
9. **`useSolarSystemStore`**: Reactive store for selection, hover, camera mode, and orbit speed multiplier.

## Implementation Phases & Staged Execution

### Phase 1: Project Setup & Dependencies
- Scaffold `frontend/` using Vite with React and TypeScript.
- Install `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`, `zustand`.
- Configure Tailwind CSS.
- Create `public/CREDITS.md` with NASA and Solar System Scope attribution.

### Phase 2: Full-Screen 3D Scene & Starfield
- Create `SolarSystemCanvas.tsx` filling viewport (`w-screen h-screen bg-black`).
- Implement `Starfield.tsx` using Drei `<Stars>` / particle geometry for deep-space atmosphere.

### Phase 3: Sun & Central Scene Lighting
- Implement `Sun.tsx` at `(0, 0, 0)` with emissive core, point light source, and ambient light fill.

### Phase 4: Planets Data & Reusable Planet Component
- Define types in `src/types/solar-system.ts`.
- Create centralized data in `src/data/planets.ts` with all 8 planets, colors, scales, distances, and texture paths.
- Build `Planet.tsx` with texture loader, fallback material, and orbital path rendering (`OrbitLine.tsx`).

### Phase 5: Saturn Rings & Earth's Moon
- Build `SaturnRings.tsx` with double-sided ring geometry and tilt.
- Build `Moon.tsx` as a hierarchical child inside Earth's orbital group.

### Phase 6: Basic Orbital Movement
- Animate continuous orbital revolution in `useFrame` using relative orbital speeds ($v \propto 1/\sqrt{r}$).
- Implement self-rotation for planets along their polar axes.

### Phase 7: Planet Selection & Smooth Camera Fly-To
- Implement `useSolarSystemStore.ts` with `selectedPlanetId` and `selectPlanet`.
- Build `CameraController.tsx` using `useFrame` and `MathUtils.damp3` to smoothly glide to selected planet and track it while moving.

### Phase 8: Reset-View & Navigation HUD
- Build `SceneControls.tsx` with "Reset View" button and active planet name display.
- Wire clicking empty space or clicking "Reset View" to `resetView()`.
- Add "Pause / Resume Orbit" toggle.

### Phase 9: Mobile Responsiveness & Polish
- Add pointer/touch event handling with comfortable hit areas for mobile taps.
- Verify canvas aspect-ratio resizing on orientation change.

### Phase 10: Testing, Validation & Documentation
- Run `npm run build` and `tsc --noEmit` to verify type safety.
- Complete all scenarios in `quickstart.md`.

## Testing Strategy

- **Visual & Functional Acceptance Testing**: Follow the 6 verification scenarios in `quickstart.md` (all 8 planets visible, Saturn rings, Moon orbiting Earth, smooth fly-to, reset view, orbit pause, and mobile responsiveness).
- **Type Safety & Build Verification**: Automated execution of `tsc --noEmit` and `vite build` to guarantee zero TypeScript or bundler errors.
- **Console Hygiene**: Verification in browser developer console for zero WebGL warnings or unhandled exceptions.

## Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Texture Loading Delay or Failure** | Blank white spheres on initial render | Pre-configure authentic fallback colors (`meshStandardMaterial.color`) so planets render immediately with their recognizable color while textures stream in asynchronously. |
| **Camera Jitter while Tracking Orbit** | Disorienting motion during planet inspection | Use relative position damping (`damp3`) with delta time in `useFrame`; camera position updates in the same frame as planet coordinate updates. |
| **Mobile WebGL Performance / GPU Throttling** | Low frame rate on low-end mobile devices | Cap pixel ratio with `dpr={[1, 2]}`, use low-poly spheres (`[32, 32]` segments), and avoid expensive post-processing bloom. |
| **Missed Mobile Taps on Distant Planets** | Frustrated mobile navigation | Attach invisible larger raycast hit spheres (`radius * 1.5`) on small inner planets for touch interactions. |

## Complexity Tracking

*No constitutional violations. Implementation strictly follows the constitution's principles of modularity, simplicity, and component decoupling.*
