# Tasks: Real-Time Egyptian Astronaut Voice Agent

**Input**: Design documents from `/specs/002-egyptian-astronaut-voice-agent/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- Exact file paths are specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, workspace structure, and shared TypeScript type contracts.

- [ ] T001 [P] Scaffold backend workspace structure and dependencies in `backend/package.json` and `backend/tsconfig.json` (Express, CORS, dotenv, `@google/genai`).
- [ ] T002 [P] Configure backend environment variable schemas and validation in `backend/src/config/env.ts` and `backend/.env.example` (`PORT`, `GEMINI_API_KEY`, `GEMINI_LIVE_MODEL`).
- [ ] T003 [P] Define TypeScript schemas and interfaces in `frontend/src/types/voice.ts` citing constrained fields from `data-model.md` (`VoiceSession.status`, `VoiceSession.tokenExpiresAt`, `ConversationState.agentState`, `ConversationState.inputVolume`, `ConversationState.outputVolume`, `AudioStreamConfig.inputSampleRate`, `AudioStreamConfig.outputSampleRate`, `AudioStreamConfig.channelCount`, `AudioStreamConfig.bitDepth`, `PersonaConfig.locale`, `PersonaConfig.dialect`, `PersonaConfig.maxResponseSentences`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend token generation, audio encoders, audio worklet processors, and headless state store that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this foundational phase is complete.

- [ ] T004 Implement ephemeral token generation service in `backend/src/services/geminiAuthService.ts` using the Gemini API to request short-lived tokens per `contracts/ephemeral-token.contract.md` enforcing `data-model.md (VoiceSession.tokenExpiresAt)`.
- [ ] T005 Implement session routes and Express application in `backend/src/routes/sessionRoutes.ts` (`POST /api/session/token`, `GET /api/health`) and `backend/src/app.ts`, with server entrypoint in `backend/src/server.ts`.
- [ ] T006 [P] Implement Linear PCM conversion and base64 utility functions in `frontend/src/utils/audioEncoding.ts` for Float32 <-> Int16 16-bit PCM per `data-model.md (AudioStreamConfig.bitDepth)`.
- [ ] T007 [P] Implement AudioWorklet downsampler processor in `frontend/public/audio-worklet/pcm-processor.js` for 16 kHz mono PCM capture per `data-model.md (AudioStreamConfig.inputSampleRate, AudioStreamConfig.channelCount)`.
- [ ] T008 [P] Implement authentic Egyptian colloquial Arabic system prompt generator in `frontend/src/utils/personaPrompt.ts` enforcing `data-model.md (PersonaConfig.locale, PersonaConfig.dialect, PersonaConfig.maxResponseSentences, PersonaConfig.systemPrompt)`.
- [ ] T009 Implement frontend backend API client in `frontend/src/services/sessionApi.ts` to call `POST /api/session/token` per `contracts/ephemeral-token.contract.md` storing `data-model.md (VoiceSession.tokenExpiresAt)`.
- [ ] T010 Implement headless reactive Zustand store in `frontend/src/store/useVoiceStore.ts` per `contracts/voice-store.contract.md` enforcing state transitions in `data-model.md (ConversationState.agentState, ConversationState.inputVolume, ConversationState.outputVolume, VoiceSession.status)`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Real-Time Egyptian Astronaut Voice Conversation (Priority: P1) 🎯 MVP

**Goal**: Enable visitors to establish a live voice session, stream 16kHz microphone audio to the Gemini Live API via an ephemeral token, and receive warm synthesized Egyptian colloquial Arabic spoken responses in 2–4 sentences over a multi-turn conversation.

**Independent Test**: Start session, speak an astronomical question in Arabic, verify 16kHz audio reaches Gemini Live via ephemeral token, and hear a natural 24kHz synthesized Egyptian Arabic response within 2–4 sentences, followed by seamless follow-up turns.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement raw WebSocket client in `frontend/src/services/geminiLiveService.ts` for `BidiGenerateContent` handshake, `setup` transmission with Egyptian persona prompt, and streaming message dispatch per `contracts/gemini-live-session.contract.md` citing `data-model.md (PersonaConfig.locale, PersonaConfig.dialect)`.
- [ ] T012 [P] [US1] Implement audio input hook `frontend/src/hooks/useMicrophone.ts` to acquire `getUserMedia`, attach `AudioWorkletNode`, downsample to 16kHz Linear PCM (`data-model.md (AudioStreamConfig.inputSampleRate, AudioStreamConfig.channelCount, AudioStreamConfig.bitDepth)`), and emit base64 audio chunks with normalized input volume (`data-model.md (ConversationState.inputVolume)`).
- [ ] T013 [P] [US1] Implement audio output hook `frontend/src/hooks/useAudioPlayer.ts` to decode 24kHz Linear PCM (`data-model.md (AudioStreamConfig.outputSampleRate, AudioStreamConfig.bitDepth)`) and schedule gapless timeline playback via Web Audio API, updating `data-model.md (ConversationState.outputVolume)`.
- [ ] T014 [US1] Implement master orchestrator hook `frontend/src/hooks/useVoiceAgent.ts` coordinating `sessionApi`, `geminiLiveService`, `useMicrophone`, and `useAudioPlayer` to manage turn-taking and transitions per `contracts/voice-store.contract.md` and `data-model.md (ConversationState.agentState)`.
- [ ] T015 [US1] Integrate basic voice controls and mount in `frontend/src/App.tsx` verifying bidirectional speech back-and-forth in Egyptian Arabic.

**Checkpoint**: At this point, User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Immediate Conversational Interruption / Barge-In (Priority: P1)

**Goal**: Immediately cut off ongoing audio playback within 200 milliseconds when the visitor speaks over the astronaut, clearing pending chunk buffers and avoiding overlapping speech.

**Independent Test**: While the astronaut is speaking, speak into the microphone; confirm audio playback stops in $< 200\text{ ms}$ and queued audio is purged.

### Implementation for User Story 2

- [ ] T016 [US2] Implement immediate stop and timeline buffer queue flush in `frontend/src/hooks/useAudioPlayer.ts` (`stopPlayback()`).
- [ ] T017 [US2] Wire server interruption event (`serverContent.interrupted = true`) in `frontend/src/services/geminiLiveService.ts` to trigger immediate playback stop per `contracts/gemini-live-session.contract.md`.
- [ ] T018 [US2] Implement client-side fast-path barge-in detection in `frontend/src/hooks/useMicrophone.ts` and `frontend/src/hooks/useVoiceAgent.ts` monitoring input volume energy to silence playback in $< 50\text{ms}$ upon user speech.

**Checkpoint**: At this point, both User Stories 1 and 2 operate seamlessly together with instant interruption capability.

---

## Phase 5: User Story 3 - Session Controls, State Feedback & Resource Teardown (Priority: P2)

**Goal**: Provide intuitive start and end controls, render distinct operational states (idle, listening, thinking, speaking, error) with animated visualizers, and cleanly release microphone hardware and network sockets upon session end or window unload.

**Independent Test**: Start session, observe state transitions on the HUD pill, click end session, and verify the browser microphone recording indicator disappears immediately.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Implement animated microphone action button in `frontend/src/components/voice/MicrophoneButton.tsx` with ripple pulse reacting to `data-model.md (ConversationState.inputVolume)`.
- [ ] T020 [P] [US3] Implement status badge with animated sound waves in `frontend/src/components/voice/VoiceStatus.tsx` displaying localized Egyptian Arabic states per `data-model.md (ConversationState.agentState, ConversationState.outputVolume)`.
- [ ] T021 [US3] Build floating HUD container in `frontend/src/components/voice/VoiceDock.tsx` combining `MicrophoneButton` and `VoiceStatus`, strictly decoupled from 3D canvas.
- [ ] T022 [US3] Implement complete hardware and network teardown in `frontend/src/hooks/useMicrophone.ts` and `frontend/src/hooks/useVoiceAgent.ts` releasing all `MediaStreamTrack`s and closing WebSocket cleanly on session termination or window unload.

**Checkpoint**: User Story 3 delivers production-grade controls, feedback, and hardware safety.

---

## Phase 6: User Story 4 - Permission Denial, Hardware Errors & Graceful Recovery (Priority: P2)

**Goal**: Gracefully catch denied microphone permissions, missing audio devices, or network disconnections, presenting informative localized Egyptian Arabic alerts and an actionable retry mechanism.

**Independent Test**: Deny microphone permissions in browser settings, attempt to start session, and verify a clear Egyptian Arabic error alert appears without an application crash.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Implement user-friendly localized error banner with retry action in `frontend/src/components/voice/ErrorBanner.tsx`.
- [ ] T024 [US4] Implement error trapping for `NotAllowedError` and `NotFoundError` in `frontend/src/hooks/useMicrophone.ts` setting `data-model.md (ConversationState.agentState)` to `'error'`.
- [ ] T025 [US4] Implement automatic connection drop recovery and retry logic in `frontend/src/hooks/useVoiceAgent.ts` resetting state cleanly.

**Checkpoint**: Error handling guarantees system stability and clear user recovery.

---

## Phase 7: User Story 5 - Persona Boundary Enforcement & Scientific Honesty (Priority: P3)

**Goal**: Enforce Egyptian astronaut persona boundaries, ensuring the agent explicitly discloses its AI identity, politely redirects non-space inquiries, and honestly admits uncertainty rather than inventing astronomical facts or metrics.

**Independent Test**: Ask if the astronaut is a real human, ask an ungrounded astronomical number, and ask a non-space question; verify all three responses adhere to persona constraints.

### Implementation for User Story 5

- [ ] T026 [US5] Refine Egyptian colloquial Arabic system instruction in `frontend/src/utils/personaPrompt.ts` with explicit few-shot boundary examples for AI disclosure, uncertainty admission, and topic redirection per `data-model.md (PersonaConfig.systemPrompt)`.
- [ ] T027 [US5] Validate persona prompt handling in `frontend/src/services/geminiLiveService.ts` ensuring instructions are included in the initial setup frame and respected by the model.

**Checkpoint**: All 5 user stories are completely functional and verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security auditing, frame-rate validation, and end-to-end verification.

- [ ] T028 [P] Verify zero permanent API keys or secrets in frontend bundle or client network payloads per Constitution Principle V.
- [ ] T029 [P] Verify 3D solar system rendering performance maintains $\ge 50\text{ fps}$ desktop and $\ge 30\text{ fps}$ mobile during active bidirectional voice streaming.
- [ ] T030 Execute full end-to-end walkthrough across all 6 scenarios in `specs/002-egyptian-astronaut-voice-agent/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion — delivers core MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 3 (extends audio playback with barge-in interruption).
- **User Story 3 (Phase 5)**: Depends on Phase 3 (replaces basic controls with full HUD and lifecycle teardown).
- **User Story 4 (Phase 6)**: Depends on Phase 5 (adds error handling to HUD and audio hooks).
- **User Story 5 (Phase 7)**: Depends on Phase 3 (refines persona prompts and boundary constraints).
- **Polish (Phase 8)**: Depends on all user stories being complete.

### Parallel Opportunities

- In Phase 1: `T001`, `T002`, `T003` can all run concurrently.
- In Phase 2: `T006`, `T007`, `T008` can run in parallel while `T004` and `T005` are implemented.
- In Phase 3 (US1): `T011`, `T012`, `T013` can run concurrently before being unified in `T014`.
- In Phase 5 (US3): `T019` and `T020` can run in parallel before assembling `T021`.
- In Phase 8 (Polish): `T028` and `T029` can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Concurrently implement the independent input, output, and transport layers:
Task T011: "Implement raw WebSocket client in frontend/src/services/geminiLiveService.ts"
Task T012: "Implement audio input hook frontend/src/hooks/useMicrophone.ts"
Task T013: "Implement audio output hook frontend/src/hooks/useAudioPlayer.ts"

# Then unify in the orchestrator:
Task T014: "Implement master orchestrator hook frontend/src/hooks/useVoiceAgent.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010) — **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T011–T015)
4. **STOP and VALIDATE**: Verify live Egyptian Arabic voice conversation independently.

### Incremental Delivery
1. Add User Story 2 (T016–T018) -> Verify $<200\text{ms}$ barge-in cancellation.
2. Add User Story 3 (T019–T022) -> Verify full HUD states & hardware teardown.
3. Add User Story 4 (T023–T025) -> Verify permission and connection error recovery.
4. Add User Story 5 (T026–T027) -> Verify Egyptian persona boundaries & AI disclosure.
5. Final Polish (T028–T030) -> Validate security, 3D frame-rate, and quickstart scenarios.
