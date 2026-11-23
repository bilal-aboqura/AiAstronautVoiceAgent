# Tasks: Space Knowledge Base (RAG)

**Input**: Design documents from `/specs/004-space-knowledge-base/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Exact file paths are specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, TypeScript schemas, and environment configuration.

- [ ] T001 [P] Create `knowledge/` directory and implement category file schema validator in `scripts/validate-knowledge-schema.ts` validating entries per `contracts/knowledge-entry.contract.md` citing `data-model.md (KnowledgeEntry.id, KnowledgeEntry.category, KnowledgeEntry.title, KnowledgeEntry.content, KnowledgeEntry.source_name, KnowledgeEntry.source_url)`.
- [ ] T002 [P] Define shared TypeScript interfaces and models in `server/types/knowledge.ts` and `frontend/src/types/agent-tools.ts` citing `data-model.md (KnowledgeEntry.id, KnowledgeEntry.category, KnowledgeEntry.title, KnowledgeEntry.content, KnowledgeEntry.source_name, KnowledgeEntry.source_url, KnowledgeIndexEntry.embedding, KnowledgeIndexEntry.content_hash, KnowledgeIndexFile.version, KnowledgeIndexFile.generated_at, KnowledgeIndexFile.embedding_model, KnowledgeIndexFile.vector_dimension, KnowledgeIndexFile.total_entries, SearchKnowledgeRequest.query, SearchKnowledgeRequest.limit, SearchKnowledgeRequest.threshold, SearchKnowledgeResultItem.relevance_score, SearchKnowledgeResponse.status, SearchKnowledgeResponse.total_matches, SearchKnowledgeResponse.execution_time_ms)`.
- [ ] T003 [P] Configure environment variable parsing and defaults (`GEMINI_EMBEDDING_MODEL=text-embedding-004`, `KNOWLEDGE_RELEVANCE_THRESHOLD=0.65`) in `server/config/env.ts` citing `data-model.md (KnowledgeIndexFile.embedding_model, SearchKnowledgeRequest.threshold)`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core embedding generator, offline index builder script, in-memory vector search service, and Express search route that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this foundational phase is complete.

- [ ] T004 Implement `EmbeddingService` in `server/services/embedding-service.ts` using `@google/genai` to generate 768-dimensional normalized vector embeddings using `GEMINI_EMBEDDING_MODEL` citing `data-model.md (KnowledgeIndexEntry.embedding, KnowledgeIndexFile.vector_dimension)`.
- [ ] T005 Implement knowledge indexing build script in `scripts/build-knowledge-index.ts` to scan category JSON files, hash contents, batch-generate embeddings via `EmbeddingService`, and persist compiled output to `knowledge/index.json` citing `data-model.md (KnowledgeIndexEntry.content_hash, KnowledgeIndexEntry.embedding, KnowledgeIndexFile.version, KnowledgeIndexFile.generated_at, KnowledgeIndexFile.embedding_model, KnowledgeIndexFile.vector_dimension, KnowledgeIndexFile.total_entries)`.
- [ ] T006 Implement in-memory vector similarity ranking and threshold filtering in `server/services/knowledge-search.ts` computing dot product of normalized vectors citing `data-model.md (SearchKnowledgeRequest.query, SearchKnowledgeRequest.limit, SearchKnowledgeRequest.threshold, SearchKnowledgeResultItem.relevance_score, SearchKnowledgeResponse.status, SearchKnowledgeResponse.total_matches, SearchKnowledgeResponse.execution_time_ms)`.
- [ ] T007 Implement Express router for `POST /api/knowledge/search` in `server/routes/knowledge.ts` validating request body and dispatching to `knowledge-search.ts` per `contracts/knowledge-search-api.contract.md` citing `data-model.md (SearchKnowledgeRequest.query, SearchKnowledgeRequest.limit, SearchKnowledgeRequest.threshold, SearchKnowledgeResponse.status)`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Grounded Planetary and Celestial Science Q&A (Priority: P1) 🎯 MVP

**Goal**: Enable the Egyptian astronaut to retrieve verified factual data about the Sun, the 8 planets, Pluto, black holes, and the ISS from the local knowledge base, citing authoritative sources and speaking in warm Egyptian Arabic without confabulating numbers.

**Independent Test**: In an active voice session, ask about the Sun's surface temperature or Mars's atmosphere; verify `search_knowledge` executes, retrieves matching entries from `sun.json` or `planets.json`, and the astronaut states the verified facts with source attribution in Egyptian Arabic.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Author curated scientific facts for Sun (`knowledge/sun.json`), eight planets (`knowledge/planets.json`), and Pluto (`knowledge/pluto.json`) per `contracts/knowledge-entry.contract.md` citing `data-model.md (KnowledgeEntry.id, KnowledgeEntry.category, KnowledgeEntry.title, KnowledgeEntry.content, KnowledgeEntry.source_name, KnowledgeEntry.source_url)`.
- [ ] T009 [P] [US1] Author curated scientific facts for black holes (`knowledge/black-holes.json`) and the International Space Station (`knowledge/iss.json`) per `contracts/knowledge-entry.contract.md` citing `data-model.md (KnowledgeEntry.id, KnowledgeEntry.category, KnowledgeEntry.title, KnowledgeEntry.content, KnowledgeEntry.source_name, KnowledgeEntry.source_url)`.
- [ ] T010 [US1] Register `search_knowledge` tool declaration in `frontend/src/services/toolDeclarations.ts` and `frontend/src/services/gemini-live.ts` per `contracts/gemini-tool-search-knowledge.contract.md` citing `data-model.md (SearchKnowledgeRequest.query)`.
- [ ] T011 [US1] Update Gemini Live system instruction in `frontend/src/services/gemini-live.ts` requiring `search_knowledge` calls before answering factual space questions, enforcing source attribution, and maintaining warm Egyptian colloquial Arabic.
- [ ] T012 [US1] Implement tool call routing for `search_knowledge` in `frontend/src/services/agent-tools.ts` dispatching queries to backend `POST /api/knowledge/search` and returning formatted `toolResponse` frames over the active WebSocket citing `data-model.md (SearchKnowledgeResponse.status, SearchKnowledgeResultItem.relevance_score)`.

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Lunar and Space Missions Exploration with Source Attribution (Priority: P1)

**Goal**: Enable the astronaut to retrieve verified mission milestones, launch dates, crew, and lunar science (Apollo 11, Voyager 1 & 2, JWST, Artemis, Curiosity) with exact source attribution.

**Independent Test**: Ask the astronaut when Apollo 11 landed on the Moon or what instruments the James Webb Space Telescope uses; verify `search_knowledge` retrieves records from `missions.json` or `moon.json` and quotes verified dates and details in Egyptian Arabic.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Author curated historical and scientific entries for the Moon (`knowledge/moon.json`) and major space missions (`knowledge/missions.json`) per `contracts/knowledge-entry.contract.md` citing `data-model.md (KnowledgeEntry.id, KnowledgeEntry.category, KnowledgeEntry.title, KnowledgeEntry.content, KnowledgeEntry.source_name, KnowledgeEntry.source_url)`.
- [ ] T014 [US2] Run `scripts/build-knowledge-index.ts` to compile Moon and mission entries into `knowledge/index.json` citing `data-model.md (KnowledgeIndexFile.total_entries, KnowledgeIndexEntry.embedding)`.
- [ ] T015 [US2] Verify cross-lingual semantic matching for mission queries (Arabic and English) in `server/services/knowledge-search.ts` citing `data-model.md (KnowledgeEntry.source_name, KnowledgeEntry.source_url, SearchKnowledgeResultItem.relevance_score)`.

**Checkpoint**: At this point, both User Stories 1 and 2 operate seamlessly together.

---

## Phase 5: User Story 3 - Honest Admission and No-Result Handling for Unverified Queries (Priority: P1)

**Goal**: Filter out weak similarity matches below the configurable threshold and prompt the astronaut to honestly state in Egyptian Arabic that space logs don't contain the record, preventing hallucinations and preparing for Feature 005 fallback.

**Independent Test**: Ask an unverified speculative or alien question (e.g. "هل في كائنات فضائية على بلوتو؟"); verify `search_knowledge` returns `status: "no_results"`, and the astronaut responds in Egyptian Arabic admitting uncertainty without confabulating facts.

### Implementation for User Story 3

- [ ] T016 [US3] Implement strict threshold filtering in `server/services/knowledge-search.ts` returning `status: "no_results"` and empty results array when no matches exceed `threshold` citing `data-model.md (SearchKnowledgeRequest.threshold, SearchKnowledgeResponse.status, SearchKnowledgeResponse.total_matches)`.
- [ ] T017 [US3] Format `no_results` tool response envelope in `frontend/src/services/agent-tools.ts` per `contracts/gemini-tool-search-knowledge.contract.md` providing an explicit instruction to Gemini Live to state uncertainty honestly in Egyptian Arabic citing `data-model.md (SearchKnowledgeResponse.status)`.
- [ ] T018 [US3] Verify zero-hallucination behavior in `frontend/src/services/gemini-live.ts` ensuring the agent never substitutes model-memory confabulations when local knowledge returns `no_results`.

**Checkpoint**: User Stories 1, 2, and 3 deliver zero-hallucination grounded Q&A with transparent uncertainty handling.

---

## Phase 6: User Story 4 - Seamless Function Calling & Multimodal Coexistence (Priority: P2)

**Goal**: Ensure knowledge retrieval occurs asynchronously in the background without audio glitches or disconnecting the live voice stream, coexisting harmoniously with 3D camera navigation (`focus_planet`, `show_fact_card`, `reset_view`).

**Independent Test**: Ask to focus on Saturn while asking about its rings; verify `focus_planet` and `search_knowledge` both execute smoothly, the 3D camera animates to Saturn, and the astronaut delivers the verified ring facts without audio stutter.

### Implementation for User Story 4

- [ ] T019 [US4] Configure asynchronous non-blocking tool dispatch in `frontend/src/services/agent-tools.ts` ensuring parallel or sequential execution of `search_knowledge` alongside `focus_planet`, `show_fact_card`, and `reset_view` without race conditions.
- [ ] T020 [US4] Implement graceful network timeout and error recovery in `frontend/src/services/agent-tools.ts` returning structured error envelopes to Gemini Live without dropping the active WebSocket connection citing `data-model.md (SearchKnowledgeResponse.status)`.
- [ ] T021 [US4] Connect knowledge search tool status to the HUD indicator in `frontend/src/store/useVoiceStore.ts` and `frontend/src/components/ui/VoiceDock.tsx` displaying a subtle retrieval indicator while searching.

**Checkpoint**: Multimodal voice agent seamlessly balances 3D scene control with real-time knowledge retrieval.

---

## Phase 7: User Story 5 - Standalone Knowledge Search API for Inspection & Tooling (Priority: P3)

**Goal**: Provide a clean HTTP endpoint (`POST /api/knowledge/search`) for developers and operators to test query embeddings, inspect similarity scores, and tune relevance thresholds independently.

**Independent Test**: Send a curl request to `POST http://localhost:3001/api/knowledge/search` with a query; verify HTTP 200 with structured JSON results, execution time in milliseconds, and relevance scores.

### Implementation for User Story 5

- [ ] T022 [US5] Add execution time benchmarking and diagnostic logging to `server/routes/knowledge.ts` citing `data-model.md (SearchKnowledgeResponse.execution_time_ms, SearchKnowledgeResponse.status)`.
- [ ] T023 [US5] Expose optional `limit` and `threshold` parameter overrides in `server/routes/knowledge.ts` with input validation citing `data-model.md (SearchKnowledgeRequest.limit, SearchKnowledgeRequest.threshold)`.

**Checkpoint**: Standalone API provides transparent inspection and benchmarking for all knowledge entries.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Automated testing, validation walkthrough, script configuration, and final quality gate verification.

- [ ] T024 [P] Implement unit tests for `EmbeddingService` and cosine similarity retrieval in `server/tests/knowledge-search.test.ts`.
- [ ] T025 [P] Implement contract and integration tests for `POST /api/knowledge/search` in `server/tests/knowledge-api.test.ts`.
- [ ] T026 Add `"build:knowledge"` script to `package.json` for one-command index generation.
- [ ] T027 Execute end-to-end verification walkthrough following `specs/004-space-knowledge-base/quickstart.md` validating all 7 categories, threshold filtering, Egyptian Arabic voice answers, and coexistence with 3D controls.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**.
- **User Stories (Phase 3–7)**:
  - User Story 1 (P1 - Planetary & Celestial Q&A): Can start immediately after Phase 2 (Foundational) — **MVP Target**.
  - User Story 2 (P1 - Missions & Moon): Can start after Phase 2; expands knowledge entries and index.
  - User Story 3 (P1 - Uncertainty & Thresholds): Can start after Phase 2; refines similarity filtering and no-result prompting.
  - User Story 4 (P2 - Multimodal Coexistence): Can start after US1 handlers are wired; integrates with existing 3D tools.
  - User Story 5 (P3 - Standalone API): Can start after Phase 2; exposes developer query overrides and diagnostic metrics.
- **Polish (Phase 8)**: Depends on all user stories being complete.

---

## Parallel Opportunities

```bash
# Setup Phase parallel execution:
Task: "T001 Create knowledge/ and schema validator in scripts/validate-knowledge-schema.ts"
Task: "T002 Define shared TypeScript interfaces in server/types/knowledge.ts and frontend/src/types/agent-tools.ts"
Task: "T003 Configure environment variables in server/config/env.ts"

# User Story 1 parallel authoring:
Task: "T008 Author Sun, planets, and Pluto entries in knowledge/sun.json, knowledge/planets.json, knowledge/pluto.json"
Task: "T009 Author black holes and ISS entries in knowledge/black-holes.json, knowledge/iss.json"

# Polish Phase parallel testing:
Task: "T024 Unit tests for EmbeddingService and cosine similarity in server/tests/knowledge-search.test.ts"
Task: "T025 Contract and integration tests in server/tests/knowledge-api.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`knowledge/` schemas, types, environment config).
2. Complete Phase 2: Foundational (`EmbeddingService`, index builder, `KnowledgeSearchService`, Express route).
3. Complete Phase 3: User Story 1 (`sun.json`, `planets.json`, `pluto.json`, tool registration, Live grounding).
4. **STOP and VALIDATE**: Test asking about Sun and Mars in Egyptian Arabic; verify grounded response and source attribution.
5. Demonstrate working MVP!

### Incremental Delivery

1. Setup + Foundational $\rightarrow$ Core RAG pipeline functional.
2. User Story 1 $\rightarrow$ Celestial Q&A with live astronaut voice (MVP).
3. User Story 2 $\rightarrow$ Lunar and space missions facts added to the corpus.
4. User Story 3 $\rightarrow$ Threshold filtering and transparent uncertainty handling.
5. User Story 4 $\rightarrow$ Seamless multimodal coexistence with 3D planet tracking and fact cards.
6. User Story 5 $\rightarrow$ Standalone API inspection and tuning capabilities.
7. Polish $\rightarrow$ Unit tests, integration tests, and full acceptance walkthrough.
