# Contract: Gemini Live `search_knowledge` Tool Protocol

**File**: `specs/004-space-knowledge-base/contracts/gemini-tool-search-knowledge.contract.md`  
**Purpose**: Define the function declaration for `search_knowledge` and the message passing protocol over the Gemini Multimodal Live WebSocket.

---

## 1. Tool Declaration in Live Session Setup

The frontend registers `search_knowledge` in the `tools` array of `BidiGenerateContentSetup` along with existing tools (`focus_planet`, `show_fact_card`, `reset_view`):

```json
{
  "functionDeclarations": [
    {
      "name": "search_knowledge",
      "description": "Searches the curated local space science knowledge base for verified scientific facts, mission histories, celestial metrics, and authoritative sources. MUST be called before answering any factual space question.",
      "parameters": {
        "type": "OBJECT",
        "properties": {
          "query": {
            "type": "STRING",
            "description": "The specific space science topic, planet name, mission, celestial phenomenon, or question to look up (e.g. 'Sun core temperature', 'Apollo 11 landing date', 'Mars atmosphere composition')."
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

---

## 2. Inbound Tool Call Frame (`toolCall`)

When Gemini Live determines it needs factual data, it issues a `toolCall` message containing a `functionCalls` array:

```json
{
  "toolCall": {
    "functionCalls": [
      {
        "id": "call_123456789",
        "name": "search_knowledge",
        "args": {
          "query": "Apollo 11 launch date"
        }
      }
    ]
  }
}
```

---

## 3. Outbound Tool Response Frame (`toolResponse`)

The frontend client intercepts the call, invokes `POST /api/knowledge/search`, formats the outcome, and sends a `toolResponse` frame over the active WebSocket:

### 3.1 Successful Match Response

```json
{
  "toolResponse": {
    "functionResponses": [
      {
        "id": "call_123456789",
        "name": "search_knowledge",
        "response": {
          "output": {
            "status": "success",
            "matches_found": 1,
            "results": [
              {
                "title": "Apollo 11 Milestone",
                "content": "انطلقت مهمة أبولو 11 على متن صاروخ ساتورن 5 في 16 يوليو 1969، وهبطت على سطح القمر في 20 يوليو 1969.",
                "source_name": "NASA History",
                "source_url": "https://www.nasa.gov/mission_pages/apollo/apollo-11.html",
                "relevance_score": 0.89
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 3.2 No-Match Response (Threshold Not Met)

```json
{
  "toolResponse": {
    "functionResponses": [
      {
        "id": "call_123456789",
        "name": "search_knowledge",
        "response": {
          "output": {
            "status": "no_results",
            "matches_found": 0,
            "results": [],
            "instruction": "No verified records found in local curated knowledge. Honestly state in Egyptian colloquial Arabic that current space logs do not have this information. Do NOT invent facts or numbers."
          }
        }
      }
    ]
  }
}
```

### 3.3 Error Response (Network/Backend Failure)

```json
{
  "toolResponse": {
    "functionResponses": [
      {
        "id": "call_123456789",
        "name": "search_knowledge",
        "response": {
          "output": {
            "status": "error",
            "error_message": "Could not connect to the local knowledge base service.",
            "instruction": "Politely inform the user in Egyptian Arabic that space archive communication is temporarily unavailable."
          }
        }
      }
    ]
  }
}
```
