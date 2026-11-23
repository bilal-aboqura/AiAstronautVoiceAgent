# Contract: Documentation Suite Specification

**Feature Branch**: `007-evaluation`  
**Contract Type**: Architectural Documentation & Academic Deliverables Contract  
**Paths**: `README.md`, `docs/architecture.md`, `/eval/README.md`

---

## 1. Master Repository `README.md` Structure

The root `README.md` must serve as the primary submission deliverable for university grading and peer developers. It must strictly contain the following sections:

1. **Project Title & Mission**:
   - "Egyptian Astronaut Voice Agent (رائد الفضاء المصري)".
   - Mission statement, target audience (students, space enthusiasts), cultural voice identity.
2. **Key Capabilities & Feature Progression**:
   - Comprehensive matrix covering Features 001 through 007.
3. **System Architecture Overview**:
   - High-level visual Mermaid diagram illustrating the decoupled system layers.
   - Decoupled client-server architecture: Vite/React/Three.js frontend, Node/Express backend, Gemini Live API streaming, RAG knowledge base, Google Search grounding, evaluation harness.
4. **Prerequisites & Quickstart Guide**:
   - Node.js version requirements (Node 20+ LTS).
   - Step-by-step installation instructions (`npm install`).
   - Starting backend and frontend services (`npm run dev`).
5. **Environment Variable Reference**:
   - Complete table documenting all variables: `PORT`, `GEMINI_API_KEY`, `GEMINI_LIVE_MODEL`, `GEMINI_EMBEDDING_MODEL`, `GEMINI_EVAL_MODEL`, `KNOWLEDGE_RELEVANCE_THRESHOLD`, etc.
   - Clear warning: Permanent API keys must NEVER be exposed in frontend bundles.
6. **Component Responsibilities & Decoupling**:
   - Detailed breakdown of Frontend vs. Backend boundaries.
7. **Gemini Live API Integration & Interactivity**:
   - Bidirectional audio streaming mechanics.
   - Low-latency voice handling and interruption / barge-in cancellation ($< 200\text{ms}$).
8. **Function Calling & Tool Registry**:
   - Complete specification of agent tools: `search_knowledge`, `googleSearch`, `focus_planet`, `show_fact_card`, `reset_view`.
9. **Grounding Hierarchy & RAG Pipeline**:
   - Level 1: Curated local space knowledge base (`search_knowledge`).
   - Level 2: Google Search grounding fallback.
   - Level 3: Honest uncertainty communication in Egyptian Arabic.
10. **Evaluation Benchmark & Findings**:
    - Explanation of the 40-question benchmark.
    - Instructions to reproduce evaluation runs and view `/eval/summary.md`.
    - Factual accuracy, hallucination reduction, and latency findings.
11. **Ethics, Safety & Privacy Compliance**:
    - Ephemeral audio verification (zero audio persisted).
    - Visible recording notification.
    - AI identity disclosure: `"الشخصية دي ذكاء اصطناعي"`.
    - Scientific fact-checking disclaimer.
    - Child-safe behavioral guardrails.
12. **Project Constitution & Academic Grading Alignment**:
    - Mapping of deliverables to course requirements and core principles.

---

## 2. Architecture Diagrams Specification

All architectural diagrams must be rendered using valid GitHub Flavored Markdown Mermaid syntax:
- `flowchart TD` or `graph TD` for component topology.
- `sequenceDiagram` for live audio streaming, barge-in cancellation, and tool execution.

---

## 3. `/eval/README.md` Specification

Dedicated guide within the `/eval` folder detailing:
- Dataset composition and category rationale.
- Instructions to run the evaluation runner (`npm run eval`).
- Instructions to perform manual human-in-the-loop review.
- Instructions to generate the summary report (`npm run eval:summary`).
- Guidelines for spotting hallucinations vs. factual omissions.
