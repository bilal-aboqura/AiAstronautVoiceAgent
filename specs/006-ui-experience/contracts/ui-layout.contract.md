# Contract: UI Layout & Responsive Overlay System

**Contract ID**: `CTR-UI-LAYOUT-006`  
**Version**: `1.0.0`  
**Location**: `frontend/src/components/layout/AppLayout.tsx`  
**Scope**: Viewport breakpoints, screen quadrant allocation, z-index hierarchy, and mobile collision prevention.

---

## 1. Z-Index Layering Hierarchy

To guarantee deterministic stacking and avoid element collision or occluded click handlers:

| Layer Level | Tailwind Class | Elements Contained | Pointer Events |
| :--- | :--- | :--- | :--- |
| **Layer 0** | `z-0` | 3D Canvas (`Canvas` from R3F, OrbitControls, Planets) | `pointer-events-auto` |
| **Layer 10** | `z-10` | Dark space ambient vignette, background star gradients | `pointer-events-none` |
| **Layer 20** | `z-20` | Top Navigation Bar (Reset View, Brand, Credits button); Foreground Astronaut Avatar | `pointer-events-auto` (buttons only) |
| **Layer 30** | `z-30` | Active Interactive HUD: Planet Information Card, Live Arabic Captions, Voice Dock | `pointer-events-auto` |
| **Layer 40** | `z-40` | Modals & Overlays (Texture Credits Modal, Help dialogs) | `pointer-events-auto` |

---

## 2. Viewport Breakpoint Specifications

```typescript
export interface ViewportDimensions {
  width: number;
  height: number;
  isMobile: boolean;    // width < 768px
  isTablet: boolean;    // 768px <= width < 1024px
  isDesktop: boolean;   // width >= 1024px
  isLandscape: boolean; // width > height
}
```

---

## 3. Quadrant Allocation Rules

### 3.1 Desktop Layout (`width >= 1024px`)
- **Top Bar**: Fixed `top-0 inset-x-0 h-16 px-8 flex justify-between items-center` (`z-20`).
- **Foreground Astronaut Avatar**: Anchored `bottom-8 left-8 w-48 h-48 md:w-56 md:h-56` (`z-20`), framing the Egyptian astronaut with a subtle galactic glow ring.
- **Planet Information Card**: Anchored `top-20 right-8 w-96 max-w-sm` (`z-30`). Off-center position ensures the focused 3D celestial body in the center viewport remains completely unobstructed.
- **Live Captions**: Anchored `bottom-32 left-1/2 -translate-x-1/2 max-w-2xl w-full px-6` (`z-30`).
- **Voice Dock**: Anchored `bottom-8 left-1/2 -translate-x-1/2` (`z-30`).

### 3.2 Mobile Layout (`width < 768px`)
- **Top Bar**: Fixed `top-0 inset-x-0 h-14 px-4 flex justify-between items-center bg-slate-950/70 backdrop-blur-sm` (`z-20`).
- **Foreground Astronaut Avatar**: Scaled down to a compact floating circular pill (`w-14 h-14`) positioned at `top-16 left-4` or integrated beside the voice dock.
- **Planet Information Card**: Rendered as a collapsible bottom drawer (`fixed inset-x-3 bottom-24 max-h-[45vh] overflow-y-auto rounded-2xl bg-slate-950/90 border border-slate-700/60 shadow-2xl`) (`z-30`) with a tap-to-minimize chevron.
- **Live Captions**: Rendered as a compact floating pill (`max-h-24 overflow-hidden`) directly above the voice dock (`bottom-24 inset-x-4 max-w-md mx-auto`) (`z-30`).
- **Voice Dock**: Anchored `bottom-4 inset-x-4 flex justify-center items-center py-2` (`z-30`).

---

## 4. Overlay Collision Invariants

1. **No Mutual Occlusion**: On mobile screens, when both the Planet Info Card and Live Captions are triggered simultaneously, the Live Captions pin above the card or the card minimizes into a compact summary pill to ensure text remains readable.
2. **Safe Area Insets**: All fixed edges apply `pb-[env(safe-area-inset-bottom,16px)]` and `pt-[env(safe-area-inset-top,16px)]` for borderless mobile screens (iPhone notch/island and Android navigation bars).
3. **Canvas Interaction Passthrough**: All overlay containers wrapping empty screen space MUST have `pointer-events-none`; only concrete buttons, cards, and interactive controls specify `pointer-events-auto`.
