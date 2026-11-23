# Planet Configuration Data Contract

**Contract ID**: `CTR-PLANET-DATA-002`
**Version**: `1.0.0`
**Location**: `frontend/src/data/planets.ts`

## Overview
This contract defines the schema and required data records for the Sun, the 8 planets, and Earth's Moon.

---

## Schema Requirements

Every planet record in `PLANETS_DATA` MUST conform to `CelestialBodyConfig`:

```typescript
export interface CelestialBodyConfig {
  id: string; // Lowercase identifier: 'mercury', 'venus', etc.
  name: string; // English display name: 'Mercury'
  arabicName: string; // Egyptian Arabic name: 'عطارد'
  type: 'star' | 'planet' | 'moon';
  radius: number; // Scaled radius in scene units
  distance: number; // Scaled orbital distance from Sun (0 for Sun)
  orbitalSpeed: number; // Relative orbital frequency
  rotationSpeed: number; // Self-spin rotation speed
  color: string; // Hex color fallback: '#A57C5A'
  textureUrl?: string; // Relative asset path: '/textures/planets/mercury.jpg'
  tilt?: number; // Axial tilt in radians
  rings?: {
    innerRadius: number;
    outerRadius: number;
    textureUrl?: string;
    tilt: number;
    opacity: number;
    color?: string;
  };
  moons?: Array<{
    id: string;
    name: string;
    arabicName: string;
    radius: number;
    distance: number;
    orbitalSpeed: number;
    rotationSpeed: number;
    color: string;
    textureUrl?: string;
  }>;
  description: string;
}
```

---

## Required Dataset Elements
The configuration array MUST contain exactly the following ordered celestial bodies:
1. `sun` (Type: `'star'`, Distance: `0`)
2. `mercury` (Type: `'planet'`)
3. `venus` (Type: `'planet'`)
4. `earth` (Type: `'planet'`, includes `moons: [moon]`)
5. `mars` (Type: `'planet'`)
6. `jupiter` (Type: `'planet'`)
7. `saturn` (Type: `'planet'`, includes `rings: { ... }`)
8. `uranus` (Type: `'planet'`)
9. `neptune` (Type: `'planet'`)
