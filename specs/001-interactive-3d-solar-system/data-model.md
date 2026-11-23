# Phase 1 Data Model: Interactive 3D Solar System

**Feature**: `001-interactive-3d-solar-system`
**Date**: 2026-11-23

## Conceptual Entities

```
┌────────────────────────────────────────────────────────┐
│                   CelestialBody                        │
│ ────────────────────────────────────────────────────── │
│ id: string                                             │
│ name: string                                           │
│ arabicName: string (for future Egyptian agent)         │
│ type: 'star' | 'planet' | 'moon'                       │
│ radius: number                                         │
│ distance: number                                       │
│ orbitalSpeed: number                                   │
│ rotationSpeed: number                                  │
│ color: string                                          │
│ textureUrl: string                                     │
│ tilt: number                                           │
└───────────┬───────────────────────────────┬────────────┘
            │ 1                             │ 1 (Saturn only)
            │ has                           │ has
            ▼ 0..1                          ▼ 0..1
┌─────────────────────────┐     ┌────────────────────────┐
│       MoonConfig        │     │       RingConfig       │
│ ─────────────────────── │     │ ────────────────────── │
│ id: string              │     │ innerRadius: number    │
│ name: string            │     │ outerRadius: number    │
│ radius: number          │     │ textureUrl: string     │
│ distance: number        │     │ tilt: number           │
│ orbitalSpeed: number    │     │ opacity: number        │
│ color: string           │     └────────────────────────┘
│ textureUrl: string      │
└─────────────────────────┘
```

---

## TypeScript Definitions (`src/types/solar-system.ts`)

```typescript
export type CelestialBodyType = 'star' | 'planet' | 'moon';

export interface RingConfig {
  innerRadius: number;
  outerRadius: number;
  textureUrl?: string;
  tilt: number; // in radians
  opacity: number;
  color?: string;
}

export interface MoonConfig {
  id: string;
  name: string;
  arabicName: string;
  radius: number;
  distance: number; // distance from parent planet
  orbitalSpeed: number;
  rotationSpeed: number;
  color: string;
  textureUrl?: string;
}

export interface CelestialBodyConfig {
  id: string;
  name: string;
  arabicName: string;
  type: CelestialBodyType;
  radius: number;
  distance: number; // distance from Sun (origin)
  orbitalSpeed: number; // relative orbital speed
  rotationSpeed: number; // self-rotation speed
  color: string; // fallback color
  textureUrl?: string;
  tilt?: number; // axial tilt in radians
  rings?: RingConfig;
  moons?: MoonConfig[];
  description: string;
}

export type CameraViewMode = 'overview' | 'focused';

export interface SolarSystemState {
  // State
  selectedPlanetId: string | null;
  hoveredPlanetId: string | null;
  cameraMode: CameraViewMode;
  isOrbiting: boolean;
  orbitSpeedMultiplier: number;

  // Actions
  selectPlanet: (id: string | null) => void;
  hoverPlanet: (id: string | null) => void;
  resetView: () => void;
  toggleOrbit: () => void;
  setOrbitSpeedMultiplier: (speed: number) => void;
}
```

---

## State Transition Model

```
                    ┌────────────────────────┐
                    │      OVERVIEW MODE     │
                    │ (selectedPlanetId: null│
                    │  camera: (0, 50, 90)   │
                    │  lookAt: (0, 0, 0))    │
                    └───────────┬────────────┘
                                │
          User clicks planet    │    User clicks "Reset View"
          or voice agent        │    or clicks empty space
          dispatches select     │
                                ▼
                    ┌────────────────────────┐
                    │      FOCUSED MODE      │
                    │ (selectedPlanetId: 'X' │
                    │  camera: dynamically   │
                    │   tracks target body)  │
                    └────────────────────────┘
```

### Transition Invariants
1. When `selectedPlanetId` is set, `cameraMode` transitions to `'focused'`.
2. When `resetView()` is called, `selectedPlanetId` is set to `null` and `cameraMode` transitions to `'overview'`.
3. If the user clicks another planet while in `'focused'` mode, `selectedPlanetId` updates to the new planet ID without returning to overview first; the camera smoothly re-aims toward the new target.
4. When `isOrbiting` is `false`, orbital calculations stop advancing time, pausing planets in their current spatial coordinates, while camera inspection and selection remain fully active.
