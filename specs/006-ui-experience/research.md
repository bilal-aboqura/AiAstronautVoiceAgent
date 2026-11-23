# Technical Research: UI/UX & Experience Polish

**Feature**: `006-ui-experience` | **Date**: 2026-11-23

---

## 1. Responsive Viewport & Layered HUD Architecture

### Context & Challenge
The Egyptian Astronaut Voice Agent is a full-screen, visually intensive application combining a 3D Three.js solar system, a foreground astronaut companion, live voice controls, real-time Arabic captions, dynamic planet cards, and search status indicators. On desktop/laptop screens (1280px–3840px), ample screen real estate allows placing HUD components in perimeter quadrants. On compact mobile screens (360px–430px) in both portrait and landscape orientations, unmanaged floating panels easily overlap, occlude the 3D celestial bodies, or render buttons unreachable.

### Decision
Implement a **Layered HUD Screen Quadrant Architecture** using Tailwind CSS responsive utilities and CSS safe-area insets:

```text
+-------------------------------------------------------------------+
| Top Navigation Bar (z-20)                                         |
| [Reset View / Overview]               [Texture Credits / المصادر] |
+-------------------------------------------------------------------+
|                                                                   |
|                   3D Solar System Canvas (z-0)                    |
|                (Three.js / React Three Fiber)                     |
|                                                                   |
| [Foreground Astronaut Avatar (z-20)]    [Planet Info Card (z-30)] |
| (Desktop: bottom-left)                  (Desktop: top-right)      |
| (Mobile: top-left icon pill)            (Mobile: bottom drawer)   |
|                                                                   |
+-------------------------------------------------------------------+
| Live Arabic Captions (z-30) (RTL, Cairo Font, Glassmorphic Plate) |
+-------------------------------------------------------------------+
| Voice Dock & Controls (z-30)                                      |
| [Mic Button] [State Glow / Level] [Searching Indicator Badge]    |
+-------------------------------------------------------------------+
```

- **Layer 0 (`z-0`)**: Full-screen R3F Canvas with `fixed inset-0 pointer-events-auto` handling OrbitControls and planet selection raycasting.
- **Layer 10 (`z-10`)**: Ambient vignette and subtle galactic gradient overlay (`pointer-events-none`).
- **Layer 20 (`z-20`)**: Non-blocking perimeter navigation (Top Header Bar: Overview Reset button, Texture Credits button; Foreground Astronaut Avatar container).
- **Layer 30 (`z-30`)**: Active Interactive HUD elements:
  - **Desktop (`md:` and above)**:
    - Planet Information Card anchored at `fixed top-20 right-6 max-w-sm` (keeps the center-framed planet completely visible).
    - Astronaut Avatar framed in the bottom-left (`fixed bottom-6 left-6`).
    - Live Captions anchored bottom-center (`fixed bottom-28 left-1/2 -translate-x-1/2 max-w-xl`).
    - Voice Dock centered at bottom (`fixed bottom-6 left-1/2 -translate-x-1/2`).
  - **Mobile (`< md:`, 360px–767px)**:
    - Planet Information Card renders as an accessible collapsible bottom-sheet or drawer (`fixed inset-x-3 bottom-24 max-h-[45vh] overflow-y-auto`) with a single-tap minimize/dismiss chevron.
    - Astronaut Avatar scales to a compact circular floating badge (`w-12 h-12`) at top-left or integrated beside the voice dock.
    - Live Captions adapt to a compact 2-line floating pill directly above the voice dock (`max-h-20`).
    - Voice Dock spans bottom edge with touch targets $\ge 48\times 48\text{px}$.
- **Layer 40 (`z-40`)**: Texture Attribution & Credits Modal (`fixed inset-0 bg-black/70 backdrop-blur-sm`).

### Rationale
- Completely avoids overlapping controls on mobile viewports.
- Guarantees touch targets are always reachable with one thumb.
- Retains 3D scene immersion by keeping the center viewport unobstructed.

### Alternatives Considered
- *3D HTML Tooltips (`<Html>` from Drei)*: Tested in prototype. When the camera orbits or transitions, 3D tooltips vibrate, clip through nearby planetary meshes, and create unreadable text on low-DPI mobile screens. Rejected in favor of fixed 2D HUD overlays.
- *Full-screen Modal for Planet Facts*: Disrupts 3D immersion and forces the user to exit the view. Rejected in favor of non-intrusive floating HUD / collapsible bottom sheet.

---

## 2. Arabic RTL Captions & Typography

### Context & Challenge
The astronaut speaks exclusively in Egyptian colloquial Arabic. Spoken dialogue must be represented with real-time text captions. Arabic text is written Right-to-Left (RTL) and requires specialized Arabic geometric typography to ensure crisp legibility on dark and glowing backgrounds.

### Decision
- **Typography**: Load Google Font **Cairo** (weights: 400 Regular, 600 Semi-Bold, 700 Bold) as the primary font, with **Tajawal** as secondary fallback, and clean system font fallbacks (`system-ui`, `Segoe UI`, `Tahoma`, `sans-serif`).
- **Text Layout**:
  - `dir="rtl"` enforced on the caption container.
  - Directional isolation using `<bdi>` (bidirectional isolation) tags for embedded English numbers, scientific mission acronyms (e.g., "ISS", "JWST"), and planet names.
  - High-contrast visual backdrop: `bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-5 py-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]`.
  - Typography styling: `font-cairo text-right text-slate-100 text-sm md:text-base leading-relaxed tracking-wide`.
- **Text Synchronization & Stream Handling**:
  - Captions consume live partial transcript events emitted during the Gemini Live session.
  - Sliding text buffer: Displays current utterance in high-contrast white, auto-scrolling with smooth CSS transitions.
  - Idle fade-out: When speech ends, captions linger for 4 seconds before softly fading out (`opacity-0 transition-opacity duration-700`).

### Rationale
- Cairo has a generous x-height, clear dot diacritics, and excellent legibility on dark themes.
- Translucent glassmorphism ensures text is readable whether the background is deep black space or a luminous celestial body.

### Alternatives Considered
- *Unstyled system fonts*: Default system Arabic fonts vary widely across Windows, macOS, Android, and iOS, often looking harsh or uneven. Cairo provides consistent cross-platform presentation.
- *Black opaque background*: Blocks the 3D scene and feels visually disconnected. Glassmorphic backdrop blur provides readability while maintaining depth.

---

## 3. Voice Controls & Operational States (Single Source of Truth)

### Context & Challenge
The application needs to clearly communicate whether the astronaut is Idle, Listening, Thinking, Searching, or Speaking. Creating duplicate state stores or ad-hoc boolean flags causes desynchronization bugs, especially during rapid user interruptions (barge-in).

### Decision
Directly consume and reflect the existing `useVoiceStore` established in Features 002 and 005.

| State | Visual Cue | Border & Glow Accent | Localized Label (`ar` / `en`) |
| :--- | :--- | :--- | :--- |
| **Idle** | Dormant mic icon | `border-slate-700 bg-slate-900/60` | "اضغط للتحدث" / "Tap to speak" |
| **Connecting** | Rotating spinner | `border-blue-500/50 animate-pulse` | "جاري الاتصال..." / "Connecting..." |
| **Listening** | Pulsing soundwave ring, mic active | `border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]` | "بيسمعك..." / "Listening..." |
| **Thinking** | Amber orbital sweep indicator | `border-amber-400 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]` | "بيفكر..." / "Thinking..." |
| **Searching** | Pulsing satellite badge (`SearchingIndicator`) | `border-indigo-400 bg-indigo-950/50 shadow-[0_0_25px_rgba(99,102,241,0.4)]` | "بيبحث في السجلات الفضائية..." / "Searching space archives..." |
| **Speaking** | Audio visualizer bars (driven by `outputVolume`) | `border-purple-400 bg-purple-950/40 shadow-[0_0_25px_rgba(168,85,247,0.4)]` | "بيتكلم..." / "Speaking..." |
| **Error** | Red warning icon & retry button | `border-rose-500 bg-rose-950/50` | "حدث خطأ - أعد المحاولة" / "Error - Retry" |

- Reuses `isSearching` and `searchStatusLabel` from `useVoiceStore` directly.
- Sub-200ms interruption (barge-in): instantly clears searching and speaking states, immediately entering the "Listening" state.

### Rationale
- Zero state desynchronization.
- Clean component architecture where UI purely subscribes to store selectors.

---

## 4. Planet Information Card Design & Content Architecture

### Context & Challenge
When a celestial body is focused (either via user click or `focus_planet` tool invocation), the visitor must see verified scientific information: Arabic and English names, distance from the Sun, and 4–5 key facts. The card must update dynamically, scale responsively, and provide a clear dismiss option.

### Decision
Create a centralized, strongly typed celestial bodies information registry (`celestial-info.ts`):
- Keys: `sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`.
- Schema:
  - `id`: Celestial ID.
  - `nameAr`: Arabic name (e.g. "المريخ", "المشتري").
  - `nameEn`: English name (e.g. "Mars", "Jupiter").
  - `distanceFromSun`: Formatted distance in AU and kilometers (e.g., "1.52 AU (~228 million km)").
  - `facts`: Array of exactly 4–5 verified bulleted facts in Arabic (with English counterpart if toggled).
  - `type`: 'star' | 'planet' | 'moon' | 'dwarf_planet'.
- Component: `PlanetInfoCard.tsx`:
  - Header: Dual bilingual titles (`nameAr` in bold Cairo font, `nameEn` in uppercase slate-400 subtitle).
  - Distance badge: Highlighting astronomical distance with an orbital icon.
  - Facts list: 4–5 bullet points with subtle space-bullet markers.
  - Close button: Prominent `X` button (`aria-label="إغلاق بطاقة الكوكب - Close planet card"`).

### Rationale
- Guaranteed 4–5 verified scientific facts backed by astronomical records.
- Seamless updates driven by `useSolarSystemStore.selectedPlanetId` and `useFactCardStore`.

---

## 5. Accessibility & Touch Standards (WCAG 2.1 AA)

### Decision
- **Touch Target Sizing**: All interactive touch surfaces strictly adhere to $\ge 44\times 44\text{ CSS pixels}$ (`min-h-[44px] min-w-[44px] p-2.5`).
- **Color Contrast**:
  - Normal text (`text-slate-100` #F1F5F9 on `bg-slate-950/85` #020617) achieves a contrast ratio $> 14:1$ (exceeds WCAG AAA).
  - Muted text (`text-slate-400` #94A3B8 on dark slate) achieves $> 5.8:1$ (exceeds WCAG AA 4.5:1).
- **Keyboard Navigation & ARIA**:
  - Full keyboard tabbing with visible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`).
  - `aria-live="polite"` on the live captions container so screen readers announce astronaut speech.
  - `role="dialog"` and `aria-modal="true"` on credits modal with Esc key listener.

---

## 6. Texture & Asset Attribution

### Decision
- Dedicated `CreditsModal.tsx` accessible via a subtle header button (`المصادر / Credits`).
- Explicitly credits:
  - **NASA / JPL-Caltech**: Public domain textures, planetary imagery, and celestial data.
  - **Solar System Scope**: Free textures under Creative Commons Attribution 4.0 International license.
  - Direct links to official sources.

---

## Summary of Technical Decisions

| Area | Decision | Primary Rationale |
| :--- | :--- | :--- |
| **Main Layout** | Fixed Layered HUD (z-0 to z-40) with safe-area spacing | Prevents mobile panel overlap and preserves central 3D focus |
| **Typography** | Google Fonts `Cairo` (weights 400, 600, 700) with `Tajawal` fallback | Authentic Arabic geometry and crisp legibility on dark space backdrops |
| **Live Captions** | RTL glassmorphic container with auto-scroll and 4s fade linger | High readability over changing 3D backgrounds with `<bdi>` isolation |
| **Voice State** | Direct integration with `useVoiceStore` (7 distinct visual states) | Zero state duplication; immediate response to barge-in interruptions |
| **Planet Card** | Curated `celestial-info.ts` registry with bilingual names & 4-5 facts | Accurate scientific data, non-intrusive positioning, one-tap dismiss |
| **Accessibility** | 44px touch targets, WCAG AA contrast, ARIA labels, keyboard focus | Full usability across touchscreens and assistive technologies |
| **Attribution** | Top-bar credits button opening modal citing NASA & Solar System Scope | Ethical, compliant, and discreet asset attribution |
