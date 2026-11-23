# Quickstart & Verification Guide: Google Search Grounding

**Feature**: `005-google-search-grounding`  
**Date**: 2026-11-23  

This guide provides step-by-step instructions to manually verify that the Egyptian Astronaut Voice Agent searches local knowledge first, falls back to Google Search grounding when local records are insufficient, displays the searching indicator, preserves grounding metadata, and admits uncertainty honestly without hallucination.

---

## 1. Prerequisites & Environment Configuration

Ensure your `.env` contains the required keys:

```bash
# Server-side Gemini API Key (NEVER exposed to frontend)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Live conversational voice model (supporting Live WebSocket + Grounding)
GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# Independent embedding model for local RAG
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Knowledge retrieval relevance threshold
KNOWLEDGE_RELEVANCE_THRESHOLD=0.65
```

Build the local knowledge index and start the applications:

```bash
# 1. Build the local space knowledge index
npm run build:knowledge

# 2. Start the Express backend server (default: port 3001)
npm run start:server

# 3. Start the Vite React frontend (default: port 5173)
npm run dev
```

---

## 2. Verification Scenarios

### Scenario 1: Local Knowledge Hit (Curated Space Question)
**Objective**: Verify that questions covered by the local knowledge base are answered immediately from local records with zero external web searches.

1. Open the application in your browser (`http://localhost:5173`).
2. Click the microphone button to start the voice session.
3. Once the astronaut greets you in Egyptian Arabic, ask:
   > *"متى انطلقت رحلة أبولو 11 إلى القمر؟"* (When did Apollo 11 launch to the moon?)  
   > or: *"ما هي درجة حرارة سطح كوكب الزهرة؟"* (What is the surface temperature of Venus?)
4. **Expected Behavior**:
   - The UI briefly shows local searching: `"بيبحث في السجلات المحلية..."`.
   - The frontend tool dispatcher intercepts `toolCall: search_knowledge`.
   - Local search returns high-confidence curated facts ($\ge 0.65$).
   - The astronaut answers directly in warm Egyptian Arabic citing the vetted source (e.g., NASA).
   - **Verification Point**: Inspection of WebSocket frames confirms `webSearchQueries` is NOT triggered; 0 external search queries executed.

---

### Scenario 2: Local Knowledge Miss with Web Search Fallback (Recent / Non-Curated Space Question)
**Objective**: Verify that questions absent from local records seamlessly trigger built-in Google Search grounding.

1. While in the active voice session, ask a recent or non-curated space question:
   > *"إيه آخر أخبار تجارب مركبة ستارشيب الفضائية؟"* (What are the latest news on Starship flight tests?)  
   > or: *"مين هو قائد محطة الفضاء الدولية دلوقتي؟"* (Who is the current commander of the ISS right now?)
2. **Expected Behavior**:
   - `search_knowledge` is invoked first; returns `no_results`.
   - Gemini Live initiates built-in Google Search grounding.
   - The voice dock displays the web searching indicator: `"بيبحث في السجلات الفضائية..."` with the pulsing icon.
   - The astronaut speaks the verified answer in Egyptian Arabic based on retrieved web data.
   - **Verification Point**: WebSocket inspection shows `serverContent.groundingMetadata` containing `webSearchQueries` and source URIs (e.g. `space.com`, `nasa.gov`).

---

### Scenario 3: Unverified / Speculative Space Question (Honest Uncertainty)
**Objective**: Verify that unverified or speculative queries do not produce hallucinations.

1. Ask an unverified speculative question:
   > *"هل توجد كائنات فضائية عايشة على بلوتو؟"* (Are there aliens living on Pluto?)
2. **Expected Behavior**:
   - Local search returns no matches.
   - Google Search grounding returns no scientific confirmation.
   - The astronaut honestly states in Egyptian Arabic that neither local logs nor web archives confirm this:
     *"بحثت في السجلات وشبكة الفضاء بس مفيش معلومات مؤكدة عن كائنات فضائية على بلوتو يا بطل."*
   - Zero fabricated numbers, dates, or citations.

---

### Scenario 4: Searching Indicator Latency & Transitions
**Objective**: Verify smooth HUD state transitions and responsiveness.

1. Ask an external search question.
2. Observe the voice dock status:
   - Within $\le 200\text{ms}$ of search start, the status pill changes to `"بيبحث في السجلات الفضائية..."`.
   - Within $\le 200\text{ms}$ of incoming audio (`modelTurn`), the indicator clears and status returns to `speaking`.
   - The 3D solar system animation does not drop frames or stutter during the search.

---

### Scenario 5: User Interruption (Barge-In) During Search
**Objective**: Verify that user speech cancels active search and speech immediately.

1. Ask a complex question triggering external search.
2. While the indicator shows `"بيبحث في السجلات الفضائية..."` or immediately as the astronaut starts speaking, speak into the mic:
   > *"استنى يا كابتن، وريني المريخ الأول!"* (Wait captain, show me Mars first!)
3. **Expected Behavior**:
   - Audio playback halts immediately ($\le 200\text{ms}$).
   - Searching state clears immediately (`clearSearch()`).
   - The agent transitions to listening and executes the new request (`focus_planet("mars")`).

---

### Scenario 6: Tool Coexistence & Non-Regression
**Objective**: Verify that existing 3D tools (`focus_planet`, `show_fact_card`, `reset_view`) and knowledge search operate alongside search grounding.

1. Speak:
   > *"وريني كوكب المشتري وقولي إيه آخر مهمة فضائية رايحة له؟"* (Show me Jupiter and tell me what the latest mission heading there is?)
2. **Expected Behavior**:
   - Camera animates and focuses on Jupiter in 3D (`focus_planet`).
   - Grounding retrieves latest mission data (e.g., Europa Clipper / JUICE).
   - Both actions complete without race conditions or errors.
