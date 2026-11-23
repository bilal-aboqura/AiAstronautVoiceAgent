# Contract: Gemini Tool Declarations

**Contract ID**: `CTR-TOOL-DECL-001`  
**Version**: `1.0.0`  
**Scope**: Registration of frontend tools in the Gemini Live session initialization payload.

---

## 1. Overview
This contract defines the exact JSON schema for the 3 function declarations registered in `BidiGenerateContentSetup.tools` when initiating a Gemini Live session for the Egyptian Astronaut Voice Agent.

---

## 2. Declarations Schema

```json
[
  {
    "functionDeclarations": [
      {
        "name": "focus_planet",
        "description": "Smoothly animates the 3D camera to focus on and track a specific celestial body in the solar system, and displays its detailed informational card. Call this eagerly as soon as a celestial body is mentioned by the visitor.",
        "parameters": {
          "type": "OBJECT",
          "properties": {
            "name": {
              "type": "STRING",
              "description": "The lowercase English identifier of the celestial body to focus on. Allowed values: 'sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'.",
              "enum": [
                "sun",
                "mercury",
                "venus",
                "earth",
                "moon",
                "mars",
                "jupiter",
                "saturn",
                "uranus",
                "neptune",
                "pluto"
              ]
            }
          },
          "required": ["name"]
        }
      },
      {
        "name": "show_fact_card",
        "description": "Displays a visual information card containing a title and a bulleted list of scientific facts on the screen. Supports both Arabic and English text. Use this when explaining interesting scientific discoveries, comparative metrics, or fun space facts to the visitor.",
        "parameters": {
          "type": "OBJECT",
          "properties": {
            "title": {
              "type": "STRING",
              "description": "Header title of the fact card (e.g., 'حقائق مذهلة عن كوكب المريخ' or 'Key Facts about Jupiter')."
            },
            "facts": {
              "type": "ARRAY",
              "description": "List of factual bullet points to display on the card. Must be verified and non-empty strings.",
              "items": {
                "type": "STRING"
              }
            }
          },
          "required": ["title", "facts"]
        }
      },
      {
        "name": "reset_view",
        "description": "Smoothly returns the 3D camera to the full solar system overview perspective, clears the active celestial body selection, and dismisses any open information or fact cards. Call this when the visitor asks to see the whole solar system, return to overview, or reset the camera view.",
        "parameters": {
          "type": "OBJECT",
          "properties": {}
        }
      }
    ]
  }
]
```

---

## 3. Compatibility Rules
1. **Model Independence**: The schema uses standard JSON Schema primitives (`STRING`, `ARRAY`, `OBJECT`, `enum`) supported across Gemini Live models.
2. **Enum Enforcement**: Specifying the 11 celestial bodies as an `enum` prevents token hallucination during function parameter generation.
3. **No Unrequested Tools**: Tools for RAG retrieval or Google Search are omitted in this milestone.
