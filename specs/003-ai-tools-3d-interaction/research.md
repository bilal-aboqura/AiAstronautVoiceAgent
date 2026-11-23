# Research: AI Tools & 3D Interaction

**Feature**: `003-ai-tools-3d-interaction`  
**Date**: 2026-11-23  
**Status**: Completed  

---

## 1. Gemini Live Function Calling Protocol & Tool Declaration Schema

### Context & Challenge
The Gemini Multimodal Live API operates over a bidirectional WebSocket (`BidiGenerateContent`). Unlike standard REST endpoints where function calling is request-response based, Gemini Live streams audio and text in real time. We need to:
1. Register tool declarations in the initial `setup` message (`BidiGenerateContentSetup`).
2. Receive asynchronous `toolCall` events from the server during audio generation.
3. Execute the corresponding client-side handlers in the browser without freezing the UI or audio playback.
4. Return a structured `toolResponse` message over the WebSocket with matching invocation IDs.
5. Ensure the Gemini model receives the tool response and continues speaking naturally in Egyptian colloquial Arabic.

### Decision
- **Tool Registration Structure**: Register all 3 function declarations in the `setup.tools` array of `BidiGenerateContentSetup`:
  ```json
  {
    "setup": {
      "model": "models/{GEMINI_LIVE_MODEL}",
      "tools": [
        {
          "functionDeclarations": [
            {
              "name": "focus_planet",
              "description": "Focus the 3D camera smoothly onto a specific celestial body in the solar system and display its information card. Call this immediately when a celestial body is mentioned.",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "name": {
                    "type": "STRING",
                    "description": "The lowercase English identifier of the celestial body to focus on. Allowed values: sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, pluto.",
                    "enum": ["sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
                  }
                },
                "required": ["name"]
              }
            },
            {
              "name": "show_fact_card",
              "description": "Display a visual card showing a title and bulleted list of scientific facts about space or celestial bodies. Supports Arabic and English. Use when explaining interesting facts or metrics.",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "title": {
                    "type": "STRING",
                    "description": "The title of the fact card (e.g., 'حقائق مذهلة عن كوكب المريخ' or 'Mars Key Facts')."
                  },
                  "facts": {
                    "type": "ARRAY",
                    "description": "List of factual bullet points in Arabic or English. Facts must be scientifically accurate.",
                    "items": { "type": "STRING" }
                  }
                },
                "required": ["title", "facts"]
              }
            },
            {
              "name": "reset_view",
              "description": "Reset the 3D camera to the full solar system overview, clear any selected celestial body, and close any active information cards. Call when the user asks to see the whole solar system or reset the view.",
              "parameters": {
                "type": "OBJECT",
                "properties": {}
              }
            }
          ]
        }
      ]
    }
  }
  ```
- **Live Tool Calling Protocol**:
  When Gemini emits a `toolCall`, the payload format is:
  ```json
  {
    "toolCall": {
      "functionCalls": [
        {
          "id": "call_abc123",
          "name": "focus_planet",
          "args": { "name": "earth" }
        }
      ]
    }
  }
  ```
  The client executes the UI function and replies with:
  ```json
  {
    "toolResponse": {
      "functionResponses": [
        {
          "id": "call_abc123",
          "name": "focus_planet",
          "response": {
            "result": { "status": "success", "focused": "earth" }
          }
        }
      ]
    }
  }
  ```
- **Rationale**:
  - Conforms directly to the official Google Gemini Live API bidirectional WebSocket specification.
  - Matches the JSON schema standards required by Gemini Live.
  - Using an explicit `enum` for `focus_planet` guides model token selection while client validation guarantees defensive safety.

---

## 2. Frontend Tool Handler Architecture & State Integration

### Context & Challenge
The system architecture mandates strict decoupling (Constitution Principle II):
- Voice logic cannot import Three.js scene meshes or camera instances directly.
- Feature 001 established `useSolarSystemStore` (Zustand) as the single headless source of truth for 3D selection, camera mode, and overview resets.
- Feature 002 established `GeminiLiveService` and `useVoiceAgent` for audio streaming.
- We need a dedicated service `src/services/agent-tools.ts` that acts as the router and validator between incoming Gemini Live tool calls and the frontend React/Zustand state.

### Decision
- Create `src/services/agent-tools.ts` with a centralized execution engine:
  - `executeToolCall(call: ToolCall): Promise<ToolResponse>`
  - Route `focus_planet` -> calls `useSolarSystemStore.getState().selectPlanet(validatedName)` and sets card state.
  - Route `show_fact_card` -> validates title/facts and updates `useCardStore` (or fact card state in `useSolarSystemStore`).
  - Route `reset_view` -> calls `useSolarSystemStore.getState().resetView()` and dismisses cards.
  - Route unknown tool -> returns structured error `{ status: "error", error: "Unknown tool: {name}" }` without throwing.
- **Rationale**:
  - Keeps the tool handler 100% in the frontend without intermediate Express roundtrips (satisfying architectural constraint).
  - Headless state mutation means Three.js camera controller responds via existing reactive subscriptions (`useFrame` damping).
  - Testable with standard unit and integration tests without mocking WebGL or WebSockets.

---

## 3. Celestial Body Expansion (Adding Pluto)

### Context & Challenge
The user request mandates support for 11 celestial bodies:
`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`.
In Feature 001, the solar system dataset covered Sun, 8 planets, and Earth's Moon. Pluto must now be fully integrated as a selectable celestial body with its own configuration, orbit, texture fallback, and informational data.

### Decision
- Extend `frontend/src/data/planets.ts` to include `pluto`:
  - `id`: `'pluto'`
  - `name`: `'Pluto'`
  - `arabicName`: `'بلوتو'`
  - `type`: `'planet'` (or dwarf planet representation)
  - `radius`: scaled appropriately (smaller than Mercury and Moon)
  - `distance`: outer solar system orbit (beyond Neptune)
  - `orbitalSpeed`: slowest relative orbit
  - `color`: subtle icy-tan/grey fallback (`'#D8C5A8'`)
  - `description`: English and Egyptian Arabic overview highlighting its dwarf planet classification and the New Horizons mission.
- Support `sun`, `moon`, and all planets uniformly in `focus_planet` name normalization:
  - Input is trimmed, lowercased, and mapped (handling common aliases if needed, e.g., "the sun" -> "sun", "the moon" -> "moon").

---

## 4. Multilingual Fact Card UI & RTL/LTR Layout

### Context & Challenge
`show_fact_card(title, facts[])` displays arbitrary factual information provided by the agent. The astronaut speaks in Egyptian Arabic, but may provide English facts or bilingual content. The card must:
- Render cleanly over the 3D canvas with high legibility and contrast.
- Render in Right-to-Left (RTL) mode for Arabic text and Left-to-Right (LTR) for English.
- Avoid overflowing the screen on mobile devices.
- Include a close button and smooth fade/slide transitions.

### Decision
- Auto-detect text direction based on the presence of Arabic characters in the title or first fact string (using regex `[\u0600-\u06FF]`).
- Apply Tailwind utility classes: `dir-rtl text-right font-arabic` for Arabic, `dir-ltr text-left` for English.
- Keep `PlanetInfoCard` and `FactCard` visually cohesive as a glassmorphic floating HUD in the bottom-right or top-right quadrant, styled with Tailwind CSS (`backdrop-blur-md bg-slate-900/80 border border-slate-700/50`).
- Ensure closing the card or resetting the view dismisses the fact card cleanly.

---

## 5. Safe Tool Execution, Error Recovery, and Conversational Continuity

### Context & Challenge
If the agent passes an invalid argument (e.g. `focus_planet("krypton")`) or if an execution error occurs:
- The app must NOT crash or throw an uncaught promise rejection.
- The WebSocket connection must NOT be closed.
- A structured error must be returned in `toolResponse`.
- The Gemini model must receive the error and explain naturally in Egyptian colloquial Arabic (e.g., "الكوكب ده مش موجود عندنا في المجموعة الشمسية يا بطل!").

### Decision
- Wrap all tool execution in a strict `try-catch` boundary.
- Validate every argument using typed validation guards before executing state mutations:
  - `validatePlanetName(name: unknown): { valid: boolean; name?: string; error?: string }`
  - `validateFactCardArgs(args: unknown): { valid: boolean; title?: string; facts?: string[]; error?: string }`
- Return standardized JSON response envelopes:
  - Success: `{ status: "success", message: string, data: any }`
  - Failure: `{ status: "error", message: string }`
- Ensure the prompt instructs the agent:
  - "لو وصلك خطأ من أي أداة (tool failure)، ما تنهيش المكالمة واشرح للمستخدم بلطف وخفة دم بالعامية المصرية إن فيه حاجة مش مضبوطة وكمل كلامك عادي."

---

## Summary of Architectural Decisions

| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Protocol** | Native Gemini Live WebSocket `toolCall` and `toolResponse` | Zero intermediary proxies, lowest latency, official protocol |
| **Tool Declarations** | 3 frontend tools registered in `setup.tools.functionDeclarations` | Cleanly covers all required actions (`focus_planet`, `show_fact_card`, `reset_view`) |
| **Handler Location** | `frontend/src/services/agent-tools.ts` | Frontend-only execution, zero Express endpoints for UI actions |
| **State Integration** | Zustand store (`useSolarSystemStore`) | Decoupled from Three.js scene graph, preserves reactive camera damping |
| **Body Support** | 11 bodies including Sun, Moon, and newly added Pluto | Fully satisfies user specification |
| **UI Presentation** | Responsive Glassmorphic HUD with dynamic RTL/LTR support | High contrast, beautiful space aesthetic, accessible in Arabic and English |
| **Resilience** | Strict runtime schema validation, error response envelopes | Zero session termination on tool error, natural Egyptian Arabic recovery |
