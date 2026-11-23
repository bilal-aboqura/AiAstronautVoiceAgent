<!--
SYNC IMPACT REPORT
==================
- Version change: Unratified Scaffold (0.0.0) -> 1.0.0
- List of modified principles:
  * [PRINCIPLE_1_NAME] -> I. Technology Stack
  * [PRINCIPLE_2_NAME] -> II. System Architecture & Component Decoupling
  * [PRINCIPLE_3_NAME] -> III. Scientific Accuracy & Grounding Hierarchy
  * [PRINCIPLE_4_NAME] -> IV. Egyptian Arabic Voice Experience & Real-Time Interactivity
  * [PRINCIPLE_5_NAME] -> V. Security, Privacy & Ephemeral Data Protection
- Added sections:
  * Core Principle: VI. Quality Assurance & Evaluation Gates
  * Core Principle: VII. System Documentation & Architectural Decisions
  * Core Principle: VIII. Strict Scope Enforcement & Staged Delivery
  * Section: Operational & Architectural Constraints
  * Section: Development Workflow & Quality Gates
- Removed sections:
  * None (scaffold placeholder structure populated with domain-specific governance rules).
- Follow-up Decisions & Potential Contradictions Identified:
  * Gemini Live API connection topology (client direct via ephemeral token vs. backend WebSocket relay).
  * Knowledge retrieval orchestration (Gemini Live function calling vs. pre-retrieval pipeline).
  * Curated space knowledge base storage engine and local embedding selection.
  * Audio buffer cancellation and synchronized Arabic caption alignment protocol.
  * 40-question evaluation dataset storage format, path, and latency metric thresholds.
  * Formal repository location and approval sign-off for the original project brief.
-->

# Egyptian Astronaut Voice Agent Constitution

## Core Principles

### I. Technology Stack
The Egyptian Astronaut Voice Agent MUST strictly adhere to the designated technology stack across all tiers:
- **Frontend Core**: Vite, React, and TypeScript. All client code MUST be strongly typed with no arbitrary `any` escapes.
- **3D Visualization**: Three.js, `@react-three/fiber` (R3F), and `@react-three/drei` for rendering the 3D astronaut avatar and immersive space scene.
- **Styling**: Tailwind CSS for UI layout, HUD components, responsive design, and caption styling.
- **Backend Application**: Node.js and Express for backend services, session initialization, API routing, and agent tooling.
- **Voice Intelligence**: Gemini Live API for low-latency bidirectional audio streaming and conversation.
- **Web Search**: Google Search tool integration for real-time external information retrieval.
- **Knowledge Retrieval**: Retrieval-Augmented Generation (RAG) powered by a locally managed, curated space knowledge base.

*Rationale*: Standardizing this stack ensures type safety, high rendering performance, robust audio streaming, and deterministic dependency boundaries.

### II. System Architecture & Component Decoupling
The system MUST enforce strict separation of concerns across presentation, business logic, voice streaming, and data retrieval:
- **Client-Server Separation**: The frontend and backend MUST operate as separate, independently deployable applications communicating over well-defined APIs and WebSocket connections.
- **Modular Components**: Frontend UI, 3D scene elements, audio handlers, and backend services MUST be broken down into cohesive, single-responsibility modules.
- **Explicit Contracts**: All communication interfaces—including REST endpoints, WebSocket event payloads, and Gemini tool calling parameters—MUST have formal, documented schemas.
- **Decoupled Voice and 3D Systems**: The voice-provider integration (audio streaming, speech recognition, speech generation, and cancellation) MUST remain completely independent of the 3D rendering pipeline. The 3D avatar MUST consume voice and animation states strictly via an abstract event/state interface (e.g., viseme/phoneme events, speech state flags) without direct dependencies on the voice provider SDK.
- **Decoupled Knowledge Retrieval and Web Search**: Local RAG knowledge retrieval and Google Search MUST operate as distinct subsystems with separate retrieval contracts.

*Rationale*: Decoupling prevents audio latency or SDK changes from breaking 3D rendering and enables independent testing of graphics, voice, and information retrieval.

### III. Scientific Accuracy & Grounding Hierarchy
The Egyptian Astronaut Voice Agent serves as an authoritative space science guide. Accuracy is paramount and non-negotiable:
- **No Hallucination or Fabrication**: The agent MUST NOT invent astronomical facts, missions, physical constants, celestial coordinates, or numerical metrics.
- **Grounding Hierarchy**: For any factual space query, the agent MUST query the curated local space knowledge base first.
- **Search Fallback**: Google Search MUST be invoked only when local curated knowledge is absent, insufficient, or requires current real-time data.
- **Source Attribution**: All factual statements derived from retrieval MUST maintain source attribution (referencing the local curation entry or web source domain).
- **Honest Uncertainty Communication**: When information is unavailable, incomplete, or unverified across both local knowledge and search, the agent MUST explicitly and honestly communicate uncertainty in Egyptian Arabic rather than attempting an ungrounded guess.

*Rationale*: Scientific credibility requires strict adherence to verified facts, prioritized local domain knowledge, and transparent disclosure of knowledge boundaries.

### IV. Egyptian Arabic Voice Experience & Real-Time Interactivity
The user interaction MUST feel authentic, responsive, and natural:
- **Authentic Egyptian Colloquial Arabic**: The agent MUST communicate in natural Egyptian colloquial Arabic (العامية المصرية), embodying the warm, curious, and witty persona of an Egyptian astronaut while correctly pronouncing and articulating scientific terminology.
- **Real-Time Bidirectional Audio**: Audio capture, transmission, and synthesized voice playback MUST operate with low latency suitable for conversational back-and-forth.
- **Interruption and Immediate Cancellation (Barge-In)**: When the user speaks while the agent is speaking, the agent MUST immediately halt audio playback, clear pending audio buffers, reset active animations, and cancel downstream generation.
- **Synchronized Captions**: Visible text captions MUST be synchronized with the spoken audio stream, displaying real-time transcribed dialogue and tool status.
- **Graceful Failure Handling**: If voice services, network streams, or tool calls experience errors, the agent MUST gracefully inform the user in Egyptian Arabic and recover without crashing the session.

*Rationale*: A natural voice agent requires low conversational latency, immediate interruption responsiveness, synchronized accessibility captions, and cultural voice authenticity.

### V. Security, Privacy & Ephemeral Data Protection
User trust, privacy, and system security MUST be protected by design:
- **No Permanent Frontend Secrets**: Permanent API keys (including Gemini API keys and Google Search credentials) MUST NEVER be bundled into or exposed by frontend client code.
- **Short-Lived Authentication**: Access to backend capabilities and Gemini Live sessions MUST utilize short-lived session tokens, ephemeral credentials, or authenticated backend gateway proxies.
- **Ephemeral Audio by Default**: Audio streams MUST NOT be recorded, persisted, or stored on disk or databases by default. Audio processing is purely ephemeral during the active session.
- **Text-Only Evaluation Transcripts**: System monitoring, debugging, and evaluation logs MUST only store sanitized textual transcripts, never raw user audio.
- **Strict Input and Payload Validation**: All incoming backend requests, WebSocket messages, and agent tool invocation arguments MUST be strictly validated against schemas before execution.

*Rationale*: Protecting user privacy and external API quotas requires zero secret leakage on clients, ephemeral voice handling, and strict input validation boundaries.

### VI. Quality Assurance & Evaluation Gates
Every capability delivered MUST be provably verified against quality gates:
- **Mandatory Acceptance Criteria**: Every feature, user story, or task MUST have explicit, verifiable acceptance criteria before development begins.
- **Test Coverage and Verification Instructions**: All pull requests and feature implementations MUST include automated tests (unit, integration, or contract) along with reproducible manual verification instructions.
- **The 40-Question Evaluation Dataset**: The project MUST maintain a standardized 40-question benchmark dataset covering space science, Egyptian colloquial nuance, grounding fallback, uncertainty handling, and out-of-scope boundaries.
- **Objective Evaluation Metrics**: System releases MUST be evaluated against four primary metrics: factual accuracy, hallucination rate (target 0%), uncertainty handling compliance, and end-to-end voice latency.

*Rationale*: Continuous benchmark evaluation prevents regression in conversational quality, domain knowledge accuracy, and real-time responsiveness.

### VII. Comprehensive Documentation & Architectural Decisions
System design and operational knowledge MUST be captured transparently:
- **Living Architecture Documentation**: System architecture diagrams, component interactions, and data flows MUST be documented and kept in sync with the codebase.
- **API and Tool Contracts**: All REST endpoints, WebSocket schemas, and Gemini agent tool definitions MUST be formally documented with request/response specifications.
- **Architectural Decision Records (ADRs)**: Significant architectural choices, technology selections, or trade-offs MUST be documented in persistent ADRs within the repository.
- **Current Setup and Verification Guides**: README, local environment setup instructions, dependency lists, and test runner commands MUST be kept current and functional.

*Rationale*: Clear documentation and recorded decisions prevent architectural drift, reduce onboarding friction, and preserve institutional design memory.

### VIII. Strict Scope Enforcement & Staged Delivery
Development velocity and system stability MUST be protected against scope creep:
- **Brief Alignment**: All work MUST strictly align with the approved original project brief for the Egyptian Astronaut Voice Agent.
- **No Unapproved Features**: Unapproved capabilities (e.g., complex multi-user architectures, extraneous mini-games, unvetted external services) MUST NOT be introduced without explicit governance approval.
- **Simplicity Over Cleverness**: Implementations MUST prioritize simplicity, robustness, and maintainability over speculative abstraction (YAGNI).
- **Independent Staged Delivery**: Development MUST progress in decoupled, independently verifiable stages (e.g., frontend 3D canvas, backend session bridge, Gemini Live audio loop, RAG pipeline, evaluation benchmark) where each stage is validated before subsequent stages proceed.

*Rationale*: Disciplined scope control and staged delivery prevent unbounded complexity and ensure that core astronaut voice capabilities achieve production quality.

## Operational & Architectural Constraints

1. **Client-Backend Contract Boundary**:
   - The frontend communicates with the Node/Express backend for session initialization, configuration, and short-lived credentials.
   - Tool execution for RAG retrieval and Google Search MUST execute through validated backend service boundaries.
2. **Real-Time Latency Budget**:
   - Time-to-first-audio-chunk response from the agent MUST aim for sub-second conversational latency.
   - Speech cancellation and audio playback cut-off MUST execute in less than 200 milliseconds upon detected user interruption.
3. **Grounding Precedence**:
   - Level 1: Locally curated space knowledge base (authoritative for verified space missions, celestial science, and project knowledge).
   - Level 2: Google Search grounding (activated only when Level 1 returns a low confidence match or missing entity).
   - Level 3: Explicit uncertainty admission in Egyptian Arabic (when neither source provides verified facts).
4. **Cultural & Language Consistency**:
   - The agent MUST consistently use authentic Egyptian Arabic phrases (e.g., "أهلاً بيك يا بطل في مركبتنا الفضائية", "ثانية واحدة أشوف السجلات اللي عندي"), avoiding cold literal translations while keeping technical space terms precise.

## Development Workflow & Quality Gates

1. **Feature Specification Gate**:
   - Every new feature MUST specify user scenarios, architectural touchpoints, and measurable acceptance criteria using the Spec Kit workflow (`/speckit-specify`).
2. **Implementation Planning Gate**:
   - Architecture, component contracts, and test strategy MUST be reviewed and approved using `/speckit-plan` before code changes occur.
3. **Execution & Converge Gate**:
   - Tasks must be tracked in dependency order via `/speckit-tasks` and validated using `/speckit-converge` and automated tests.
4. **40-Question Benchmark Gate**:
   - No architectural change to the prompt, Gemini Live configuration, or RAG retriever may be merged without running the 40-question evaluation dataset and verifying that accuracy and latency metrics satisfy quality thresholds.

## Governance

The Egyptian Astronaut Voice Agent Constitution is the supreme design and implementation authority for the project:
1. **Constitutional Precedence**: This constitution supersedes all secondary documentation, pull requests, and informal requirements. Any design or implementation contrary to these principles is invalid.
2. **Amendment Procedure**: Amendments to this constitution require:
   - An explicit proposal detailing the rationale, impact, and affected components.
   - Review and sign-off by project stakeholders.
   - An associated version bump and update to the Sync Impact Report.
3. **Semantic Versioning Policy**:
   - **MAJOR** version bumps (e.g., 1.x.x to 2.0.0) indicate breaking changes to core principles, removal of constraints, or major technology stack shifts.
   - **MINOR** version bumps (e.g., 1.0.0 to 1.1.0) indicate the addition of new principles, quality gates, or materially expanded operational constraints.
   - **PATCH** version bumps (e.g., 1.0.0 to 1.0.1) indicate wording refinements, typo corrections, or clarifications that do not alter governance semantics.
4. **Compliance Verification**: All specifications, plans, code reviews, and automated evaluations MUST verify adherence to this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23
