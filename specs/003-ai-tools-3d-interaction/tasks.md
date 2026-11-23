# Tasks: AI Tools & 3D Interaction

**Input**: Design documents from `/specs/003-ai-tools-3d-interaction/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Exact file paths are specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared TypeScript schemas, and celestial dataset extension.

- [ ] T001 [P] Define tool interfaces, payload schemas, and response types in `frontend/src/types/agent-tools.ts` citing `data-model.md (GeminiToolCall.id, GeminiToolCall.name, GeminiToolCall.args, ToolExecutionResult.status, ToolExecutionErrorResult.code, GeminiFunctionResponse.id, GeminiFunctionResponse.name, GeminiFunctionResponse.response)`.
- [ ] T002 [P] Extend celestial body types and constants in `frontend/src/types/solar-system.ts` with `SUPPORTED_CELESTIAL_BODIES` enum citing `data-model.md (CelestialBodyInfo.id, CelestialBodyInfo.type)`.
- [ ] T003 [P] Extend planetary dataset with Pluto configuration and Arabic/English metadata in `frontend/src/data/planets.ts` citing `data-model.md (CelestialBodyInfo.id, CelestialBodyInfo.type, CelestialBodyInfo.name, CelestialBodyInfo.arabicName, CelestialBodyInfo.overviewSummary, CelestialBodyInfo.facts)`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tool declarations, store state extension, and frontend execution router that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this foundational phase is complete.

- [ ] T004 Extend `useSolarSystemStore` in `frontend/src/store/useSolarSystemStore.ts` to manage fact card state and card visibility actions citing `data-model.md (FactCardData.isVisible, PlanetInfoCardData.isVisible, PlanetInfoCardData.bodyId)`.
- [ ] T005 Define Gemini tool declarations for `focus_planet`, `show_fact_card`, and `reset_view` in `frontend/src/services/toolDeclarations.ts` per `contracts/gemini-tool-declarations.contract.md`.
- [ ] T006 Implement core tool routing skeleton and validation guards in `frontend/src/services/agent-tools.ts` per `contracts/frontend-tool-handler.contract.md`.
- [ ] T007 Wire tool declarations into `GeminiLiveService` initial session setup and persona system prompt in `frontend/src/services/geminiLiveService.ts` per `contracts/gemini-tool-declarations.contract.md`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Voice-Controlled Celestial Body Navigation (Priority: P1) 🎯 MVP

**Goal**: Enable the Egyptian astronaut to focus the 3D camera smoothly on any of the 11 celestial bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`) and display its information card upon voice mention.

**Independent Test**: In an active voice session, ask about Earth or Saturn; verify `focus_planet` executes, the camera smoothly animates and locks onto the planet's orbit, the planetary card opens, and the agent continues speaking in Egyptian Arabic.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Implement `validatePlanetName` validator in `frontend/src/services/agent-tools.ts` validating all 11 bodies case-insensitively citing `data-model.md (CelestialBodyInfo.id, ToolExecutionErrorResult.code)`.
- [ ] T009 [US1] Implement `focus_planet` execution handler in `frontend/src/services/agent-tools.ts` dispatching to `useSolarSystemStore.getState().selectPlanet` and opening info card citing `data-model.md (PlanetInfoCardData.bodyId, PlanetInfoCardData.isVisible, ToolExecutionSuccessResult.status)`.
- [ ] T010 [US1] Update `CameraController` in `frontend/src/components/canvas/CameraController.tsx` to support smooth transit and continuous tracking for all 11 bodies including Pluto, Sun, and Moon.
- [ ] T011 [US1] Implement `PlanetInfoCard` component in `frontend/src/components/ui/PlanetInfoCard.tsx` displaying localized celestial data citing `data-model.md (PlanetInfoCardData.bodyId, PlanetInfoCardData.isVisible)`.
- [ ] T012 [US1] Wire inbound `toolCall` execution and outbound `toolResponse` transmission in `frontend/src/services/geminiLiveService.ts` per `contracts/gemini-live-tool-protocol.contract.md`.

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Voice-Driven Overview Reset (Priority: P1)

**Goal**: Enable the visitor to return the camera to the full solar system overview, clear active planet selection, and close open cards via natural speech.

**Independent Test**: While focused on a planet with cards open, ask the agent to show the whole solar system or reset the view; verify `reset_view` executes, camera pulls back to wide overview, selection is cleared to `null`, and cards close.

### Implementation for User Story 2

- [ ] T013 [US2] Implement `reset_view` execution handler in `frontend/src/services/agent-tools.ts` dispatching to `useSolarSystemStore.getState().resetView` citing `data-model.md (ToolExecutionSuccessResult.status)`.
- [ ] T014 [US2] Update `resetView` action in `frontend/src/store/useSolarSystemStore.ts` to dismiss open `PlanetInfoCard` and `FactCard` citing `data-model.md (FactCardData.isVisible, PlanetInfoCardData.isVisible)`.
- [ ] T015 [US2] Verify camera interpolation return path to default overview coordinates in `frontend/src/components/canvas/CameraController.tsx`.

**Checkpoint**: At this point, both User Stories 1 and 2 operate seamlessly together.

---

## Phase 5: User Story 3 - Dynamic Multilingual Fact Card Presentation (Priority: P2)

**Goal**: Display informative visual fact cards with verified facts in Arabic (RTL) or English (LTR) when the astronaut shares educational facts.

**Independent Test**: Ask the astronaut for interesting space facts; verify `show_fact_card` is called with title and facts, and a readable floating card appears in RTL layout for Arabic or LTR for English.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Implement `validateFactCardArgs` in `frontend/src/services/agent-tools.ts` validating title and facts array citing `data-model.md (FactCardData.title, FactCardData.facts, ToolExecutionErrorResult.code)`.
- [ ] T017 [P] [US3] Implement text direction auto-detector utility in `frontend/src/utils/textDirection.ts` detecting Arabic Unicode range citing `data-model.md (FactCardData.language, FactCardData.textDirection)`.
- [ ] T018 [US3] Implement `show_fact_card` handler in `frontend/src/services/agent-tools.ts` updating `useSolarSystemStore` citing `data-model.md (FactCardData.title, FactCardData.facts, FactCardData.textDirection, FactCardData.isVisible, ToolExecutionSuccessResult.status)`.
- [ ] T019 [US3] Create floating `FactCard` component in `frontend/src/components/ui/FactCard.tsx` with glassmorphic styling, RTL/LTR layout, and close button per `contracts/fact-card.contract.md` citing `data-model.md (FactCardData.title, FactCardData.facts, FactCardData.textDirection, FactCardData.isVisible)`.

**Checkpoint**: User Stories 1, 2, and 3 deliver complete visual 3D navigation and fact presentation.

---

## Phase 6: User Story 4 - Resilient Error Handling & Conversational Continuity (Priority: P2)

**Goal**: Gracefully catch invalid tool arguments or unknown tool names, return structured error responses to Gemini Live, and ensure the astronaut explains the issue in colloquial Egyptian Arabic without dropping the voice session.

**Independent Test**: Trigger a tool call with an unsupported body name (e.g. `focus_planet(name="krypton")`); verify an error envelope is returned, the voice connection remains alive, and the agent explains warmly in Egyptian Arabic.

### Implementation for User Story 4

- [ ] T020 [US4] Implement safe execution wrapper and unknown tool handler in `frontend/src/services/agent-tools.ts` returning structured error envelopes citing `data-model.md (ToolExecutionErrorResult.code, ToolExecutionErrorResult.status, ToolExecutionErrorResult.message)`.
- [ ] T021 [US4] Update `GeminiLiveService` in `frontend/src/services/geminiLiveService.ts` to handle tool execution failures and transmit error `toolResponse` without tearing down WebSocket or audio player.
- [ ] T022 [US4] Refine agent persona prompt in `frontend/src/utils/personaPrompt.ts` instructing the astronaut to acknowledge tool errors with warmth and humor in Egyptian colloquial Arabic without ending the call.

**Checkpoint**: System handles all failure modes safely with zero voice session termination.

---

## Phase 7: User Story 5 - Coexistence of Voice & Manual 3D Controls (Priority: P3)

**Goal**: Harmonize manual 3D user interactions (clicking celestial bodies, clicking manual UI reset) and voice tool interactions into a unified shared state.

**Independent Test**: Manually click a planet, then issue a voice command to focus on another; verify camera switches smoothly. Click the manual reset button, then issue a voice reset; verify no state conflict.

### Implementation for User Story 5

- [ ] T023 [P] [US5] Add click handler to Pluto mesh in `frontend/src/components/canvas/Planet.tsx` allowing manual selection of Pluto.
- [ ] T024 [US5] Harmonize manual reset button in `frontend/src/components/ui/SceneControls.tsx` with voice tool reset state in `frontend/src/store/useSolarSystemStore.ts`.
- [ ] T025 [US5] Integrate `FactCard` and `PlanetInfoCard` into the main canvas overlay in `frontend/src/App.tsx` ensuring mutual non-interference with 3D raycasting and `VoiceDock`.

**Checkpoint**: Both voice control and manual 3D pointer interactions operate in complete harmony.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Automated testing, validation walkthrough, and documentation.

- [ ] T026 [P] Implement unit tests for agent tool validators and execution in `frontend/tests/unit/agent-tools.test.ts`.
- [ ] T027 [P] Implement unit tests for `FactCard` RTL/LTR layout rendering in `frontend/tests/unit/fact-card.test.tsx`.
- [ ] T028 Run full automated typecheck and build validation (`npm run build`) across frontend and backend.
- [ ] T029 Execute end-to-end manual verification walkthrough following `specs/003-ai-tools-3d-interaction/quickstart.md` covering all 3 tools, Pluto navigation, error recovery, and bilingual card display.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**.
- **User Stories (Phase 3–7)**:
  - User Story 1 (P1 - Navigation): Can start immediately after Phase 2 (Foundational).
  - User Story 2 (P1 - Reset): Can start after Phase 2; integrates with US1 selection state.
  - User Story 3 (P2 - Fact Cards): Can start after Phase 2; shares store card layer.
  - User Story 4 (P2 - Error Handling): Builds on tool router from Phase 2 and US1/US3 handlers.
  - User Story 5 (P3 - Coexistence): Harmonizes UI controls across US1, US2, and manual scene controls.
- **Polish (Phase 8)**: Depends on all user stories being complete.

---

## Parallel Opportunities

- **Phase 1 (Setup)**: Tasks `T001`, `T002`, and `T003` operate on distinct files and can run in parallel.
- **Phase 2 (Foundational)**: `T004` and `T005` can run in parallel.
- **Phase 3 (User Story 1)**: `T008` (validation) and `T011` (PlanetInfoCard) can run in parallel before `T009` and `T012`.
- **Phase 5 (User Story 3)**: `T016` (args validation) and `T017` (text direction detector) can run in parallel.
- **Phase 8 (Polish)**: `T026` (agent tools tests) and `T027` (fact card tests) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (`T001`–`T003`).
2. Complete Phase 2: Foundational (`T004`–`T007`).
3. Complete Phase 3: User Story 1 (`T008`–`T012`).
4. **STOP and VALIDATE**: Verify Earth and Saturn voice focus and info card display independently.

### Incremental Delivery
1. Add User Story 2 (`T013`–`T015`): Verify voice-driven overview reset.
2. Add User Story 3 (`T016`–`T019`): Verify bilingual fact cards (Arabic RTL & English LTR).
3. Add User Story 4 (`T020`–`T022`): Verify safe error handling with invalid planet names.
4. Add User Story 5 (`T023`–`T025`): Verify harmony between manual clicking and voice navigation.
5. Execute Phase 8 (`T026`–`T029`): Verify unit tests and complete manual quickstart scenarios.
