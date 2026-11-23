# Feature Specification: Evaluation Harness & Documentation

**Feature Branch**: `007-evaluation`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Implement Feature 007 (007-evaluation) for the Egyptian Astronaut Voice Agent. Goal: Build a simple and reproducible evaluation system that compares the complete agent against a baseline Gemini model without tools. Document the complete project for university grading. Existing project architecture: Frontend: Vite + React + TypeScript. Backend: Node.js + Express. Voice: Gemini Live API. Local knowledge base: RAG with search_knowledge. Web fallback: Gemini built-in Google Search grounding. 3D: Three.js, React Three Fiber and Drei. Styling: Tailwind CSS. Coding agent: Gemini CLI. Functional requirements: 1. Evaluation dataset: Create exactly 40 test questions covering Planets and the Sun, Moons, Space missions, Scientific facts and numbers, Tricky questions, Out-of-scope questions, Unanswerable questions. Each question must contain: Unique ID, Category, Question text, Expected answer or key facts, Reference source for manual verification. Store the dataset in /eval/questions.csv. 2. Two evaluation configurations: Version A — Full Agent (Same configured Gemini model, Local knowledge base, Google Search grounding, Existing agent tools when relevant); Version B — Baseline (Same Gemini model, No tools, Answers from its own knowledge). Keep the model and test questions consistent. Do not hardcode a guessed model ID. 3. Evaluation runner: Create a simple script to run the questions against both configurations. For every question, record: Answer, Correctness status, with manual review, Appropriate uncertainty admission, Tool usage where applicable, Response latency. Do not automatically treat model-generated correctness judgments as ground truth. 4. Results: Save results as CSV files under /eval. Produce a summary comparing: Accuracy A vs. B, Hallucination count A vs. B, Average response latency A vs. B. Keep unreviewed results distinguishable from incorrect results. Do not fabricate results. 5. Documentation: Create: Main README, Architecture diagram, Architecture explanation, Installation and local setup instructions, Environment variable documentation, Explanation of frontend and backend responsibilities, Gemini Live API integration documentation, Function calling documentation, Knowledge-base and Google Search grounding documentation, Evaluation instructions, Evaluation results and limitations. 6. Ethics and safety: No audio stored by default, Evaluation logs must be text-only, Show a visible notice when evaluation text is recorded, Preserve the AI identity label: 'الشخصية دي ذكاء اصطناعي', Include a disclaimer that facts should be double-checked, Preserve child-safe behavior. Constraints: Prefer the easiest reliable implementation, Do not add unnecessary dependencies, Do not build a complex dashboard, Do not train or fine-tune models, Do not change working Features 001–006 unnecessarily, Keep evaluation reproducible, Do not invent sources or results, Everything should run locally, Follow the original project brief and project constitution. Deliverables: 1. Exactly 40 test questions, 2. Full-agent evaluation configuration, 3. Baseline evaluation configuration, 4. Evaluation runner, 5. CSV results, 6. Comparison summary, 7. Architecture diagram, 8. Complete README."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Curated 40-Question Space Science Benchmark Dataset (Priority: P1)

As an academic evaluator or university grader examining the scientific capability and behavioral boundaries of the Egyptian Astronaut Voice Agent, I want a structured, verified dataset of exactly 40 space-themed questions in Egyptian Arabic covering factual, tricky, out-of-scope, and unanswerable domains, so that I can rigorously, fairly, and repeatedly assess the conversational intelligence, factual reliability, and safety of the system.

**Why this priority**: Without a high-quality, balanced, and verified benchmark dataset, neither model configuration can be measured objectively. The 40 questions form the scientific baseline and empirical foundation for the entire evaluation gate required by the project constitution.

**Independent Test**: Load `/eval/questions.csv` in any standard CSV reader or test script. Verify that it contains exactly 40 rows (plus header), zero empty fields, spans all 7 required categories with balanced representation, presents natural Egyptian Arabic phrasing, defines clear expected facts, and includes verified, credible reference sources for manual verification.

**Acceptance Scenarios**:

1. **Given** the evaluation dataset file at `/eval/questions.csv`, **When** inspected, **Then** it contains exactly 40 unique test questions with the columns `id`, `category`, `question`, `expected_answer`, and `reference_source`.
2. **Given** the 40 test questions, **When** categorized, **Then** they span all 7 mandatory categories:
   - Planets and the Sun
   - Moons
   - Space missions
   - Scientific facts and numbers
   - Tricky questions (common misconceptions or misleading premises)
   - Out-of-scope questions (unrelated subjects such as sports, politics, cooking)
   - Unanswerable questions (future unpredicted events, speculative physics, or cosmological unknowns)
3. **Given** each question row, **When** examined, **Then** the `question` is articulated in natural Egyptian Arabic, `expected_answer` provides concise verifiable ground truth or expected behavioral response, and `reference_source` links to or cites an authoritative scientific source (e.g., NASA, ESA, peer-reviewed planetary tables).
4. **Given** tricky and unanswerable questions, **When** expected answers are specified, **Then** they explicitly mandate appropriate uncertainty admission or correction of false premises rather than fabricated data.

---

### User Story 2 - Automated Dual-Configuration Evaluation Execution (Priority: P1)

As an evaluator testing the impact of external tool augmentation, I want a simple, automated execution script that runs all 40 questions against both Version A (Full Agent with local RAG, Google Search grounding, and interactive tools) and Version B (Baseline Gemini model with no tools using internal knowledge), using the identical configured model without hardcoded assumptions, so that I can cleanly capture side-by-side responses, tool invocations, and response latencies under reproducible local conditions.

**Why this priority**: Automated execution eliminates manual typing fatigue and inconsistency across 80 total query runs (40 questions x 2 versions), ensuring exact repeatability, uniform measurement of latency, and accurate telemetry logging of tool activity.

**Independent Test**: Execute the evaluation runner script locally from the command line. Observe that the runner reads `/eval/questions.csv`, queries Version A and Version B sequentially or in controlled batches, logs model responses, captures active tool invocations, records execution latencies in milliseconds, and outputs raw structured results without throwing errors or requiring GUI interaction.

**Acceptance Scenarios**:

1. **Given** the configured Gemini model environment variable, **When** the evaluation runner executes, **Then** both Version A and Version B query the exact same model identity without hardcoding a guessed model string.
2. **Given** Version A execution, **When** questions are evaluated, **Then** the agent has access to the local space knowledge base (`search_knowledge`), Google Search grounding, and agent tools, invoking them when relevant and logging which tools were called.
3. **Given** Version B execution, **When** questions are evaluated, **Then** the model operates strictly as a baseline without access to tools, knowledge retrieval, or external search, answering solely from pre-trained knowledge.
4. **Given** each query execution, **When** the model completes its response, **Then** the runner records the exact response text, the elapsed round-trip latency (in milliseconds), any tool invocation names/arguments, and flags whether uncertainty cues were detected in the response.
5. **Given** the output file generation, **When** the run finishes, **Then** all raw outputs are saved to CSV files in `/eval` with an initial review status explicitly marked as `unreviewed`.

---

### User Story 3 - Human-in-the-Loop Review & Comparative Performance Summary (Priority: P2)

As a university grader and researcher, I want a transparent evaluation workflow where model responses are manually reviewed against ground truth rather than naively trusting automated LLM judges, clearly distinguishing unreviewed items from incorrect ones, and generating an executive summary comparing Accuracy, Hallucination count, and Latency between Version A and Version B.

**Why this priority**: Fully automated LLM-as-a-judge evaluations frequently suffer from self-preference bias and miss nuanced Arabic hallucinations. A human-in-the-loop review mechanism guarantees academic integrity, satisfies university grading rigor, and ensures results are 100% authentic and verifiable.

**Independent Test**: Open the evaluation results CSV, enter manual review judgments (`correct`, `incorrect`, `hallucination`, `uncertainty_accepted`), and execute the summary generator script or command. Verify that the generated summary report cleanly tallies reviewed items, displays comparative metrics (Accuracy A vs. B, Hallucinations A vs. B, Latency A vs. B), and explicitly warns if unreviewed items remain.

**Acceptance Scenarios**:

1. **Given** evaluation results saved in `/eval`, **When** inspected prior to manual inspection, **Then** every item clearly exhibits an `unreviewed` state and is not counted as correct or incorrect prematurely.
2. **Given** a human reviewer assessing responses against `expected_answer` and `reference_source`, **When** marking a record, **Then** the reviewer can assign standard statuses: `correct`, `incorrect`, `hallucination`, or `uncertainty_accepted` alongside optional reviewer notes.
3. **Given** completed reviews, **When** the summary report is compiled, **Then** it produces an executive comparison report detailing:
   - Overall factual accuracy percentage for Version A vs. Version B.
   - Total hallucination count for Version A vs. Version B.
   - Average and median response latency for Version A vs. Version B.
   - Category-by-category performance breakdowns across all 7 question types.
4. **Given** the generated summary, **When** formatted, **Then** it provides clear markdown and CSV tables that can be directly included in academic presentations and project deliverables.

---

### User Story 4 - Comprehensive Academic Documentation & Architectural Clarity (Priority: P2)

As a university examination committee member, professor, or peer developer, I want a comprehensive, professional project documentation suite—including a master README, high-level and detailed architecture diagrams, clear component responsibility matrices, step-by-step local setup instructions, environment variable references, and in-depth explanations of Gemini Live, tool calling, and grounding hierarchy—so that I can thoroughly understand, run, audit, and evaluate the entire software engineering project.

**Why this priority**: Academic assessment requires comprehensive documentation that articulates architectural decisions, design patterns, separation of concerns, and technical trade-offs. Flawless code without documentation cannot achieve top academic honors.

**Independent Test**: Navigate through the repository documentation starting from the root `README.md`. Follow the setup instructions step-by-step on a fresh checkout; confirm that dependencies install cleanly, environment variables are well-documented, architecture diagrams accurately describe the 3D-voice-backend decoupling, and every functional module (RAG, Search, Live API, 3D HUD) has dedicated technical documentation.

**Acceptance Scenarios**:

1. **Given** the root `README.md`, **When** read by a reviewer, **Then** it presents an executive project overview, key features (001 through 007), system architecture summary, quickstart guide, evaluation summary, and academic grading alignment.
2. **Given** the architecture documentation, **When** examined, **Then** it includes clear visual architecture diagrams (Mermaid format and/or structured schematics) detailing:
   - Frontend presentation tier (Vite + React + Tailwind + Three.js / R3F / Drei).
   - Backend application tier (Node.js + Express, session handling, proxying).
   - Voice streaming pipeline (Gemini Live API, bidirectional audio, barge-in cancellation).
   - Grounding & Tooling layer (Local space knowledge base RAG vs. Google Search fallback vs. 3D scene manipulation).
   - Evaluation harness tier (Runner, dataset, review workflow, metrics reporter).
3. **Given** the component breakdown documentation, **When** evaluated, **Then** it explicitly defines the strict responsibilities and boundaries of frontend vs. backend, proving adherence to constitutional decoupling.
4. **Given** technical deep-dive sections, **When** reviewed, **Then** they document:
   - Gemini Live API integration and low-latency session management.
   - Function calling contracts and parameter validation.
   - Knowledge base embedding and retrieval strategy (`search_knowledge`).
   - Google Search grounding integration and fallback triggers.
   - Step-by-step evaluation harness execution and limitation analysis.

---

### User Story 5 - Privacy Guardrails, Child Safety & Ethical Disclaimers (Priority: P3)

As a student, parent, or educational user interacting with the voice agent or inspecting its logs, I want guaranteed privacy through ephemeral audio handling, explicit text-only evaluation records, prominent AI identity disclosure, and educational fact-checking disclaimers, so that the voice agent operates as a safe, ethical, and trustworthy learning companion.

**Why this priority**: Educational AI systems designed for students and public demonstrations must uphold strict ethical standards, child protection, and privacy compliance. Explicitly disclosing AI identity and avoiding permanent audio storage protects user trust and conforms to global ethical AI guidelines.

**Independent Test**: Inspect the network traffic, disk storage, and UI disclaimers during interactive sessions and evaluation runs. Verify that no raw audio files are written to disk, evaluation logs strictly capture text, a visible recording notice appears during evaluation logging, the UI displays the AI identity badge ("الشخصية دي ذكاء اصطناعي"), and astronomical advice includes a polite fact verification reminder.

**Acceptance Scenarios**:

1. **Given** interactive voice sessions or evaluation runs, **When** audio streams are processed, **Then** audio data is strictly ephemeral in memory and is never written or persisted to local disk or databases.
2. **Given** evaluation execution logging, **When** responses are logged, **Then** logs contain text-only transcripts, latency figures, and tool names with all potential user secrets sanitized.
3. **Given** active evaluation recording or transcript logging, **When** in progress, **Then** the system presents a clear, visible notice stating that textual interaction data is being recorded for academic evaluation.
4. **Given** the user interface and system prompt, **When** the agent introduces itself or responds, **Then** the identity label "الشخصية دي ذكاء اصطناعي" is clearly preserved.
5. **Given** scientific discussions, **When** presented in the UI or documentation, **Then** a transparent disclaimer advises users to verify critical facts with official space agency publications.
6. **Given** inappropriate, unsafe, or non-educational queries, **When** received by the agent, **Then** the agent gracefully defers or deflects with child-safe, polite Egyptian Arabic phrasing.

---

### Edge Cases

- **Missing or Expired API Keys During Evaluation**: When an evaluator runs the evaluation script without setting `GEMINI_API_KEY` (or with an expired key), the runner must abort immediately with a clear, informative error message explaining how to configure the environment variable, without producing corrupt or partial CSV results.
- **Model API Rate Limiting or Transient Network Drops**: If the Gemini API returns a 429 (Rate Limit) or 503 (Overloaded) during an evaluation batch, the runner must implement a polite exponential backoff retry mechanism (up to 3 retries) and log the delay rather than crashing the entire 40-question run.
- **Ambiguous or Semi-Correct Model Responses**: When a model provides an answer that is partially correct but includes a minor factual inaccuracy, the human review protocol must provide clear scoring guidelines (e.g., scoring criteria for `partially_correct` vs. `incorrect` vs. `hallucination`) so that human judgment remains consistent.
- **Language Drift to Modern Standard Arabic (MSA) or English**: If Version B (baseline without system prompt guardrails) responds in English or MSA rather than Egyptian Arabic, the evaluator must record the response as-is while noting the language drift in the qualitative evaluation log.
- **Special Characters and Arabic Text in CSV Exports**: Because Arabic text utilizes UTF-8 and contains commas, quotes, and bidirectional text, all generated CSV files must be encoded in UTF-8 with BOM (or properly escaped RFC 4180 CSV standard) to prevent character corruption when opened in Microsoft Excel or Google Sheets.
- **Out-of-Scope and Adversarial Prompt Injections**: When evaluating out-of-scope questions (e.g., questions asking the agent to write malicious code or comment on sensitive political disputes), Version A must maintain its polite astronaut persona and deflect safely, whereas differences in Version B's response must be systematically recorded.
- **Zero Tool Calls on Factual Space Questions**: If Version A fails to invoke `search_knowledge` or Google Search for a highly specific numerical query and generates an incorrect answer, this must be accurately classified as a grounding failure rather than masked.
- **Evaluation Runner Executed on Windows and POSIX Environments**: All evaluation runner scripts and file path references must use cross-platform compatible path resolution to ensure seamless execution across Windows (PowerShell/Node) and Unix environments.

---

## Requirements *(mandatory)*

### Functional Requirements

#### 1. Evaluation Dataset (`/eval/questions.csv`)
- **FR-001**: The system MUST provide an evaluation dataset file located strictly at `/eval/questions.csv`.
- **FR-002**: The dataset MUST contain exactly 40 space-themed evaluation questions, uniquely indexed from `1` to `40`.
- **FR-003**: The dataset CSV MUST strictly adhere to the following 5-column header schema: `id,category,question,expected_answer,reference_source`.
- **FR-004**: The 40 questions MUST span exactly the following 7 categories with balanced distribution:
  1. `Planets and the Sun`
  2. `Moons`
  3. `Space missions`
  4. `Scientific facts and numbers`
  5. `Tricky questions`
  6. `Out-of-scope questions`
  7. `Unanswerable questions`
- **FR-005**: All question texts MUST be formulated in natural Egyptian Arabic reflecting authentic conversational phrasing.
- **FR-006**: Every question row MUST include a concise `expected_answer` specifying verified ground-truth facts or appropriate behavioral deflection/uncertainty guidance.
- **FR-007**: Every question row MUST cite an authoritative, verifiable scientific or institutional `reference_source` (e.g., NASA Planetary Fact Sheet, ESA Science Archives, IAU nomenclature).

#### 2. Dual Evaluation Configurations (Version A vs. Version B)
- **FR-008**: The system MUST implement **Version A (Full Agent)** configuration comprising:
  - The configured production Gemini model.
  - The complete Egyptian astronaut persona and system instructions.
  - The local curated space knowledge base (`search_knowledge`).
  - Google Search grounding integration.
  - Agent tools (including 3D solar system manipulation tools when applicable).
- **FR-009**: The system MUST implement **Version B (Baseline)** configuration comprising:
  - The identical production Gemini model used in Version A.
  - Standard baseline completion without external tools, RAG search, or Google Search grounding.
  - Answering strictly from pre-trained parametric knowledge.
- **FR-010**: The model identifier MUST be loaded dynamically from shared project environment configuration and MUST NOT be hardcoded as an arbitrary or guessed model ID.

#### 3. Evaluation Runner Script
- **FR-011**: The system MUST provide an automated evaluation runner script that can be executed locally from the terminal (e.g., via `npm run eval` or a standalone Node.js/TypeScript script).
- **FR-012**: The evaluation runner MUST process the 40 questions sequentially or in controlled batches through both Version A and Version B configurations under identical test conditions.
- **FR-013**: For every question evaluated across both configurations, the runner MUST record:
  - `question_id`: The ID matching `/eval/questions.csv`.
  - `configuration`: `Version A (Full Agent)` or `Version B (Baseline)`.
  - `response_text`: The full text response generated by the model.
  - `tools_called`: List or string of all tools invoked during response generation (e.g., `search_knowledge`, `google_search`, or `none`).
  - `latency_ms`: Round-trip response latency measured in milliseconds.
  - `uncertainty_detected`: Boolean flag indicating whether the model expressed uncertainty or unanswerability.
  - `review_status`: Initialized to `unreviewed`.
  - `correctness`: Initialized to `unreviewed` (not assumed correct or incorrect).
  - `hallucination`: Initialized to `unreviewed`.
  - `reviewer_notes`: Empty field for human evaluator annotations.
- **FR-014**: The evaluation runner MUST NOT automatically treat model-generated self-evaluations or heuristic text matches as ground truth.
- **FR-015**: The evaluation runner MUST support resilient error handling, logging API errors without corrupting previously recorded results.

#### 4. Results Management & Comparative Summary
- **FR-016**: The system MUST save evaluation run outputs to CSV files under the `/eval` directory (e.g., `/eval/results_version_a.csv`, `/eval/results_version_b.csv`, or combined `/eval/evaluation_results.csv`).
- **FR-017**: All CSV output files MUST be encoded in UTF-8 (with BOM recommended for Windows Excel compatibility) and strictly follow RFC 4180 escaping for multi-line text and Arabic commas.
- **FR-018**: The system MUST provide a summary generator script or command that parses the reviewed evaluation CSVs and outputs a comparative markdown report at `/eval/summary.md`.
- **FR-019**: The summary report MUST quantitatively compare:
  - Factual accuracy percentage (Version A vs. Version B).
  - Total hallucination count and hallucination rate (Version A vs. Version B).
  - Average and median response latency in milliseconds (Version A vs. Version B).
  - Category-by-category breakdown across all 7 question categories.
- **FR-020**: The summary report MUST explicitly count and display any remaining `unreviewed` items, preventing unreviewed questions from being falsely categorized as failures or successes.
- **FR-021**: The system MUST NOT fabricate, mock, or fake evaluation results; all recorded figures MUST derive from actual model execution and recorded human reviews.

#### 5. Comprehensive University Documentation Suite
- **FR-022**: The system MUST provide a comprehensive, well-structured root `README.md` containing:
  - Project title, mission, and Egyptian astronaut theme.
  - Executive summary and feature roadmap (Features 001–007).
  - Visual system architecture diagrams and flow descriptions.
  - Quickstart installation, prerequisites, and local setup guide.
  - Complete environment variable reference table with descriptions and security advice.
  - Clear breakdown of frontend vs. backend responsibilities.
  - Technical deep-dive on Gemini Live API integration, streaming, and barge-in audio cancellation.
  - Function calling / agent tool documentation (schemas, parameters, return types).
  - Knowledge retrieval & Google Search grounding hierarchy documentation.
  - Step-by-step instructions for running the evaluation harness and reviewing results.
  - Summary of evaluation findings, comparative metrics, and identified limitations.
  - Project constitution and academic compliance statements.
- **FR-023**: The documentation MUST include both high-level system architecture diagrams and detailed component sequence diagrams rendered using Mermaid markdown.
- **FR-024**: The documentation MUST explain the architectural decoupling between the voice/AI intelligence layer and the 3D rendering canvas.

#### 6. Ethics, Safety & Privacy Compliance
- **FR-025**: The system MUST NOT record, store, or persist user audio files to local storage or external databases under default operation.
- **FR-026**: Evaluation logs and audit traces MUST remain strictly text-only, with no raw audio recordings preserved.
- **FR-027**: The system MUST display a clear, prominent visual notice in the UI whenever evaluation logging or text recording is active.
- **FR-028**: The system MUST prominently display and maintain the AI persona identity disclosure label: "الشخصية دي ذكاء اصطناعي" (This character is artificial intelligence).
- **FR-029**: The system MUST display a visible disclaimer stating that scientific information should be double-checked with official scientific references.
- **FR-030**: The agent persona and system prompts MUST strictly maintain child-safe, educational, and respectful conversational boundaries, deflecting harmful or inappropriate prompts.

---

### Key Entities *(include if feature involves data)*

- **EvaluationQuestion**: Represents a curated benchmark question.
  - `id`: Unique sequential integer identifier (1 to 40).
  - `category`: One of the 7 designated space domains.
  - `question`: Natural Egyptian Arabic prompt text.
  - `expected_answer`: Authoritative ground truth or required behavioral deflection.
  - `reference_source`: Published scientific citation or reference URL for manual verification.

- **EvaluationResult**: Represents a single execution of a benchmark question against a specific configuration.
  - `question_id`: Reference to the evaluated `EvaluationQuestion`.
  - `configuration`: Target setup (`Version A (Full Agent)` vs. `Version B (Baseline)`).
  - `model_id`: Actual Gemini model identifier used.
  - `response_text`: Verbatim response produced by the model.
  - `tools_called`: List of tool names triggered during generation.
  - `latency_ms`: Measured round-trip response time in milliseconds.
  - `uncertainty_detected`: Boolean indicating if uncertainty language was identified.
  - `review_status`: State of human validation (`unreviewed`, `reviewed`).
  - `judgment`: Evaluator scoring (`correct`, `incorrect`, `hallucination`, `uncertainty_accepted`).
  - `reviewer_notes`: Optional qualitative feedback from the human reviewer.

- **EvaluationSummary**: Represents the aggregate comparative analysis between Version A and Version B.
  - `total_questions`: 40.
  - `evaluated_count`: Total evaluated items per version.
  - `reviewed_count`: Number of items confirmed by a human reviewer.
  - `accuracy_rate_a` / `accuracy_rate_b`: Percentage of correct answers.
  - `hallucination_count_a` / `hallucination_count_b`: Count of factually fabricated responses.
  - `avg_latency_ms_a` / `avg_latency_ms_b`: Mean response latency.
  - `category_metrics`: Multi-dimensional breakdown table per category.

- **SystemDocumentation**: The collection of grading documentation artifacts.
  - `README.md`: The primary project entry point and academic overview.
  - `architecture_diagrams`: Mermaid sequence and component architecture diagrams.
  - `eval_instructions`: Reproducible evaluation guide.
  - `eval_summary`: Formal comparative benchmark report.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Exactly 40 test questions are created and stored at `/eval/questions.csv` covering all 7 designated categories with 100% of rows containing verified external scientific reference sources.
- **SC-002**: The evaluation runner successfully executes both Version A and Version B across all 40 questions (80 total inference queries) without crashes, capturing 100% of responses, tool calls, and latency measurements.
- **SC-003**: 100% of generated evaluation result records clearly distinguish between reviewed and unreviewed statuses, guaranteeing zero fabricated or automated pseudo-ground-truth judgments.
- **SC-004**: The comparative summary report calculates accuracy, hallucination count, and latency differentials between Version A and Version B from reviewed human evaluations with 100% mathematical precision.
- **SC-005**: Version A demonstrates a measurable reduction in hallucination count compared to Version B on tricky and numerical questions due to local RAG and Google Search tool grounding.
- **SC-006**: 100% compliance with privacy and safety constraints: zero audio files are created on disk, evaluation logs are strictly text-only, and the AI identity label ("الشخصية دي ذكاء اصطناعي") is prominently displayed.
- **SC-007**: An independent university grader or developer can follow the README instructions from a fresh repository clone and complete local installation, launch both frontend and backend, and initiate the evaluation runner in under 15 minutes.
- **SC-008**: 100% of Features 001 through 006 continue to function without regressions or broken contracts.

---

## Assumptions

- **Target Audience & Academic Context**: The documentation and evaluation outputs are prepared for university professors, grading committees, and software engineering evaluators who appreciate both theoretical rigor (architecture, decoupling, grounding hierarchies) and empirical verification (benchmarking, latency analysis, error analysis).
- **Execution Environment**: Evaluation scripts are designed to execute locally in a Node.js / TypeScript environment with active internet connectivity to reach the Gemini API and Google Search services.
- **Model Consistency**: Both Version A and Version B will query the exact same Gemini model specified in the project's `.env` configuration (e.g., `gemini-2.0-flash` or the project's configured model), preventing cross-model variance from invalidating the benchmark.
- **Single-Turn Evaluation Design**: To ensure strict scientific reproducibility across the 40 questions, the evaluation runner operates on standalone single-turn queries per question rather than open-ended multi-turn dialogs.
- **Human Review Authority**: In accordance with academic honesty principles, human evaluation is the supreme ground truth for correctness and hallucination scoring; automated tools assist only in measurement (latency, tool tracking, text capture).
- **No Heavyweight Dependencies**: The evaluation harness avoids complex external database systems or heavy web dashboards; standard CSV files, lightweight CLI scripts, and clean Markdown reports provide maximum transparency and zero setup friction.
