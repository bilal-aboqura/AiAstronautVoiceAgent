# Implementation Plan: AI Tools & 3D Interaction

**Branch**: `003-ai-tools-3d-interaction` | **Date**: 2026-11-23 | **Spec**: [specs/003-ai-tools-3d-interaction/spec.md](spec.md)

**Input**: Feature specification from `specs/003-ai-tools-3d-interaction/spec.md`

## Summary

Integrate Gemini Multimodal Live API function calling with the interactive 3D solar system so the Egyptian Astronaut voice agent controls 3D navigation and educational visual cards in real time. The solution registers 3 client-side tools (`focus_planet`, `show_fact_card`, `reset_view`) in the Gemini Live session initialization configuration. Incoming `toolCall` messages from the Live WebSocket are validated and routed through a dedicated frontend service (`src/services/agent-tools.ts`) directly into the reactive application state store (`useSolarSystemStore`), driving smooth camera interpolation and informational HUDs. Structured `toolResponse` frames are returned immediately over the WebSocket with zero audio disruption, allowing the astronaut to continue conversing in natural Egyptian colloquial Arabic. Zero Express endpoints are created for UI actions, and permanent API keys remain strictly backend-confined.

---

## Technical Context

**Language/Version**: TypeScript 5.4+, React 18 / 19, Node.js 20 LTS  
**Frontend Primary Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `lucide-react`, `tailwindcss`  
**Backend Primary Dependencies**: `express`, `cors`, `dotenv`, `@google/genai` (for ephemeral session token provisioning)  
**Voice Provider**: Gemini Multimodal Live API (Bidirectional WebSocket)  
**Model Configuration**: Resolved dynamically from `GEMINI_LIVE_MODEL` environment variable (e.g. `gemini-2.0-flash-exp`)  
**Storage**: N/A (In-memory reactive state and static assets)  
**Testing**: Automated unit tests for tool validators/handlers; manual verification via [quickstart.md](quickstart.md)  
**Target Platform**: Modern desktop and mobile browsers supporting WebGL 2.0 and Web Audio API  
**Project Type**: Full-Stack Web Application (Frontend in `frontend/`, Backend in `backend/`)  
**Performance Goals**: Tool execution turnaround $< 100\text{ms}$, camera transit 1.5–2.5s, voice response continuation $< 1.5\text{s}$, 0 dropped voice sessions  
**Constraints**: Keep UI tools in frontend; no Express endpoints for client-only actions; zero permanent secrets on client; no RAG or Google Search in this milestone  
**Scale/Scope**: 3 tools, 11 supported celestial bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`), bilingual RTL/LTR fact cards  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post Phase 1 design.*

- [x] **Principle I (Technology Stack)**: Frontend strictly uses Vite, React, TypeScript, Three.js, R3F, Drei, and Tailwind CSS. Backend uses Node.js and Express. Voice uses Gemini Live API.
- [x] **Principle II (System Architecture & Component Decoupling)**: 3D scene rendering interacts solely with `useSolarSystemStore`. Voice agent connects to `agent-tools.ts`, which mutates the store without touching Three.js mesh instances or camera internals directly.
- [x] **Principle III (Scientific Accuracy & Grounding)**: Tools do not fabricate astronomical facts. Supported planet names are validated against real celestial bodies; prompt strictly commands the agent to provide factual space data and admit uncertainty honestly.
- [x] **Principle IV (Egyptian Arabic Voice Experience & Interactivity)**: Spoken voice stays in authentic Egyptian colloquial Arabic. Tool failure returns error messages that the agent explains warmly in Egyptian Arabic without dropping the call.
- [x] **Principle V (Security, Privacy & Ephemeral Data Protection)**: All Gemini Live calls utilize short-lived ephemeral tokens from the backend. Permanent `GEMINI_API_KEY` is never exposed.
- [x] **Principle VI (Quality Assurance & Evaluation Gates)**: Comprehensive contracts, data models, unit tests, and runnable verification scenarios provided in [quickstart.md](quickstart.md).
- [x] **Principle VII (Comprehensive Documentation)**: Complete architecture, protocol contracts ([gemini-tool-declarations.contract.md](contracts/gemini-tool-declarations.contract.md), [gemini-live-tool-protocol.contract.md](contracts/gemini-live-tool-protocol.contract.md), [frontend-tool-handler.contract.md](contracts/frontend-tool-handler.contract.md), [fact-card.contract.md](contracts/fact-card.contract.md)), data model, and quickstart documented.
- [x] **Principle VIII (Strict Scope Enforcement)**: Scope strictly restricted to Feature 003. RAG (`search_knowledge`), Google Search, external voice providers, and 40-question benchmark runner are excluded.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-tools-3d-interaction/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical decisions & protocol analysis
├── data-model.md        # Entities, schemas, and state transitions
├── quickstart.md        # End-to-end verification walkthrough
├── contracts/           # Protocol and interface contracts
│   ├── gemini-tool-declarations.contract.md
│   ├── gemini-live-tool-protocol.contract.md
│   ├── frontend-tool-handler.contract.md
│   └── fact-card.contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
frontend/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CameraController.tsx    # Smooth damping towards target body or overview
│   │   │   ├── SolarSystemCanvas.tsx   # Three.js / R3F Canvas host
│   │   │   └── Planet.tsx              # Reusable planetary mesh with orbit & click handler
│   │   └── ui/
│   │       ├── FactCard.tsx            # Floating bilingual fact card (RTL/LTR)
│   │       ├── PlanetInfoCard.tsx      # Planetary detail card
│   │       ├── SceneControls.tsx       # HUD reset button & planet indicator
│   │       └── VoiceDock.tsx           # Voice agent controls & status indicator
│   ├── data/
│   │   └── planets.ts                  # Centralized configuration (extended with Pluto)
│   ├── services/
│   │   ├── agent-tools.ts              # Core frontend tool dispatcher & validators
│   │   └── gemini-live.ts              # Gemini Live WebSocket service (tool call handler)
│   ├── store/
│   │   ├── useSolarSystemStore.ts      # Selection, camera mode, and fact card state
│   │   └── useVoiceStore.ts            # Voice agent session state
│   ├── types/
│   │   ├── agent-tools.ts              # Tool payload, argument & response types
│   │   └── solar-system.ts             # Celestial body types (including Pluto)
│   ├── App.tsx                         # Integrated UI layout
│   └── main.tsx
└── tests/
    └── unit/
        ├── agent-tools.test.ts         # Tool argument validation & dispatch tests
        └── fact-card.test.tsx          # RTL/LTR layout rendering tests
```

---

## Component Responsibilities

1. **`gemini-live.ts` (`GeminiLiveService`)**:
   - Registers the 3 tool declarations in `BidiGenerateContentSetup.tools`.
   - Listens for WebSocket frames containing `toolCall`.
   - Delegates incoming `functionCalls` to `agent-tools.ts`.
   - Packages execution results into `toolResponse` frames and transmits them back immediately.
   - Enforces continuous audio streaming without resetting playback on tool responses.

2. **`agent-tools.ts`**:
   - Validates incoming arguments against typed schemas.
   - Dispatches `focus_planet` to `useSolarSystemStore.getState().selectPlanet(name)`.
   - Dispatches `show_fact_card` to `useSolarSystemStore.getState().setFactCard(...)`.
   - Dispatches `reset_view` to `useSolarSystemStore.getState().resetView()`.
   - Traps all execution errors and returns structured failure envelopes with descriptive messages.

3. **`useSolarSystemStore.ts`**:
   - Maintains `selectedPlanetId: string | null`, `cameraMode: 'overview' | 'focused'`.
   - Maintains active `factCard: FactCardData | null` and `isInfoCardOpen: boolean`.
   - Exposes atomic actions: `selectPlanet`, `resetView`, `setFactCard`, `closeFactCard`, `closeInfoCard`.

4. **`CameraController.tsx`**:
   - Reads `selectedPlanetId` from `useSolarSystemStore`.
   - Interpolates camera position and look-at target smoothly over 1.5–2.5 seconds using `useFrame` damping.
   - Continuously locks look-at target to the moving planet mesh while focused.

5. **`FactCard.tsx` & `PlanetInfoCard.tsx`**:
   - Renders floating glassmorphic panels over the 3D canvas.
   - Automatically detects Arabic characters to apply `dir="rtl"` and right text alignment.
   - Provides accessible close buttons to dismiss cards.

---

## Implementation Phases & Staged Execution

### Phase 1: Inspect & Prepare
- Inspect existing `useSolarSystemStore.ts`, `planets.ts`, and `CameraController.tsx` from Feature 001.
- Inspect `gemini-live.ts` and `useVoiceAgent.ts` from Feature 002.
- Define TypeScript interfaces in `frontend/src/types/agent-tools.ts` (`ToolCallPayload`, `ToolResponsePayload`, `SUPPORTED_CELESTIAL_BODIES`).
- Ensure no duplicate stores or canvas wrappers are introduced.

### Phase 2: Gemini Tool Declarations
- Define JSON schemas for `focus_planet`, `show_fact_card`, and `reset_view` conforming to [gemini-tool-declarations.contract.md](contracts/gemini-tool-declarations.contract.md).
- Update the system instruction in `gemini-live.ts` to instruct the Egyptian Astronaut to eagerly call `focus_planet` when celestial bodies are mentioned, call `reset_view` on overview requests, and use `show_fact_card` for educational bullet points.
- Inject tool declarations into the `setup` message transmitted to Gemini Live.

### Phase 3: Frontend Tool Handler
- Create `frontend/src/services/agent-tools.ts`.
- Implement argument validation helpers:
  - `validatePlanetName(name: unknown)`
  - `validateFactCardArgs(args: unknown)`
- Implement `executeToolCall(call: ToolCallPayload): Promise<ToolResponsePayload>`.
- Route calls to `useSolarSystemStore` actions.
- Implement defensive error handling returning `{ status: 'error', message: ... }` for unknown tools or bad inputs.

### Phase 4: Planet Focus Integration
- Extend `frontend/src/data/planets.ts` with `pluto` configuration (color, radius, orbit, summaries in Arabic & English).
- Verify all 11 bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`) can be selected.
- Wire `focus_planet` to trigger camera interpolation and display `PlanetInfoCard`.
- Verify camera smoothly tracks orbital movement after arriving at the planet.

### Phase 5: Fact Cards Integration
- Create or update `frontend/src/components/ui/FactCard.tsx`.
- Connect `show_fact_card` to store state (`factCard`).
- Implement automatic RTL detection for Arabic strings using Unicode range check (`/[\u0600-\u06FF]/`).
- Style with glassmorphic Tailwind CSS backdrop, high-contrast typography, and accessible close button.

### Phase 6: Reset View Integration
- Wire `reset_view` to call `useSolarSystemStore.getState().resetView()`.
- Ensure `reset_view` clears selected planet, closes `PlanetInfoCard`, and dismisses `FactCard`.
- Verify smooth camera pull-back animation to full solar system perspective.

### Phase 7: Gemini Tool Responses & Conversational Turn
- Update `gemini-live.ts` WebSocket message listener to detect `toolCall`.
- Execute tool calls through `agent-tools.ts` and construct `toolResponse` frame conforming to [gemini-live-tool-protocol.contract.md](contracts/gemini-live-tool-protocol.contract.md).
- Send `toolResponse` back over WebSocket immediately.
- Verify Gemini Live receives `toolResponse` and continues generating synthesized speech without session teardown.
- Handle multiple tool calls within a single turn safely.

### Phase 8: Verification & Quality Gates
- Write unit tests in `frontend/tests/unit/agent-tools.test.ts`.
- Perform manual verification following [quickstart.md](quickstart.md) (Earth focus, Saturn focus, fact card display, reset view, error recovery, coexistence with manual clicks).
- Verify 3D frame rate remains $\ge 50\text{ fps}$ on desktop and $\ge 30\text{ fps}$ on mobile during camera animations.
