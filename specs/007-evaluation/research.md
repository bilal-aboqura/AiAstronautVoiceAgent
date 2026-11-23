# Phase 0 Research: Evaluation Harness & Documentation

**Feature Branch**: `007-evaluation`  
**Date**: 2026-11-23  
**Status**: Completed  
**Spec Reference**: [specs/007-evaluation/spec.md](spec.md)

---

## Executive Summary

Feature 007 establishes a rigorous, reproducible, and academically sound evaluation harness and complete project documentation suite for the Egyptian Astronaut Voice Agent. The harness empirically benchmarks the complete agent (**Version A — Full Agent** with Egyptian persona, local RAG `search_knowledge`, Google Search grounding, and interactive 3D tools) against a baseline (**Version B — Baseline** using the identical Gemini model with zero external tools or grounding).

The benchmark operates on a standardized, verified 40-question dataset (`/eval/questions.csv`) structured across 7 distinct categories. To preserve scientific integrity, correctness and hallucination scoring rely on human-in-the-loop review referencing authoritative citations, strictly prohibiting automated LLM-as-a-judge outputs from being treated as ground truth. All outputs are saved to RFC 4180-compliant CSV files in `/eval`, and a comparative summary script computes accuracy, hallucination count, and latency metrics.

---

## Technical Decisions & Trade-Off Analysis

### Decision 1: Model Invocation Architecture for Evaluation Runner

- **Context**: The production voice agent uses bidirectional WebSocket audio streaming via the Gemini Multimodal Live API. For evaluating factual accuracy, hallucination rates, and tool invocation logic across 40 standardized textual questions, we must choose how the evaluation runner (`/eval/run-evaluation.ts`) executes queries against Version A and Version B.
- **Alternatives Considered**:
  1. *Full Audio Pipeline Emulation*: Convert the 40 Arabic text questions to speech (TTS), stream audio chunks over the Gemini Live WebSocket, capture returning PCM audio, and transcribe back to text (STT).
     - *Evaluation*: Extremely fragile, introduces speech recognition/synthesis errors, creates high latency jitter ($> 5\text{s}$ per turn), and risks non-deterministic network dropouts. Violates the user constraint: *"Prefer the easiest reliable implementation. Avoid duplicating the entire voice application or introducing unnecessary infrastructure."*
  2. *Gemini Live WebSocket in Text-Only Mode*: Open WebSocket sessions with Gemini Live sending text frames instead of audio buffers.
     - *Evaluation*: Possible, but Gemini Live WebSocket requires complex setup handshakes, ephemeral tokens, and async event loops that make automated, sequential, or batch benchmarking more complex to debug and maintain.
  3. *Gemini Content Generation API via Official Google GenAI SDK (`@google/genai`)*: Use the official Google GenAI SDK with `ai.models.generateContent` passing identical model settings, system instructions, and tool declarations.
     - *Evaluation*: Clean, deterministic, standard for evaluation benchmarks. For Version A, the SDK seamlessly handles tool declarations (`search_knowledge`, `googleSearch: {}`, and 3D tools) and tool call loops. For Version B, the exact same model is called with zero tools. Measures pure cognitive latency without audio codec overhead.
- **Decision**: **Alternative 3 (Gemini Content Generation API via `@google/genai`)**.
- **Rationale**: It provides the most reproducible, deterministic, and transparent evaluation harness. It directly reuses the existing backend's `@google/genai` dependency and `server/services/knowledge-search.ts` without requiring new infrastructure or audio mocking.

---

### Decision 2: Model Configuration Resolution & Elimination of Hardcoded Model IDs

- **Context**: The project specification strictly mandates: *"Keep the model and test questions consistent. Do not hardcode a guessed model ID."*
- **Alternatives Considered**:
  1. *Hardcode `gemini-2.0-flash` in the script*:
     - *Evaluation*: Violates the specification constraint. Fails if the user or environment switches to another model (e.g., `gemini-2.0-flash-exp` or `gemini-2.5`).
  2. *Unified Environment Resolution*: Load the model dynamically from project environment variables with a structured fallback chain:
     `process.env.GEMINI_EVAL_MODEL || process.env.GEMINI_LIVE_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash'`.
- **Decision**: **Alternative 2 (Unified Environment Resolution)**.
- **Rationale**: Both Version A and Version B query the exact same model identifier loaded at runtime from `.env`. The runner explicitly logs the resolved model ID at the start of the evaluation run and embeds `model_id` in every CSV result record.

---

### Decision 3: Local Knowledge (RAG) & Tool Execution Integration in Version A

- **Context**: Version A must provide the complete agent experience: local space knowledge base (`search_knowledge`), Google Search grounding, and agent tools.
- **Implementation Strategy**:
  - **Local RAG (`search_knowledge`)**: The evaluation script directly imports and reuses the existing `server/services/knowledge-search.ts` service (from Feature 004). When the Gemini model returns a `functionCall` for `search_knowledge({ query })`, the runner executes the vector similarity search in-memory, logs the tool call, and feeds the function response back to the model to generate the final grounded answer.
  - **Google Search Grounding**: Version A declares `googleSearch: {}` in its tools configuration (supported natively by `@google/genai`). When triggered by the model, search grounding citations and queries are extracted from `candidates[0].groundingMetadata`.
  - **Tool Logging**: The runner records every invoked tool name in the `tools_called` field (e.g. `search_knowledge`, `googleSearch`, `focus_planet`, or `none`).
- **Version B (Baseline)**: Executed against the same model with `tools: []` (empty array) and no system prompt tool instructions, forcing the model to rely solely on pre-trained parametric weights.

---

### Decision 4: Dataset Structure & 40-Question Category Balance

- **Context**: Exactly 40 questions covering 7 categories must be stored in `/eval/questions.csv`.
- **Distribution Plan**:
  1. **Planets and the Sun**: 10 questions (core solar system facts: temperatures, atmospheres, rotation directions, solar physics).
  2. **Moons**: 5 questions (Europa, Titan, Ganymede, Phobos, Moon geology).
  3. **Space missions**: 7 questions (Apollo 11, James Webb Space Telescope, Voyager 1, Artemis, Curiosity, New Horizons, ISS).
  4. **Scientific facts and numbers**: 6 questions (speed of light, astronomical unit, escape velocity, solar system age, black hole event horizon, Saturn ring composition).
  5. **Tricky questions**: 4 questions (common misconceptions with false premises, e.g. "Why is Mercury the hottest planet?", "Can you land on the surface of Jupiter?", "Do astronauts float because there is zero gravity in orbit?", "Is the dark side of the Moon always dark?").
  6. **Out-of-scope questions**: 4 questions (unrelated non-space topics: Egyptian football league, traditional cooking recipes, local political elections, stock market forecasting).
  7. **Unanswerable questions**: 4 questions (unknowns and speculative queries: "What was before the Big Bang?", "When will Betelgeuse explode as a supernova?", "What is the exact coordinate of alien civilizations?", "Did extraterrestrials build the Giza Pyramids?").
- **Verification Sources**: Every row cites official public scientific sources (NASA Science Solar System Exploration, NASA JPL Fact Sheets, ESA Science & Technology, IAU, NASA Exoplanet Archive).

---

### Decision 5: Human-in-the-Loop Review vs. Automated LLM Judge

- **Context**: Automated LLM-as-a-judge evaluators are known to exhibit position bias, self-preference, and fail to detect subtle Arabic dialectal hallucinations.
- **Decision**:
  - The evaluation runner executes the queries and logs raw outputs with `review_status = 'unreviewed'`, `correctness = 'unreviewed'`, and `hallucination = 'unreviewed'`.
  - A structured manual review workflow enables human evaluators to inspect the response against `expected_answer` and `reference_source`, setting:
    - `correctness`: `'correct'` | `'incorrect'`
    - `hallucination`: `'yes'` | `'no'` (or `'n/a'`)
    - `uncertainty_detected`: verified boolean
    - `reviewer_notes`: concise rationale
  - Unreviewed items are strictly isolated and reported as pending, preventing unreviewed responses from skewing accuracy scores.

---

### Decision 6: Evaluation Summary Calculation & Reporting

- **Summary Generator (`/eval/summarize-results.ts`)**:
  - Parses the reviewed results CSV.
  - Aggregates:
    - **Accuracy Rate**: $\text{Accuracy} = \frac{\text{Correct Answers}}{\text{Total Reviewed Questions}} \times 100\%$ for Version A vs. Version B.
    - **Hallucination Count & Rate**: Total occurrences of `hallucination == 'yes'` for Version A vs. Version B.
    - **Response Latency**: Mean and median round-trip response time in milliseconds for Version A vs. Version B.
    - **Category Matrix**: Tabular comparison of accuracy and hallucinations across all 7 categories.
  - Generates `/eval/summary.md` and displays a formatted summary table in the terminal.

---

### Decision 7: Complete Documentation Suite Structure

- **Context**: University grading requires clear architectural explanations, installation guides, component decoupling documentation, and live API mechanics.
- **Documentation Deliverables**:
  1. `README.md` (Repository Root): Comprehensive master guide for university examiners, covering mission, architecture, setup, API keys, evaluation results, and ethical design.
  2. `docs/architecture.md`: In-depth architectural decomposition, Mermaid diagrams (component architecture, voice streaming loop, tool calling sequence), and constitutional compliance audit.
  3. `/eval/README.md`: Evaluation methodology guide, dataset explanation, running instructions, and scoring rubrics.

---

### Decision 8: Ethics, Privacy & Ephemeral Audio Guardrails

- **Constraints**:
  - Zero raw user audio persisted to disk or databases.
  - Evaluation logs strictly text-only.
  - Visible UI notice indicating when evaluation logging is active.
  - Mandatory AI persona disclosure label: `"الشخصية دي ذكاء اصطناعي"`.
  - Educational disclaimer advising fact verification.
  - Child-safe conversational boundaries.
- **Implementation**: The documentation, evaluation scripts, and UI components enforce and verify these requirements.
