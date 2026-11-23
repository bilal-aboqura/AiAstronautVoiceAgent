# Contract: Voice Search State & UI Store Protocol

**File**: `specs/005-google-search-grounding/contracts/voice-search-state.contract.md`  
**Purpose**: Define the Zustand store state, actions, and UI events for managing search status feedback.

---

## 1. Store State Schema

```typescript
export type VoiceAgentState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type SearchStage = 'idle' | 'local_kb' | 'web_search';

export interface GroundingSource {
  title: string;
  url: string;
  domain: string;
}

export interface VoiceSearchSlice {
  // State
  isSearching: boolean;
  searchStage: SearchStage;
  searchStatusLabel: string;
  activeSearchQuery: string | null;
  groundingSources: GroundingSource[];
  latestWebQueries: string[];

  // Actions
  startLocalSearch: (query: string) => void;
  startWebSearch: (query?: string) => void;
  finishSearch: (sources?: GroundingSource[], queries?: string[]) => void;
  clearSearch: () => void;
}
```

---

## 2. Arabic Localized Status Labels

| State / Stage | English Meaning | Egyptian Arabic Label (`searchStatusLabel`) |
| :--- | :--- | :--- |
| `local_kb` | Searching local archives | `"بيبحث في السجلات المحلية..."` |
| `web_search` | Searching space web archives | `"بيبحث في السجلات الفضائية..."` |
| `idle` / not searching | Ready / Listening | `""` (or default voice state label) |

---

## 3. State Transitions & Action Contracts

### 3.1 `startLocalSearch(query)`
- Triggered when client receives `toolCall: search_knowledge`.
- `isSearching`: `true`
- `searchStage`: `'local_kb'`
- `searchStatusLabel`: `"بيبحث في السجلات المحلية..."`
- `activeSearchQuery`: `query`

### 3.2 `startWebSearch(query)`
- Triggered when `search_knowledge` returns `no_results` or when `groundingMetadata` web query is detected.
- `isSearching`: `true`
- `searchStage`: `'web_search'`
- `searchStatusLabel`: `"بيبحث في السجلات الفضائية..."`
- `activeSearchQuery`: `query || state.activeSearchQuery`

### 3.3 `finishSearch(sources, queries)`
- Triggered when audio streaming begins (`modelTurn`) or turn completes.
- `isSearching`: `false`
- `searchStage`: `'idle'`
- `searchStatusLabel`: `""`
- `groundingSources`: `sources || state.groundingSources`
- `latestWebQueries`: `queries || state.latestWebQueries`

### 3.4 `clearSearch()`
- Triggered on user barge-in (interruption) or session disconnection.
- Resets all search states to idle and clears active queries.

---

## 4. UI Component Contract: `SearchingIndicator`

- **Visual Appearance**: Subtle pulsing status pill rendered in the voice HUD dock.
- **Icon**: Radar / Satellite dish icon with a gentle blue-amber pulse animation.
- **Label**: Displays `searchStatusLabel` in Cairo font.
- **Non-blocking**: Must not prevent clicking mute/disconnect or orbiting the 3D scene.
- **Latency Budget**: Appears $\le 200\text{ms}$ after search trigger, disappears $\le 200\text{ms}$ upon audio playback start.
