# Feature Specification: Real-Time Egyptian Astronaut Voice Agent

**Feature Branch**: `002-egyptian-astronaut-voice-agent`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Feature 002: Real-Time Egyptian Astronaut Voice Agent. Implement a real-time voice conversation system for the Egyptian astronaut character using the Gemini Live API. Visitors must be able to speak through their microphone and receive natural spoken responses in Egyptian Arabic. Frontend: Vite + React + TypeScript, Backend: Node.js + Express, Voice: Gemini Live API, Communication: WebSocket, Authentication: Short-lived Gemini ephemeral tokens, Model configuration: GEMINI_LIVE_MODEL environment variable. Do not hardcode an assumed model identifier. Verify the selected model supports the required Live API audio capabilities."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Egyptian Astronaut Voice Conversation (Priority: P1)

As a curious visitor exploring space, I want to speak naturally into my microphone and hear the Egyptian astronaut reply in authentic, friendly Egyptian colloquial Arabic, so that I can learn about astronomy through an engaging and culturally relatable conversational companion.

**Why this priority**: Real-time bidirectional voice conversation is the core value proposition of this feature. Without microphone audio streaming, persona grounding, and spoken voice responses, no conversational astronaut experience exists.

**Independent Test**: The visitor activates the voice conversation, speaks an astronomical question in Arabic or English into the microphone, and hears a natural spoken response in Egyptian Arabic (العامية المصرية) within 2–4 sentences, followed by the ability to ask a follow-up question seamlessly.

**Acceptance Scenarios**:

1. **Given** a visitor has loaded the application and allowed microphone permissions, **When** they click or tap the start session control, **Then** the system establishes a secure live voice session and visually indicates a "Listening" state.
2. **Given** an active voice session, **When** the visitor speaks a question about space (e.g., "إيه هو أكبر كوكب في المجموعة الشمسية؟"), **Then** the system captures the speech, streams it to the voice service, transitions to "Thinking", and streams back synthesized audio in Egyptian Arabic.
3. **Given** the astronaut begins answering, **When** the audio plays, **Then** the voice sounds natural, warm, speaks in authentic Egyptian colloquial Arabic, uses everyday analogies, and concludes within 2 to 4 sentences.
4. **Given** the astronaut finishes speaking, **When** the visitor speaks a follow-up question, **Then** the conversation continues smoothly in the same session without requiring a manual push-to-talk button.

---

### User Story 2 - Immediate Conversational Interruption / Barge-In (Priority: P1)

As an engaged listener, I want to interrupt the astronaut while he is speaking by simply talking, so that I can redirect the discussion or ask an immediate clarification without waiting for a lengthy speech to finish.

**Why this priority**: Seamless conversational barge-in is essential for natural human dialogue. Without rapid interruption handling, the agent feels rigid and robotic, leading to confusing audio overlap.

**Independent Test**: While the astronaut is actively playing spoken audio, the visitor begins speaking into the microphone. Active audio playback cuts off within 200 milliseconds, and the astronaut promptly answers the new inquiry without playing stale remnants of the prior response.

**Acceptance Scenarios**:

1. **Given** the astronaut is currently speaking and audio is playing through the visitor's speaker, **When** the visitor starts speaking into their microphone, **Then** the ongoing audio playback halts immediately (in under 200 milliseconds).
2. **Given** an interrupted response, **When** active audio stops, **Then** all buffered audio chunks from the interrupted response are cleared to prevent overlapping speech.
3. **Given** the visitor completes their interrupting remark, **When** the visitor pauses, **Then** the astronaut processes the new utterance and replies to the new query in Egyptian Arabic.

---

### User Story 3 - Session Controls, State Feedback & Resource Teardown (Priority: P2)

As a visitor, I want clear start and end controls with immediate visual feedback on the astronaut's status (idle, listening, thinking, speaking, error), and reassurance that my microphone and connection are completely disconnected when I finish.

**Why this priority**: Users must maintain complete control over their hardware, privacy, and conversational lifecycle. Clear state feedback prevents confusion regarding whether the system is listening or processing.

**Independent Test**: The visitor starts a session, observes visual indicator transitions between states (idle -> listening -> thinking -> speaking), clicks the end session control, and verifies that the browser's microphone indicator disappears immediately and audio stops.

**Acceptance Scenarios**:

1. **Given** the application is idle, **When** the user views the interface, **Then** a prominent start session control is visible alongside an "Idle" status indicator.
2. **Given** an active session, **When** the visitor speaks, the system processes, and the astronaut replies, **Then** the status display transitions responsively between "Listening", "Thinking", and "Speaking".
3. **Given** an active session, **When** the visitor clicks or taps the end session control, **Then** the session terminates, the microphone hardware track is released immediately, all pending audio is silenced, and the status returns to "Idle".
4. **Given** an active session, **When** the visitor closes or navigates away from the browser tab, **Then** all microphone tracks and live connections are cleanly torn down.

---

### User Story 4 - Permission Denial, Hardware Errors & Graceful Recovery (Priority: P2)

As a visitor with an unavailable microphone or blocked permissions, I want helpful, localized feedback explaining the issue and allowing me to retry easily, so that I understand why voice is unavailable without the application crashing.

**Why this priority**: Web audio applications encounter permission blocks and missing audio devices frequently. Robust recovery ensures high system reliability and positive user experience.

**Independent Test**: The visitor denies browser microphone access or disconnects their input device; the interface transitions to an informative "Error" state explaining the issue in clear language and provides a retry mechanism.

**Acceptance Scenarios**:

1. **Given** the visitor clicks start session, **When** the browser prompts for microphone access and the visitor denies permission, **Then** the system transitions to an "Error" status with a clear explanatory message and does not crash.
2. **Given** a visitor with no detected microphone input device, **When** attempting to start a session, **Then** the system displays a device unavailable message and remains interactive.
3. **Given** an active session experiences an unexpected network disconnect, **When** the connection drops, **Then** the system safely releases the microphone, alerts the user, and enables a one-click session reconnection.

---

### User Story 5 - Persona Boundary Enforcement & Scientific Honesty (Priority: P3)

As a space enthusiast or casual visitor, I want the astronaut to maintain his Egyptian character, politely decline off-topic inquiries, honestly admit when a fact is unknown, and clearly state that he is an artificial intelligence guide when questioned, so that the experience remains credible and educational.

**Why this priority**: Persona integrity and scientific accuracy are mandated by project governance. Preventing fabrication and hallucinations maintains user trust.

**Independent Test**: When asked an ungrounded obscure question, an unrelated personal topic, or whether he is a real human, the astronaut stays in character, politely redirects or admits uncertainty in Egyptian Arabic, and confirms his AI identity.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the visitor asks if the astronaut is a real person in space, **Then** the agent warmly clarifies in Egyptian Arabic that he is an AI astronaut companion.
2. **Given** an active session, **When** the visitor asks an obscure, unverified astronomical metric, **Then** the agent honestly admits in Egyptian Arabic that he does not know or cannot verify the number right now, without inventing a fictional value.
3. **Given** an active session, **When** the visitor asks about an unrelated topic (e.g., cooking recipes or political debates), **Then** the agent politely redirects the conversation back to space and celestial wonders with gentle humor.

---

### Edge Cases

- **Rapid Consecutive Interruptions**: If a visitor interrupts the astronaut, speaks a single word, pauses, and immediately speaks again, the cancellation and speech detection logic must handle rapid state switching without leaving orphaned audio playback or stuck "Thinking" states.
- **Silent Background Noise / Ambient Chatter**: Moderate room background noise or low-volume ambient chatter must not cause the system to remain perpetually in "Listening" or trigger false barge-ins when the visitor is not actively speaking.
- **Network Glitches During Speech Reception**: If incoming audio chunks are delayed or dropped due to temporary network jitter, audio buffer scheduling must avoid loud clicks or pitch distortions, resuming smoothly when packets arrive.
- **Accidental Rapid Button Clicks**: If the visitor rapidly clicks the start/end session button multiple times in succession, the system must debounced requests to prevent creating duplicate concurrent sessions or leaking audio handles.
- **Audio Device Disconnection Mid-Session**: If the visitor unplugs their headset or microphone while a session is active, the system must catch the device disconnect event, stop audio streams safely, and alert the visitor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an intuitive interface to start, monitor, and end a real-time voice conversation session.
- **FR-002**: The system MUST securely obtain short-lived session authorization from the backend server before connecting to the voice service, ensuring permanent API secrets are never exposed to the client.
- **FR-003**: The system MUST request microphone permissions prior to streaming audio and release all microphone media tracks immediately upon session termination.
- **FR-004**: The system MUST capture visitor microphone audio in real time and stream it directly to the real-time voice intelligence service.
- **FR-005**: The system MUST receive generated audio streams from the voice service and play them back seamlessly through the visitor's audio output device.
- **FR-006**: The system MUST support continuous multi-turn conversations within a single active session without requiring push-to-talk interactions between turns.
- **FR-007**: The system MUST detect visitor speech while the agent is speaking (barge-in) and cut off active audio playback in under 200 milliseconds.
- **FR-008**: Upon an interruption, the system MUST discard any queued audio chunks and prevent overlapping speech playback.
- **FR-009**: The system MUST embody an authentic Egyptian astronaut persona speaking exclusively in Egyptian colloquial Arabic (العامية المصرية), avoiding Modern Standard Arabic (الفصحى) and other regional dialects.
- **FR-010**: Spoken responses MUST be concise and conversational, typically constrained to 2 to 4 sentences, featuring relatable everyday analogies.
- **FR-011**: The astronaut MUST explicitly identify as an AI character when asked and never claim to be a living human or an active biological astronaut.
- **FR-012**: The astronaut MUST NOT fabricate astronomical facts, celestial coordinates, or scientific measurements; if a fact cannot be verified, the astronaut MUST explicitly acknowledge uncertainty in Egyptian Arabic.
- **FR-013**: The astronaut MUST politely redirect off-topic or unrelated questions back to astronomy and space exploration with friendly Egyptian humor.
- **FR-014**: The system MUST visually communicate five discrete operational states: Idle, Listening, Thinking, Speaking, and Error.
- **FR-015**: The system MUST provide clear, user-friendly error messages when microphone permissions are denied, input hardware is missing, or network connections fail.
- **FR-016**: The system MUST handle unexpected connection drops gracefully, safely tearing down audio contexts and allowing the user to reconnect with a single action.
- **FR-017**: The system MUST NOT store, record, or persist visitor microphone audio on either the client or the server by default.
- **FR-018**: The voice controls, status displays, and audio management logic MUST operate as a modular subsystem strictly decoupled from 3D solar system rendering.

### Key Entities *(include if feature involves data)*

- **Voice Session**: Represents an active bidirectional voice interaction. Attributes include session identifier, ephemeral token, connection status (idle, connecting, active, disconnecting, error), active duration, and turn count.
- **Conversation State**: Encapsulates the instantaneous user and agent state: operational state (Idle, Listening, Thinking, Speaking, Error), microphone mute/active status, audio playback active flag, and active error details.
- **Voice Event**: Encapsulates real-time audio and interaction signals, including session started, audio chunk received, user speech detected (barge-in trigger), playback completed, session terminated, and error raised.
- **Persona Instruction**: Specifies the behavioral rules, linguistic constraints (Egyptian Arabic only, 2–4 sentences), cultural tone, scientific grounding boundaries, and conversational redirect prompts governing the agent.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of voice sessions establish a live connection within 2.5 seconds of the visitor initiating the session on broadband internet.
- **SC-002**: Turnaround response latency (time from visitor completing speech to the first synthesized audio playback) is under 1.5 seconds under standard network conditions.
- **SC-003**: Conversational barge-in response time (time from visitor speaking over the astronaut to complete audio cutoff of previous speech) is under 200 milliseconds in 95% of interruption occurrences.
- **SC-004**: 100% of generated responses use natural Egyptian colloquial Arabic phrasing without reverting to Modern Standard Arabic or other regional dialects.
- **SC-005**: 100% of standard conversational responses remain within 2 to 4 sentences in length.
- **SC-006**: 100% of session terminations release browser microphone tracks immediately, leaving zero active audio recording indicators in the browser tab.
- **SC-007**: Zero permanent API keys, secrets, or long-lived credentials are leaked to frontend bundles, network request headers, or browser storage.
- **SC-008**: 0% audio playback overlap occurs (the system never plays simultaneous agent audio streams).
- **SC-009**: 100% of microphone permission rejections and unexpected network drops display a clear, non-technical explanation with an available retry action.
- **SC-010**: Frame rate of the underlying 3D solar system canvas is unaffected by active voice streaming, maintaining $\ge 30\text{ fps}$ on mobile and $\ge 50\text{ fps}$ on desktop hardware.

## Assumptions

- **Hardware & Browser Capabilities**: Visitors use modern desktop or mobile browsers supporting Web Audio APIs (`AudioContext`, `AudioWorklet` or `ScriptProcessorNode`, and `MediaStream` APIs) with a functional microphone and audio output.
- **Model Capabilities**: The configured real-time conversational model (`GEMINI_LIVE_MODEL`) supports bidirectional audio streaming, native Egyptian Arabic speech synthesis, and real-time interruption signaling.
- **Visual Presentation**: The voice controls and status indicators will appear as a clean, floating HUD overlay positioned unobtrusively on top of the existing 3D solar system view.
- **Explicit Exclusions for Feature 002**:
  - 3D planet camera navigation triggered by voice tool calling is deferred to a future feature.
  - Curated space knowledge base retrieval (RAG) and Google Search grounding are deferred to subsequent features.
  - Real-time synchronized text captions and astronaut avatar facial viseme synchronization are deferred to subsequent features.
  - Automated 40-question benchmark evaluation harness is deferred to the designated evaluation milestone.
