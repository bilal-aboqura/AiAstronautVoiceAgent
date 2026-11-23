# Tasks: Feature 007 — Evaluation Harness & Documentation

**Input**: Design documents from `/specs/007-evaluation/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  
**Path Convention**: Root-level evaluation scripts under `eval/`, documentation in `docs/` and `README.md`, and frontend components in `frontend/src/`.

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3], [US4], [US5])
- Setup, Foundational, and Polish phases have NO story label
- User Story phases MUST have their respective story label
- All constrained fields cite `data-model.md (Entity.field)`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, npm script configuration, environment templates, and TypeScript definitions.

- [ ] T001 Configure evaluation package scripts (`eval`, `eval:summary`, `eval:validate`) and dependencies in `package.json`
- [ ] T002 [P] Update environment configuration template with `GEMINI_EVAL_MODEL` and evaluation settings in `.env.example`
- [ ] T003 [P] Implement core TypeScript interfaces and type definitions for dataset questions, execution results, review statuses, and aggregate metrics in `eval/types.ts` citing constrained fields from `data-model.md (EvaluationQuestion.id, EvaluationQuestion.category, EvaluationQuestion.question, EvaluationQuestion.expected_answer, EvaluationQuestion.reference_source, EvaluationResultRecord.question_id, EvaluationResultRecord.category, EvaluationResultRecord.configuration, EvaluationResultRecord.model_id, EvaluationResultRecord.review_status, EvaluationResultRecord.correctness, EvaluationResultRecord.hallucination)`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities for RFC 4180 CSV handling with UTF-8 BOM, dynamic model resolution, and dataset schema validation that MUST be complete before user story execution.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Implement robust CSV parser and serializer utility in `eval/utils/csv-helper.ts` supporting RFC 4180 escaping, multi-line quoted fields, and UTF-8 with BOM (`\uFEFF`) encoding for Arabic text
- [ ] T005 [P] Implement dynamic model and environment configuration resolver in `eval/utils/model-config.ts` resolving `GEMINI_EVAL_MODEL || GEMINI_LIVE_MODEL || GEMINI_MODEL` without hardcoded model strings
- [ ] T006 Implement dataset integrity validator in `eval/validate-dataset.ts` enforcing 40 rows, exact 5-column header, non-empty fields, and strict category distribution per `contracts/evaluation-dataset.contract.md` citing `data-model.md (EvaluationQuestion.id, EvaluationQuestion.category)`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Curated 40-Question Space Science Benchmark Dataset (Priority: P1) 🎯 MVP

**Goal**: Deliver a curated, balanced dataset of exactly 40 space-themed questions in Egyptian Arabic across 7 categories with verified scientific reference sources in `/eval/questions.csv`.

**Independent Test**: Execute `eval/validate-dataset.ts` (or `npm run eval:validate`). The script passes with zero errors, validating exactly 40 questions across all 7 categories with complete reference sources per `quickstart.md (Scenario 1)`.

### Implementation for User Story 1

- [ ] T007 [US1] Create the complete 40-question benchmark dataset in `eval/questions.csv` containing:
  - 10 Planets and the Sun questions
  - 5 Moons questions
  - 7 Space missions questions
  - 6 Scientific facts and numbers questions
  - 4 Tricky questions with false premises
  - 4 Out-of-scope non-space questions
  - 4 Unanswerable questions
  all written in Egyptian Arabic with concise expected answers and authoritative scientific citations (NASA, ESA, IAU) satisfying `contracts/evaluation-dataset.contract.md` and citing `data-model.md (EvaluationQuestion.id, EvaluationQuestion.category, EvaluationQuestion.question, EvaluationQuestion.expected_answer, EvaluationQuestion.reference_source)`.
- [ ] T008 [US1] Run automated dataset verification with `eval/validate-dataset.ts` to confirm 100% compliance with `contracts/evaluation-dataset.contract.md` and `quickstart.md (Scenario 1)` (depends on T007)

**Checkpoint**: User Story 1 (MVP) is complete and independently verifiable. The 40-question benchmark dataset is validated.

---

## Phase 4: User Story 2 - Automated Dual-Configuration Evaluation Execution (Priority: P1)

**Goal**: Deliver an automated execution runner that evaluates all 40 questions against both Version A (Full Agent with local RAG, Google Search grounding, and tools) and Version B (Baseline Gemini model with no tools) using the dynamically resolved model, measuring response latencies and logging tool usage into `/eval/results.csv`.

**Independent Test**: Run a smoke test with `npm run eval -- --limit=2`. Verify that 4 results (2 questions $\times$ 2 configurations) are appended to `/eval/results.csv` with measured latencies, tool call logs, and initial status `review_status = "unreviewed"` per `quickstart.md (Scenario 2)`.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Implement Version A execution engine with local RAG (`search_knowledge`) tool loop and Google Search grounding in `eval/runners/version-a-runner.ts` importing `server/services/knowledge-search.ts` and citing `data-model.md (EvaluationResultRecord.configuration, EvaluationResultRecord.tools_called)`
- [ ] T010 [P] [US2] Implement Version B baseline execution engine without tools or external search in `eval/runners/version-b-runner.ts` citing `data-model.md (EvaluationResultRecord.configuration)`
- [ ] T011 [US2] Implement unified evaluation runner CLI in `eval/run-evaluation.ts` orchestrating question loading, batch/sequential execution, millisecond round-trip latency timing, exponential backoff retries (429/503), uncertainty detection, and results export to `eval/results.csv` satisfying `contracts/evaluation-runner.contract.md` and citing `data-model.md (EvaluationResultRecord.question_id, EvaluationResultRecord.model_id, EvaluationResultRecord.response_text, EvaluationResultRecord.latency_ms, EvaluationResultRecord.uncertainty_detected, EvaluationResultRecord.review_status, EvaluationResultRecord.correctness, EvaluationResultRecord.hallucination)` (depends on T009, T010)
- [ ] T012 [US2] Execute runner smoke test (`npm run eval -- --limit=2`) verifying error-free execution of Version A and Version B and correct CSV schema in `eval/results.csv` per `quickstart.md (Scenario 2)` (depends on T011)

**Checkpoint**: User Story 2 is functional. The evaluation runner can execute queries across both configurations and capture raw responses with full telemetry.

---

## Phase 5: User Story 3 - Human-in-the-Loop Review & Comparative Performance Summary (Priority: P2)

**Goal**: Establish a transparent human-in-the-loop review workflow that scores responses against ground truth without relying on model self-judgment, and generate a comparative summary report (`/eval/summary.md`) comparing Accuracy, Hallucination count, and Latency between Version A and Version B.

**Independent Test**: Fill review markings (`correct`, `incorrect`, `hallucination`) in `eval/results.csv` and run `npm run eval:summary`. Verify that `eval/summary.md` generates with accurate mathematical calculations and terminal output displays the comparison table per `quickstart.md (Scenario 4)`.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Create evaluation review instructions, scoring rubrics, and unreviewed-state isolation rules in `eval/README.md` satisfying `contracts/evaluation-results.contract.md`
- [ ] T014 [P] [US3] Implement summary calculation engine in `eval/utils/metrics-calculator.ts` computing accuracy percentages, hallucination counts, average/median response latencies, and category matrices satisfying `contracts/evaluation-summary.contract.md` and citing `data-model.md (ConfigurationMetrics.accuracy_percent, ConfigurationMetrics.hallucination_count, ConfigurationMetrics.avg_latency_ms, EvaluationSummary.version_a, EvaluationSummary.version_b)`
- [ ] T015 [US3] Implement summary generator script in `eval/summarize-results.ts` reading reviewed records from `eval/results.csv`, calculating metrics via `metrics-calculator.ts`, outputting `/eval/summary.md`, and printing formatted ASCII comparison tables (depends on T014)
- [ ] T016 [US3] Perform human review scoring on evaluation outputs in `eval/results.csv` and generate the final comparative evaluation report in `eval/summary.md` per `quickstart.md (Scenario 4)` (depends on T012, T015)

**Checkpoint**: User Story 3 is complete. Evaluation results are verified by human review and synthesized into a comparative summary report.

---

## Phase 6: User Story 4 - Comprehensive Academic Documentation & Architectural Clarity (Priority: P2)

**Goal**: Deliver a comprehensive, university-grade documentation package—including root `README.md`, `docs/architecture.md` with visual Mermaid diagrams, and `/eval/README.md`—documenting architecture, setup, Gemini Live streaming, function calling, grounding hierarchy, and evaluation findings.

**Independent Test**: Follow the root `README.md` setup instructions on a clean checkout; inspect `docs/architecture.md` in markdown preview to confirm all Mermaid diagrams render cleanly without syntax errors per `quickstart.md (Scenario 5)`.

### Implementation for User Story 4

- [ ] T017 [P] [US4] Create comprehensive architectural documentation with Mermaid component topology and sequence diagrams in `docs/architecture.md` detailing frontend, backend, 3D avatar canvas, Gemini Live streaming, barge-in cancellation, and tool execution contracts per `contracts/documentation-suite.contract.md`
- [ ] T018 [US4] Author the master university-grade `README.md` incorporating executive summary, features 001–007 matrix, setup instructions, environment variables table, frontend vs. backend boundaries, Gemini Live API integration, grounding hierarchy, evaluation findings, and academic grading alignment satisfying `contracts/documentation-suite.contract.md` (depends on T017)

**Checkpoint**: User Story 4 is complete. The system architecture, installation steps, and technical deep-dives are documented.

---

## Phase 7: User Story 5 - Privacy Guardrails, Child Safety & Ethical Disclaimers (Priority: P3)

**Goal**: Enforce ethical transparency and privacy compliance through ephemeral audio handling, text-only evaluation logging, visible evaluation recording notices, AI identity labeling (`"الشخصية دي ذكاء اصطناعي"`), and educational fact-checking disclaimers.

**Independent Test**: Run `eval/audit-privacy.ts`. Verify that zero audio files exist on disk, evaluation records are text-only, and UI components display required AI identity notices per `quickstart.md (Scenario 6)`.

### Implementation for User Story 5

- [ ] T019 [P] [US5] Implement visible evaluation mode notice and scientific fact verification disclaimer in `frontend/src/components/ui/EvaluationNotice.tsx` preserving the AI identity label `"الشخصية دي ذكاء اصطناعي"` and child-safe messaging
- [ ] T020 [US5] Implement automated privacy and storage audit script in `eval/audit-privacy.ts` asserting that zero `.wav`, `.mp3`, or audio files exist in the repository and verifying text-only evaluation logging per `quickstart.md (Scenario 6)`

**Checkpoint**: User Story 5 is complete. Privacy guardrails and ethical disclosures are implemented and validated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification across the entire project, cross-platform path validation, regression checking, and final quality sign-off.

- [ ] T021 [P] Verify cross-platform path resolution and script execution in Windows PowerShell and Node.js environments
- [ ] T022 Run complete 40-question evaluation benchmark (`npm run eval`), complete review scoring, and compile final `/eval/summary.md` via `npm run eval:summary`
- [ ] T023 Execute complete verification walkthrough across all 6 scenarios in `quickstart.md`
- [ ] T024 Perform regression verification confirming that Features 001 through 006 continue to function without errors

---

## Dependencies & Execution Order

### Phase Dependencies

```mermaid
flowchart TD
    Setup[Phase 1: Setup] --> Foundation[Phase 2: Foundational]
    Foundation --> US1[Phase 3: US1 - 40-Question Dataset (MVP)]
    US1 --> US2[Phase 4: US2 - Evaluation Runner]
    US2 --> US3[Phase 5: US3 - Human Review & Summary]
    Foundation --> US4[Phase 6: US4 - Academic Documentation]
    Foundation --> US5[Phase 7: US5 - Privacy & Ethics Guardrails]
    US3 --> Polish[Phase 8: Polish & Cross-Cutting Verification]
    US4 --> Polish
    US5 --> Polish
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2). Delivers the MVP benchmark dataset in `eval/questions.csv`.
- **User Story 2 (P1)**: Depends on US1 (requires `eval/questions.csv`). Delivers automated dual-configuration execution in `eval/run-evaluation.ts`.
- **User Story 3 (P2)**: Depends on US2 (requires raw evaluation results). Delivers human review scoring and `/eval/summary.md`.
- **User Story 4 (P2)**: Can start after Phase 2 (Foundational) and integrates final evaluation findings from US3 into `README.md`.
- **User Story 5 (P3)**: Can run in parallel with US3/US4. Validates zero audio storage and adds UI transparency disclaimers.

---

## Parallel Execution Examples

### Parallel Example: Setup & Foundational (Phase 1 & 2)

```bash
# Launch independent setup tasks in parallel:
Task: T002 Update environment configuration template in .env.example
Task: T003 Implement core TypeScript types in eval/types.ts

# Launch independent foundational tasks in parallel:
Task: T004 Implement CSV parser and serializer utility in eval/utils/csv-helper.ts
Task: T005 Implement dynamic model and environment configuration resolver in eval/utils/model-config.ts
```

### Parallel Example: User Story 2 Runners

```bash
# Launch configuration runners in parallel:
Task: T009 Implement Version A runner in eval/runners/version-a-runner.ts
Task: T010 Implement Version B baseline runner in eval/runners/version-b-runner.ts
```

### Parallel Example: Documentation & UI Notice

```bash
# Launch architectural documentation and UI disclaimer in parallel:
Task: T017 Create in-depth architecture documentation in docs/architecture.md
Task: T019 Implement evaluation mode notice and disclaimer in frontend/src/components/ui/EvaluationNotice.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006)
3. Complete Phase 3: User Story 1 (T007–T008)
4. **STOP and VALIDATE**: Run `npm run eval:validate` to verify the 40-question dataset independently.

### Incremental Delivery

1. **Increment 1 (MVP)**: Curated 40-question space dataset validated with `eval/validate-dataset.ts`.
2. **Increment 2**: Dual configuration runner executing smoke test (`--limit=2`) and full benchmark into `eval/results.csv`.
3. **Increment 3**: Human review scoring and automated summary generation in `eval/summary.md`.
4. **Increment 4**: Complete academic documentation suite (`README.md`, `docs/architecture.md`, `/eval/README.md`).
5. **Increment 5**: Privacy audit script and UI ethical transparency notices.
6. **Increment 6**: Full regression test and quality sign-off.
