# Contract: Planet Information Card UI

**Contract ID**: `CTR-PLANET-CARD-006`  
**Version**: `1.0.0`  
**Location**: `frontend/src/components/ui/PlanetInfoCard.tsx`  
**Scope**: Presentation, typography, data bindings, and responsive layout for celestial information cards.

---

## 1. Component Interface & Props

```typescript
export interface PlanetInfoCardProps {
  /** Unique celestial identifier (e.g., 'earth', 'mars', 'saturn') */
  planetId: string;
  /** Arabic celestial name (e.g., 'المريخ') */
  nameAr: string;
  /** English celestial name (e.g., 'Mars') */
  nameEn: string;
  /** Celestial classification: 'star' | 'planet' | 'moon' | 'dwarf_planet' */
  type: 'star' | 'planet' | 'moon' | 'dwarf_planet';
  /** Formatted distance from Sun in AU and km */
  distance: {
    au: string;
    km: string;
  };
  /** Exactly 4 to 5 verified key scientific facts in Arabic */
  factsAr: string[];
  /** English counterparts for the key facts */
  factsEn?: string[];
  /** Callback invoked when user clicks the dismiss button */
  onClose: () => void;
  /** Mobile minimized toggle state */
  isMinimized?: boolean;
  /** Callback to toggle minimized state on mobile */
  onToggleMinimize?: () => void;
}
```

---

## 2. Visual Layout Specifications

### 2.1 Header Region
- **Arabic Name**: Cairo Bold, 24px (`text-2xl font-bold font-cairo text-cyan-400`).
- **English Name**: Slate-400 Medium, 14px uppercase (`text-sm font-medium tracking-wider text-slate-400 uppercase`).
- **Type Badge**: Subtle chip indicating classification (e.g., "كوكب صخري" / "Terrestrial Planet").
- **Close Button**: Accessible `X` button with `min-w-[44px] min-h-[44px]` touch target, `aria-label="إغلاق بطاقة الكوكب - Close planet card"`.

### 2.2 Distance from the Sun
- Displays both astronomical units (AU) and metric kilometers:
  - Example: `1.52 AU (~227.9 مليون كم)` / `1.52 AU (~227.9M km)`.
  - Icon: Orbit / Sun icon badge with amber-cyan gradient accent.

### 2.3 Facts Section
- Renders an ordered list of 4 to 5 bullet points.
- Layout: strictly `dir="rtl"` with right-aligned text and custom space-bullet dots (`bg-cyan-500/80`).
- Typography: Cairo Regular / Semi-Bold (`font-cairo text-sm leading-relaxed text-slate-200`).

---

## 3. Responsive Styling Rules

- **Desktop (`md:` and above)**:
  - Width: `w-96 max-w-sm`.
  - Background: `bg-slate-950/85 backdrop-blur-md`.
  - Border: `border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)]`.
  - Animation: Smooth slide-in from right (`translate-x-0 transition-transform duration-300 ease-out`).
- **Mobile (`< md:`)**:
  - Anchored at bottom: `fixed inset-x-3 bottom-24 max-h-[45vh] overflow-y-auto rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-2xl p-4`.
  - Top drag handle / collapse chevron allowing one-tap minimization to a compact 48px header strip.

---

## 4. Scientific Content Registry (Supported Celestial Bodies)

The card must support the complete solar system registry:
1. `sun`: الشمس / Sun (G-type main-sequence star)
2. `mercury`: عطارد / Mercury
3. `venus`: الزهرة / Venus
4. `earth`: الأرض / Earth
5. `moon`: القمر / Moon
6. `mars`: المريخ / Mars
7. `jupiter`: المشتري / Jupiter
8. `saturn`: زحل / Saturn (with ring details)
9. `uranus`: أورانوس / Uranus
10. `neptune`: نبتون / Neptune
11. `pluto`: بلوتو / Pluto (Dwarf planet)
