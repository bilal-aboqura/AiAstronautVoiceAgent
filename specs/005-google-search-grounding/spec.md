# Feature Specification: Google Search Grounding

**Feature Branch**: `005-google-search-grounding`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Build a Google Search grounding integration for the existing Egyptian Astronaut Gemini Live voice agent. Objective: Allow the agent to search the web when its local knowledge base cannot find sufficiently relevant information. Use Gemini's built-in Google Search grounding with the Gemini Live API. Search behavior: 1. For factual space questions, call the existing search_knowledge(query) function first. 2. Check whether the local knowledge results are relevant and sufficient. 3. If local results are sufficient, answer using those results. 4. If local results are missing or insufficient, use Gemini's built-in Google Search grounding. 5. Answer using retrieved and grounded information. 6. Preserve available source and citation metadata. Technical requirements: Frontend: Vite + React + TypeScript. Backend: existing Node.js + Express server. Voice: existing Gemini Live API connection. Local knowledge: existing Feature 004 implementation. Search provider: Gemini built-in Google Search grounding. Model configuration: GEMINI_LIVE_MODEL. Gemini Live integration: Configure built-in Google Search grounding in the Gemini Live session. Preserve the existing search_knowledge custom function declaration. Keep existing focus_planet, show_fact_card, and reset_view functions. Follow the actual API and SDK configuration supported by the selected Live model. Verify that the selected model supports both required custom functions and Google Search grounding. Handle grounding metadata according to the actual SDK response structure. Do not assume all models return identical metadata. Search status: Add or reuse a searching state in the voice agent. Display a small searching indicator during external search. Return to the normal state after completion or failure. Keep the UI responsive. Accuracy and persona: Search the local knowledge base first. Use Google Search grounding when local results are insufficient. Prefer reliable scientific sources. Never invent facts, numbers, URLs, or citations. Admit uncertainty if reliable information cannot be found. Continue speaking in natural Egyptian colloquial Arabic. Keep responses short and conversational. Preserve the existing space-only persona. Error handling: Handle: Search unavailable. Unsupported model configuration. Network failures. Empty search results. Missing grounding metadata. Session errors. Search failures must not terminate the voice conversation. Architecture constraints: Use Gemini's built-in Google Search grounding. Do not create a separate web_search Express endpoint. Do not add another search API provider. Reuse Feature 004 knowledge retrieval. Reuse the existing Gemini Live connection. Do not expose API keys in the browser. Do not duplicate existing function handlers. Keep GEMINI_LIVE_MODEL configurable. Acceptance criteria: Local knowledge is searched first. Sufficient local results are used without unnecessary external search. Insufficient local results trigger Google Search grounding. Grounded answers use available source information. Searching status is displayed. Search failures are handled gracefully. The astronaut answers naturally in Egyptian Arabic. Existing voice, knowledge, and 3D tools continue working. Out of scope: A separate web search API. A custom web_search HTTP endpoint. New voice providers. Evaluation harness (Feature 007). Unrequested UI features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - External Web Grounding for Non-Curated or Recent Space Queries (Priority: P1)

As a curious visitor conversing with the Egyptian astronaut, when I ask a factual space science question that is not covered by the curated local knowledge base or asks for recent astronomical developments (e.g., "إيه آخر أخبار تجارب مركبة ستارشيب الفضائية؟" or "Who is the current commander of the International Space Station right now?"), I want the astronaut to search the web using built-in search grounding after checking local records, so that I receive an accurate, verified, and grounded answer citing reliable scientific sources while speaking warmly in authentic Egyptian colloquial Arabic.

**Why this priority**: The local curated knowledge base covers foundational space topics (Sun, planets, Moon, Pluto, major historic missions, black holes, ISS), but cannot anticipate every astronomical query, recent mission telemetry, or newly discovered exoplanet. Enabling seamless web search fallback delivers a truly knowledgeable, up-to-date space guide without hallucination.

**Independent Test**: In an active voice session, the visitor asks about a space topic absent from the local curated index (e.g., recent orbital tests of Starship or an obscure comet). The agent first checks the local knowledge base, receives insufficient results, invokes built-in search grounding, and answers with retrieved scientific facts, naming the external source in Egyptian Arabic.

**Acceptance Scenarios**:

1. **Given** an active voice session, **When** the visitor asks a factual space question absent from or not sufficiently covered by the curated local knowledge base, **Then** the system first executes local knowledge retrieval, detects that local results are missing or below sufficiency thresholds, and activates external search grounding.
2. **Given** search grounding retrieves verified web results from authoritative scientific sources, **When** the astronaut formulates the spoken answer, **Then** the answer accurately incorporates retrieved facts, preserves source attribution, and speaks in natural Egyptian colloquial Arabic.
3. **Given** a query requiring recent or real-time space information, **When** search grounding resolves, **Then** the astronaut provides current factual figures without fabricating dates, crew names, or mission outcomes.
4. **Given** conversational speech turnaround, **When** search grounding executes, **Then** the agent delivers a concise, conversational 2-4 sentence spoken response without rambling or reading verbatim raw webpage dumps.

---

### User Story 2 - Prioritizing Curated Local Knowledge Without Unnecessary External Search (Priority: P1)

As an educational visitor asking about fundamental celestial bodies or historic space missions (e.g., "ما هي درجة حرارة سطح كوكب الزهرة؟" or "متى انطلقت رحلة أبولو 11؟"), I want the astronaut to answer immediately from the curated local space records without initiating an unnecessary external web search, so that answers remain fast, authoritative, consistent, and strictly grounded in vetted materials.

**Why this priority**: The constitutional grounding hierarchy establishes that local curated knowledge takes precedence over external search. Avoiding unnecessary external search preserves conversational speed, reduces latency, prevents external search quota consumption, and guarantees vetted scientific answers for core solar system facts.

**Independent Test**: The visitor asks a question covered by the local knowledge base (e.g., Venus surface temperature or Apollo 11 launch date). The system invokes local knowledge search, identifies a high-confidence curated match, and answers directly from local data without triggering external search grounding.

**Acceptance Scenarios**:

1. **Given** a user query regarding a topic present in the local knowledge base with sufficient relevance, **When** the local search executes and returns sufficient results, **Then** the system directly utilizes those curated results to construct the response.
2. **Given** sufficient local knowledge results, **When** the agent generates the spoken response, **Then** no external search grounding is triggered.
3. **Given** an answer generated from local records, **When** the astronaut speaks, **Then** the answer credits the curated archival records (e.g., NASA or ESA) in authentic Egyptian Arabic.

---

### User Story 3 - Visible Search Indicator and Non-Blocking Conversational State (Priority: P2)

As a visitor interacting with the voice agent, when the astronaut is conducting an external search to look up unfamiliar facts, I want to see a clear, subtle visual indicator showing that the astronaut is searching space archives, and I want the interface to remain responsive so that I know what is happening without the session feeling frozen or disconnected.

**Why this priority**: External search operations introduce a small latency delta compared to cached or local memory. Providing clear visual feedback reassures the user that the agent is actively researching their question and maintains trust in the live voice experience.

**Independent Test**: The visitor asks a question requiring external search. The UI transitions its voice dock/HUD state to indicate active searching (e.g., displaying a subtle searching icon and label like "بيبحث في السجلات الفضائية..."), remains smooth and responsive, and transitions cleanly back to speaking when audio output begins.

**Acceptance Scenarios**:

1. **Given** an active voice session, **When** external search grounding is initiated, **Then** the UI displays a clear searching status indicator without blocking user interaction or freezing the 3D scene.
2. **Given** search grounding completes and the model begins speaking, **When** speech audio begins playback, **Then** the searching indicator immediately clears and the UI returns to the active speaking state.
3. **Given** a visitor speaks during an active search (interruption/barge-in), **When** voice activity is detected, **Then** the system respects the interruption, aborts or resets pending playback, and listens to the new visitor input without application deadlocks.

---

### User Story 4 - Graceful Error Handling and Honest Uncertainty Communication (Priority: P2)

As a visitor asking an obscure, speculative, or unverified space question (e.g., "هل توجد كائنات فضائية تحت جليد قمر أوروبا؟"), or if external search experiences a network failure or empty search results, I want the astronaut to honestly state in Egyptian Arabic that neither local archives nor current web searches could verify the information, rather than fabricating numbers, dates, or scientific claims.

**Why this priority**: Zero hallucination is a non-negotiable constitutional rule. When both local knowledge and external search fail to provide verified facts, the agent must gracefully explain the limitation in character rather than guessing or terminating the call.

**Independent Test**: Simulate an obscure question or external search outage/empty result. The agent gracefully catches the absence of grounded data, keeps the voice session fully connected, and speaks an authentic Egyptian colloquial Arabic response acknowledging that verified data is unavailable (e.g., "بحثت في السجلات والشبكة الفضائية بس مفيش معلومات مؤكدة عن ده حالياً يا بطل").

**Acceptance Scenarios**:

1. **Given** an external search that returns empty results, **When** the agent evaluates the response, **Then** the astronaut explicitly admits uncertainty in natural Egyptian Arabic and does not invent ungrounded claims.
2. **Given** a transient network failure, search timeout, or unsupported search configuration, **When** encountered, **Then** the voice session remains open and active without abrupt disconnections or error crashes.
3. **Given** a search error or missing grounding metadata, **When** handled, **Then** the agent responds with a warm, conversational explanation in Egyptian Arabic while remaining ready for the visitor's next question.

---

### User Story 5 - Multi-Tool Coexistence with Existing 3D Controls and Knowledge Retrieval (Priority: P3)

As a visitor exploring the solar system while speaking with the astronaut, when I ask a question that triggers both a 3D scene tool (such as focusing on a planet or displaying a fact card) and a knowledge retrieval, I want all tools—3D navigation, local knowledge search, and external search grounding—to execute harmoniously without conflicts or tool dropouts.

**Why this priority**: The agent's distinctive character is its multimodal presence, combining 3D celestial rendering with voice intelligence. Introducing search grounding must preserve existing tool declarations (`focus_planet`, `show_fact_card`, `reset_view`, `search_knowledge`) without regressions.

**Independent Test**: The visitor says "وريني كوكب المشتري وقولي إيه آخر مهمة فضائية رايحة له؟" (Show me Jupiter and tell me what the latest mission heading there is). The agent triggers `focus_planet` to focus Jupiter in 3D, queries local knowledge, falls back to search grounding for upcoming/current mission details, and delivers the spoken answer while smoothly displaying the planet.

**Acceptance Scenarios**:

1. **Given** a live voice session configured with tools, **When** initialized, **Then** the session preserves all existing custom function declarations (`search_knowledge`, `focus_planet`, `show_fact_card`, `reset_view`) alongside built-in search grounding.
2. **Given** a visitor request requiring both a 3D action and an information lookup, **When** processed, **Then** the 3D action executes smoothly on the canvas while the knowledge/search retrieval fulfills the factual response.
3. **Given** model configuration changes (such as selecting different live models via configuration), **When** loaded, **Then** tool declarations and search configurations adhere to supported model capabilities without breaking session startup.

---

### Edge Cases

- **Bilingual Queries and Mixed Script**: Visitors may ask space questions mixing Arabic and English terms (e.g., "إيه الـ Trappist-1 system؟" or "كلمنا عن الـ James Webb"). Grounding must interpret the bilingual terminology and search external sources accurately.
- **Ambiguous or Conflicting Search Results**: If external search sources present conflicting claims or non-scientific speculation, the agent must favor established scientific sources (NASA, ESA, reputable astronomical observatories) and acknowledge scientific debate rather than adopting speculative rumors.
- **Local vs. External Discrepancies**: If an external web search snippet slightly contradicts curated local records for foundational historical facts (e.g., Apollo 11 date or Mars radius), the curated local space knowledge base takes precedence as the authoritative source of truth.
- **Rapid User Interruption During Search**: If the user interrupts while the searching indicator is active, the agent must cancel the pending speech synthesis generation and immediately re-orient to the visitor's new utterance.
- **Search Metadata Formatting Differences**: Different model versions or API configurations may return varying grounding metadata formats (e.g., web search queries, grounding chunks, grounding supports, or missing URL fields). The system must safely handle whatever metadata structure is present without runtime exceptions.
- **Out-of-Scope Queries**: If a visitor asks questions completely unrelated to space, astronomy, or space exploration (e.g., cooking recipes or political debates), the astronaut must politely pivot back to space topics in character ("أنا رائد فضاء متخصص في أسرار الكون ومهمات الفضاء يا بطل!").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST execute the curated local knowledge base search (`search_knowledge`) as the first step for all factual space science queries.
- **FR-002**: The system MUST evaluate the relevance and sufficiency of local knowledge results prior to considering any external search.
- **FR-003**: The system MUST answer directly using local curated results whenever local knowledge provides sufficient, relevant information, without triggering external search.
- **FR-004**: The system MUST activate external search grounding if local knowledge results are absent, empty, or fall below the sufficiency threshold.
- **FR-005**: The system MUST configure and utilize built-in search grounding directly within the live conversational voice session.
- **FR-006**: The system MUST preserve all existing conversational tools (`search_knowledge`, `focus_planet`, `show_fact_card`, `reset_view`) in the session configuration alongside search grounding.
- **FR-007**: The system MUST support configurable conversational model selection through standard configuration settings (`GEMINI_LIVE_MODEL`) while maintaining search grounding and tool compatibility.
- **FR-008**: The system MUST extract and preserve available grounding metadata (including source names, domains, or reference titles) from external search responses.
- **FR-009**: The system MUST provide visual feedback by transitioning to a designated searching state and displaying a subtle search indicator in the user interface during external search execution.
- **FR-010**: The system MUST clear the searching indicator and return to the appropriate operational state (speaking or listening) as soon as search completes or fails.
- **FR-011**: The system MUST maintain responsive, non-blocking UI interactions, audio streaming, and 3D rendering while external searches are in progress.
- **FR-012**: The system MUST gracefully handle external search failures (including network disconnects, service timeouts, empty search hits, and malformed metadata) without terminating or resetting the voice session.
- **FR-013**: When factual information is unavailable across both local knowledge and external search, the system MUST articulate honest uncertainty in colloquial Egyptian Arabic rather than inventing facts, numbers, or sources.
- **FR-014**: The system MUST communicate all spoken responses in authentic Egyptian colloquial Arabic (العامية المصرية) while preserving the warm, inquisitive persona of an Egyptian astronaut.
- **FR-015**: Spoken responses MUST remain concise (typically 2 to 4 sentences) and optimized for real-time vocal dialogue rather than long monologue readings.
- **FR-016**: Permanent API keys and credentials MUST remain securely on the backend server and MUST NOT be exposed to the client application.
- **FR-017**: The system MUST NOT introduce any separate standalone web search HTTP endpoints or extraneous external search API providers.

### Key Entities *(include if feature involves data)*

- **Grounding Query**: The synthesized search query generated to retrieve external factual data when local knowledge is insufficient, capturing the astronomical subject and specific question.
- **Grounding Metadata**: Structured attribution data returned by the search provider, containing source titles, web domains/URLs, grounding snippets, and search query tokens.
- **Search State**: The real-time operational status of the voice agent indicating active external information retrieval, distinct from idle, listening, processing, or speaking states.
- **Grounded Spoken Response**: The final synthesized conversational response delivered in Egyptian Arabic, integrating retrieved factual information with natural persona phrasing and scientific attribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of factual space science inquiries query the curated local knowledge base prior to initiating any external search.
- **SC-002**: 0% of queries that have sufficient local knowledge results trigger unnecessary external web search.
- **SC-003**: For queries requiring external search fallback, search grounding activates and delivers grounded conversational speech in under 3.5 seconds end-to-end turnaround under normal network conditions.
- **SC-004**: 100% of grounded answers incorporate verified factual data from retrieved sources with 0% fabricated facts, dates, numbers, or URLs (hallucination rate: 0%).
- **SC-005**: In 100% of search failure, service timeout, or empty-result scenarios, the voice conversation remains active and connected without unhandled exceptions or session aborts.
- **SC-006**: When requested facts cannot be verified across both local and external sources, the astronaut communicates uncertainty in authentic Egyptian Arabic in 100% of occurrences.
- **SC-007**: The visual searching indicator appears within 200 milliseconds of external search initiation and clears within 200 milliseconds of search completion or failure.
- **SC-008**: 100% of existing 3D celestial tools (`focus_planet`, `show_fact_card`, `reset_view`) and local `search_knowledge` tool retain full operational functionality alongside search grounding.
- **SC-009**: 100% of client-side operations execute without exposing permanent API keys or search provider secrets in the browser bundle or network requests.

## Assumptions

- The configured conversational live model supports simultaneous custom tool declarations (`functionDeclarations`) and built-in Google Search grounding within the same live session.
- Ephemeral tokens generated by the backend session endpoint inherit permissions necessary for search grounding without requiring separate frontend authentication.
- External search results prioritize authoritative scientific sources (e.g., NASA, ESA, space agencies, research institutions, and established observatories).
- The user interface accommodates a subtle searching indicator alongside existing microphone and audio state indicators without displacing 3D viewport controls.
- The existing Feature 004 local knowledge base returns structured items with a clear relevance indicator or empty list when queries fall below the confidence threshold.
