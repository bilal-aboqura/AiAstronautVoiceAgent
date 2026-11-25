# Tasks: Interactive 3D Solar System

**Input**: Design documents from `/specs/001-interactive-3d-solar-system/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.
**Path Convention**: Web application with client source inside `frontend/src/` per implementation plan.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and tooling configuration.

- [X] T001 Initialize Vite React TypeScript project in `frontend/`
- [X] T002 Install runtime and 3D dependencies (`three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`, `zustand`) in `frontend/package.json`
- [X] T003 [P] Configure Tailwind CSS styling in `frontend/tailwind.config.js` and `frontend/src/index.css`
- [X] T004 [P] Configure TypeScript compiler options in `frontend/tsconfig.json` and Vite build configuration in `frontend/vite.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models, contracts, state management, and asset attribution that MUST be complete before user story components can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Implement core TypeScript interfaces in `frontend/src/types/solar-system.ts` citing constrained fields from `data-model.md` (`CelestialBodyConfig.id`, `CelestialBodyConfig.name`, `CelestialBodyConfig.arabicName`, `CelestialBodyConfig.type`, `CelestialBodyConfig.radius`, `CelestialBodyConfig.distance`, `CelestialBodyConfig.orbitalSpeed`, `CelestialBodyConfig.rotationSpeed`, `CelestialBodyConfig.color`, `CelestialBodyConfig.textureUrl`, `CelestialBodyConfig.tilt`, `RingConfig.innerRadius`, `RingConfig.outerRadius`, `RingConfig.tilt`, `RingConfig.opacity`, `MoonConfig.radius`, `MoonConfig.distance`, `MoonConfig.orbitalSpeed`, `SolarSystemState.selectedPlanetId`, `SolarSystemState.cameraMode`, `SolarSystemState.isOrbiting`, `SolarSystemState.orbitSpeedMultiplier`)
- [X] T006 [P] Implement headless Zustand state store in `frontend/src/store/useSolarSystemStore.ts` satisfying `contracts/solar-system-store.contract.md` with actions `selectPlanet`, `resetView`, `hoverPlanet`, `toggleOrbit`, and `setOrbitSpeedMultiplier`
- [X] T007 [P] Create centralized celestial dataset in `frontend/src/data/planets.ts` satisfying `contracts/planet-data.contract.md` containing configurations for Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Earth's Moon with realistic fallback colors
- [X] T008 [P] Create asset attribution documentation in `frontend/public/CREDITS.md` documenting CC-BY 4.0 licenses for Solar System Scope and NASA Jet Propulsion Laboratory texture assets
- [X] T009 [P] Set up asset directories and texture asset placeholders in `frontend/public/textures/planets/`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Planetary Exploration & Overview (Priority: P1) 🎯 MVP

**Goal**: Render a full-screen 3D space environment containing a starfield backdrop, glowing Sun, all eight planets with distinct textures/materials, Saturn's rings, the Moon orbiting Earth, and continuous orbital movement.

**Independent Test**: Load the application in any browser. The full-screen canvas displays the luminous Sun, all eight planets, Saturn's rings, and Earth's Moon, with all celestial bodies continuously revolving in orbital paths.

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement deep-space 3D background in `frontend/src/components/canvas/Starfield.tsx` using Drei `<Stars>`
- [X] T011 [P] [US1] Implement luminous central Sun and lighting setup in `frontend/src/components/canvas/Sun.tsx` with emissive mesh, central `pointLight`, and corona halo
- [X] T012 [P] [US1] Implement orbital guide tracks in `frontend/src/components/canvas/OrbitLine.tsx` rendering faint circular rings along each planet's orbital distance
- [X] T013 [P] [US1] Implement tilted double-sided ring geometry in `frontend/src/components/canvas/SaturnRings.tsx` using `RingGeometry` with transparency and $26.7^\circ$ tilt
- [X] T014 [P] [US1] Implement Earth's sub-orbiting lunar body in `frontend/src/components/canvas/Moon.tsx` with independent orbital revolution around Earth
- [X] T015 [US1] Implement reusable planetary body in `frontend/src/components/canvas/Planet.tsx` with texture mapping, instant fallback material, axial self-rotation, and orbital revolution in `useFrame` (depends on T012, T013, T014)
- [X] T016 [US1] Implement full-screen R3F canvas wrapper in `frontend/src/components/canvas/SolarSystemCanvas.tsx` assembling camera defaults (`fov: 45`, `position: [0, 50, 90]`), ambient lighting, Sun, and all 8 planets from `frontend/src/data/planets.ts` (depends on T010, T011, T015)
- [X] T017 [US1] Integrate canvas into root application in `frontend/src/App.tsx` and mount in `frontend/src/main.tsx` (depends on T016)

**Checkpoint**: User Story 1 (MVP) is fully functional and independently verifiable. All 8 planets, Sun, Moon, and Saturn rings render and orbit continuously.

---

## Phase 4: User Story 2 - Planet Selection & Camera Focus (Priority: P1)

**Goal**: Allow users to click or tap any planet to smoothly animate the camera toward it over 1.5–2.5 seconds and continuously track the planet along its orbit.

**Independent Test**: Click any planet in the scene. The camera smoothly glides to frame that planet in close-up inspection and follows it as it moves along its orbit.

### Implementation for User Story 2

- [X] T018 [US2] Implement camera fly-to and dynamic orbital tracking in `frontend/src/components/canvas/CameraController.tsx` using R3F `useFrame` and `THREE.MathUtils.damp3` to smoothly interpolate camera position and look-at target toward `selectedPlanetId`
- [X] T019 [US2] Add pointer click detection, hover feedback, and cursor styling in `frontend/src/components/canvas/Planet.tsx` dispatching `selectPlanet` and `hoverPlanet` to `frontend/src/store/useSolarSystemStore.ts`
- [X] T020 [US2] Mount `CameraController` inside `frontend/src/components/canvas/SolarSystemCanvas.tsx` to handle dynamic camera transitions (depends on T018, T019)

**Checkpoint**: User Story 2 is functional. Users can click any planet and enjoy smooth, stutter-free fly-to and orbital tracking.

---

## Phase 5: User Story 3 - Camera Reset & Navigation Controls (Priority: P2)

**Goal**: Provide a clean, minimal HUD with a "Reset View" button to return to the solar system overview, active planet indicator labels, and an orbit pause/resume toggle.

**Independent Test**: Focus on any planet, click the "Reset View" button (or click empty space), and verify the camera smoothly glides back to the default overview perspective. Click "Pause Orbit" and verify orbital revolution freezes.

### Implementation for User Story 3

- [X] T021 [P] [US3] Implement minimalist HUD overlay in `frontend/src/components/ui/SceneControls.tsx` with active planet name display (English and Egyptian Arabic), "Reset View" button, and "Pause / Resume Orbit" toggle
- [X] T022 [P] [US3] Implement texture attribution dialog in `frontend/src/components/ui/CreditsModal.tsx` displaying public domain asset credits
- [X] T023 [US3] Add background pointer click handler in `frontend/src/components/canvas/SolarSystemCanvas.tsx` (or canvas wrapper) to trigger `resetView()` when clicking empty space
- [X] T024 [US3] Integrate `SceneControls` and `CreditsModal` into `frontend/src/App.tsx` positioned above the 3D canvas (depends on T021, T022, T023)

**Checkpoint**: User Story 3 is complete. Users have complete navigation control with reset view, orbit pause, and asset attribution.

---

## Phase 6: User Story 4 - Multi-Device Responsiveness & Touch Support (Priority: P2)

**Goal**: Optimize touch interactions, mobile canvas scaling, and touch target hitboxes so mobile and tablet users enjoy seamless exploration.

**Independent Test**: Emulate mobile viewports (e.g., iPhone, Android). Verify full-screen responsiveness, reliable touch selection ($\ge 90\%$ tap accuracy), and smooth frame rate ($\ge 30\text{ fps}$).

### Implementation for User Story 4

- [X] T025 [P] [US4] Add enlarged invisible touch hitboxes (`radius * 1.5`) on small inner planets in `frontend/src/components/canvas/Planet.tsx` to ensure reliable mobile touch selection
- [X] T026 [P] [US4] Configure responsive canvas pixel ratio capping (`dpr={[1, 2]}`) and auto-resizing in `frontend/src/components/canvas/SolarSystemCanvas.tsx`
- [X] T027 [US4] Optimize mobile layout, touch paddings, and HUD positioning in `frontend/src/components/ui/SceneControls.tsx` for small mobile screens

**Checkpoint**: User Story 4 is complete. The application is fully responsive on desktop and mobile devices.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, type checking, code hygiene, and validation against acceptance criteria.

- [X] T028 [P] Run static TypeScript type check via `tsc --noEmit` and fix any type errors across `frontend/`
- [X] T029 [P] Run production build verification via `npm run build` in `frontend/` to ensure zero packaging errors
- [X] T030 Execute end-to-end verification walkthrough of all 6 scenarios in `specs/001-interactive-3d-solar-system/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - **BLOCKS all user stories**.
- **User Story 1 (Phase 3 - MVP)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (requires rendered planets to select and track).
- **User Story 3 (Phase 5)**: Depends on Phase 4 completion (enhances selection with reset & HUD controls).
- **User Story 4 (Phase 6)**: Depends on Phase 3, 4, 5 completion (optimizes touch and mobile viewport).
- **Polish (Phase 7)**: Depends on all user stories being implemented.

### Parallel Execution Opportunities

```bash
# Phase 1 Setup (parallelizable):
T003 [P] Tailwind CSS config & T004 [P] TypeScript/Vite config

# Phase 2 Foundational (parallelizable):
T005 [P] Types & T006 [P] State Store & T007 [P] Celestial Dataset & T008 [P] Credits doc

# Phase 3 User Story 1 (parallelizable components):
T010 [P] Starfield & T011 [P] Sun & T012 [P] OrbitLine & T013 [P] SaturnRings & T014 [P] Moon

# Phase 5 User Story 3 (parallelizable UI):
T021 [P] SceneControls & T022 [P] CreditsModal

# Phase 6 User Story 4 (parallelizable mobile):
T025 [P] Touch hitboxes & T026 [P] Responsive canvas DPR
```

---

## Implementation Strategy

### MVP First (User Story 1)
1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T009)
3. Complete Phase 3: User Story 1 (T010–T017)
4. **STOP and VALIDATE**: Verify that the solar system renders, the Sun glows, all 8 planets orbit, Saturn rings show, and the Moon orbits Earth.

### Incremental Delivery
1. Foundation + US1 $\rightarrow$ Working 3D Solar System (MVP!)
2. Add US2 $\rightarrow$ Interactive Planet Selection & Smooth Camera Fly-To
3. Add US3 $\rightarrow$ Reset View Controls, Orbit Pause Toggle, and Credits HUD
4. Add US4 $\rightarrow$ Touch Hitboxes & Mobile Responsiveness
5. Final Polish $\rightarrow$ `tsc --noEmit`, `npm run build`, and `quickstart.md` verification
