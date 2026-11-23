# Contract: Gemini Live Tool Protocol

**Contract ID**: `CTR-TOOL-PROTO-002`  
**Version**: `1.0.0`  
**Scope**: Inbound and outbound WebSocket message formats for function calling during an active Gemini Live session.

---

## 1. Inbound Tool Call Message (`toolCall`)

When Gemini Live determines a tool should be executed, it sends a WebSocket frame with `toolCall`:

```json
{
  "toolCall": {
    "functionCalls": [
      {
        "id": "call_1234567890abcdef",
        "name": "focus_planet",
        "args": {
          "name": "saturn"
        }
      }
    ]
  }
}
```

### Multiple Tool Calls in Single Frame
Gemini may occasionally batch related tool calls in a single message (e.g. focusing a planet and displaying its fact card simultaneously):

```json
{
  "toolCall": {
    "functionCalls": [
      {
        "id": "call_001",
        "name": "focus_planet",
        "args": { "name": "mars" }
      },
      {
        "id": "call_002",
        "name": "show_fact_card",
        "args": {
          "title": "معلومات عن الكوكب الأحمر",
          "facts": [
            "يومه أطول من يوم الأرض بـ 37 دقيقة فقط",
            "فيه أكبر بركان في المجموعة الشمسية: جبل أوليمبوس"
          ]
        }
      }
    ]
  }
}
```

---

## 2. Outbound Tool Response Message (`toolResponse`)

The client MUST respond for **every** received `functionCall` matching its `id` and `name`:

### Success Response Format
```json
{
  "toolResponse": {
    "functionResponses": [
      {
        "id": "call_1234567890abcdef",
        "name": "focus_planet",
        "response": {
          "result": {
            "status": "success",
            "message": "Camera smoothly focusing on saturn. Planetary info card displayed.",
            "data": {
              "planet": "saturn",
              "cameraMode": "focused"
            }
          }
        }
      }
    ]
  }
}
```

### Error Response Format
If validation fails (e.g. unsupported name or empty title), the client returns a structured error:

```json
{
  "toolResponse": {
    "functionResponses": [
      {
        "id": "call_bad_arg",
        "name": "focus_planet",
        "response": {
          "result": {
            "status": "error",
            "message": "Celestial body 'krypton' is not recognized. Supported bodies: sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, pluto."
          }
        }
      }
    ]
  }
}
```

---

## 3. Timing and Conversational Continuity Rules
1. **Immediate Execution**: Frontend tool handlers MUST execute synchronously or return within $< 100\text{ms}$ to ensure the `toolResponse` reaches Gemini without latency spikes.
2. **Non-Blocking Camera**: Camera transitions run on requestAnimationFrame/`useFrame` independently; the tool response is returned immediately upon initiating the animation.
3. **Session Continuity**: Tool failures MUST return status `"error"` in `toolResponse` and NEVER close the WebSocket or stop audio streaming.
