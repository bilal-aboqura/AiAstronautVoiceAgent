# Feature Specification: Space Knowledge Base (RAG)

**Feature Branch**: `004-space-knowledge-base`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Build a local, source-backed space knowledge base that allows the Egyptian Astronaut Gemini Live agent to retrieve accurate scientific information before answering factual questions. Objective: Implement search_knowledge(query), which searches a curated local knowledge base and returns relevant facts with their sources to Gemini Live. Knowledge categories: Sun, Eight planets, Moon, Pluto, Major space missions, Black holes, International Space Station. Every knowledge entry must include: Unique ID, Category, Title, Content, Source name, Source URL. Technical requirements: Frontend: Vite + React + TypeScript, Backend: existing Node.js + Express server, Voice: existing Gemini Live API integration, Storage: local JSON knowledge files, Retrieval: embeddings-based similarity search, Embedding model configurable independently from GEMINI_LIVE_MODEL, Keep the permanent API key server-side. Functional requirements: JSON schema for knowledge entries, organize curated facts into category files, knowledge-index building script, generate and store embeddings, knowledge search with relevance ranking, configurable minimum relevance threshold, return facts and sources in structured results, handle empty results and search errors, expose POST /api/knowledge/search endpoint, register search_knowledge(query) in Gemini Live, connect Gemini tool calls to Express knowledge endpoint, return tool responses through active Gemini Live session, update system instruction to search local knowledge before answering factual questions. Accuracy rules: Never invent scientific facts or numbers, preserve source information, do not treat weak matches as reliable, return no useful results when relevance threshold is not met, do not allow unsupported model-memory answers to replace retrieved facts, prepare no-result behavior for Feature 005 Google Search grounding. Constraints: Reuse Gemini Live connection, reuse agent-tools implementation, reuse Express server, do not create second voice agent, do not expose API credentials in frontend, prefer simplest reliable local index, no complex vector DB unless necessary. Acceptance criteria: Planet info, Moon info, Mission info, sources included, unknown questions produce no-result response, function calling delivers results, answers naturally in Egyptian Arabic, existing voice and 3D tools continue working. Out of scope: Feature 005 Google Search grounding, Feature 007 evaluation harness, UI redesign, additional voice providers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grounded Planetary and Celestial Science Q&A (Priority: P1)

As a curious visitor speaking with the Egyptian astronaut, when I ask factual scientific questions about the Sun, the planets, Pluto, the International Space Station, or black holes (e.g., "كم تبلغ درجة حرارة سطح الشمس؟" or "What is Jupiter's Great Red Spot?"), I want the astronaut to search the curated local knowledge base and provide an accurate, fact-checked response grounded in verified data, citing the authoritative scientific source while speaking in authentic Egyptian colloquial Arabic.

**Why this priority**: Scientific accuracy without hallucination is the foundational mandate of the educational astronaut voice agent. Grounding celestial facts in a verified, locally curated knowledge base ensures credible learning and enforces the project constitution's zero-hallucination principle.

**Independent Test**: In an active voice session, the visitor asks a specific factual question about a planet's atmospheric composition or diameter. The system triggers `search_knowledge`, retrieves the curated entry, and the astronaut speaks the verified factual answer in Egyptian Arabic along with attribution to the primary source (e.g., NASA or ESA).

**Acceptance Scenarios**:

1. **Given** an active voice session, **When** the visitor asks a factual question about a solar system body (e.g., "إيه هو الغلاف الجوي للمريخ؟" or "Tell me about the atmosphere of Mars"), **Then** the agent invokes `search_knowledge` with a focused query before formulating its spoken response.
2. **Given** relevant curated entries exist in the local knowledge base, **When** `search_knowledge` is executed, **Then** it returns structured results containing verified facts, the category, the entry title, and source attribution (source name and source URL).
3. **Given** search results are returned to the live session, **When** the astronaut speaks, **Then** the response accurately states the factual figures and details without fabricating numbers or dates, confirms the source, and delivers the answer in warm Egyptian Arabic (e.g., "حسب بيانات وكالة ناسا، الغلاف الجوي للمريخ بيتكون معظمه من ثاني أكسيد الكربون...").
4. **Given** questions asked in either Arabic or English, **When** the query is evaluated by semantic search, **Then** relevant entries are successfully retrieved regardless of the input language.

---

### User Story 2 - Lunar and Space Missions Exploration with Source Attribution (Priority: P1)

As an astronomy enthusiast, when I ask about lunar exploration, the Moon, or historic and modern space missions (such as Apollo 11, Voyager 1, the James Webb Space Telescope, or Artemis), I want the astronaut to retrieve the curated mission history, milestones, and facts with exact source references, so that I learn authentic space history.

**Why this priority**: Space missions and lunar exploration are high-interest topics with precise historical dates, crew details, and mission achievements that language models frequently confabulate if ungrounded.

**Independent Test**: The visitor asks about Apollo 11 or the James Webb Space Telescope. The agent searches the local mission entries, retrieves verified dates, launch vehicles, and mission goals, and delivers a concise, source-attributed narrative in Egyptian Arabic.

**Acceptance Scenarios**:

1. **Given** a query about a space mission (e.g., "مين أول إنسان مشي على القمر وفي أي رحلة؟" or "When did Voyager 1 launch?"), **When** processed by the agent, **Then** `search_knowledge` retrieves matching records from the mission knowledge category.
2. **Given** retrieved mission facts, **When** spoken by the astronaut, **Then** all names, dates, and milestones match the curated entry verbatim and include attribution to the documented source.
3. **Given** multiple related facts in the knowledge base, **When** ranked by relevance, **Then** the most semantically relevant facts are prioritized at the top of the returned result set.

---

### User Story 3 - Transparent Handling of Unknown or Low-Relevance Queries (Priority: P1)

As a visitor asking a question outside the scope of curated knowledge or asking an unverified speculative question (e.g., "هل في كائنات فضائية عايشة على بلوتو؟" or "What is the secret recipe of rocket fuel?"), I want the astronaut to honestly state in Egyptian Arabic that the space records do not contain this information, rather than inventing false facts or substituting unverified model memories.

**Why this priority**: Preserving scientific integrity requires clear knowledge boundary recognition. Weak similarity matches must not be treated as authoritative, and the system must produce an explicit no-result state that prepares for future search grounding (Feature 005).

**Independent Test**: The visitor asks an out-of-scope or unverified question. The knowledge search determines that no entry satisfies the minimum relevance threshold and returns an empty result set. The astronaut responds in colloquial Egyptian Arabic acknowledging the limitation (e.g., "السجلات العلمية اللي معايا مفهاش تفاصيل مؤكدة عن الموضوع ده يا بطل").

**Acceptance Scenarios**:

1. **Given** a user query where no curated entries exceed the configurable minimum relevance threshold, **When** `search_knowledge` is executed, **Then** the system returns an empty result set (`results: []`) with a clear status indicating no confident match.
2. **Given** an empty result from `search_knowledge`, **When** the astronaut replies, **Then** the agent explicitly admits lack of verified data in authentic Egyptian Arabic and DOES NOT invent an ungrounded scientific claim.
3. **Given** a query with weak or tangential keyword matches below the threshold, **When** evaluated, **Then** the system filters them out rather than returning misleading low-confidence facts.

---

### User Story 4 - Seamless Function Calling & Multimodal Coexistence (Priority: P2)

As a visitor interacting with the 3D solar system while speaking, when the astronaut calls `search_knowledge` to retrieve facts, I want the retrieval to occur rapidly in the background without stuttering, disconnecting the voice call, or interfering with active 3D camera controls and fact cards.

**Why this priority**: The agent is multimodal. Voice streaming, 3D solar system rendering, and tool calls must function concurrently. A knowledge search failure or latency spike must never crash the voice session or disrupt 3D interactions.

**Independent Test**: The visitor asks to see Mars while asking about its moons. The agent issues `focus_planet` to focus Mars in 3D and simultaneously executes `search_knowledge` to answer the question. The 3D scene smoothly animates to Mars while the astronaut speaks the retrieved scientific answer.

**Acceptance Scenarios**:

1. **Given** an active Gemini Live voice session, **When** a knowledge query is initiated, **Then** the tool call is dispatched to the backend search endpoint and the response is returned back into the active session without disconnecting or resetting the audio stream.
2. **Given** the agent simultaneously triggers a 3D visualization tool (such as `focus_planet` or `show_fact_card`), **When** `search_knowledge` is executed, **Then** both tool actions execute reliably without race conditions or UI freezes.
3. **Given** a transient network error or backend timeout on the knowledge search endpoint, **When** detected, **Then** the client returns a structured error response to the session, and the astronaut gracefully explains the temporary issue in Egyptian Arabic while keeping the session open.

---

### User Story 5 - Standalone Knowledge Search API for Inspection & Tooling (Priority: P3)

As a system operator or developer, I want to execute knowledge searches directly via an authenticated backend HTTP endpoint (`POST /api/knowledge/search`), so that I can inspect search relevance, verify query embeddings, validate thresholds, and test retrieval independently of the live voice stream.

**Why this priority**: Decoupled verification of the RAG pipeline is essential for continuous testing, debugging search relevance, tuning thresholds, and preparing the evaluation harness.

**Independent Test**: Send a curl or HTTP POST request with `{"query": "James Webb Space Telescope"}` to `/api/knowledge/search`. The response returns status 200 with structured items matching the query, containing titles, categories, snippets, source URLs, and relevance scores.

**Acceptance Scenarios**:

1. **Given** the backend server is running with a built knowledge index, **When** a client sends a valid `POST /api/knowledge/search` request with a query string, **Then** the endpoint returns HTTP 200 with matching knowledge items and their similarity scores.
2. **Given** a request specifying custom `limit` and `threshold` parameters, **When** processed, **Then** the endpoint respects the requested parameters in filtering and ranking results.
3. **Given** an invalid or empty query payload, **When** received, **Then** the endpoint returns HTTP 400 with a descriptive validation error message.

---

### Edge Cases

- **Bilingual and Transliterated Queries**: Visitors may query in Modern Standard Arabic ("ما هو كوكب المشتري؟"), Egyptian Colloquial ("إيه حكاية البقعة الحمراء دي؟"), English ("What is the solar wind?"), or Franco-Arab transliteration ("eh howa akbar kawkab?"). The semantic embedding search must resolve queries to relevant curated facts across languages.
- **Ambiguous Queries**: Queries that span multiple bodies (e.g., "Earth vs Venus size") must retrieve the top relevant entries across both categories without crashing or deadlocking.
- **Near-Threshold Matches**: If a match's similarity score is borderline, the configurable threshold must deterministically decide inclusion or exclusion without intermittent behavior.
- **Missing or Corrupt Knowledge Index**: If the application starts without a pre-built index file or with a corrupted file, the search service must log a clear diagnostic warning and return a safe error response rather than crashing the Express server.
- **Zero API Quota or Offline Embedding Service**: If the embedding provider fails or experiences rate limits during query embedding generation, the system must capture the error and return a structured fallback response to the agent.
- **Large Query Payloads**: Extremely long user inputs must be safely truncated or rejected with input validation before generating embeddings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define a formal JSON schema for knowledge entries containing: `id` (string, unique), `category` (string enum), `title` (string), `content` (string), `source_name` (string), and `source_url` (valid URL string).
- **FR-002**: The system MUST organize curated factual space content into structured JSON files covering all seven mandatory categories:
  1. Sun
  2. Eight planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
  3. Moon
  4. Pluto
  5. Major space missions (e.g., Apollo, Voyager, Hubble, James Webb Space Telescope, Artemis)
  6. Black holes
  7. International Space Station (ISS)
- **FR-003**: The system MUST provide an offline index-building script that reads the curated knowledge files, computes vector embeddings for each entry, and persists a compact local index file with metadata and embeddings.
- **FR-004**: The system MUST support an embedding model that is configurable independently from `GEMINI_LIVE_MODEL` via server environment variables.
- **FR-005**: All permanent API keys and secret credentials MUST remain strictly server-side and never be transmitted to or bundled within the frontend client.
- **FR-006**: The backend MUST expose a REST endpoint `POST /api/knowledge/search` accepting `{ query: string, limit?: number, threshold?: number }`.
- **FR-007**: The search implementation MUST generate a vector embedding for the incoming query and perform similarity ranking against the local knowledge index.
- **FR-008**: The search implementation MUST enforce a configurable minimum relevance threshold, filtering out any entry whose similarity score does not meet the threshold.
- **FR-009**: The search endpoint MUST return structured results containing an array of matched entries, each with its `id`, `category`, `title`, `content`, `source_name`, `source_url`, and `relevance_score`.
- **FR-010**: When no knowledge entries satisfy the relevance threshold, the search endpoint MUST return an empty result array (`results: []`) with a status indicator, rather than returning weak or misleading matches.
- **FR-011**: The system MUST register a client tool declaration `search_knowledge` in the Gemini Live conversational session configuration, with a single required parameter `query` of type string.
- **FR-012**: When the live session dispatches a `search_knowledge` tool call, the frontend client MUST forward the query to the backend `POST /api/knowledge/search` endpoint.
- **FR-013**: The frontend client MUST format the search result or error into a structured tool response and return it to the active Gemini Live session via the live session protocol.
- **FR-014**: The system instruction for the astronaut voice agent MUST be updated to mandate that:
  - The agent MUST call `search_knowledge` before answering factual space questions.
  - The agent MUST base its factual claims strictly on retrieved content and cite the source name.
  - The agent MUST NEVER invent or guess scientific facts, numerical metrics, coordinates, or mission dates.
  - If the search returns no results or falls below the threshold, the agent MUST honestly state in Egyptian colloquial Arabic that its records do not contain this information.
  - The agent MUST communicate warmly and naturally in Egyptian colloquial Arabic.
- **FR-015**: The system MUST gracefully handle search errors (such as embedding network timeouts or unreadable index) and return a structured error response that allows the agent to inform the user without crashing the voice session.
- **FR-016**: The knowledge retrieval subsystem MUST operate in harmony with existing 3D tools (`focus_planet`, `show_fact_card`, `reset_view`), allowing multi-tool or sequential execution within the same dialogue turn.
- **FR-017**: The knowledge retrieval subsystem MUST not introduce complex vector database infrastructure, preferring a lightweight, portable local JSON/binary index format.
- **FR-018**: The system MUST prepare the no-result behavior to act as the triggering condition for Feature 005 (Google Search grounding fallback), keeping the two retrieval mechanisms decoupled.

### Key Entities

- **KnowledgeEntry**:
  - `id`: Unique string identifier (e.g., `sun-core-temperature`, `apollo-11-crew`).
  - `category`: Category string (`sun`, `planets`, `moon`, `pluto`, `missions`, `black-holes`, `iss`).
  - `title`: Short descriptive title of the fact or record.
  - `content`: Scientifically verified factual narrative and statistics.
  - `source_name`: Authoritative publishing body (e.g., "NASA Science", "ESA").
  - `source_url`: Verifiable URL pointing to the source publication.

- **KnowledgeIndexEntry**:
  - `id`: Reference to the `KnowledgeEntry` unique id.
  - `category`: Category tag.
  - `title`: Entry title.
  - `content`: Entry factual text.
  - `source_name`: Source name.
  - `source_url`: Source URL.
  - `embedding`: High-dimensional vector representation of the entry text.

- **SearchKnowledgeRequest**:
  - `query`: User query text string to embed and search.
  - `limit`: Maximum number of results to return (default: 3).
  - `threshold`: Minimum similarity score required (default: 0.65).

- **SearchKnowledgeResult**:
  - `results`: Array of matched `KnowledgeEntry` objects augmented with `relevance_score`.
  - `query`: The original query string.
  - `total_matches`: Count of matches that met or exceeded the threshold.
  - `execution_time_ms`: Backend retrieval duration in milliseconds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of factual queries on covered categories (Sun, 8 planets, Moon, Pluto, major missions, black holes, ISS) retrieve relevant facts with verified source name and URL when asked in Arabic or English.
- **SC-002**: Zero factual hallucinations on covered space science topics: 0% invented numerical values, physical dimensions, launch dates, or mission names in retrieved answers.
- **SC-003**: End-to-end knowledge search latency on the backend is under 500 milliseconds for 95% of queries on standard hardware.
- **SC-004**: 100% of ungrounded or out-of-domain queries that fail the minimum relevance threshold produce an explicit uncertainty admission in Egyptian Arabic without generating speculative answers.
- **SC-005**: 100% conversational stability: executing `search_knowledge` tool calls never causes disconnection, session termination, or audio clipping of the Gemini Live stream.
- **SC-006**: Existing voice agent capabilities and 3D interactions (`focus_planet`, `show_fact_card`, `reset_view`) maintain 100% operational fidelity with no regression in behavior or camera animation.

## Assumptions

- **Pre-computed Embeddings**: Because the curated space knowledge base is authoritatively curated and changes during development rather than by end-users at runtime, embeddings can be generated ahead of time by an offline indexing script and loaded into memory on server start for optimal runtime retrieval speed.
- **Embedding Model Independence**: The embedding model used for RAG (e.g., `text-embedding-004` or equivalent) is configured independently from `GEMINI_LIVE_MODEL` to permit flexibility and cost control.
- **Cosine Similarity Retrieval**: Standard vector cosine similarity over normalized embeddings is sufficient to achieve high precision for the curated categories without requiring a full vector database daemon.
- **Decoupled Search Fallback**: Feature 005 will handle Google Search grounding; in Feature 004, the agent stops at honest uncertainty admission when local knowledge retrieval yields no matches above threshold.
- **Bilingual Content Strategy**: Curated knowledge entries will feature rich scientific descriptions structured to optimize cross-lingual semantic matching against both Arabic and English queries.
