# Implementation Plan: Feature 007 — Evaluation Harness & Documentation

**Branch**: `007-evaluation` | **Date**: 2026-11-23 | **Spec**: [specs/007-evaluation/spec.md](spec.md)

**Input**: Feature specification from `specs/007-evaluation/spec.md`

---

## Summary

Build a simple, reliable, and reproducible evaluation harness and author a complete, university-grade documentation package for the Egyptian Astronaut Voice Agent project. 

The evaluation system rigorously compares the complete multimodal voice agent (**Version A — Full Agent** with Egyptian astronaut persona, local RAG `search_knowledge`, Google Search grounding, and interactive 3D tools) against an ungrounded baseline (**Version B — Baseline** using the exact same Gemini model with zero tools or external search). The benchmark executes on a curated, verified 40-question space science dataset (`/eval/questions.csv`) spanning 7 distinct categories. 

To maintain scientific integrity and adhere to academic honesty rules, correctness and hallucination scoring are performed via human-in-the-loop review referencing authoritative scientific sources (NASA, ESA, IAU), strictly prohibiting automated LLM-as-a-judge outputs from being treated as ground truth. An automated runner script (`/eval/run-evaluation.ts`) captures responses, tool invocations, and response latencies into CSV files, and a metrics summary script (`/eval/summarize-results.ts`) computes factual accuracy, hallucination count, and latency differentials between Version A and Version B. 

Finally, a complete documentation suite—comprising the master repository `README.md`, `docs/architecture.md` (with Mermaid diagrams), and `/eval/README.md`—is created to document project architecture, local setup, Gemini Live mechanics, tool calling, grounding hierarchies, evaluation methodology, and privacy guardrails for academic grading.

---

## Technical Context

**Language/Version**: TypeScript 5.4+, Node.js 20 LTS  
**Primary Dependencies**: `dotenv`, `@google/genai` (reusing backend dependency for model generation and tool execution), `csv-parse` / native CSV parsers  
**Storage**: RFC 4180 compliant CSV files with UTF-8 BOM encoding (`/eval/questions.csv`, `/eval/results.csv`, `/eval/summary.md`)  
**Testing**: Dataset schema validation script, runner smoke tests (`npm run eval -- --limit=2`), unit tests for summary metrics calculator, and full 40-question benchmark runs  
**Target Platform**: Node.js runtime across cross-platform environments (Windows PowerShell, macOS, Linux)  
**Project Type**: Evaluation Harness, CLI Tools & Project Documentation Suite (`/eval/`, `docs/`, `README.md`)  
**Performance Goals**: Evaluation runner execution with graceful rate limit backoff; latency recording accuracy to the nearest millisecond; 100% completion of 80 test turns (40 questions $\times$ 2 configurations) without process aborts  
**Constraints**: 
- Prefer the simplest reliable implementation.
- Reuse existing project services (`server/services/knowledge-search.ts`) without duplicating the voice application.
- Never hardcode a guessed Gemini model ID (load dynamically from `.env`).
- Never treat model self-judgments as ground truth.
- Zero audio stored on disk by default (ephemeral memory only).
- Text-only evaluation logging.
- Preserve the AI identity label: `"الشخصية دي ذكاء اصطناعي"`.
- Do not modify working Features 001–006 unnecessarily.  
**Scale/Scope**: Exactly 40 questions, 2 model configurations (80 inference queries total), 7 question categories, master documentation suite  

---

## Constitution Check

*GATE: Pre-research evaluation PASSED. Post-design evaluation PASSED.*

- [x] **Principle I (Technology Stack)**: Uses existing Node.js + TypeScript environment and `@google/genai` SDK. No unauthorized external platforms or heavyweight database daemons introduced.
- [x] **Principle II (System Architecture & Component Decoupling)**: Evaluation harness lives cleanly in `/eval/`, maintaining strict decoupling from frontend UI and 3D rendering. It interacts with backend knowledge services through well-defined service contracts.
- [x] **Principle III (Scientific Accuracy & Grounding Hierarchy)**: Directly measures the grounding hierarchy (Level 1 Local RAG $\to$ Level 2 Google Search $\to$ Level 3 Uncertainty) against ungrounded baseline generation. Ground truth is verified against NASA/ESA citations.
- [x] **Principle IV (Egyptian Arabic Voice Experience & Interactivity)**: Dataset questions are written in authentic Egyptian colloquial Arabic. Persona identity, uncertainty phrasing, and child-safe guardrails are validated.
- [x] **Principle V (Security, Privacy & Ephemeral Data Protection)**: All API credentials remain server-side in `.env`. Audio streams remain 100% ephemeral in memory; evaluation logs strictly capture text, latency, and tool telemetry.
- [x] **Principle VI (Quality Assurance & Evaluation Gates)**: Delivers the mandatory **40-Question Evaluation Dataset** and objective evaluation metrics (accuracy, hallucination count, latency) explicitly required by Principle VI and the Development Workflow Gate.
- [x] **Principle VII (Comprehensive Documentation & Architectural Decisions)**: Delivers the master living architecture documentation, Mermaid sequence and component diagrams, API and tool contracts, and local setup guides.
- [x] **Principle VIII (Strict Scope Enforcement & Staged Delivery)**: Scope strictly restricted to evaluation dataset, dual configuration runner, review workflow, summary reporter, and documentation. No unnecessary dashboards or fine-tuning.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-evaluation/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan (/speckit-plan)
├── research.md          # Phase 0: Technical decisions & research
├── data-model.md        # Phase 1: Entity definitions & review lifecycle
├── quickstart.md        # Phase 1: Runnable verification scenarios
├── contracts/           # Phase 1: Formal protocol & data contracts
│   ├── evaluation-dataset.contract.md
│   ├── evaluation-runner.contract.md
│   ├── evaluation-results.contract.md
│   ├── evaluation-summary.contract.md
│   └── documentation-suite.contract.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout (repository root)

```text
/ (Project Root)
├── README.md                    # Master academic and project documentation
├── package.json                 # Added npm scripts: "eval", "eval:summary", "eval:validate"
├── .env.example                 # Updated environment variables documentation
│
├── eval/                        # Evaluation Harness Package
│   ├── README.md                # Evaluation methodology, scoring rubrics & guide
│   ├── questions.csv            # Standardized 40-question benchmark dataset
│   ├── results.csv              # Raw test outputs & manual review records
│   ├── summary.md               # Generated comparative benchmark report
│   ├── run-evaluation.ts        # Automated dual-configuration runner script
│   ├── summarize-results.ts     # Metrics calculation & summary markdown generator
│   └── validate-dataset.ts      # Schema, count, and category integrity validator
│
├── docs/                        # Dedicated Architectural Documentation
│   ├── architecture.md          # Detailed architecture, component decoupling & Mermaid diagrams
│   └── contracts/               # Consolidated interface and tool contracts
│
├── server/                      # Existing Backend (Features 002-005)
│   ├── services/
│   │   └── knowledge-search.ts  # Reused by Version A for local RAG
│   └── ...
│
└── frontend/                    # Existing Frontend (Features 001, 003, 006)
    └── ...
```

---

## Implementation Phases

### Phase 1 — Review Existing Project
- Inspect codebase and configuration from Features 001–006:
  - Gemini Live session handling and token generation in `server/routes/session.ts`.
  - Local RAG search service in `server/services/knowledge-search.ts` and `knowledge/index.json`.
  - Tool declarations (`search_knowledge`, `googleSearch`, `focus_planet`, `show_fact_card`, `reset_view`).
  - Active environment variables (`.env`, `GEMINI_API_KEY`, `GEMINI_LIVE_MODEL`, `GEMINI_EMBEDDING_MODEL`).
- Ensure no changes to working features are introduced.

### Phase 2 — Create Evaluation Dataset (`/eval/questions.csv`)
- Create `/eval/questions.csv` with exactly 40 space-themed questions across the 7 required categories:
  - **Planets and the Sun**: 10 questions (Jupiter size/composition, Venus greenhouse effect, Sun core fusion, Mercury orbit/temperatures, Mars iron oxide, Saturn rings, Neptune winds, Uranus axial tilt, solar corona, solar wind).
  - **Moons**: 5 questions (Europa subsurface ocean, Titan methane lakes, Ganymede magnetic field, Phobos doomed orbit, Earth's Moon tidal locking).
  - **Space missions**: 7 questions (Apollo 11 date/crew, James Webb Space Telescope L2 orbit/infrared, Voyager 1 interstellar location, Artemis lunar program, Curiosity Mars rover, New Horizons Pluto flyby, International Space Station orbit speed).
  - **Scientific facts and numbers**: 6 questions (speed of light in vacuum, astronomical unit distance, escape velocity from Earth, age of solar system, Sagittarius A* black hole mass, composition of Saturn rings).
  - **Tricky questions**: 4 questions (misconceptions with false premises: hottest planet, landing on Jupiter's surface, zero gravity vs free fall, Moon's dark side sunlight).
  - **Out-of-scope questions**: 4 questions (Egyptian football championship, traditional koshari recipe, local parliamentary elections, stock market trading).
  - **Unanswerable questions**: 4 questions (pre-Big Bang singularity conditions, exact date of Betelgeuse supernova, exact coordinates of intelligent extraterrestrial life, aliens building the Pyramids).
- Implement dataset validator script `/eval/validate-dataset.ts` to assert:
  - Exactly 40 questions.
  - Exactly 5 columns: `id`, `category`, `question`, `expected_answer`, `reference_source`.
  - 100% non-empty fields with valid reference URLs/citations.
  - Proper UTF-8 BOM encoding and RFC 4180 escaping.

### Phase 3 — Prepare Evaluation Configurations
- **Version A (Full Agent)**:
  - Configure the model using `process.env.GEMINI_EVAL_MODEL || process.env.GEMINI_LIVE_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash'`.
  - Attach Egyptian Astronaut system instructions (persona, AI identity disclosure `"الشخصية دي ذكاء اصطناعي"`, fact verification reminder, grounding hierarchy, child safety).
  - Register tools:
    - `search_knowledge`: bound to `server/services/knowledge-search.ts`.
    - `googleSearch`: native Google Search grounding tool `{}`.
    - 3D manipulation tools (`focus_planet`, `show_fact_card`, `reset_view`).
- **Version B (Baseline)**:
  - Use the exact same resolved model.
  - Set `tools: []` (strictly zero tools, zero search grounding).
  - Rely exclusively on internal pre-trained parametric knowledge.

### Phase 4 — Build Evaluation Runner (`/eval/run-evaluation.ts`)
- Implement the CLI runner script `/eval/run-evaluation.ts`:
  - Read `/eval/questions.csv`.
  - Support flags: `--limit=N`, `--config=a|b|both`.
  - Query each question against Version A and Version B.
  - Implement function calling execution loop for Version A: when `search_knowledge` is called, execute vector search in-memory, log the tool call, and supply the tool output back to the model.
  - Measure response latency in milliseconds ($\Delta T = T_{\text{end}} - T_{\text{start}}$).
  - Extract candidate text and detect presence of uncertainty phrasing.
  - Handle rate limits (429) and server overloads (503) with exponential backoff retries.
  - Output results to `/eval/results.csv` with initial status `review_status = "unreviewed"`, `correctness = "unreviewed"`, and `hallucination = "unreviewed"`.

### Phase 5 — Manual Answer Review Protocol
- Define the human-in-the-loop review workflow in `/eval/README.md`:
  - Reviewer inspects each row in `/eval/results.csv`.
  - Compares `response_text` with `expected_answer` and cites `reference_source`.
  - Sets `correctness` to `'correct'` or `'incorrect'`.
  - Sets `hallucination` to `'yes'`, `'no'`, or `'n/a'`.
  - Sets `review_status = 'reviewed'`.
  - Adds `reviewer_notes` explaining any identified factual errors or grounding failures.
  - Never allow unreviewed answers to count as correct or incorrect.

### Phase 6 — Generate Evaluation Summary (`/eval/summarize-results.ts`)
- Implement summary calculation script `/eval/summarize-results.ts`:
  - Parse reviewed records from `/eval/results.csv`.
  - Compute:
    - Factual accuracy percentage (Version A vs. Version B).
    - Hallucination count and rate (Version A vs. Version B).
    - Mean and median response latency in milliseconds (Version A vs. Version B).
    - Detailed 7-category comparative matrix.
    - Count of pending unreviewed records.
  - Write output to `/eval/summary.md`.
  - Print a cleanly formatted ASCII table to the terminal.

### Phase 7 — Comprehensive Project Documentation
- **Root `README.md`**:
  - Project title, mission statement, Egyptian astronaut theme.
  - Full feature matrix (Features 001–007).
  - High-level system architecture overview with Mermaid diagram.
  - Step-by-step local installation and startup instructions.
  - Comprehensive environment variables table.
  - Frontend vs. backend responsibilities matrix.
  - Deep-dive on Gemini Live API, streaming, and barge-in audio cancellation.
  - Function calling and agent tool specifications.
  - Grounding hierarchy documentation (Local RAG $\to$ Google Search $\to$ Uncertainty).
  - Evaluation harness instructions and benchmark summary.
  - Ethics, privacy, and child safety compliance statements.
- **`docs/architecture.md`**:
  - In-depth system architecture documentation.
  - Mermaid component topology diagrams.
  - Mermaid sequence diagrams for Gemini Live audio streaming, tool calls, and cancellation.
  - Constitutional compliance verification.
- **`/eval/README.md`**:
  - Evaluation methodology, dataset design rationale, running instructions, and scoring guide.

### Phase 8 — Final Verification & Quality Gates
- Execute verification scenarios from `quickstart.md`:
  1. Dataset integrity check (`npm run eval:validate`).
  2. Runner smoke test (`npm run eval -- --limit=2`).
  3. Full 40-question benchmark execution across both versions.
  4. Manual review verification.
  5. Summary generation (`npm run eval:summary`).
  6. Verify all Mermaid diagrams render cleanly without errors.
  7. Confirm zero audio files on disk (ephemeral audio audit).
  8. Verify Features 001–006 remain fully functional without regressions.

---

## Dependencies & Configuration

### Package Scripts (`package.json`)
```json
{
  "scripts": {
    "eval": "tsx eval/run-evaluation.ts",
    "eval:summary": "tsx eval/summarize-results.ts",
    "eval:validate": "tsx eval/validate-dataset.ts"
  }
}
```

### Environment Variables (`.env`)
```bash
# Server Port
PORT=3001

# Gemini API Key (Strictly server-side)
GEMINI_API_KEY="your-api-key"

# Live Model & Evaluation Model (Dynamic resolution)
GEMINI_LIVE_MODEL="gemini-2.0-flash"
GEMINI_EVAL_MODEL="gemini-2.0-flash"

# Embedding Model for Local RAG
GEMINI_EMBEDDING_MODEL="text-embedding-004"
KNOWLEDGE_RELEVANCE_THRESHOLD=0.65
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Gemini API 429 Rate Limits** during evaluation batch | High | Built-in exponential backoff retry mechanism (1s, 2s, 4s) in `run-evaluation.ts` with controlled pacing between requests. |
| **Arabic text corruption in CSV** when opened in Excel | Medium | Write all CSV files with UTF-8 BOM (`\uFEFF`) and RFC 4180 quotation standard. |
| **Hardcoded model ID drift** across features | High | Centralize model resolution from environment variables (`process.env.GEMINI_EVAL_MODEL \|\| process.env.GEMINI_LIVE_MODEL`). |
| **Automated LLM Judge Hallucination** | Critical | Strict human-in-the-loop review protocol referencing external citations; model self-evaluations are never ground truth. |
| **Audio File Persistence** | Critical | Zero disk recording code in voice session or evaluation pipelines; automated audit script verifies no audio files exist on disk. |

---

## Testing Strategy

1. **Automated Dataset Validation**: `eval/validate-dataset.ts` runs automated assertions on question count, column schema, category distribution, and reference source presence.
2. **Evaluation Runner Smoke Tests**: Tested with `--limit=2` to verify model connectivity, tool loop execution, and latency logging.
3. **Full Benchmark Verification**: Full 40-question run validating that all 80 responses are recorded with zero unhandled exceptions.
4. **Summary Metrics Unit Tests**: Verify that mathematical formulas for accuracy, hallucination count, and average latencies compute accurately.
5. **Documentation Link & Diagram Verification**: Verify all Mermaid diagrams render cleanly and all file links are valid.

---

## Acceptance Criteria

- [ ] Exactly 40 questions stored in `/eval/questions.csv` across the 7 mandatory categories with verified reference sources.
- [ ] Evaluation runner successfully executes Version A (with tools) and Version B (baseline without tools) using the configured Gemini model.
- [ ] Response latency, tool calls, and verbatim answers are recorded for all questions.
- [ ] Results saved in `/eval/results.csv` with explicit unreviewed state prior to human review.
- [ ] Human review workflow correctly attributes correctness and hallucinations against ground truth.
- [ ] Summary report (`/eval/summary.md`) accurately computes accuracy, hallucination count, and latency differentials.
- [ ] Master `README.md` and `docs/architecture.md` comprehensively document the system architecture, quickstart, tool contracts, and evaluation results.
- [ ] Zero audio files are stored on disk; evaluation logs are strictly text-only.
- [ ] AI identity label `"الشخصية دي ذكاء اصطناعي"` and fact verification disclaimers are preserved.
- [ ] Features 001 through 006 continue to function without regressions.

---

## Definition of Completion

Feature 007 is complete when:
1. `/eval/questions.csv` contains exactly 40 verified space questions across all 7 required categories.
2. The evaluation runner executes both Version A and Version B cleanly and outputs structured CSV records.
3. The review process and summary generator output `/eval/summary.md` with accurate comparative metrics.
4. The master `README.md` and `docs/architecture.md` provide complete, university-grade documentation.
5. All verification scenarios in `quickstart.md` pass without errors.
