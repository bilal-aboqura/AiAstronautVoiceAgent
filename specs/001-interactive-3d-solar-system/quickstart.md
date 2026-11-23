# Quickstart & Verification Guide: Interactive 3D Solar System

**Feature**: `001-interactive-3d-solar-system`
**Branch**: `001-interactive-3d-solar-system`

## Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$
- Modern desktop or mobile browser with WebGL 2.0 support.

---

## Setup Commands

```bash
# Navigate to frontend directory
cd frontend

# Install project dependencies
npm install

# Start Vite local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Verification Scenarios

### Scenario 1: Initial Scene & Overview Verification
1. Open `http://localhost:5173` in a web browser.
2. **Verify**:
   - Canvas occupies full screen (`100vw`, `100vh`).
   - Deep-space background with distributed 3D starfield is visible.
   - Central Sun glows prominently.
   - All 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) are visible.
   - Saturn displays its distinct tilted ring system.
   - The Moon is visible orbiting Earth.
   - All planets actively move along concentric orbital paths.

### Scenario 2: Planet Selection & Camera Fly-To
1. Click on Mars (or any other planet).
2. **Verify**:
   - The camera smoothly transitions toward Mars over $\sim 1.5\text{ seconds}$.
   - The camera centers on Mars and continues to track its orbital movement without snapping.
   - The active planet label updates to "Mars" / "المريخ".
   - The "Reset View" control appears in the interface HUD.

### Scenario 3: Overview Reset
1. While focused on a planet, click the "Reset View" button (or click empty space).
2. **Verify**:
   - The camera smoothly glides back to the default overview perspective.
   - The entire solar system is once again framed in view.
   - The active planet label disappears or indicates "Solar System Overview".

### Scenario 4: Orbit Pause & Resume Interaction
1. Click the "Pause Orbit" toggle in the HUD.
2. **Verify**:
   - Planets stop revolving around the Sun, freezing in place.
   - Planet axial rotation continues (or remains inspectable).
   - Clicking a planet still zooms smoothly to its frozen location.
   - Clicking "Resume Orbit" resumes continuous orbital motion smoothly.

### Scenario 5: Mobile Viewport & Touch Responsiveness
1. Open browser DevTools and toggle device emulation (e.g., iPhone 14 or Pixel 7).
2. **Verify**:
   - Canvas scales correctly with no horizontal scrollbars.
   - Tapping on a planet selects it reliably.
   - UI controls (Reset View button) are finger-friendly and do not obstruct the 3D scene.
   - Frame rate remains smooth ($\ge 30\text{ fps}$).

### Scenario 6: Production Build & Typecheck
```bash
npm run build
```
**Verify**:
- TypeScript compiler exits with 0 errors.
- Vite build succeeds and generates optimized static assets in `dist/`.
