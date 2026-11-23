# Research & Technical Decisions: Google Search Grounding

**Feature**: `005-google-search-grounding`  
**Date**: 2026-11-23  
**Status**: Completed  

---

## 1. Built-in Google Search Grounding Configuration in Gemini Live

### Decision
Configure Gemini's built-in Google Search grounding tool directly in the `BidiGenerateContentSetup` WebSocket handshake message sent from the client at session initialization. Pass `tools` as an array containing both `{ "googleSearch": {} }` (or `{ "google_search": {} }`) and the existing custom `{ "functionDeclarations": [ ... ] }` block.

```json
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "generationConfig": {
      "responseModalities": ["AUDIO"]
    },
    "tools": [
      {
        "googleSearch": {}
      },
      {
        "functionDeclarations": [
          { "name": "search_knowledge", ... },
          { "name": "focus_planet", ... },
          { "name": "show_fact_card", ... },
          { "name": "reset_view", ... }
        ]
      }
    ]
  }
}
```

### Rationale
- **Zero Additional Infrastructure**: Gemini executes Google Search natively on Google's cloud infrastructure without requiring an external search API key (e.g., Custom Search API, SerpAPI), separate billing accounts, or new Express search proxy endpoints.
- **Low Latency Multimodal Streaming**: Web grounding executes seamlessly within the bidirectional audio pipeline, allowing Gemini Live to synthesize real-time voice directly from fresh web data without leaving the WebSocket stream.
- **SDK & Spec Alignment**: Both the official Google Gen AI SDK (`@google/genai`) and the raw Gemini Multimodal Live WebSocket protocol support defining `googleSearch` alongside custom `functionDeclarations` in the initial setup frame.

### Alternatives Considered
- *Custom `web_search` custom function calling an external search API (e.g., SerpAPI, Google Custom Search)*: Rejected because the user prompt and Constitution Principle VIII strictly forbid creating separate search APIs or backend search endpoints when built-in grounding is supported natively.
- *Backend-proxied search pipeline*: Rejected as unnecessary architectural bloat; Gemini Live handles search grounding internally once declared in session setup.

---

## 2. Model & SDK Compatibility Verification

### Decision
Support `gemini-2.0-flash-exp` (default) and `gemini-2.0-flash` dynamically resolved from the server's `GEMINI_LIVE_MODEL` environment variable. Never hardcode model strings in frontend code; the client receives the configured model identifier from the backend `/api/session/token` response.

### Rationale
- **Multimodal Live + Grounding Support**: Both `gemini-2.0-flash-exp` and `gemini-2.0-flash` support bidirectional audio streaming, simultaneous custom function calling, and native Google Search grounding.
- **Configurability**: Exposing `GEMINI_LIVE_MODEL` through server environment variables ensures that when Google stabilizes or updates model versions (e.g., `gemini-2.5-flash`), the application can transition without code changes or frontend rebuilds.
- **Fallback Verification**: If an operator configures an unsupported model or older variant that rejects the `googleSearch` tool in `BidiGenerateContentSetup`, the setup handshake error is caught immediately during connection negotiation and surfaced gracefully in Egyptian Arabic.

### Alternatives Considered
- *Hardcoding `models/gemini-2.0-flash`*: Rejected to satisfy requirement 4 ("Keep GEMINI_LIVE_MODEL configurable. Do not hardcode an assumed model ID").

---

## 3. Grounding Hierarchy Enforcement: Local-First Search with Google Search Fallback

### Decision
Enforce the constitutional grounding hierarchy (Level 1: Curated Local Knowledge $\rightarrow$ Level 2: Google Search Fallback $\rightarrow$ Level 3: Honest Uncertainty) through a two-layer orchestration strategy:

1. **System Prompt & Tool Contract Directives**:
   - The astronaut's system prompt strictly instructs:
     ```text
     قواعد البحث والتأكد من المعلومات العلمية:
     1. لأي سؤال علمي أو فلكي، يجب دائماً وأولاً استدعاء أداة search_knowledge للبحث في السجلات المحلية الموثقة.
     2. إذا رجعت نتائج search_knowledge بمعلومات مطابقة وكافية، أجب منها مباشرة واذكر المصدر (مثل ناسا أو وكالة الفضاء الأوروبية) ولا تقم بالبحث على جوجل.
     3. فقط إذا رجعت search_knowledge بدون نتائج كافية أو بحالة no_results، استخدم حينها البحث على جوجل (Google Search grounding) للحصول على معلومات دقيقة ومحدثة.
     4. لو لم تجد معلومات موثقة في السجلات المحلية ولا على الويب، اعترف بأمانة وبساطة إنك مش متأكد.
     ```
   - The `search_knowledge` tool description explicitly designates it as mandatory-first:
     `"Searches the curated local space science knowledge base. MUST be called first before any other information retrieval for factual space questions."`

2. **Tool Response Guidance Payload**:
   - When `search_knowledge` returns matches ($\ge \text{threshold}$): The tool response delivers structured facts and states: `"status": "success", "instruction": "Curated local records found. Synthesize spoken response directly from these vetted facts without searching external web sources."`
   - When `search_knowledge` returns no matches: The tool response delivers: `"status": "no_results", "instruction": "No verified records in local curated knowledge. You may now search the web using Google Search grounding for recent or non-curated space facts, or admit uncertainty if not verified."`

3. **Orchestration & Verification Safeguards**:
   - Because built-in `googleSearch` is executed autonomously by Gemini on the server side, automated contract tests verify that for known space topics (e.g., "Apollo 11", "Mars atmosphere"), the model issues `toolCall: search_knowledge` and does not generate `webSearchQueries` in its response metadata.
   - For novel topics (e.g., "Latest Starship flight test"), tests verify that `search_knowledge` is called first, receives `no_results`, and subsequent `groundingMetadata` contains executed web queries.

### Alternatives Considered
- *Dynamic Tool Reconfiguration via `send_context_update`*: Evaluated, but current Gemini Live API does not permit adding or removing built-in tools (`googleSearch`) mid-session; built-in tools must be declared in the initial `setup` frame. Therefore, guiding search activation through tool response instructions and prompt hierarchy is the most reliable, standard architecture.

---

## 4. Defensive Parsing of Inbound Grounding Metadata

### Decision
Implement a defensive, schema-tolerant parser for `serverContent.groundingMetadata` in the client's WebSocket message handler (`gemini-live-service.ts`). Extract available citation metadata into a clean domain entity (`GroundingMetadataInfo`), safely handling partial or missing fields across different model versions.

```typescript
export interface GroundingSource {
  title?: string;
  url?: string;
  domain?: string;
}

export interface GroundingMetadataInfo {
  webSearchQueries: string[];
  sources: GroundingSource[];
  searchEntryPointHtml?: string;
}
```

### Parsing Rules:
1. `serverContent.groundingMetadata?.webSearchQueries`: Parse as `string[]` (defaults to empty array `[]`).
2. `serverContent.groundingMetadata?.groundingChunks`: Iterate safely. For each chunk with `web`, extract `chunk.web.title` and `chunk.web.uri`. Derive domain hostname safely using `new URL(uri).hostname`.
3. `serverContent.groundingMetadata?.searchEntryPoint?.renderedContent`: Extract if present for optional attribution display.
4. If `groundingMetadata` is missing, `null`, or undefined, return `null` without throwing errors or interrupting audio playback.

### Rationale
API telemetry indicates that different Gemini model previews return varying combinations of grounding fields (e.g., some return only `webSearchQueries` while others populate full `groundingChunks`). A defensive extractor guarantees zero crashes regardless of payload structure.

---

## 5. UI Search Status & Voice Agent State Integration

### Decision
Extend the voice agent store (`useVoiceStore`) with dedicated search tracking fields:
- `isSearching: boolean`
- `searchStage: 'idle' | 'local_kb' | 'web_search'`
- `groundingSources: GroundingSource[]`
- `latestSearchQueries: string[]`

### Lifecycle & UI Indicators:
1. When a `toolCall` for `search_knowledge` arrives: `isSearching = true`, `searchStage = 'local_kb'`. Voice dock status text updates to `"بيبحث في السجلات المحلية..."`.
2. If `search_knowledge` returns `no_results` and Gemini initiates grounding: `searchStage = 'web_search'`. Voice dock status text displays `"بيبحث في السجلات الفضائية..."` with a subtle pulsing radar/satellite icon.
3. When `modelTurn` with audio chunks arrives: `isSearching = false`, `searchStage = 'idle'`, voice state transitions to `speaking`.
4. On User Interruption (Barge-In): Immediately reset `isSearching = false`, clear audio buffers, and transition voice state back to `listening`.

### Rationale
Provides immediate visual reassurance to the user that the astronaut is looking up information during the 1–3 second search window, while maintaining a smooth, non-intrusive HUD experience.

---

## 6. Error Handling, Resilience & Authentic Persona Preservation

### Decision
Implement robust exception handling at every integration boundary:
- **Search Outage / Timeout**: If search grounding cannot complete or returns an internal error, the client catches the frame error and falls back to Level 3 uncertainty. The astronaut communicates in warm Egyptian Arabic:
  `"السجلات والشبكة الفضائية مش متوفرة دلوقتي يا بطل، نقدر نكمل كلامنا عن كواكب مجموعتنا الشمسية!"`
- **Empty Search Hits**: If search produces zero verified hits, the astronaut states:
  `"بحثت في السجلات وشبكة الفضاء بس مفيش معلومات مؤكدة عن ده حالياً يا بطل."`
- **Zero Hallucination Guarantee**: The agent never fabricates numbers, dates, or scientific sources.
- **Session Preservation**: Search errors NEVER close or reset the active WebSocket session; the conversation continues uninterrupted.
