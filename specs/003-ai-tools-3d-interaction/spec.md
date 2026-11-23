# Feature Specification: AI Tools & 3D Interaction

**Feature Branch**: `003-ai-tools-3d-interaction`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Feature 003: AI Tools & 3D Interaction. Build a function-calling integration between the existing Gemini Live voice agent and the existing interactive 3D solar system. Allow the Egyptian Astronaut AI agent to control the solar system through Gemini Live custom function calling while maintaining the existing voice conversation. Required tools: focus_planet(name), show_fact_card(title, facts[]), reset_view(). Integration requirements: Register declarations in Gemini Live session configuration, receive function calls in frontend, route each function call to the correct frontend handler, execute UI functions in React, return tool response through existing Gemini Live session, allow Gemini to continue speaking after tool response, handle multiple tool calls safely, handle invalid arguments and execution errors without crashing. Architectural constraints: Reuse Feature 001 solar system and Feature 002 voice agent, keep camera movement and card state in frontend, do not create Express endpoints for frontend-only UI actions, do not expose permanent API key in browser, keep selected model configurable via GEMINI_LIVE_MODEL, follow function-calling format supported by selected Gemini Live model and SDK. Agent behavior: Call focus_planet as soon as a celestial body is mentioned, call reset_view when asked to return to full solar system, use show_fact_card when useful info is available, speak in natural Egyptian colloquial Arabic, keep answers short and conversational, never invent facts or numbers, tool failures must not end voice conversation. Out of scope: RAG, Google Search grounding, new voice providers, evaluation harness, unrequested features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Voice-Controlled Celestial Body Navigation (Priority: P1)

As a curious visitor speaking with the Egyptian astronaut, I want the agent to automatically focus the 3D camera onto a celestial body (Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) and show its information card as soon as we discuss it, so that I can explore space visually and intuitively without needing to manually find and click on objects.

**Why this priority**: This constitutes the core interactive bridge between the voice agent persona and the 3D space environment. Having the astronaut guide the visitor's view directly brings the interactive astronaut concept to life and delivers the primary multimodal experience.

**Independent Test**: In an active voice session, the visitor asks about Earth or Saturn in Arabic or English. The camera smoothly glides to frame the selected body, tracks its orbital path, and displays its detailed planetary info card, while the astronaut seamlessly continues speaking in Egyptian Arabic.

**Acceptance Scenarios**:

1. **Given** an active voice session and the 3D solar system in overview, **When** the visitor asks about a supported celestial body (e.g., "كلمني عن كوكب زحل" or "Tell me about Mars"), **Then** the agent immediately initiates the `focus_planet` tool call specifying the celestial body name before or while speaking.
2. **Given** a valid `focus_planet` request, **When** the action is processed, **Then** the 3D camera smoothly animates from its current viewpoint to frame the requested celestial body within 1.5 to 2.5 seconds, continues following its orbital movement, and opens the corresponding planetary information card.
3. **Given** the camera has completed or is completing its transit, **When** the agent delivers its spoken response, **Then** the astronaut's voice continues speaking in warm Egyptian colloquial Arabic without audio interruption, stutter, or delay caused by the 3D animation.
4. **Given** a visitor mentions any of the 11 supported bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`), **When** the tool is invoked, **Then** the target name is recognized case-insensitively and matched correctly to the 3D scene entity.

---

### User Story 2 - Voice-Driven Overview Reset (Priority: P1)

As a visitor inspecting a specific planet, I want to ask the astronaut to zoom back out to see the entire solar system, so that I can regain the big-picture view and pick a new destination through natural conversation.

**Why this priority**: Symmetrical camera navigation is essential for exploration. Without the ability to return to the global overview via voice, users are left stuck on a single body or forced to resort to manual UI workarounds.

**Independent Test**: While the camera is focused on any planet with its information card open, the visitor asks to see the whole solar system (e.g., "ورّيني المجموعة الشمسية كلها" or "Reset view"). The camera smoothly returns to the default overview perspective, clearing the active selection and closing the card.

**Acceptance Scenarios**:

1. **Given** the camera is focused on a selected celestial body, **When** the visitor says a reset phrase (e.g., "نرجع لمنظر المجموعة الشمسية كله" or "Reset the view"), **Then** the agent dispatches the `reset_view` tool call.
2. **Given** `reset_view` is executed, **When** the action completes, **Then** the camera smoothly glides back to the default solar system overview framing, any highlighted selection is cleared, and open information cards are closed.
3. **Given** the camera is returned to overview, **When** the astronaut speaks, **Then** the agent provides a friendly confirmation in Egyptian Arabic (e.g., "تمام، رجعنا للمنظر العام لكل كواكبنا الجميلة").

---

### User Story 3 - Dynamic Multilingual Fact Card Presentation (Priority: P2)

As a visitor learning complex astronomical facts, I want informative visual fact cards to appear on screen displaying key facts in both Arabic and English with proper text layout (RTL for Arabic), so that I can read and absorb essential data alongside the spoken dialogue.

**Why this priority**: Spoken numbers, distances, temperatures, and bulleted takeaways are difficult to retain through audio alone. Displaying verified visual fact cards reinforces learning and accommodates both Arabic and English learners.

**Independent Test**: When discussing specific celestial features, the astronaut triggers `show_fact_card` with a title and bulleted list of facts. An elegant fact card appears on the screen with proper text direction (RTL for Arabic, LTR for English), clear typography, and verified scientific content.

**Acceptance Scenarios**:

1. **Given** an active conversation, **When** the astronaut explains notable points about an astronomical entity, **Then** the agent calls `show_fact_card` with a descriptive title and an array of verified factual bullet points.
2. **Given** `show_fact_card` is called with Arabic text, **When** displayed on screen, **Then** the card renders with Right-to-Left (RTL) alignment, authentic Arabic typography, and readable contrast.
3. **Given** `show_fact_card` is called with English text, **When** displayed on screen, **Then** the card renders with Left-to-Right (LTR) alignment.
4. **Given** a fact card is currently displayed, **When** the user manually closes it or when a new card is shown, **Then** the interface transitions cleanly without overlapping text or visual glitches.

---

### User Story 4 - Resilient Error Handling & Conversational Continuity (Priority: P2)

As a visitor, if an invalid tool command is issued or an action cannot be completed, I want the astronaut to explain what happened in natural Egyptian Arabic and continue our voice conversation without the application freezing or the session disconnecting.

**Why this priority**: Real-time voice agents must never crash or terminate unexpectedly due to bad tool inputs, unknown names, or internal execution errors. Graceful conversational recovery maintains user trust and keeps the session alive.

**Independent Test**: A tool call is triggered with an unsupported celestial body name or malformed arguments. The system safely intercepts the error, returns a structured error payload to the agent, the astronaut explains the situation warmly in Egyptian Arabic (e.g., "الكوكب ده مش موجود عندنا في المجموعة الشمسية يا بطل!"), and the voice session remains fully operational.

**Acceptance Scenarios**:

1. **Given** a tool invocation with an invalid or unsupported celestial name (e.g., `focus_planet(name="krypton")`), **When** validated by the client handler, **Then** the call is safely rejected without raising unhandled errors, an error result is returned to the agent, and the astronaut explains the limitation warmly in Egyptian Arabic.
2. **Given** a `show_fact_card` call with empty or malformed arguments (e.g., missing title or empty facts array), **When** received, **Then** the system rejects the invocation safely, reports an error result, and avoids rendering a broken or blank card.
3. **Given** any tool execution failure, **When** the failure occurs, **Then** the live audio stream, microphone capture, and voice session remain active and uninterrupted.

---

### User Story 5 - Coexistence of Voice & Manual 3D Controls (Priority: P3)

As a visitor who enjoys both speaking and clicking, I want manual 3D interactions (clicking a planet directly, clicking the UI reset button) and voice-commanded actions to stay completely in sync, so that neither mode breaks or confuses the other.

**Why this priority**: Users frequently alternate between pointing and talking. Shared state consistency ensures an intuitive and cohesive user experience regardless of the input modality used.

**Independent Test**: The user clicks Mars manually, then asks the voice agent to focus on Saturn; the camera transitions seamlessly to Saturn. The user then clicks the on-screen reset button, and subsequent voice commands operate accurately from the overview state.

**Acceptance Scenarios**:

1. **Given** a user has manually selected a planet by clicking on the 3D scene, **When** they subsequently ask the voice agent to focus on a different planet, **Then** the agent's tool call takes precedence and smoothly transitions the camera to the new target.
2. **Given** the agent has focused a planet via voice, **When** the user clicks the on-screen manual reset button or clicks empty space, **Then** the camera resets to overview and the internal selection state reflects the reset accurately.

---

### Edge Cases

- **Rapid Multiple Tool Calls**: If the voice agent issues multiple tool calls within a single response turn (e.g., focusing a planet and immediately displaying its fact card), the client must process them sequentially or in parallel without race conditions or camera coordinate jumping.
- **Interruption During Tool Transit**: If the visitor interrupts (barges in) while the camera is actively animating toward a celestial body, the camera must smoothly complete its transit or redirect to a newly requested target, while the previous turn's audio playback halts immediately within 200 milliseconds.
- **Unsupported Celestial Body Names**: Invocations specifying non-solar or non-included bodies (e.g., "Ceres", "Alpha Centauri", "Death Star") must be rejected gracefully with clear error feedback rather than throwing exceptions or desyncing the 3D scene.
- **Malformed or Incomplete Fact Card Payloads**: Invocations with missing titles, empty arrays, or whitespace-only strings must be validated and rejected safely with descriptive error messages.
- **Case Sensitivity and Spacing Variants**: Celestial body names supplied with mixed case (e.g., "Earth", "MARS", " saturn ") must be trimmed and normalized to lowercase before matching.
- **Network Latency During Tool Response**: If there is a brief network delay between the client executing a tool and the live session receiving the tool response, the 3D scene must remain responsive and never block manual user interaction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST register three client-executable tool declarations (`focus_planet`, `show_fact_card`, `reset_view`) in the live conversational session initialization configuration.
- **FR-002**: The `focus_planet` tool declaration MUST define a required `name` parameter of type string, accepting exclusively the 11 supported celestial bodies: `sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, and `pluto`.
- **FR-003**: The client MUST validate the supplied celestial body name case-insensitively and reject unsupported names with a structured error response.
- **FR-004**: Upon valid execution of `focus_planet`, the system MUST smoothly animate the 3D camera to focus on and continuously track the selected celestial body within 1.5 to 2.5 seconds.
- **FR-005**: Upon valid execution of `focus_planet`, the system MUST display the corresponding celestial body information card on the screen.
- **FR-006**: The `show_fact_card` tool declaration MUST define a required `title` parameter of type string and a required `facts` parameter as an array of strings.
- **FR-007**: The client MUST validate `show_fact_card` arguments, rejecting empty titles, empty fact arrays, or non-string elements with a structured error response.
- **FR-008**: The system MUST render fact cards with full support for both Arabic and English text, automatically applying Right-to-Left (RTL) layout when Arabic content is detected and Left-to-Right (LTR) for English.
- **FR-009**: The `reset_view` tool declaration MUST define a parameterless tool that smoothly animates the camera back to the full solar system overview, clears the active selection, and dismisses any open information or fact cards.
- **FR-010**: All UI tool operations MUST execute directly within the client application state and user interface, without routing through intermediate backend server endpoints for client-only presentation actions.
- **FR-011**: The client MUST capture tool call events from the live session, dispatch them to corresponding UI and 3D scene handlers, and send structured tool responses back over the active live session protocol.
- **FR-012**: Following the receipt of a tool response, the live voice session MUST allow the agent to continue speaking seamlessly and complete its conversational turn.
- **FR-013**: The system MUST handle multiple or rapid successive tool calls safely, preventing race conditions or camera coordinate corruption.
- **FR-014**: If a tool fails execution or argument validation, the system MUST return a structured error result to the session, and the agent MUST explain the error naturally in colloquial Egyptian Arabic without dropping or terminating the voice session.
- **FR-015**: The system MUST keep permanent service credentials strictly off the client, utilizing short-lived ephemeral session credentials provided by the backend.
- **FR-016**: The selected live conversational model identifier MUST remain configurable via runtime environment configuration without hardcoded assumptions.
- **FR-017**: The agent prompt MUST instruct the model to call `focus_planet` eagerly as soon as a celestial body is mentioned, call `reset_view` upon user overview requests, speak in authentic Egyptian colloquial Arabic, and never fabricate scientific facts or numbers.
- **FR-018**: Manual 3D controls (clicking planets, clicking on-screen reset) MUST update the same shared application state as voice tools, ensuring consistent state across modalities.

### Key Entities

- **CelestialBody**:
  - `id`: Unique identifier (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`).
  - `displayName`: Localized name representation (Arabic and English).
  - `orbitalRadius`: Distance from the Sun in 3D scene units.
  - `cameraFocusDistance`: Optimal camera offset distance for inspection framing.
  - `overviewSummary`: Key planetary data (diameter, temperature, orbit period).

- **ToolCallRequest**:
  - `callId`: Unique identifier for the function call issued by the voice service.
  - `name`: Tool name (`focus_planet`, `show_fact_card`, `reset_view`).
  - `arguments`: Key-value map of parameters supplied by the model.

- **ToolCallResponse**:
  - `callId`: Matching identifier corresponding to the `ToolCallRequest`.
  - `name`: Matching tool name.
  - `response`: Object containing execution outcome (e.g., `{ status: "success" | "error", message?: string, data?: any }`).

- **FactCard**:
  - `title`: Header text of the card.
  - `facts`: Array of factual bullet points.
  - `language`: Detected or specified language code (`ar` or `en`).
  - `textDirection`: Directional rendering mode (`rtl` or `ltr`).
  - `isVisible`: Boolean visibility flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid voice requests mentioning supported celestial bodies trigger camera focus and corresponding info card display within 1.0 second of tool call dispatch.
- **SC-002**: Camera transitions between celestial bodies complete smoothly within 1.5 to 2.5 seconds without coordinate stutter or visual jumping.
- **SC-003**: 100% of reset requests successfully return the camera to the full solar system overview and dismiss open cards.
- **SC-004**: Spoken voice responses continue naturally after tool execution with less than 1.5 seconds post-tool speech latency.
- **SC-005**: 100% of invalid or malformed tool invocations (invalid planet names, empty fact arrays) are handled safely with zero application crashes or dropped sessions.
- **SC-006**: Fact cards render with 100% proper directional layout (RTL for Arabic, LTR for English) and readable contrast.
- **SC-007**: Zero permanent credentials exposed in client-side code or network bundles.
- **SC-008**: Manual 3D interactions (mouse/touch selection and reset) and voice-triggered interactions remain 100% synchronized in state.
- **SC-009**: 100% of supported celestial bodies (all 11: Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) are addressable and selectable via voice.

## Assumptions

- **Existing 3D Foundation**: Feature 001 provides the interactive solar system with smooth camera interpolation, planetary orbits, and selection state management.
- **Existing Voice Foundation**: Feature 002 provides the bidirectional live audio streaming session, microphone capture, audio playback, and ephemeral token exchange infrastructure.
- **Live Function Calling Support**: The conversational model selected via environment configuration supports custom tool declarations and client-side function call responses over the active session connection.
- **Frontend Execution**: UI actions (camera movement, card display, view reset) are client-side operations that execute in the browser without requiring backend server routing.
- **Language and Persona**: Spoken responses and conversational tool acknowledgments are conducted in authentic Egyptian colloquial Arabic (العامية المصرية) adhering to the Astronaut persona defined in Constitution Principle IV.
- **Scope Boundaries**: Knowledge-base RAG (`search_knowledge`), Google Search grounding, external audio providers, and the 40-question benchmark runner are strictly out of scope for Feature 003.
