# Implementation Plan: Space Knowledge Base (RAG)

**Branch**: `004-space-knowledge-base` | **Date**: 2026-11-23 | **Spec**: [specs/004-space-knowledge-base/spec.md](spec.md)

**Input**: Feature specification from `specs/004-space-knowledge-base/spec.md`

## Summary

Implement a local, source-backed space knowledge retrieval system (RAG) that allows the Egyptian Astronaut Gemini Live agent to retrieve verified scientific facts before answering factual queries. The solution structures curated domain facts across 7 categories (Sun, 8 planets, Moon, Pluto, major missions, black holes, and the ISS) into validated JSON files. An offline indexing script (`scripts/build-knowledge-index.ts`) computes high-dimensional vector embeddings via Google's `text-embedding-004` (configured independently from `GEMINI_LIVE_MODEL` via `GEMINI_EMBEDDING_MODEL`) and outputs a pre-compiled `knowledge/index.json`. 

At runtime, the Express backend loads the index into memory and provides an embedding-based cosine similarity search service (`server/services/knowledge-search.ts`) exposed at `POST /api/knowledge/search`. A configurable relevance threshold (default: 0.65) filters out weak or tangential matches. On the client, the `search_knowledge(query)` tool declaration is registered in the active Gemini Live session configuration. When Gemini Live dispatches a tool call, the frontend relays the query to the Express search endpoint, returning structured facts and source URLs directly into the live WebSocket session. The astronaut's system prompt is updated to mandate searching local knowledge before answering factual space questions, citing authoritative sources, maintaining warm Egyptian colloquial Arabic, and admitting uncertainty honestly when no curated records exist—seamlessly preparing for Feature 005 (Google Search fallback).

---

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20 LTS, React 18 / 19  
**Frontend Primary Dependencies**: Vite, React, TypeScript, Three.js, `@react-three/fiber`, `@react-three/drei`, `zustand`, `tailwindcss`  
**Backend Primary Dependencies**: `express`, `cors`, `dotenv`, `@google/genai` (for embeddings and ephemeral tokens)  
**Voice Provider**: Gemini Multimodal Live API (Bidirectional WebSocket)  
**Embedding Provider**: Google Gemini Embeddings API (`text-embedding-004`)  
**Conversational Model Setting**: `GEMINI_LIVE_MODEL` (e.g., `gemini-2.0-flash-exp`)  
**Embedding Model Setting**: `GEMINI_EMBEDDING_MODEL` (e.g., `text-embedding-004`)  
**Storage**: Curated local JSON files in `knowledge/`, pre-compiled into `knowledge/index.json`  
**Retrieval Engine**: In-memory vector dot product / cosine similarity with configurable threshold  
**Testing**: Unit tests for embedding service and search similarity; API route integration tests; manual verification via [quickstart.md](quickstart.md)  
**Target Platform**: Modern desktop and mobile browsers; Node.js backend server  
**Project Type**: Full-Stack Web Application (Frontend in `frontend/`, Backend in `backend/` or `server/`)  
**Performance Goals**: Local knowledge search response $< 500\text{ms}$ (in-memory search $< 10\text{ms}$ + query embedding), sub-second tool response return  
**Constraints**: Keep permanent API key strictly server-side; do not introduce heavy vector database daemons; do not expose credentials in frontend; preserve existing 3D tools (`focus_planet`, `show_fact_card`, `reset_view`)  
**Scale/Scope**: 7 mandatory categories, ~50–100 curated high-quality entries, 768-dim float embeddings  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post Phase 1 design.*

- [x] **Principle I (Technology Stack)**: Frontend strictly uses Vite, React, TypeScript, Three.js, R3F, and Tailwind CSS. Backend strictly uses Node.js and Express. Voice uses Gemini Live API. Local RAG utilizes JSON files and Gemini embeddings.
- [x] **Principle II (System Architecture & Component Decoupling)**: Clean separation of concerns. RAG retrieval executes through backend Express service boundaries. Frontend tool dispatcher connects Gemini Live tool calls to the search endpoint without leaking keys or embedding logic. Local RAG is decoupled from future Google Search.
- [x] **Principle III (Scientific Accuracy & Grounding Hierarchy)**: Level 1 Grounding (curated local space knowledge) is strictly enforced. The astronaut is instructed to call `search_knowledge` prior to answering factual space questions, ground facts in retrieved data, cite sources, and admit uncertainty honestly (Level 3) when matches fall below threshold. Zero hallucination enforced.
- [x] **Principle IV (Egyptian Arabic Voice Experience & Interactivity)**: Spoken answers remain in authentic Egyptian colloquial Arabic. Tool execution happens asynchronously over the existing WebSocket without audio stutter or stream disconnection.
- [x] **Principle V (Security, Privacy & Ephemeral Data Protection)**: `GEMINI_API_KEY` is kept exclusively on the server. The frontend interacts only with the backend search endpoint and uses ephemeral session tokens for Gemini Live.
- [x] **Principle VI (Quality Assurance & Evaluation Gates)**: Comprehensive contracts ([knowledge-entry.contract.md](contracts/knowledge-entry.contract.md), [knowledge-search-api.contract.md](contracts/knowledge-search-api.contract.md), [gemini-tool-search-knowledge.contract.md](contracts/gemini-tool-search-knowledge.contract.md)), data model, automated unit tests, and runnable verification scenarios provided in [quickstart.md](quickstart.md).
- [x] **Principle VII (Comprehensive Documentation)**: Complete architecture, lifecycle transitions, contracts, and execution guides maintained.
- [x] **Principle VIII (Strict Scope Enforcement)**: Scope strictly restricted to Feature 004 local knowledge base RAG. Google Search fallback (Feature 005), evaluation benchmark harness (Feature 007), and UI redesigns are explicitly excluded.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-space-knowledge-base/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical decisions & embedding selection
├── data-model.md        # Entities, schemas, and lifecycle states
├── quickstart.md        # End-to-end verification walkthrough
├── contracts/           # API and data contracts
│   ├── knowledge-entry.contract.md
│   ├── knowledge-search-api.contract.md
│   └── gemini-tool-search-knowledge.contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
knowledge/
├── sun.json             # Sun physics, corona, solar wind, core fusion
├── planets.json         # Eight major planets: atmospheres, sizes, orbits, moons
├── moon.json            # Earth's Moon geology, phases, tidal locking
├── pluto.json           # Dwarf planet facts, New Horizons discoveries
├── missions.json        # Apollo 11, Voyager 1 & 2, JWST, Artemis, Curiosity, Perseverance
├── black-holes.json     # Event horizons, singularities, Sagittarius A*
├── iss.json             # Orbit speed, altitude, international crew, research
└── index.json           # Compiled index with 768-dim embeddings (gitignored or checked in)

scripts/
└── build-knowledge-index.ts # CLI script: validates JSON, computes embeddings, outputs index.json

server/ (or backend/src/)
├── config/
│   └── env.ts           # Environment variables (GEMINI_EMBEDDING_MODEL, KNOWLEDGE_RELEVANCE_THRESHOLD)
├── services/
│   ├── embedding-service.ts  # Handles Gemini API embedding generation
│   └── knowledge-search.ts   # In-memory vector similarity ranking & threshold filtering
├── routes/
│   ├── knowledge.ts     # Express router: POST /api/knowledge/search
│   └── session.ts       # Existing ephemeral token router
├── types/
│   └── knowledge.ts     # Server-side TypeScript interfaces & JSON schemas
└── index.ts             # Express server entrypoint

frontend/src/
├── services/
│   ├── agent-tools.ts   # Extended with search_knowledge tool executor
│   └── gemini-live.ts   # Registers search_knowledge tool declaration in Live session
├── types/
│   └── agent-tools.ts   # Frontend tool argument and response interfaces
└── store/
    └── useVoiceStore.ts # Voice status updates during knowledge search
```

---

## Component Responsibilities

1. **`knowledge/*.json`**:
   - Curated, verified scientific space facts adhering to `knowledge-entry.contract.md`.
   - Each entry contains `id`, `category`, `title`, `content`, `source_name`, `source_url`.
   - Rich descriptions crafted for cross-lingual semantic matching (Arabic and English).

2. **`scripts/build-knowledge-index.ts`**:
   - Reads and validates all JSON files in `knowledge/`.
   - Uses `EmbeddingService` to generate vector embeddings for each entry's combined `title` and `content`.
   - Hashes entries to avoid redundant embedding API calls on unchanged items.
   - Saves `knowledge/index.json`.

3. **`EmbeddingService` (`server/services/embedding-service.ts`)**:
   - Server-side wrapper using `@google/genai` or Google Gen AI REST API.
   - Generates 768-dimensional float embeddings using `GEMINI_EMBEDDING_MODEL` (e.g. `text-embedding-004`).
   - Normalizes vectors and caches results where applicable.
   - Keeps `GEMINI_API_KEY` secure and isolated.

4. **`KnowledgeSearchService` (`server/services/knowledge-search.ts`)**:
   - Loads `knowledge/index.json` into memory at server startup.
   - Accepts search queries, generates query embeddings via `EmbeddingService`.
   - Computes cosine similarity (dot product of normalized vectors) against all indexed entries.
   - Filters results by `KNOWLEDGE_RELEVANCE_THRESHOLD` (default: 0.65).
   - Returns top $K$ (default: 3) sorted matches or an empty result set.

5. **`KnowledgeRouter` (`server/routes/knowledge.ts`)**:
   - Exposes `POST /api/knowledge/search`.
   - Validates incoming request payloads (`query`, `limit`, `threshold`).
   - Dispatches to `KnowledgeSearchService` and returns structured JSON responses.

6. **`agent-tools.ts` & `gemini-live.ts`**:
   - `gemini-live.ts` declares `search_knowledge` tool in `BidiGenerateContentSetup`.
   - `agent-tools.ts` intercepts `search_knowledge` function calls, issues `POST /api/knowledge/search` to Express backend, and formats the response frame back into the active WebSocket.
   - Handles network errors and empty results gracefully without throwing unhandled exceptions.

---

## Implementation Phases & Staged Execution

### Phase 1: Curated Knowledge Files
- Create the `knowledge/` directory in the repository.
- Define TypeScript schemas and validation logic for `KnowledgeEntry`.
- Author curated scientific facts across all 7 categories:
  - `sun.json`: Sun temperature, solar corona, fusion, mass.
  - `planets.json`: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune (atmospheres, distances, moons, rings).
  - `moon.json`: Geology, tidal locking, phases, Apollo landing sites.
  - `pluto.json`: Dwarf planet classification, New Horizons discoveries, icy surface.
  - `missions.json`: Apollo 11, Voyager 1 & 2, James Webb Space Telescope (JWST), Artemis, Curiosity rover.
  - `black-holes.json`: Event horizons, Sagittarius A*, gravitational lensing, Hawking radiation.
  - `iss.json`: Orbital speed, altitude, international partnership, scientific laboratory.
- Include authoritative citations (`source_name`: NASA, ESA, JPL; `source_url`: official HTTPS URLs).

### Phase 2: Index Generation Script
- Implement `scripts/build-knowledge-index.ts`.
- Add category validation to ensure all files conform to `knowledge-entry.contract.md`.
- Read existing `knowledge/index.json` (if present) to detect unmodified content via SHA-256 hashes and avoid redundant embedding generation.
- Batch embed new/modified entries using `text-embedding-004`.
- Write out the compiled `knowledge/index.json` file.
- Add npm script `"build:knowledge": "ts-node scripts/build-knowledge-index.ts"`.

### Phase 3: Embedding Service
- Implement `server/services/embedding-service.ts`.
- Read `GEMINI_EMBEDDING_MODEL` from environment configuration (defaulting to `text-embedding-004`).
- Initialize Google Gen AI client with server-side `GEMINI_API_KEY`.
- Provide `generateEmbedding(text: string): Promise<number[]>` with error handling and exponential backoff.

### Phase 4: Knowledge Search Service
- Implement `server/services/knowledge-search.ts`.
- Initialize by loading `knowledge/index.json` into memory. Gracefully warn if the index is missing.
- Implement vector cosine similarity math for normalized 768-dimensional vectors.
- Implement ranking, top-K slicing, and filtering with `KNOWLEDGE_RELEVANCE_THRESHOLD` (default: 0.65).
- Structure output payload conforming to `SearchKnowledgeResponse`.

### Phase 5: Express Search Endpoint
- Implement `server/routes/knowledge.ts`.
- Expose `POST /api/knowledge/search`.
- Validate request body using schema validator.
- Register route in Express server app (`app.use('/api/knowledge', knowledgeRouter)`).
- Handle edge cases: malformed JSON, query too long, missing index, API error.

### Phase 6: Gemini Live Tool Integration
- In `frontend/src/services/gemini-live.ts`, register the `search_knowledge` tool declaration in `setup.tools`.
- In `frontend/src/services/agent-tools.ts`, handle `search_knowledge` function calls by posting to `/api/knowledge/search`.
- Format `toolResponse` frames and send them back to the active Gemini Live WebSocket.
- Ensure tool execution preserves existing 3D tools (`focus_planet`, `show_fact_card`, `reset_view`).

### Phase 7: System Instruction Grounding
- Update the Gemini Live system prompt in `gemini-live.ts` with explicit grounding instructions:
  - Mandate calling `search_knowledge` whenever asked a factual space science question.
  - Strictly ground responses in retrieved facts and mention the scientific source.
  - Never invent or fabricate numerical figures, dates, or celestial bodies.
  - When search returns no results or falls below threshold, admit uncertainty in authentic Egyptian colloquial Arabic.
  - Maintain the warm, witty, curious Egyptian astronaut persona (العامية المصرية).

### Phase 8: Verification & Quality Assurance
- Execute unit tests for `embedding-service` and `knowledge-search`.
- Run curl tests against `POST /api/knowledge/search` for all 7 categories.
- Test cross-lingual queries (Arabic, English, colloquial Egyptian).
- Test threshold rejection of out-of-scope/speculative queries.
- Perform end-to-end live voice session verification according to [quickstart.md](quickstart.md).
- Verify 3D solar system camera navigation and info cards continue working flawlessly.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | N/A (Standard in-memory vector dot product with JSON storage selected; no external DB introduced) |
