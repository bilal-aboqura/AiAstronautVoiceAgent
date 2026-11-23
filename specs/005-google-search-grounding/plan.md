# Implementation Plan: Google Search Grounding

**Branch**: `005-google-search-grounding` | **Date**: 2026-11-23 | **Spec**: [specs/005-google-search-grounding/spec.md](spec.md)

**Input**: Feature specification from `specs/005-google-search-grounding/spec.md`

## Summary

Implement a seamless, native Google Search grounding integration for the Egyptian Astronaut Gemini Live voice agent. When visitors ask factual space science questions that are absent, incomplete, or below confidence thresholds in the curated local knowledge base (Feature 004), the voice agent automatically falls back to Gemini's built-in Google Search grounding without leaving the bidirectional audio WebSocket stream.

The implementation configures the built-in `googleSearch` tool alongside existing custom function declarations (`search_knowledge`, `focus_planet`, `show_fact_card`, `reset_view`) in the `BidiGenerateContentSetup` handshake. The grounding hierarchy strictly prioritizes local curated knowledge (Level 1) before triggering web search (Level 2), and gracefully falls back to honest uncertainty communication in natural Egyptian colloquial Arabic (Level 3) if neither source contains verified information. Grounding metadata (web queries, source titles, URLs) is defensively parsed from `serverContent.groundingMetadata`, preserving citations. A non-blocking visual searching indicator (`"بيبحث في السجلات الفضائية..."`) is integrated into the voice HUD, with sub-200ms interruption cancellation and zero permanent secrets exposed on the client.

---

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20 LTS, React 18 / 19  
**Frontend Primary Dependencies**: `react`, `react-dom`, `zustand`, `lucide-react`, `tailwindcss`, `@google/genai` (or native WebSocket)  
**Backend Primary Dependencies**: `express`, `cors`, `dotenv`, `@google/genai`  
**Voice Provider**: Gemini Multimodal Live API (Bidirectional WebSocket)  
**Search Provider**: Gemini Built-in Google Search Grounding (`googleSearch: {}`)  
**Conversational Live Model**: Resolved from backend `GEMINI_LIVE_MODEL` (default: `gemini-2.0-flash-exp` or `gemini-2.0-flash`)  
**Storage**: N/A (Purely ephemeral; search metadata is transient during session)  
**Testing**: Vitest for grounding metadata parser and voice store transitions; manual end-to-end verification via [quickstart.md](quickstart.md)  
**Target Platform**: Modern desktop and mobile browsers; Node.js Express backend  
**Project Type**: Full-Stack Web Application (Frontend in `frontend/`, Backend in `server/`)  
**Performance Goals**: Turnaround for grounded voice response $< 3.5\text{s}$; searching indicator transition $< 200\text{ms}$; barge-in cutoff $< 200\text{ms}$; 3D rendering maintains $\ge 50\text{ fps}$ desktop  
**Constraints**: Keep permanent `GEMINI_API_KEY` server-side; do NOT create a custom `web_search` endpoint or external search service; reuse existing Gemini Live WebSocket connection; never fabricate scientific facts or URLs  
**Scale/Scope**: Single-user real-time voice session per browser tab; full coexistence with existing 3D tools and local knowledge retrieval  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post Phase 1 design.*

- [x] **Principle I (Technology Stack)**: Frontend strictly uses Vite, React, TypeScript, and Tailwind CSS. Backend strictly uses Node.js and Express. Voice uses Gemini Live API. Web Search strictly utilizes Gemini's built-in Google Search tool.
- [x] **Principle II (System Architecture & Component Decoupling)**: Clean client-server boundary. Local knowledge RAG and Google Search operate as distinct subsystems with separate retrieval contracts. Frontend handles tool dispatching and visual state without leaking backend secrets.
- [x] **Principle III (Scientific Accuracy & Grounding Hierarchy)**: Level 1 (Curated Local Knowledge) takes strict precedence. Level 2 (Google Search Grounding) activates only when Level 1 returns `no_results` or insufficient relevance. Level 3 (Honest Uncertainty) communicated in Egyptian Arabic when no verified facts exist. Zero hallucination enforced.
- [x] **Principle IV (Egyptian Arabic Voice Experience & Interactivity)**: Spoken answers remain in authentic Egyptian colloquial Arabic. Non-blocking searching indicator displayed in voice HUD. Sub-200ms interruption (barge-in) clears search and speech.
- [x] **Principle V (Security, Privacy & Ephemeral Data Protection)**: `GEMINI_API_KEY` stored exclusively on backend. Ephemeral session tokens used for Live connection. Zero permanent search cache or audio recorded on disk.
- [x] **Principle VI (Quality Assurance & Evaluation Gates)**: Comprehensive contracts ([gemini-live-search-grounding-setup.contract.md](contracts/gemini-live-search-grounding-setup.contract.md), [gemini-live-grounding-metadata.contract.md](contracts/gemini-live-grounding-metadata.contract.md), [voice-search-state.contract.md](contracts/voice-search-state.contract.md)), data model, and manual verification guide in [quickstart.md](quickstart.md).
- [x] **Principle VII (Comprehensive Documentation)**: Complete research decisions, data model, state machines, and contracts documented.
- [x] **Principle VIII (Strict Scope Enforcement & Staged Delivery)**: Scope strictly restricted to built-in Google Search grounding integration. No custom web search endpoints, no third-party search APIs, no evaluation harness creep (Feature 007).

---

## Project Structure

### Documentation (this feature)

```text
specs/005-google-search-grounding/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Technical decisions & research
├── data-model.md        # Phase 1: Entity definitions & state diagrams
├── quickstart.md        # Phase 1: Verification scenarios walkthrough
├── contracts/           # Phase 1: Formal protocol contracts
│   ├── gemini-live-search-grounding-setup.contract.md
│   ├── gemini-live-grounding-metadata.contract.md
│   └── voice-search-state.contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
server/ (or backend/src/)
├── config/
│   └── env.ts           # Configurable GEMINI_LIVE_MODEL (e.g. gemini-2.0-flash-exp)
├── routes/
│   ├── session.ts       # Ephemeral token endpoint providing model and token
│   └── knowledge.ts     # Feature 004 local knowledge search endpoint
└── index.ts             # Express server entrypoint

frontend/src/
├── services/
│   ├── gemini-live-service.ts  # WebSocket client with googleSearch tool setup & defensive parsing
│   ├── agent-tools.ts          # Existing custom tool declarations & handlers
│   └── grounding-parser.ts     # Defensive extraction of sources and web queries
├── store/
│   └── useVoiceStore.ts        # Zustand store tracking isSearching, searchStage, groundingSources
├── components/
│   └── voice/
│       ├── SearchingIndicator.tsx  # Pulsing HUD badge for search feedback
│       └── VoiceDock.tsx           # Integrates searching state into astronaut voice controls
└── types/
    └── voice.ts                # TypeScript interfaces for search and grounding metadata
```

---

## Complexity Tracking

> **Constitution Check passed with zero violations. No unjustified complexity introduced.**

| Aspect | Constitutional Rule | Solution Approach |
| :--- | :--- | :--- |
| External Search Engine | Principle I & VIII (No unvetted external APIs) | Uses Gemini's built-in `googleSearch` tool; zero extra API providers or keys. |
| Grounding Precedence | Principle III (Local-first hierarchy) | System prompt rules + tool response guidance + contract tests. |
| Client Secret Protection | Principle V (Zero client secrets) | Backend ephemeral tokens provide scoped permissions for Live session. |

---

## Step-by-Step Implementation Phases

### Phase 1: Inspect Feature 004 & Gemini Live Integration
- Review `specs/004-space-knowledge-base/contracts/gemini-tool-search-knowledge.contract.md` and `frontend/src/services/agent-tools.ts`.
- Verify the exact shape of `search_knowledge` tool registration and response format (`status: "success"` vs. `status: "no_results"`).
- Verify the current WebSocket connection establishment in `frontend/src/services/gemini-live-service.ts`.

### Phase 2: Verify Model & SDK Compatibility
- Confirm that the configured `GEMINI_LIVE_MODEL` (e.g. `gemini-2.0-flash-exp`, `gemini-2.0-flash`) supports simultaneous custom function calling and built-in `googleSearch` grounding.
- Ensure backend `/api/session/token` exposes `model` dynamically from `process.env.GEMINI_LIVE_MODEL` to the client.

### Phase 3: Add Built-in Google Search Tool to Live Session Configuration
- Update `BidiGenerateContentSetup` in `frontend/src/services/gemini-live-service.ts`:
  - Pass `tools: [ { googleSearch: {} }, { functionDeclarations: [...] } ]`.
  - Preserve all existing custom functions (`search_knowledge`, `focus_planet`, `show_fact_card`, `reset_view`).
  - Update system prompt instructions to reinforce the 3-tier grounding hierarchy: local-first, search fallback, honest uncertainty.

### Phase 4: Implement Local-First Behavior with Google Search Fallback
- Ensure the `search_knowledge` tool dispatcher returns explicit guidance in `toolResponse`:
  - On match: `"status": "success", "instruction": "Curated local records found. Synthesize spoken response directly from these vetted facts without searching external web sources."`
  - On miss: `"status": "no_results", "instruction": "No verified records in local curated knowledge. You may now search the web using Google Search grounding for recent or non-curated space facts, or admit uncertainty if not verified."`
- Write contract tests validating that curated space queries do not generate `webSearchQueries`.

### Phase 5: Preserve Grounding Metadata and Source Information
- Create `frontend/src/services/grounding-parser.ts` to implement `extractGroundingInfo(metadata)`:
  - Extract `webSearchQueries` safely.
  - Extract `groundingChunks` into `ExtractedSource` objects (`title`, `url`, `domain`).
  - Gracefully handle undefined, null, or query-only metadata structures without throwing.
- Store extracted metadata in `useVoiceStore` (`groundingSources`, `latestWebQueries`).

### Phase 6: Integrate Search Status into the UI
- Extend `useVoiceStore` with `isSearching`, `searchStage`, `searchStatusLabel`, `activeSearchQuery`.
- Create `frontend/src/components/voice/SearchingIndicator.tsx`:
  - Render a subtle pulsing status pill with Arabic text: `"بيبحث في السجلات الفضائية..."`.
  - Display within the existing `VoiceDock` HUD.
  - Ensure transitions occur in $< 200\text{ms}$ upon search trigger and clear when speech begins.

### Phase 7: Add Graceful Error Handling and Fallback Behavior
- Handle WebSocket error frames for unsupported models or tool rejections with graceful user alerts.
- Handle search timeouts or empty search results by guiding the agent to formulate warm, honest uncertainty statements in Egyptian Arabic (`"السجلات وشبكة الفضاء مش متوفرة دلوقتي يا بطل"`).
- Connect user barge-in (interruption) to call `clearSearch()`, resetting search states and clearing pending audio buffers immediately.

### Phase 8: Comprehensive Verification & Regression Testing
- Execute all 6 scenarios in [quickstart.md](quickstart.md):
  1. Local Knowledge Hit (Curated topic $\rightarrow$ Local KB answered, 0 web queries).
  2. Local Knowledge Miss (Recent topic $\rightarrow$ Google Search grounding $\rightarrow$ grounded voice answer).
  3. Speculative / Unverified Question (Honest uncertainty in Egyptian Arabic).
  4. Search status indicator latency and visual transitions.
  5. Barge-in interruption during search.
  6. Non-regression of 3D tools (`focus_planet`, `show_fact_card`, `reset_view`).

---

## Files to Create or Modify

| File Path | Action | Purpose |
| :--- | :--- | :--- |
| `frontend/src/services/grounding-parser.ts` | **Create** | Defensive parsing of `serverContent.groundingMetadata` into typed domain sources. |
| `frontend/src/components/voice/SearchingIndicator.tsx` | **Create** | Subtle, animated HUD indicator displaying Arabic search status. |
| `frontend/src/services/gemini-live-service.ts` | **Modify** | Add `googleSearch: {}` to `setup.tools`, wire grounding metadata parser, hook search state transitions. |
| `frontend/src/store/useVoiceStore.ts` | **Modify** | Add search tracking slice (`isSearching`, `searchStage`, `groundingSources`, `clearSearch`). |
| `frontend/src/components/voice/VoiceDock.tsx` | **Modify** | Embed `SearchingIndicator` and handle search state visual transitions. |
| `frontend/src/types/voice.ts` | **Modify** | Add TypeScript definitions for grounding metadata, sources, and search stages. |
| `server/config/env.ts` | **Modify** | Ensure `GEMINI_LIVE_MODEL` is configurable and documented. |
| `server/routes/session.ts` | **Verify/Modify** | Ensure ephemeral token response passes the configured live model ID to frontend. |

---

## Dependencies & Configuration

### Dependencies
- **No new npm packages required!** Built-in Google Search grounding operates through the existing WebSocket protocol and the Gemini API infrastructure.

### Environment Variables
```bash
# Server-side Gemini API Key (keep server-side only)
GEMINI_API_KEY=your_gemini_api_key

# Configurable Live model supporting Live audio + function calling + Google search
GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# Local knowledge embedding model (Feature 004)
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Local knowledge relevance threshold (Feature 004)
KNOWLEDGE_RELEVANCE_THRESHOLD=0.65
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Model ignores local search and jumps directly to Google Search** | Medium | System prompt and `search_knowledge` tool description explicitly instruct that local search is mandatory first. Contract tests verify adherence. |
| **Grounding metadata structure varies across model versions** | Low | `grounding-parser.ts` implements defensive null-safe extraction that inspects optional keys without assuming fixed shapes. |
| **Search operation latency impacts conversational fluidness** | Medium | Searching indicator displays immediately in HUD so the visitor knows research is happening; turnaround optimized for $< 3.5\text{s}$. |
| **User interrupts while search is ongoing** | Low | Speech activity immediately triggers barge-in: clears search state, aborts pending playback, and resets to listening. |
| **Network failure or search service outage** | Low | Client catches frame errors without dropping WebSocket; agent articulates honest uncertainty in Egyptian Arabic. |

---

## Testing & Acceptance Criteria

- **Local-First Precedence**: 100% of factual queries query `search_knowledge` first; 0% of queries with sufficient local results trigger external web search.
- **Search Fallback Activation**: For queries lacking local results, Google Search grounding executes and returns verified scientific facts.
- **Source Attribution**: Web search queries and source URLs/domains are captured in `groundingSources`.
- **Search Indicator**: Visual searching indicator appears $\le 200\text{ms}$ upon search start and clears $\le 200\text{ms}$ upon audio playback.
- **Honest Uncertainty**: Unverified questions result in authentic Egyptian Arabic uncertainty statements with 0% fabricated facts.
- **Tool Coexistence**: 3D scene controls (`focus_planet`, `show_fact_card`, `reset_view`) and local `search_knowledge` maintain 100% functionality without regressions.
- **Session Stability**: Zero unexpected WebSocket disconnects or unhandled exceptions across all test scenarios.

---

## Definition of Completion

1. `BidiGenerateContentSetup` transmits both `googleSearch` and custom `functionDeclarations`.
2. Local knowledge is queried first; Google Search grounding acts as automatic fallback.
3. Defensive parser extracts grounding metadata into `useVoiceStore`.
4. Voice HUD displays subtle Arabic searching indicator during research.
5. Search failures, empty results, and speculative questions produce honest Egyptian Arabic uncertainty statements.
6. User barge-in cancels search and speech in $< 200\text{ms}$.
7. All 6 verification scenarios in [quickstart.md](quickstart.md) pass without regressions.
