# Phase 0 Research: Interactive 3D Solar System

**Feature**: `001-interactive-3d-solar-system`
**Date**: 2026-11-23

## Research Objectives
Resolve all technical unknowns, establish best practices for React Three Fiber (R3F) and Drei in a full-screen interactive space environment, and design decoupling patterns that comply with the project constitution.

---

### Research Item 1: Camera Transition & Orbital Tracking Architecture
- **Question**: How can the camera smoothly transition toward a selected planet and then continuously track it while it orbits, without stutter or conflicting with user controls?
- **Decision**: Implement a custom `CameraController` using R3F's `useFrame` hook and mathematical damping (`THREE.MathUtils.damp3`).
- **Rationale**:
  - Pre-packaged camera controllers (like standard `OrbitControls`) fight against programmatic position interpolation when targets move dynamically.
  - In `useFrame`, when a target planet is selected, we calculate a target look-at vector `P_planet(t)` and a camera position vector `P_camera(t) = P_planet(t) + offset`. By applying exponential damping with a delta-time factor (`damp3(currentPos, targetPos, smoothingFactor, delta)`), the camera glides smoothly to the planet in ~1.5–2.0 seconds and thereafter automatically follows the planet along its orbit with zero jitter.
  - When returning to the overview, the target transitions back to the origin `(0, 0, 0)` with overview camera coordinates `(0, 50, 90)`.
- **Alternatives Considered**:
  - `@react-spring/three`: Adds a heavy animation runtime and makes dynamic moving-frame-of-reference tracking difficult to maintain.
  - `@react-three/drei`'s `CameraControls`: Feature-rich for static framing, but awkward when smoothly transitioning to an entity undergoing active orbital revolution.

---

### Research Item 2: Planetary Scale & Distance Representation
- **Question**: Real solar system scales make planets invisible or unclickable. What scaling model provides optimal visual balance and interactivity?
- **Decision**: Implement a **stylized logarithmic/compressed scale** with clear orbital track guides (`OrbitLine`).
- **Scale Specifications**:
  - Central Sun: Radius $4.5\text{ units}$.
  - Terrestrial planets:
    - Mercury: Radius $0.5\text{ units}$, Orbit Radius $12\text{ units}$
    - Venus: Radius $0.85\text{ units}$, Orbit Radius $18\text{ units}$
    - Earth: Radius $0.9\text{ units}$, Orbit Radius $25\text{ units}$
    - Mars: Radius $0.65\text{ units}$, Orbit Radius $33\text{ units}$
  - Gas & Ice Giants:
    - Jupiter: Radius $2.6\text{ units}$, Orbit Radius $48\text{ units}$
    - Saturn: Radius $2.2\text{ units}$, Orbit Radius $64\text{ units}$
    - Uranus: Radius $1.5\text{ units}$, Orbit Radius $78\text{ units}$
    - Neptune: Radius $1.4\text{ units}$, Orbit Radius $92\text{ units}$
  - Moon: Radius $0.25\text{ units}$, Sub-orbit Radius $2.2\text{ units}$ from Earth.
- **Rationale**: Preserves authentic relative ordering (Jupiter > Saturn > Uranus > Neptune > Earth > Venus > Mars > Mercury) while guaranteeing that all eight planets are distinctly visible, interactable, and easily framed by the camera.
- **Alternatives Considered**:
  - True 1:1 astronomical scale: Rejected because planets would be sub-pixel points invisible to the user.
  - Uniform spacing: Rejected because it looks artificial and removes the natural distinction between the compact inner solar system and the expansive outer solar system.

---

### Research Item 3: Scene Lighting & Sun Shader Visuals
- **Question**: How to make the Sun appear intensely luminous while realistically lighting planets without washing out textures or leaving the dark sides completely invisible?
- **Decision**: Multi-layered lighting strategy:
  1. **Sun Visual**: Sphere using `meshBasicMaterial` with high emissive color (`#FFF8E7`), combined with a subtle outer glowing halo/billboard mesh.
  2. **Solar Illumination**: Central Three.js `PointLight` placed at `(0, 0, 0)` with distance $\sim 150$ and controlled decay ($\approx 1.2$) to illuminate planets directionally.
  3. **Space Ambient Fill**: Low-intensity `ambientLight` ($\text{intensity} \approx 0.18$) so that the shaded sides of planetary bodies retain visible texture details rather than rendering as pure black voids.
- **Rationale**: Produces cinematic high-contrast lighting while ensuring the planets remain aesthetically appealing and clear to inspect from any angle.

---

### Research Item 4: Free Texture Assets & Attribution
- **Question**: Where should planetary textures be sourced to guarantee free, high-quality, royalty-free usage with zero paid dependencies?
- **Decision**: Use public domain / CC-BY 4.0 planet texture maps from **Solar System Scope** and **NASA Jet Propulsion Laboratory (JPL)**.
  - Document all assets in `public/CREDITS.md`.
  - Provide baked fallback color values in planet metadata: if texture loading takes time or encounters network delays, the planet renders instantly with its authentic base color (`meshStandardMaterial.color`).
- **Asset Sources**:
  - Solar System Scope: Textures licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
  - NASA JPL: Public domain imagery released for educational and public use.

---

### Research Item 5: Saturn's Rings Implementation
- **Question**: How to render Saturn's rings with accurate transparency, double-sided visibility, and axial tilt?
- **Decision**: A custom `RingGeometry(innerRadius, outerRadius, 64)` mesh with `meshStandardMaterial` (`side: THREE.DoubleSide`, `transparent: true`, `opacity: 0.9`), rotated along the X-axis by $26.7^\circ$ ($0.466\text{ radians}$).
- **Rationale**: Standard Three.js ring geometry with UV texture coordinates mapped radially produces accurate concentric ring bands matching Saturn's real rings.

---

### Research Item 6: Voice-Agent Decoupling Architecture
- **Question**: How do we ensure the 3D scene architecture satisfies Constitution Principle II and is 100% prepared for future voice agent control without refactoring?
- **Decision**: Implement a headless Zustand state store (`useSolarSystemStore`).
  - The store exposes actions: `selectPlanet(id: string | null)`, `resetView()`, `toggleOrbit()`, and `setOrbitSpeed(speed: number)`.
  - The 3D canvas, meshes, and HUD components only react to this store.
  - When the Egyptian Astronaut Voice Agent is added in future features, the voice agent will simply call `useSolarSystemStore.getState().selectPlanet('mars')` or subscribe to `selectedPlanet`, maintaining complete decoupling between the 3D rendering engine and the voice streaming service.
