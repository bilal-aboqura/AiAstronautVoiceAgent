# Research & Technical Decisions: Space Knowledge Base (RAG)

**Feature**: `004-space-knowledge-base`  
**Date**: 2026-11-23  
**Status**: Completed  

---

## 1. Embedding Model Selection & Configuration

### Decision
Use Google's `text-embedding-004` (via the official Google Gen AI SDK `@google/genai` or REST endpoint) configured via the `GEMINI_EMBEDDING_MODEL` environment variable, completely decoupled from `GEMINI_LIVE_MODEL`.

### Rationale
- **Cross-Lingual Capabilities**: `text-embedding-004` produces 768-dimensional normalized embeddings with strong semantic representation across Arabic (Modern Standard & Egyptian colloquial nuances) and English.
- **Provider Consistency**: Reuses the server-side `GEMINI_API_KEY` credential already established for ephemeral token generation without introducing a third-party embedding vendor.
- **Model Decoupling**: In accordance with the constitution and requirements, `GEMINI_EMBEDDING_MODEL` is configured independently from the conversational live model (`GEMINI_LIVE_MODEL`, e.g., `gemini-2.0-flash-exp`).

### Alternatives Considered
- *Local ONNX / Transformers.js (`all-MiniLM-L6-v2`)*: Rejected because multilingual cross-lingual Arabic/English performance on small local models is poor without larger quantized model weights (~500MB+ download), adding unwanted runtime bloat to Node.js.
- *OpenAI `text-embedding-3-small`*: Rejected because it would require a separate external provider, additional API keys, and extra vendor billing.
- *Hardcoding embedding model*: Rejected because model identifiers evolve and require environment variable configuration.

---

## 2. Knowledge Storage & Index Architecture

### Decision
Store curated facts in human-readable category JSON files under `knowledge/` (`sun.json`, `planets.json`, `moon.json`, `pluto.json`, `missions.json`, `black-holes.json`, `iss.json`). Use an offline build script (`scripts/build-knowledge-index.ts`) to generate a compiled, pre-computed vector index file (`knowledge/index.json`) containing entries and their 768-float embedding vectors.

### Rationale
- **Simplicity & Zero Database Overhead**: Avoids complex external vector databases (Pinecone, ChromaDB, Qdrant, Milvus) that are overkill for a curated educational corpus (~50–200 entries).
- **Sub-Millisecond Search Speed**: Loading pre-computed embeddings into memory on backend startup enables in-memory vector cosine similarity calculations in $< 5\text{ms}$ per query.
- **Incremental & Cache-Friendly Rebuilding**: The index build script hashes content strings; if an entry has not changed, its embedding does not need to be recomputed, saving API quota and time.

### Alternatives Considered
- *Full Vector Database (e.g., Chroma, Milvus, Weaviate)*: Rejected as a severe violation of Constitution Principle VIII (Simplicity over cleverness, YAGNI). A few hundred curated entries fit in memory easily (< 2MB memory footprint).
- *SQLite with `sqlite-vss` / `sqlite-vec`*: Rejected because compiling native C/C++ extension binaries on Windows/Node adds unnecessary build friction without meaningful performance benefit at this scale.
- *Single monolithic `knowledge.json`*: Rejected because organizing into category files allows cleaner curation, domain review, and modular file maintenance.

---

## 3. Retrieval Algorithm, Similarity Metric & Thresholding

### Decision
Use normalized Dot Product / Cosine Similarity across 768-dimensional float vectors:
$$\text{similarity}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$
Since embeddings from `text-embedding-004` are unit-normalized, cosine similarity equals the dot product. Filter matches using a configurable `KNOWLEDGE_RELEVANCE_THRESHOLD` (default: `0.65`) and top-`K` limit (default: `3`).

### Rationale
- **Deterministic Filtering**: High confidence matches (scores $\ge 0.65$) reliably contain the facts requested. Weak matches ($< 0.65$) are rejected to prevent hallucination or irrelevant trivia from confusing the agent.
- **Top-K Limiting**: Returning 1 to 3 targeted facts ensures Gemini Live receives concise, actionable context within token and conversational latency budgets.
- **Preparation for Feature 005**: When the search returns zero results above threshold (`results: []`), this state explicitly signals that curated local knowledge lacks the answer, cleanly setting up the trigger for Feature 005 (Google Search fallback).

### Alternatives Considered
- *Keyword / BM25 Search alone*: Rejected because users ask questions in varied dialects (Egyptian Arabic, Modern Standard, English, colloquial phrasing) where exact keyword overlap fails.
- *Hybrid BM25 + Vector Search*: Deferred as unnecessary complexity for Phase 1; embedding similarity alone provides strong semantic matching across languages.

---

## 4. Gemini Live Tool Integration Architecture

### Decision
Register `search_knowledge` as a client-side tool declaration in the Gemini Live setup message. When the live session sends a `toolCall` for `search_knowledge(query)`, the frontend dispatches an HTTP POST request to the Express backend endpoint `/api/knowledge/search`, then formats and returns the structured `toolResponse` over the active WebSocket.

### Rationale
- **Harmonizes with Existing Tool Infrastructure**: Feature 003 established the client tool dispatch loop (`agent-tools.ts`). Handling `search_knowledge` through the same mechanism preserves a single unified WebSocket and session state.
- **Keeps Secrets Server-Side**: The frontend never holds the permanent API key or embedding secrets. The Express backend handles query embedding and vector search.
- **Multi-Tool Compatibility**: Gemini Live can issue `search_knowledge` alongside `focus_planet` or `show_fact_card` in sequence or parallel without race conditions or connection tears.

### Alternatives Considered
- *Backend WebSocket Relay for all tool calls*: Rejected because Feature 002 and 003 established a client-side direct WebSocket with ephemeral tokens. Changing connection topology would rewrite working infrastructure and break 3D camera responsiveness.
- *Pre-retrieval pipeline before sending user speech*: Rejected because Gemini Live is a real-time streaming audio API; the model itself decides when a factual query requires tool execution via function calling.

---

## 5. System Prompt & Persona Grounding

### Decision
Inject explicit grounding rules into the Egyptian Astronaut's Gemini Live system instruction:
1. **Always Call `search_knowledge`**: Before answering factual questions about planets, the Sun, Moon, Pluto, space missions, black holes, or the ISS, invoke `search_knowledge`.
2. **Ground strictly in Retrieved Content**: Use retrieved facts and numerical figures. Never invent numbers or dates.
3. **Cite Sources**: Naturally mention the authoritative source (e.g., ناسا, وكالة الفضاء الأوروبية).
4. **Honest Uncertainty**: If no results are returned, honestly state in Egyptian colloquial Arabic that current space logs don't have this record (e.g., "السجلات العلمية اللي معايا مفهاش تفاصيل مؤكدة عن الموضوع ده يا بطل").
5. **Authentic Persona**: Maintain warm, friendly Egyptian Arabic (العامية المصرية) while remaining scientifically rigorous.

### Rationale
Enforces Constitution Principles III (Scientific Accuracy) and IV (Egyptian Arabic Voice Experience) directly within the agent's core decision loop.
