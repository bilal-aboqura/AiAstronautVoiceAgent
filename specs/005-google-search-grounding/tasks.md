# Tasks: Google Search Grounding

**Input**: Design documents from `/specs/005-google-search-grounding/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Exact file paths are specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared TypeScript definitions, and environment configuration.

- [ ] T001 [P] Define TypeScript interfaces for Google Search grounding setup, grounding metadata payloads, and extracted sources in `frontend/src/types/voice.ts` citing `data-model.md (LiveSessionSetup.model, LiveSessionSetup.tools, GroundingMetadata.webSearchQueries, GroundingMetadata.groundingChunks, GroundingMetadata.groundingSupports, GroundingMetadata.searchEntryPoint, ExtractedSource.title, ExtractedSource.url, ExtractedSource.domain)`.
- [ ] T002 [P] Verify and document environment configuration in `server/config/env.ts` ensuring `GEMINI_LIVE_MODEL` (e.g. `gemini-2.0-flash-exp`) is dynamically passed from backend to the ephemeral token session endpoint in `server/routes/session.ts` citing `data-model.md (LiveSessionSetup.model)`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core defensive parser, unit tests, and Zustand state slice that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this foundational phase is complete.

- [ ] T003 Implement defensive grounding metadata extraction module in `frontend/src/services/grounding-parser.ts` to parse `serverContent.groundingMetadata`, extracting `webSearchQueries`, `groundingChunks` (URIs, titles, domains), and search entry points without throwing on partial or missing fields per `contracts/gemini-live-grounding-metadata.contract.md` citing `data-model.md (GroundingMetadata.webSearchQueries, GroundingMetadata.groundingChunks, GroundingMetadata.groundingSupports, GroundingMetadata.searchEntryPoint, ExtractedSource.title, ExtractedSource.url, ExtractedSource.domain)`.
- [ ] T004 Implement unit tests for `grounding-parser.ts` in `frontend/src/services/__tests__/grounding-parser.test.ts` validating complete, query-only, and omitted metadata frames against `contracts/gemini-live-grounding-metadata.contract.md`.
- [ ] T005 Extend voice state store in `frontend/src/store/useVoiceStore.ts` with search tracking slice (`isSearching`, `searchStage`, `searchStatusLabel`, `activeSearchQuery`, `groundingSources`, `latestSearchQueries`, `startLocalSearch`, `startWebSearch`, `finishSearch`, `clearSearch`) per `contracts/voice-search-state.contract.md` citing `data-model.md (VoiceSearchState.isSearching, VoiceSearchState.searchStage, VoiceSearchState.searchStatusLabel, VoiceSearchState.activeQuery, VoiceSearchState.groundingSources, VoiceSearchState.latestSearchQueries)`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - External Web Grounding for Non-Curated or Recent Space Queries (Priority: P1) 🎯 MVP

**Goal**: Enable the voice agent to fall back to Gemini's built-in Google Search grounding when local knowledge lacks verified records, delivering verified web-grounded space science answers in Egyptian colloquial Arabic.

**Independent Test**: In an active voice session, ask a recent or non-curated space query (e.g. latest Starship test flight or current ISS commander); verify `search_knowledge` executes first, returns `no_results`, Google Search grounding activates, and the astronaut speaks a verified answer with source attribution in Egyptian Arabic per `quickstart.md (Scenario 2)`.

### Implementation for User Story 1

- [ ] T006 [US1] Update `BidiGenerateContentSetup` in `frontend/src/services/gemini-live-service.ts` to include `{ "googleSearch": {} }` alongside custom `functionDeclarations` per `contracts/gemini-live-search-grounding-setup.contract.md` citing `data-model.md (LiveSessionSetup.tools)`.
- [ ] T007 [US1] Update system instruction prompt in `frontend/src/services/gemini-live-service.ts` to enforce the 3-tier grounding hierarchy (local knowledge first, Google Search fallback for novel/recent topics, honest uncertainty) per `contracts/gemini-live-search-grounding-setup.contract.md`.
- [ ] T008 [US1] Integrate `grounding-parser.ts` into WebSocket inbound message dispatcher in `frontend/src/services/gemini-live-service.ts` to capture `groundingMetadata` on `serverContent` and store extracted sources and queries in `useVoiceStore` citing `data-model.md (VoiceSearchState.groundingSources, VoiceSearchState.latestSearchQueries)`.
- [ ] T009 [US1] Verify end-to-end fallback flow for recent space queries (e.g. Starship test flight or current ISS crew) per `quickstart.md (Scenario 2)` ensuring web search grounding activates and answers with source attribution in Egyptian Arabic.

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Prioritizing Curated Local Knowledge Without Unnecessary External Search (Priority: P1)

**Goal**: Ensure queries covering fundamental solar system bodies or historic space missions are answered directly from curated local records without triggering external web searches.

**Independent Test**: In an active voice session, ask a question present in the curated local knowledge base (e.g. Apollo 11 launch date or Venus surface temperature); verify `search_knowledge` is called, returns matching records, and the astronaut answers from local data with zero external web search queries triggered per `quickstart.md (Scenario 1)`.

### Implementation for User Story 2

- [ ] T010 [US2] Update `search_knowledge` tool description and execution handler in `frontend/src/services/agent-tools.ts` to return explicit synthesis instructions on match (`status: "success"`) commanding the model to answer from local facts without web search citing `data-model.md (VoiceSearchState.searchStage)`.
- [ ] T011 [US2] Update `search_knowledge` tool execution handler in `frontend/src/services/agent-tools.ts` to return explicit fallback authorization on miss (`status: "no_results"`) instructing the model that local records lack the fact and authorizing Google Search grounding per `contracts/gemini-tool-search-knowledge.contract.md`.
- [ ] T012 [US2] Implement contract test in `frontend/src/services/__tests__/local-first-grounding.test.ts` verifying that simulated local knowledge hits do not trigger external `webSearchQueries` per `quickstart.md (Scenario 1)`.

**Checkpoint**: User Stories 1 and 2 operate in harmony, enforcing the constitutional grounding hierarchy.

---

## Phase 5: User Story 3 - Visible Search Indicator and Non-Blocking Conversational State (Priority: P2)

**Goal**: Display clear visual feedback in the voice HUD indicating whether local or web search is underway, maintaining responsive 3D interaction and instant barge-in interruption.

**Independent Test**: Trigger an external web search; verify the HUD status displays `"بيبحث في السجلات الفضائية..."` within 200ms, clears when speech begins, and immediately resets if interrupted by visitor speech per `quickstart.md (Scenario 4 & Scenario 5)`.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Create `SearchingIndicator` component in `frontend/src/components/voice/SearchingIndicator.tsx` displaying a subtle animated badge with localized Egyptian Arabic labels (`"بيبحث في السجلات المحلية..."` and `"بيبحث في السجلات الفضائية..."`) per `contracts/voice-search-state.contract.md` citing `data-model.md (VoiceSearchState.searchStatusLabel, VoiceSearchState.searchStage)`.
- [ ] T014 [US3] Mount `SearchingIndicator` inside `frontend/src/components/voice/VoiceDock.tsx` and bind visibility to `isSearching` from `useVoiceStore` ensuring non-blocking layout with $< 200\text{ms}$ transition latency citing `data-model.md (VoiceSearchState.isSearching)`.
- [ ] T015 [US3] Connect user interruption (barge-in) handler in `frontend/src/services/gemini-live-service.ts` and `frontend/src/hooks/useMicrophone.ts` to call `clearSearch()`, immediately clearing search indicator, resetting search stage to idle, and canceling pending playback in $< 200\text{ms}$ per `quickstart.md (Scenario 5)` citing `data-model.md (VoiceSearchState.isSearching, VoiceSearchState.searchStage)`.

**Checkpoint**: Search status is visible, elegant, non-blocking, and cleanly responsive to interruptions.

---

## Phase 6: User Story 4 - Graceful Error Handling and Honest Uncertainty Communication (Priority: P2)

**Goal**: Ensure search failures, empty search hits, or speculative queries do not crash or terminate the voice session, and that the astronaut communicates honest uncertainty in authentic Egyptian Arabic.

**Independent Test**: Ask an unverified speculative question (e.g. "هل في كائنات فضائية على بلوتو؟"); verify the agent acknowledges lack of verified data in Egyptian Arabic without inventing facts, keeping the call open per `quickstart.md (Scenario 3)`.

### Implementation for User Story 4

- [ ] T016 [US4] Implement WebSocket setup and runtime error guards in `frontend/src/services/gemini-live-service.ts` catching unsupported model configurations or tool setup rejections gracefully without crashing the app.
- [ ] T017 [US4] Update system prompt and fallback logic in `frontend/src/services/gemini-live-service.ts` guiding the agent to articulate warm Egyptian Arabic uncertainty statements (e.g. `"بحثت في السجلات وشبكة الفضاء بس مفيش معلومات مؤكدة يا بطل"`) on empty search hits or network timeouts per `quickstart.md (Scenario 3)`.
- [ ] T018 [US4] Verify session resilience in `frontend/src/services/gemini-live-service.ts` ensuring transient search errors keep the voice call active and connected.

**Checkpoint**: The voice agent achieves resilient zero-hallucination uncertainty handling across all edge cases.

---

## Phase 7: User Story 5 - Multi-Tool Coexistence with Existing 3D Controls and Knowledge Retrieval (Priority: P3)

**Goal**: Guarantee that 3D celestial navigation (`focus_planet`, `show_fact_card`, `reset_view`) and local `search_knowledge` tool continue working without interference from search grounding.

**Independent Test**: Ask the astronaut to show Jupiter in 3D while querying its latest space mission; verify `focus_planet` executes on canvas while grounding retrieves mission data without conflict per `quickstart.md (Scenario 6)`.

### Implementation for User Story 5

- [ ] T019 [US5] Verify simultaneous tool declarations in `frontend/src/services/gemini-live-service.ts` preserving `focus_planet`, `show_fact_card`, `reset_view`, and `search_knowledge` alongside `googleSearch` per `contracts/gemini-live-search-grounding-setup.contract.md`.
- [ ] T020 [US5] Verify concurrent tool dispatching in `frontend/src/services/agent-tools.ts` ensuring simultaneous 3D scene camera animations and knowledge/search grounding execute without race conditions per `quickstart.md (Scenario 6)`.

**Checkpoint**: Multimodal coexistence between voice, 3D interaction, local knowledge, and web grounding is verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification across all test scenarios, client secret auditing, and test coverage validation.

- [ ] T021 [P] Verify end-to-end execution of all 6 test scenarios documented in `specs/005-google-search-grounding/quickstart.md`.
- [ ] T022 [P] Verify zero client secret leakage ensuring `GEMINI_API_KEY` is never bundled into client assets or network payloads per Constitution Principle V.
- [ ] T023 Run type check, linting, and unit test suite across `frontend/` and `server/` to ensure zero regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - Can proceed sequentially in priority order: P1 (US1, US2) $\rightarrow$ P2 (US3, US4) $\rightarrow$ P3 (US5).
- **Polish (Phase 8)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). Delivers core MVP grounding.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2). Enforces local-first precedence over US1 fallback.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2). Integrates visual HUD search status.
- **User Story 4 (P2)**: Can start after US1 & US2. Adds error resilience and uncertainty prompts.
- **User Story 5 (P3)**: Can start after US1. Validates coexistence with 3D tools.

---

## Parallel Execution Opportunities

- **Phase 1**: T001 and T002 can execute in parallel.
- **Phase 2**: T003, T004, and T005 can execute in parallel once types are defined.
- **Phase 5**: T013 (`SearchingIndicator.tsx`) can be developed in parallel with service integrations.
- **Phase 8**: T021 and T022 can run in parallel before final test suite execution.

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)
1. Complete Phase 1: Setup (TypeScript definitions, env config).
2. Complete Phase 2: Foundational (grounding parser, unit tests, store slice).
3. Complete Phase 3: User Story 1 (Google Search tool in `BidiGenerateContentSetup`, system prompt hierarchy, grounding metadata capture).
4. **VALIDATE MVP**: Test web search fallback for novel space queries independently via `quickstart.md (Scenario 2)`.

### Incremental Feature Delivery
1. Foundation + US1 $\rightarrow$ Basic web search grounding works (MVP).
2. Add US2 $\rightarrow$ Enforce local-first precedence to eliminate unnecessary web searches.
3. Add US3 $\rightarrow$ User sees elegant Egyptian Arabic searching indicators and sub-200ms barge-in.
4. Add US4 $\rightarrow$ Zero-hallucination uncertainty handling and session resilience.
5. Add US5 $\rightarrow$ Multimodal 3D coexistence verified.
6. Phase 8 Polish $\rightarrow$ Full test suite passes, zero secret leaks, ready for release.
