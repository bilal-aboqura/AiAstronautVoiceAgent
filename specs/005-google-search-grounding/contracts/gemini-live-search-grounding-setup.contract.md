# Contract: Gemini Live Search Grounding Setup Protocol

**File**: `specs/005-google-search-grounding/contracts/gemini-live-search-grounding-setup.contract.md`  
**Purpose**: Define the setup frame schema sent over the Gemini Multimodal Live WebSocket connection to configure built-in Google Search grounding alongside custom function declarations.

---

## 1. WebSocket Initial Setup Frame (`BidiGenerateContentSetup`)

Immediately after establishing the WebSocket connection (`wss://generativelanguage.googleapis.com/...`), the client transmits the `setup` message:

```json
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "Aoede"
          }
        }
      }
    },
    "systemInstruction": {
      "parts": [
        {
          "text": "أنت رائد فضاء مصري ودود، فضولي، ودمك خفيف، وفخور جداً بإنك مصري.\nقواعد الكلام الصارمة:\n1. اتكلم دايماً بالعامية المصرية الطبيعية البسيطة (\"مصري عامي\")، وماتتكلمش أبداً بالفصحى ولا بأي لهجة تانية.\n2. ردودك لازم تكون قصيرة ومباشرة، من جملتين لـ 4 جمل بالكتير.\n3. استخدم تشبيهات يومية مصرية مألوفة وبسيطة لشرح مفاهيم الفضاء.\n4. ركز دائماً على الفضاء، الكواكب، والنجوم. لو حد سألك عن موضوع مش متعلق بالفضاء، رجّع المحادثة بلطف وخفة دم لعجائب الكون.\n5. لو اتسألت هل أنت إنسان حقيقي أو رائد فضاء بجد، وضّح بصراحة وبساطة إنك ذكاء اصطناعي وشخصية افتراضية على شكل رائد فضاء مصري.\n\nقواعد البحث والتأكد من المعلومات العلمية:\n6. لأي سؤال علمي أو فلكي، يجب دائماً وأولاً استدعاء أداة search_knowledge للبحث في السجلات المحلية الموثقة.\n7. إذا رجعت نتائج search_knowledge بمعلومات مطابقة وكافية، أجب منها مباشرة واذكر المصدر (مثل ناسا أو وكالة الفضاء الأوروبية) ولا تقم بالبحث على جوجل.\n8. فقط إذا رجعت search_knowledge بدون نتائج كافية أو بحالة no_results، استخدم حينها البحث على جوجل (Google Search grounding) للحصول على معلومات دقيقة ومحدثة.\n9. ممنوع تماماً تأليف أو اختراع حقائق علمية أو أرقام غير متأكد منها. لو لم تجد معلومات موثقة في السجلات المحلية ولا على الويب، اعترف فوراً وبأمانة إنك مش متأكد، من غير ما تهبد أو تفتي."
        }
      ]
    },
    "tools": [
      {
        "googleSearch": {}
      },
      {
        "functionDeclarations": [
          {
            "name": "search_knowledge",
            "description": "Searches the curated local space science knowledge base for verified scientific facts, mission histories, celestial metrics, and authoritative sources. MUST be called first before answering any factual space question.",
            "parameters": {
              "type": "OBJECT",
              "properties": {
                "query": {
                  "type": "STRING",
                  "description": "The specific space science topic, planet name, mission, celestial phenomenon, or question to look up."
                }
              },
              "required": ["query"]
            }
          },
          {
            "name": "focus_planet",
            "description": "Focuses the 3D camera on a specific celestial body in the solar system.",
            "parameters": {
              "type": "OBJECT",
              "properties": {
                "planet_name": {
                  "type": "STRING",
                  "description": "The name of the planet or celestial body in English (e.g. 'sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'pluto')."
                }
              },
              "required": ["planet_name"]
            }
          },
          {
            "name": "show_fact_card",
            "description": "Displays a visual HUD fact card for a celestial body or space phenomenon.",
            "parameters": {
              "type": "OBJECT",
              "properties": {
                "planet_name": {
                  "type": "STRING",
                  "description": "The planet or celestial body name to show fact card for."
                }
              },
              "required": ["planet_name"]
            }
          },
          {
            "name": "reset_view",
            "description": "Resets the 3D camera view back to the full solar system overview.",
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

---

## 2. Server Handshake Acknowledgement (`BidiGenerateContentSetupComplete`)

Gemini responds confirming setup acceptance:

```json
{
  "setupComplete": {}
}
```

If the model or credentials reject tool configuration, the server responds with an error frame and closes the socket:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid tool configuration or unsupported feature for model",
    "status": "INVALID_ARGUMENT"
  }
}
```
Client intercepts this error and alerts the user gracefully in Egyptian Arabic.
