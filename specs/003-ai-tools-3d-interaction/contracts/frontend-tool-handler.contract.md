# Contract: Frontend Tool Handler

**Contract ID**: `CTR-TOOL-HANDLER-003`  
**Version**: `1.0.0`  
**Location**: `frontend/src/services/agent-tools.ts`  
**Scope**: Client-side dispatch, validation, and execution of agent tools.

---

## 1. Overview
`agent-tools.ts` is the central gateway on the frontend that receives raw tool calls from `GeminiLiveService`, validates their arguments, mutates application state via `useSolarSystemStore`, and returns structured execution results.

---

## 2. Interface Definitions

```typescript
export interface ToolCallPayload {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolExecutionResult {
  status: 'success' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export interface ToolResponsePayload {
  id: string;
  name: string;
  response: {
    result: ToolExecutionResult;
  };
}

export interface IAgentToolService {
  executeToolCall(call: ToolCallPayload): Promise<ToolResponsePayload>;
  executeBatch(calls: ToolCallPayload[]): Promise<ToolResponsePayload[]>;
  isSupportedTool(name: string): boolean;
}
```

---

## 3. Function Implementations & Side Effects

### 1. `focus_planet(args: { name: string })`
- **Validation**:
  - `name` must be a string.
  - Normalized `name.trim().toLowerCase()` must belong to `SUPPORTED_CELESTIAL_BODIES`.
- **Side Effects**:
  - Calls `useSolarSystemStore.getState().selectPlanet(normalizedName)`.
  - Sets `useSolarSystemStore.getState().openInfoCard(normalizedName)`.
- **Return on Success**:
  ```typescript
  {
    status: 'success',
    message: `Camera smoothly focused on ${normalizedName} and info card opened.`,
    data: { planet: normalizedName }
  }
  ```

### 2. `show_fact_card(args: { title: string; facts: string[] })`
- **Validation**:
  - `title` must be a non-empty string.
  - `facts` must be an array of length $\ge 1$, with each item a non-empty string.
- **Side Effects**:
  - Detects text direction (`rtl` if Arabic detected, else `ltr`).
  - Calls `useSolarSystemStore.getState().setFactCard({ title, facts, direction, isVisible: true })`.
- **Return on Success**:
  ```typescript
  {
    status: 'success',
    message: `Fact card '${title}' with ${facts.length} facts displayed on screen.`,
    data: { title, factCount: facts.length }
  }
  ```

### 3. `reset_view()`
- **Validation**:
  - No arguments required; extra arguments ignored.
- **Side Effects**:
  - Calls `useSolarSystemStore.getState().resetView()`.
  - Calls `useSolarSystemStore.getState().closeAllCards()`.
- **Return on Success**:
  ```typescript
  {
    status: 'success',
    message: 'Camera reset to solar system overview. All active cards dismissed.',
    data: { cameraMode: 'overview' }
  }
  ```

---

## 4. Error Isolation
- Unknown tool names return `{ status: 'error', message: 'Unknown tool: [name]' }`.
- Validation errors return `{ status: 'error', message: '[specific validation issue]' }`.
- Under no circumstance does `executeToolCall` throw an uncaught error.
