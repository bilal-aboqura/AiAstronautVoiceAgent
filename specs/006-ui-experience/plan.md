# Implementation Plan: UI/UX & Experience Polish

**Branch**: `006-ui-experience` | **Date**: 2026-11-23 | **Spec**: [specs/006-ui-experience/spec.md](spec.md)

**Input**: Feature specification from `specs/006-ui-experience/spec.md`

---

## Summary

Polish and refine the Egyptian Astronaut Voice Agent web interface to deliver a fully responsive, readable, accessible, and immersive space experience across laptop, desktop, tablet, and mobile displays. The 3D solar system remains the central visual centerpiece, with the Egyptian astronaut companion elegantly presented in the foreground.

The implementation unifies UI controls around a **Layered HUD Screen Quadrant Architecture** using Tailwind CSS and CSS safe-area insets. Voice controls clearly communicate five discrete operational states (Idle, Listening, Thinking, Searching, Speaking) by reusing the existing headless `useVoiceStore` from Features 002 and 005 without duplicating state logic. Real-time spoken captions are rendered with authentic Right-to-Left (RTL) Arabic typography using Google Fonts (Cairo or Tajawal) over high-contrast translucent glassmorphic backdrops with smooth line-clamping and auto-scroll. Planet information cards present bilingual names, distance from the Sun in AU and km, and 4–5 verified scientific facts, positioning cleanly without occluding the focused 3D celestial body. The interface adheres strictly to WCAG 2.1 AA accessibility standards (minimum $44\times 44\text{px}$ touch targets, visible keyboard focus rings, polite ARIA live regions) and adds transparent attribution for free NASA and Solar System Scope textures.

---

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20 LTS, React 18 / 19  
**Frontend Primary Dependencies**: `react`, `react-dom`, `zustand`, `lucide-react`, `tailwindcss`, `@react-three/fiber`, `@react-three/drei`, `three`  
**Backend Primary Dependencies**: `express`, `cors`, `dotenv`, `@google/genai`  
**Styling Framework**: Tailwind CSS 3.4+ with custom glassmorphism and animation utilities  
**Typography**: Google Fonts `Cairo` (primary, weights 400, 600, 700) with `Tajawal` fallback  
**Voice Provider**: Gemini Live API (Bidirectional WebSocket) via existing Feature 002/005 service  
**Storage**: N/A (Client-side presentation & transient UI state; zero permanent storage needed)  
**Testing**: Manual cross-device verification walkthrough via [quickstart.md](quickstart.md) and automated component/contract tests with Vitest  
**Target Platform**: Evergreen desktop, laptop, tablet, and mobile browsers (Chrome, Edge, Safari, Firefox; viewports from 360px to 3840px)  
**Project Type**: Full-Stack Web Application (`frontend/` + `server/`)  
**Performance Goals**: 3D solar system frame rate $\ge 50\text{ fps}$ desktop, $\ge 30\text{ fps}$ mobile; UI state transitions $< 100\text{ms}$; caption sync $< 150\text{ms}$; zero horizontal overflow on screens $\ge 360\text{px}$  
**Constraints**: Zero duplicate voice state; keep 3D canvas non-blocking; do not add unnecessary third-party packages; preserve all Features 001–005 functionality; keep permanent secrets server-side  
**Scale/Scope**: Unified single-page responsive space application with rich multimodal voice and 3D interaction  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post Phase 1 design.*

- [x] **Principle I (Technology Stack)**: Frontend strictly uses Vite, React, TypeScript, and Tailwind CSS. 3D visualization strictly uses Three.js, React Three Fiber, and Drei. Voice strictly uses Gemini Live API. No unauthorized frameworks introduced.
- [x] **Principle II (System Architecture & Component Decoupling)**: 3D scene elements, voice streaming, and UI HUD remain decoupled. The UI observes headless Zustand stores (`useSolarSystemStore`, `useVoiceStore`) via clean selectors without leaking audio logic into 3D rendering.
- [x] **Principle III (Scientific Accuracy & Grounding Hierarchy)**: Planet information cards present verified astronomical facts (NASA/astronomical standards) with exact distances in AU and km. No invented or conflicting numbers.
- [x] **Principle IV (Egyptian Arabic Voice Experience & Interactivity)**: Captions display Egyptian colloquial Arabic with proper RTL formatting and Cairo typography. Voice states and searching status reflect in Arabic. Sub-200ms interruption (barge-in) cleanly clears captions and speech visualizers.
- [x] **Principle V (Security, Privacy & Ephemeral Data Protection)**: All permanent secrets remain server-side. Captions and UI states are purely ephemeral in browser memory with zero disk recording.
- [x] **Principle VI (Quality Assurance & Evaluation Gates)**: Comprehensive contracts defined in [contracts/](contracts/), data model in [data-model.md](data-model.md), and end-to-end verification walkthrough in [quickstart.md](quickstart.md).
- [x] **Principle VII (Comprehensive Documentation)**: Architectural decisions recorded in [research.md](research.md), contracts, and this implementation plan.
- [x] **Principle VIII (Strict Scope Enforcement & Staged Delivery)**: Scope strictly restricted to UI/UX, responsive layouts, voice controls, planet cards, captions, search indicator, accessibility, and texture credits. No scope creep into unrequested features.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-ui-experience/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan (/speckit-plan)
├── research.md          # Phase 0: Technical decisions & research
├── data-model.md        # Phase 1: Entity definitions & state diagrams
├── quickstart.md        # Phase 1: Verification scenarios walkthrough
├── contracts/           # Phase 1: Formal protocol & UI contracts
│   ├── ui-layout.contract.md
│   ├── planet-info-card.contract.md
│   ├── live-captions.contract.md
│   ├── voice-dock-ui.contract.md
│   └── credits-attribution.contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
frontend/
├── index.html                   # Google Fonts preload for Cairo & Tajawal
├── src/
│   ├── data/
│   │   ├── celestial-info.ts    # Curated verified facts, distances, and bilingual names
│   │   └── texture-credits.ts   # NASA & Solar System Scope attribution registry
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx    # Layered HUD container (z-0 to z-40) with safe areas
│   │   │   └── TopNavBar.tsx    # Header with Reset View and Credits modal trigger
│   │   ├── 3d/
│   │   │   └── AstronautAvatar.tsx # Foreground astronaut character display
│   │   ├── ui/
│   │   │   ├── PlanetInfoCard.tsx  # Responsive bilingual celestial card (desktop floating HUD / mobile sheet)
│   │   │   ├── LiveCaptions.tsx    # RTL Arabic captions plate with Cairo font & auto-scroll
│   │   │   └── CreditsModal.tsx    # Accessible texture attribution dialog
│   │   └── voice/
│   │       ├── VoiceDock.tsx       # Polished mic orb with 5 operational states & audio levels
│   │       └── SearchingIndicator.tsx # Pulsing satellite badge for local/web search
│   ├── store/
│   │   ├── useSolarSystemStore.ts  # Existing 3D camera & selectedPlanetId store
│   │   └── useVoiceStore.ts        # Existing voice session, searching & volume store
│   └── styles/
│       └── index.css            # Tailwind directives, font definitions, glassmorphism utilities
```

---

## Complexity Tracking

> **Constitution Check passed with zero violations. No unjustified complexity introduced.**

| Aspect | Constitutional Rule | Solution Approach |
| :--- | :--- | :--- |
| Responsive Layout | Principle I & II (Decoupled modular presentation) | Fixed Layered HUD (z-0 to z-40) with Tailwind flex/grid and safe-area insets. |
| Arabic Captions | Principle IV (Egyptian Arabic voice experience) | Native RTL with Cairo font, `<bdi>` isolation, and translucent glassmorphism. |
| Voice State Management | Principle II & VIII (Reuse existing state, simplicity) | Directly consumes existing `useVoiceStore` without secondary state wrappers. |
| Open Asset Attribution | Legal & ethical compliance | Top-nav credits button opening an accessible modal citing NASA & Solar System Scope. |

---

## Step-by-Step Implementation Phases

### Phase 1: Review Existing UI & Inventory Components
- Inspect existing frontend components: `App.tsx`, `SolarSystem.tsx`, `VoiceDock.tsx`, `FactCard.tsx`, `SearchingIndicator.tsx`.
- Review existing stores: `useSolarSystemStore.ts` and `useVoiceStore.ts`.
- Identify elements to polish, refactor, or preserve without breaking 3D or voice interactions.

### Phase 2: Design & Contracts (Completed)
- [x] Phase 0 research consolidated in `research.md`.
- [x] Entities and state schemas documented in `data-model.md`.
- [x] UI component contracts documented in `contracts/`.
- [x] Verification walkthrough written in `quickstart.md`.

### Phase 3: Typography & Space Theme Foundation
- Preload Google Fonts `Cairo` (weights: 400, 600, 700) and `Tajawal` in `frontend/index.html`.
- Configure `fontFamily.cairo` and `fontFamily.tajawal` in `tailwind.config.js`.
- Define unified space design system utilities in `index.css`:
  - Glassmorphic backdrops: `backdrop-blur-md`, `bg-slate-950/85`.
  - Border and glow gradients: cyan-500, amber-500, purple-500 accents.
  - Safe-area inset variables for mobile screens.

### Phase 4: Responsive Main Layout & Foreground Astronaut Presence
- Implement `AppLayout.tsx` enforcing the layered z-index hierarchy:
  - Layer 0: Full-screen 3D canvas (`Canvas` from R3F with OrbitControls).
  - Layer 10: Ambient dark space vignette (`pointer-events-none`).
  - Layer 20: `TopNavBar` (brand title, reset view button, credits trigger) and `AstronautAvatar` container.
  - Layer 30: Active interactive HUD overlays (`PlanetInfoCard`, `LiveCaptions`, `VoiceDock`).
  - Layer 40: `CreditsModal`.
- Ensure responsive quadrant allocation:
  - Desktop: Astronaut avatar anchored bottom-left; Planet info card floating top-right.
  - Mobile: Astronaut avatar compact floating icon; Planet info card renders as collapsible bottom drawer.
  - Safe-area insets on mobile (`pb-[env(safe-area-inset-bottom)]`).

### Phase 5: Voice Controls & Operational States Polishing
- Refactor `VoiceDock.tsx` to cleanly render 5 discrete operational states:
  1. **Idle**: Dormant mic orb with subtle slate ring and "اضغط للتحدث" label.
  2. **Connecting**: Rotating spinner with blue accent.
  3. **Listening**: Glowing cyan ring with dynamic input volume scaling.
  4. **Thinking**: Rotating amber orbital indicator.
  5. **Searching**: Integrated `SearchingIndicator` badge with satellite dish icon.
  6. **Speaking**: Purple glowing visualizer with animated audio bars.
  7. **Error**: Red accent ring with retry trigger.
- Guarantee touch targets satisfy minimum $48\times 48\text{px}$.
- Verify sub-200ms barge-in: speaking cut-off immediately returns to listening.

### Phase 6: Curated Celestial Registry & Planet Information Card
- Create `frontend/src/data/celestial-info.ts` containing verified facts, distances (AU and km), and bilingual names for all 11 bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`).
- Implement `PlanetInfoCard.tsx`:
  - Cairo bold Arabic name + slate-400 English subtitle.
  - Formatted distance from Sun badge.
  - 4 to 5 verified scientific bullet points.
  - Responsive layout: desktop side-card vs. mobile bottom sheet with tap-to-minimize chevron.
  - Accessible dismiss button (`X`).
  - Automatic updates whenever `selectedPlanetId` changes in `useSolarSystemStore`.

### Phase 7: Live Arabic Captions with Cairo Typography
- Implement `LiveCaptions.tsx`:
  - `dir="rtl"` with Cairo typography.
  - `<bdi>` isolation for mixed English terms, mission names, and numbers.
  - High-contrast translucent dark slate plate (`bg-slate-950/85 backdrop-blur-md`).
  - Height capping with smooth auto-scroll to latest utterance chunk.
  - 4.0-second linger on speech completion before soft 700ms fade-out.
  - Sub-200ms immediate clear upon user barge-in.

### Phase 8: Search Indicator Feedback & Visual Polish
- Polish `SearchingIndicator.tsx`:
  - Radar / satellite dish icon with gentle amber-cyan radar sweep pulse.
  - Displays localized Egyptian Arabic message: `"بيبحث في السجلات الفضائية..."`.
  - Appears within $100\text{ms}$ of search invocation; automatically hides when speaking begins.
- Refine overall application aesthetics:
  - Subtle hover and focus transitions across all controls.
  - Cohesive galactic color palette (obsidian, cyan, gold, slate).
  - Clear visual control states for active, hovered, focused, and disabled elements.

### Phase 9: Accessibility, Touch Standards & Texture Attribution
- Add descriptive `aria-label` attributes in Arabic and English to all interactive buttons.
- Ensure all clickable elements meet the $44\times 44\text{px}$ touch target standard.
- Implement visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`).
- Add `aria-live="polite"` to the caption container for screen reader accessibility.
- Implement `CreditsModal.tsx` citing NASA / JPL-Caltech and Solar System Scope textures with links and licenses.

### Phase 10: Verification & Regression Testing
- Execute all verification scenarios from [quickstart.md](quickstart.md).
- Validate desktop (1920x1080), laptop (1366x768), and mobile (375x667, 412x915) screen layouts.
- Verify 100% regression compliance with Features 001–005 (3D solar system, voice agent, function calling, local RAG knowledge base, Google Search grounding).

---

## Dependencies & Configuration

### Dependencies
- No new third-party npm packages required! Reuses existing `react`, `react-three-fiber`, `drei`, `three`, `zustand`, `lucide-react`, and `tailwindcss`.
- Google Fonts: `Cairo` and `Tajawal` loaded via standard CDN stylesheet in `index.html`.

### Configuration
- `tailwind.config.js`:
  ```javascript
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        tajawal: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        space: {
          950: '#020617',
          900: '#0a0f1d',
          800: '#111827',
        }
      }
    }
  }
  ```

---

## Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Mobile Screen Clutter**: Captions, planet card, and voice dock competing for space on 375px screens. | High | Collapsible bottom drawer for planet card; compact 2-line floating pill for captions; strict z-index quadrant layering. |
| **3D Canvas Re-renders**: Frequent UI state updates causing React Three Fiber scene lag. | Medium | Keep 3D canvas and UI HUD in separate React component trees; subscribe to store selectors with shallow comparison. |
| **Arabic Text Misalignment**: Numbers or English words causing reversed punctuation in RTL. | Medium | Wrap all embedded English names, mission codes, and numbers in `<bdi>` (bidirectional isolation) tags. |
| **Font Loading Delay (FOIT)**: Text invisible while Google Fonts Cairo is downloading. | Low | Use `font-display: swap` in Google Fonts URL with clean system Arabic fallbacks (`sans-serif`, `system-ui`, `Segoe UI`, `Tahoma`). |

---

## Testing Strategy

1. **Automated Unit & Contract Tests**:
   - `celestial-info.test.ts`: Validate that all 11 celestial bodies contain Arabic name, English name, distance in AU/km, and exactly 4–5 facts.
   - `ui-layout.test.ts`: Validate breakpoint categorization and collision invariants.
   - `voice-dock.test.ts`: Validate state rendering and aria-labels for all 5 operational states.
2. **Visual & Responsive Testing**:
   - Chrome DevTools Device Mode: iPhone SE (375px), Pixel 7 (412px), iPad Mini (768px), Laptop (1366px), Desktop (1920px).
   - Test portrait and landscape orientation transitions.
3. **Accessibility Audit**:
   - Lighthouse Accessibility audit (target $\ge 95$).
   - Full keyboard navigation run-through (Tab, Shift-Tab, Enter, Space, Esc).
4. **End-to-End Regression Walkthrough**:
   - Complete verification walkthrough following [quickstart.md](quickstart.md).

---

## Acceptance Criteria

1. **Main Layout**: Full-screen dark space theme; 3D solar system remains primary visual element; foreground astronaut presence; responsive on laptop and mobile viewports.
2. **Voice Controls & States**: Unambiguous visual representation of Idle, Listening, Thinking, Searching, Speaking, and Error states; reuses existing voice state store without duplication.
3. **Planet Information Card**: Bilingual Arabic & English names, distance from Sun, 4–5 verified key facts; dynamically updates upon target change; unobtrusive placement with easy dismiss.
4. **Live Captions**: Spoken words displayed in real time; RTL layout with Cairo typography; high-contrast readable backdrop; auto-scroll and 4s linger/fade.
5. **Search Feedback**: Visible searching indicator (`"بيبحث في السجلات الفضائية..."`) displayed during local/web search and hidden upon speaking.
6. **Visual Polish**: Consistent space styling, glassmorphism, subtle transitions, touch-friendly controls ($\ge 44\text{px}$), and NASA / Solar System Scope texture credits.
7. **Accessibility**: ARIA labels on all interactive controls, WCAG AA contrast, keyboard accessibility, and zero element collisions on mobile screens.
8. **Regressions**: All functionality from Features 001–005 (3D navigation, voice streaming, function calling, local RAG, Google Search grounding) continues to operate flawlessly.

---

## Definition of Completion

- [x] Feature specification validated and approved.
- [x] Technical research consolidated in `research.md`.
- [x] Data model and entity schemas documented in `data-model.md`.
- [x] UI contracts defined in `contracts/`.
- [x] Verification guide documented in `quickstart.md`.
- [x] Implementation plan finalized and committed to `plan.md`.
- [ ] Tasks broken down and dependency-ordered in `tasks.md` via `/speckit-tasks`.
