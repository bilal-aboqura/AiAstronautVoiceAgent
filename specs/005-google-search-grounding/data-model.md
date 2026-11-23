# Data Model: Google Search Grounding

**Feature**: `005-google-search-grounding`  
**Date**: 2026-11-23  
**Status**: Completed  

---

## 1. Entity Overview & Relationships

```mermaid
erDiagram
    LiveSessionSetup ||--|{ SessionTool : configures
    SessionTool ||--o| GoogleSearchTool : specifies
    SessionTool ||--o| FunctionDeclarationsTool : specifies
    FunctionDeclarationsTool ||--|{ FunctionDeclaration : defines

    ServerContentPayload ||--o| GroundingMetadata : contains
    ServerContentPayload ||--o| ModelTurn : contains
    GroundingMetadata ||--o{ GroundingChunk : includes
    GroundingChunk ||--o| WebSource : references

    VoiceSearchState ||--o{ ExtractedSource : retains
    VoiceSearchState ||--o{ SearchQueryLog : tracks

    LiveSessionSetup {
        string model
        string responseModalities
        string prebuiltVoice
        string systemInstruction
    }

    GoogleSearchTool {
        object googleSearch
    }

    FunctionDeclaration {
        string name
        string description
        object parameters
    }

    GroundingMetadata {
        string[] webSearchQueries
        object[] groundingChunks
        object[] groundingSupports
        object searchEntryPoint
    }

    WebSource {
        string uri
        string title
        string domain
    }

    VoiceSearchState {
        boolean isSearching
        string searchStage
        string activeQuery
        int lastSearchDurationMs
    }
```

---

## 2. Entity Definitions

### 2.1 LiveSessionSetup
Represents the initial configuration frame (`BidiGenerateContentSetup`) transmitted immediately upon establishing the WebSocket connection to Gemini Live.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `model` | `string` | Yes | Model identifier, e.g. `"models/gemini-2.0-flash-exp"`, resolved dynamically from backend. |
| `generationConfig` | `object` | Yes | Controls output modalities (`["AUDIO"]`) and speech voice (`"Aoede"`). |
| `systemInstruction` | `object` | Yes | Persona instructions, grounding rules, and Egyptian colloquial Arabic guidelines. |
| `tools` | `SessionTool[]` | Yes | Array containing both built-in `googleSearch` and custom `functionDeclarations`. |

### 2.2 GroundingMetadata (Server Content Inbound)
Represents the grounding information optionally returned in a `serverContent` WebSocket message when the model invokes search grounding.

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `webSearchQueries` | `string[]` | No | Search query strings generated and executed by the model during the turn. |
| `groundingChunks` | `GroundingChunk[]` | No | Web resources, source page titles, and URIs retrieved during grounding. |
| `groundingSupports` | `GroundingSupport[]` | No | Model-generated text segments linked to supporting chunk indices. |
| `searchEntryPoint` | `object` | No | Renderable Google search entry point or container metadata if supplied. |

### 2.3 ExtractedSource
Normalized client-side domain entity representing an external scientific web source extracted from `groundingChunks`.

```typescript
export interface ExtractedSource {
  title: string;
  url: string;
  domain: string;
}
```

### 2.4 VoiceSearchState (Store Entity)
Represents the operational search state managed within `useVoiceStore`.

```typescript
export type SearchStage = 'idle' | 'local_kb' | 'web_search';

export interface VoiceSearchState {
  isSearching: boolean;
  searchStage: SearchStage;
  searchStatusLabel: string;
  activeQuery: string | null;
  groundingSources: ExtractedSource[];
  latestSearchQueries: string[];
}
```

---

## 3. State Machine & Search Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Listening: User connects
    Listening --> Processing: User finishes speaking
    
    Processing --> LocalKBSearch: Factual space question detected
    
    state LocalKBSearch {
        [*] --> SearchingLocal: toolCall: search_knowledge
        SearchingLocal --> LocalMatchFound: matches >= threshold
        SearchingLocal --> LocalNoMatch: matches == 0 or < threshold
    }

    LocalMatchFound --> Speaking: Return curated facts via toolResponse
    LocalNoMatch --> WebSearchGrounding: toolResponse: no_results (authorizes web search)
    
    state WebSearchGrounding {
        [*] --> ExecutingGoogleSearch: Gemini initiates search grounding
        ExecutingGoogleSearch --> WebResultsReceived: serverContent with groundingMetadata
        ExecutingGoogleSearch --> WebSearchEmptyOrFailed: Zero hits or search error
    }

    WebResultsReceived --> Speaking: Grounded speech synthesized in Egyptian Arabic
    WebSearchEmptyOrFailed --> Speaking: Honest uncertainty stated in Egyptian Arabic

    Speaking --> Listening: Turn complete (turnComplete = true)
    
    state InterruptionInterceptors {
        LocalKBSearch --> Listening: Barge-in interruption detected
        WebSearchGrounding --> Listening: Barge-in interruption detected
        Speaking --> Listening: Barge-in interruption detected (<200ms cut-off)
    }

    Listening --> Idle: User disconnects or session ends
```

---

## 4. Grounding Hierarchy Truth Table

| Local Search Result | External Search Result | Spoken Response Behavior | Source Attribution |
| :--- | :--- | :--- | :--- |
| $\ge 1$ match above threshold ($0.65$) | Not executed ($0$ web queries) | Answer synthesized directly from local facts | Curated archive (e.g. NASA / ESA) |
| $0$ matches / below threshold | $\ge 1$ verified web sources | Answer synthesized from web search results | External scientific source & domain |
| $0$ matches / below threshold | $0$ results / search unavailable | Explicit honest uncertainty in Egyptian Arabic | None (admits lack of verified data) |
| Non-factual / 3D navigation command | Not executed | Executes 3D action (`focus_planet`, etc.) | N/A |
