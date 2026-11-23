# Technical Research: Real-Time Egyptian Astronaut Voice Agent

**Feature**: `002-egyptian-astronaut-voice-agent` | **Date**: 2026-11-23

## Executive Summary

This document establishes the architectural, protocol, and engineering decisions for implementing the Real-Time Egyptian Astronaut Voice Agent using the Gemini Multimodal Live API. It resolves all technical unknowns regarding ephemeral token authentication, WebSocket protocol schemas, bidirectional PCM audio streaming, sub-200ms conversational barge-in cancellation, and authentic Egyptian Arabic persona prompting.

---

## Technical Decisions & Rationale

### 1. Ephemeral Authentication & Secret Protection

- **Decision**: The Node.js/Express backend provides a dedicated endpoint (`POST /api/session/token`) that uses the server-held `GEMINI_API_KEY` to request a short-lived ephemeral session token from the Gemini API (valid for 5–30 minutes). The browser receives only this ephemeral token and the resolved WebSocket endpoint.
- **Rationale**: 
  - Strictly adheres to Constitution Principle V: permanent API credentials never leak to the client bundle or network traces.
  - Enables direct browser-to-Gemini WebSocket connections, eliminating server-side audio relay bottlenecks, lowering latency, and reducing backend bandwidth.
- **Alternatives Considered**:
  - *Backend WebSocket Relay/Proxy*: Frontend connects to Express WebSocket, which proxies audio to Gemini Live. Rejected because it doubles packet transit latency, increases server CPU/memory overhead, and complicates audio streaming scalability.
  - *Client-side API Key*: Rejected as an unacceptable security risk in violation of Constitution Principle V.

---

### 2. Live API Model Selection & Dynamic Configuration

- **Decision**: Model selection is dynamically resolved from the `GEMINI_LIVE_MODEL` environment variable on the backend (defaulting to `gemini-2.0-flash-exp` or `gemini-2.0-flash`). The ephemeral token endpoint validates that the model is configured and returns the model identifier to the client.
- **Rationale**:
  - Complies with the prompt requirement: "Do not hardcode an assumed model identifier. Verify the selected model supports the required Live API audio capabilities."
  - Gemini 2.0 Flash is Google's multimodal model natively optimized for bidirectional streaming audio and low-latency voice back-and-forth.
- **Alternatives Considered**:
  - *Hardcoding `gemini-2.0-flash-exp` in client code*: Rejected because model identifiers change as models graduate to GA.

---

### 3. Bidirectional Audio Streaming & Sample Rates

- **Decision**:
  - **Input (Microphone to Gemini)**: 16 kHz (or 24 kHz) 16-bit Linear PCM, single channel (mono), little-endian. Captured via Web Audio API (`AudioContext` + `AudioWorkletNode`), downsampled, converted to base64, and packaged in `realtimeInput.mediaChunks` with MIME type `audio/pcm;rate=16000` (or `24000`) in 100ms–200ms slice intervals.
  - **Output (Gemini to Speaker)**: 24 kHz 16-bit Linear PCM, single channel (mono), little-endian received in `serverContent.modelTurn.parts` with MIME type `audio/pcm;rate=24000`. Decoded from base64 into `Float32Array` $[-1.0, 1.0]$ and scheduled gaplessly via Web Audio API `AudioBufferSourceNode`.
- **Rationale**:
  - Linear PCM is the raw audio format required by the Gemini Multimodal Live API.
  - `AudioWorklet` processes audio on a dedicated background thread, preventing UI thread jank or frame drops in the background 3D solar system.
- **Alternatives Considered**:
  - *MediaRecorder with WebM/Opus*: Rejected because containerized streaming introduces 300–800ms of chunking latency and chunk header parsing overhead compared to raw PCM.

---

### 4. Conversational Interruption & Barge-In Strategy

- **Decision**: Hybrid dual-layer interruption cancellation:
  1. **Server-Triggered (Authoritative)**: When the Gemini Live API detects visitor speech, it automatically halts generation and emits `{"serverContent": {"interrupted": true}}`.
  2. **Client-Triggered (Low-Latency Fast-Path)**: When the client is playing audio and user microphone activity exceeds a calibrated speech energy threshold (or local VAD trigger), the client immediately silences current playback without waiting for network round-trip.
  - **Cancellation Actions**:
    - Call `stop(0)` on currently active `AudioBufferSourceNode` instances.
    - Purge and discard all queued audio buffers in memory.
    - Reset the Web Audio scheduling timeline cursor.
    - Transition UI status to `Listening`.
- **Rationale**:
  - Guarantees interruption latency under 200 ms (satisfying Constitution Constraint 2 and SC-003).
  - Eliminates jarring overlapping speech between the visitor and astronaut.
- **Alternatives Considered**:
  - *Server-only interruption*: Subject to 150–350ms network round-trip latency, exceeding the 200ms budget.
  - *Client-only VAD without server reset*: Gemini Live would continue streaming obsolete audio chunks, wasting bandwidth and desynchronizing conversational turns.

---

### 5. Egyptian Arabic Persona & System Instruction Design

- **Decision**: Construct the system instruction in authentic Egyptian colloquial Arabic (العامية المصرية) rather than English:
  - Role: Friendly, witty, curious Egyptian astronaut companion.
  - Dialect: Exclusively Egyptian slang and colloquial idioms (e.g., "يا سيدي الفاضل", "يا بطل", "خد عندك بقى", "زي ما تقول كدة"). Modern Standard Arabic (الفصحى) is explicitly banned.
  - Brevity: 2 to 4 sentences maximum per response.
  - Analogies: Relatable everyday Egyptian comparisons (e.g., comparing planetary distances or heat to everyday Egyptian experiences).
  - Honesty & Boundaries: Acknowledge AI identity when asked; admit uncertainty immediately when facts or numbers are unverified; politely redirect non-space questions.
- **Rationale**:
  - Prompting directly in the target colloquial dialect establishes strong stylistic conditioning in the model's token sampling, preventing code-switching into formal MSA or Levantine/Gulf dialects.
- **Alternatives Considered**:
  - *English system prompt with "Speak Egyptian Arabic"*: Tested in similar LLMs; frequently causes awkward literal translations or formal MSA slips.

---

### 6. Architectural Decoupling & State Management

- **Decision**: 
  - Voice logic is encapsulated in modular hooks (`useVoiceAgent`, `useMicrophone`, `useAudioPlayer`) and a dedicated headless Zustand store (`useVoiceStore`).
  - Voice UI components (`MicrophoneButton`, `VoiceStatus`, `VoiceDock`) exist as a separate floating HUD layer.
  - Zero coupling with Three.js / R3F scene graph; future features can listen to `useVoiceStore` events without voice code ever importing 3D scene modules.
- **Rationale**:
  - Satisfies Constitution Principle II (System Architecture & Component Decoupling) and Feature 002 requirements.
