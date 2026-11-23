# Solar System Store Contract

**Contract ID**: `CTR-SOLAR-001`
**Version**: `1.0.0`
**Scope**: Client-side application state store for the 3D Solar System.

## Overview
This contract defines the public state and action interface exposed by `useSolarSystemStore`. It serves as the formal boundary between the 3D Three.js canvas, the UI controls HUD, and future AI Voice Agent components.

---

## State Schema

```typescript
interface SolarSystemStateSnapshot {
  /** ID of the currently selected celestial body (e.g., 'mars', 'earth'), or null if viewing full solar system */
  selectedPlanetId: string | null;

  /** ID of celestial body currently hovered by pointer, or null */
  hoveredPlanetId: string | null;

  /** Current camera mode */
  cameraMode: 'overview' | 'focused';

  /** Whether orbital motion is actively updating */
  isOrbiting: boolean;

  /** Multiplier for orbital speed (1.0 = normal, 0 = paused, 2.0 = fast) */
  orbitSpeedMultiplier: number;
}
```

---

## Actions / Events

### 1. `selectPlanet(id: string | null): void`
- **Description**: Sets the active planet target for camera focus.
- **Parameters**:
  - `id`: Unique identifier of planet (`'mercury'`, `'venus'`, `'earth'`, `'mars'`, `'jupiter'`, `'saturn'`, `'uranus'`, `'neptune'`), or `null` to reset.
- **Side Effects**:
  - Updates `selectedPlanetId`.
  - Sets `cameraMode` to `'focused'` if `id` is non-null, or `'overview'` if `null`.

### 2. `resetView(): void`
- **Description**: Resets camera focus back to the global overview.
- **Parameters**: None.
- **Side Effects**:
  - Sets `selectedPlanetId = null`.
  - Sets `cameraMode = 'overview'`.

### 3. `hoverPlanet(id: string | null): void`
- **Description**: Updates hover state for cursor visual feedback.
- **Parameters**: `id` or `null`.

### 4. `toggleOrbit(): void`
- **Description**: Toggles `isOrbiting` between `true` and `false`.

---

## External Integration (Future Voice Agent Readiness)
Any external component (e.g., Gemini Live function call dispatcher) can control the 3D solar system by importing the store directly:

```typescript
import { useSolarSystemStore } from '@/store/useSolarSystemStore';

// Example: Voice agent says "Let's visit Mars!"
useSolarSystemStore.getState().selectPlanet('mars');

// Example: Voice agent says "Let's return to the full view."
useSolarSystemStore.getState().resetView();
```
Zero coupling exists between the voice agent and Three.js canvas objects.
