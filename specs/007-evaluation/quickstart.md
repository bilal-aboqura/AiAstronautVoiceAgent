# Quickstart Validation Guide: Feature 007 (Evaluation Harness & Documentation)

**Feature Branch**: `007-evaluation`  
**Date**: 2026-11-23  
**Status**: Completed  
**Spec Reference**: [specs/007-evaluation/spec.md](spec.md)

---

## Overview

This guide provides step-by-step, runnable verification scenarios to validate the implementation of Feature 007:
1. **Benchmark Dataset**: Exactly 40 space questions across 7 categories.
2. **Dual Evaluation Runner**: Automated execution of Version A (Full Agent) vs. Version B (Baseline).
3. **Human Review Workflow**: Authentic scoring against external scientific citations.
4. **Summary Metrics Generator**: Comparative accuracy, hallucination count, and latency analysis.
5. **Academic Documentation Suite**: Complete master README and architecture diagrams.
6. **Privacy & Ethical Audit**: Zero audio persistence and text-only evaluation auditability.

---

## Prerequisites

- Node.js 20 LTS or higher installed.
- Valid Gemini API key configured in `.env`:
  ```bash
  GEMINI_API_KEY="your-gemini-api-key-here"
  GEMINI_LIVE_MODEL="gemini-2.0-flash"
  ```
- Dependencies installed:
  ```bash
  npm install
  ```

---

## Verification Scenarios

### Scenario 1: Evaluation Dataset Integrity Validation

**Goal**: Verify that `/eval/questions.csv` exists, adheres to the RFC 4180 standard, and contains exactly 40 balanced questions with verified references.

1. **Run validation script or terminal check**:
   ```powershell
   # Check row count (1 header + 40 questions = 41 lines)
   (Get-Content eval/questions.csv).Count
   ```
2. **Expected Outcome**:
   - Output displays exactly `41`.
   - Category distribution matches requirements:
     - Planets and the Sun: 10
     - Moons: 5
     - Space missions: 7
     - Scientific facts and numbers: 6
     - Tricky questions: 4
     - Out-of-scope questions: 4
     - Unanswerable questions: 4
   - Header is `id,category,question,expected_answer,reference_source`.
   - All questions are written in natural Egyptian colloquial Arabic.

---

### Scenario 2: Smoke Test Evaluation Runner (Limited Run)

**Goal**: Prove the evaluation runner functions end-to-end against the configured Gemini model on a small sample before running the full benchmark.

1. **Execute limited smoke test**:
   ```bash
   npm run eval -- --limit=2
   ```
2. **Observe Terminal Output**:
   - Resolved model ID is displayed (e.g. `Testing Model: gemini-2.0-flash`).
   - Version A executes with tools (`search_knowledge`, `googleSearch`).
   - Version B executes with zero tools.
   - Response times and tool calls are displayed.
3. **Expected Outcome**:
   - `/eval/results.csv` is created or appended.
   - 4 result rows generated (2 questions $\times$ 2 configurations).
   - Status is initialized to `review_status = "unreviewed"`.

---

### Scenario 3: Full 40-Question Evaluation Execution

**Goal**: Execute all 40 questions across both configurations (80 inferences total) and produce the raw benchmark results.

1. **Execute full evaluation runner**:
   ```bash
   npm run eval
   ```
2. **Expected Outcome**:
   - All 40 questions execute sequentially or in controlled batches.
   - For Version A, queries invoke `search_knowledge` or `googleSearch` when applicable.
   - For Version B, queries answer from parametric weights without tool calls.
   - Transient 429/503 errors (if encountered) are retried with backoff.
   - 80 total records are saved into `/eval/results.csv`.
   - Zero crashes or uncaught exceptions.

---

### Scenario 4: Human-in-the-Loop Review & Summary Metrics Generation

**Goal**: Verify the manual review workflow and summary report generator.

1. **Inspect and edit review judgments**:
   Open `/eval/results.csv` in a spreadsheet editor or text editor. For the evaluated rows:
   - Compare `response_text` against `expected_answer` and `reference_source`.
   - Set `review_status = "reviewed"`.
   - Set `correctness = "correct"` or `"incorrect"`.
   - Set `hallucination = "yes"` or `"no"` (`"n/a"` for out-of-scope).
2. **Execute summary report generator**:
   ```bash
   npm run eval:summary
   ```
3. **Expected Outcome**:
   - Terminal prints a formatted comparative table.
   - File `/eval/summary.md` is generated containing:
     - Accuracy rate: Version A vs. Version B.
     - Hallucination count: Version A vs. Version B.
     - Average response latency: Version A vs. Version B.
     - Detailed category breakdown table.
     - Clear disclosure of any remaining unreviewed questions.

---

### Scenario 5: Documentation & Architecture Diagram Audit

**Goal**: Verify that all university grading documentation deliverables are present, complete, and formatted correctly.

1. **Inspect documentation artifacts**:
   - Root `README.md` exists and covers mission, architecture, setup, env vars, Live API, tools, RAG, and evaluation summary.
   - `docs/architecture.md` exists and contains high-level component diagrams and sequence diagrams in Mermaid syntax.
   - `/eval/README.md` exists and documents evaluation methodology and scoring rubrics.
2. **Verify Mermaid Diagram Rendering**:
   - Open `docs/architecture.md` and `README.md` in markdown preview to confirm all Mermaid diagrams render cleanly without syntax errors.

---

### Scenario 6: Privacy & Ephemeral Audio Compliance Audit

**Goal**: Prove that the application strictly complies with constitutional privacy rules.

1. **Storage Audit**:
   - Verify that running evaluation and voice sessions generates **zero audio files** on disk:
     ```powershell
     Get-ChildItem -Recurse -Include *.wav,*.mp3,*.pcm,*.ogg,*.webm
     ```
   - Must return zero audio recording files.
2. **Text-Only Log Audit**:
   - Inspect `/eval/results.csv` to ensure it contains only text transcripts and latency numbers, with zero audio buffers or binary blobs.
3. **UI Notice & Identity Audit**:
   - Verify the presence of the AI persona identity disclosure: `"الشخصية دي ذكاء اصطناعي"`.
   - Verify the fact verification disclaimer.
