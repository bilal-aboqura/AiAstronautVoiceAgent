# Quickstart & Verification Guide: Space Knowledge Base (RAG)

**Feature**: `004-space-knowledge-base`  
**Date**: 2026-11-23  

This guide provides step-by-step instructions for building the curated space knowledge index, verifying the search API independently, and testing grounded voice conversations with the Egyptian Astronaut.

---

## 1. Prerequisites & Environment Configuration

Ensure `.env` contains the required keys:

```bash
# Gemini API Key for ephemeral tokens and embeddings
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Live conversational voice model
GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# Independent embedding model for local RAG
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Knowledge retrieval relevance threshold
KNOWLEDGE_RELEVANCE_THRESHOLD=0.65
```

---

## 2. Phase 1 & 2: Building the Knowledge Index

Run the index builder script to parse all category files in `knowledge/`, validate schemas, compute vector embeddings using `GEMINI_EMBEDDING_MODEL`, and save `knowledge/index.json`:

```bash
# Using npm script or direct ts-node execution
npm run build:knowledge
# Or:
npx ts-node scripts/build-knowledge-index.ts
```

**Expected Console Output**:
```text
[Knowledge Indexer] Scanning directory: ./knowledge
[Knowledge Indexer] Validating category files:
  - sun.json: 8 entries (OK)
  - planets.json: 24 entries (OK)
  - moon.json: 6 entries (OK)
  - pluto.json: 5 entries (OK)
  - missions.json: 12 entries (OK)
  - black-holes.json: 6 entries (OK)
  - iss.json: 6 entries (OK)
[Knowledge Indexer] Total valid entries: 67
[Knowledge Indexer] Computing embeddings with model text-embedding-004...
[Knowledge Indexer] Writing compiled index to knowledge/index.json...
[Knowledge Indexer] Index generated successfully (Size: ~450 KB, Total: 67 entries).
```

---

## 3. Phase 5: Manual REST API Verification

Start the Express backend:

```bash
npm run dev:server
# or
npm run server
```

### Scenario A: Query Sun Science (Arabic)
```bash
curl -X POST http://localhost:3001/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "درجة حرارة سطح الشمس"}'
```
**Expected Response**:
- Status: `200 OK`
- `status`: `"success"`
- `results`: 1+ entries from `sun` category
- `source_name` and `source_url` present
- `relevance_score` $\ge 0.65$

### Scenario B: Query Moon & Apollo Missions (English)
```bash
curl -X POST http://localhost:3001/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "When did Apollo 11 land on the moon?"}'
```
**Expected Response**:
- Status: `200 OK`
- `status`: `"success"`
- Top result: `apollo-11-landing`
- Verifies July 20, 1969 landing date and NASA attribution.

### Scenario C: Out-of-Scope / Alien Question (Testing Zero-Hallucination Threshold)
```bash
curl -X POST http://localhost:3001/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "هل في كائنات فضائية وكائنات خضراء على نبتون؟"}'
```
**Expected Response**:
- Status: `200 OK`
- `status`: `"no_results"`
- `total_matches`: 0
- `results`: `[]`

---

## 4. Phase 6 & 7: End-to-End Voice Conversation Verification

Start the full web application:

```bash
npm run dev
```

1. Open `http://localhost:5173` in a modern browser (Chrome / Edge).
2. Click the microphone icon to connect the voice session. Confirm the Egyptian astronaut greeting ("يا أهلاً بيك يا بطل!").
3. **Test Planet Factual Question**:
   - Ask: *"إيه هي درجة حرارة كوكب الزهرة؟"* (What is the temperature of Venus?)
   - Observe the terminal / console: `search_knowledge` tool call is executed.
   - Listen to response: Astronaut speaks the verified temperature (~465°C / 900°F) in Egyptian Arabic, attributes the data to NASA, and does not invent unverified numbers.
4. **Test Simultaneous 3D Interaction**:
   - Ask: *"وريني كوكب المشتري وقولي إيه حكاية البقعة الحمراء العظيمة؟"* (Show me Jupiter and tell me about the Great Red Spot?)
   - Verify camera smoothly animates and focuses on Jupiter (`focus_planet`).
   - Verify `search_knowledge` is invoked to retrieve the Great Red Spot facts.
   - Astronaut seamlessly talks about the storm while camera tracks Jupiter.
5. **Test Out-of-Scope Uncertainty Admission**:
   - Ask: *"مين بنى القصور اللي تحت جليد بلوتو؟"* (Who built the palaces under Pluto's ice?)
   - Verify `search_knowledge` returns no results.
   - Listen to response: Astronaut honestly admits in warm Egyptian Arabic that current scientific records don't have this information (e.g. *"السجلات العلمية اللي معايا مفهاش أي كلام عن قصور على بلوتو يا بطل، بلوتو مغطى بالجليد فقط"*).
6. **Test Reset**:
   - Say: *"تمام، نرجع للمنظر العام"* (Okay, return to general overview).
   - Camera smoothly returns to the overview perspective (`reset_view`).
