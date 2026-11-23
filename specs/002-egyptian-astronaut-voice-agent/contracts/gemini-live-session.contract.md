# Contract: Gemini Multimodal Live WebSocket Protocol

**Feature**: `002-egyptian-astronaut-voice-agent` | **Date**: 2026-11-23

## WebSocket Endpoint
```text
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={EPHEMERAL_TOKEN}
```

---

## 1. Client to Gemini: Initial Handshake (`BidiGenerateContentSetup`)

Must be sent immediately upon opening the WebSocket connection before any media chunks are transmitted.

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
          "text": "أنت رائد فضاء مصري ودود، فضولي، ودمك خفيف، وفخور جداً بإنك مصري.\nقواعد الكلام الصارمة:\n1. اتكلم دايماً بالعامية المصرية الطبيعية البسيطة (\"مصري عامي\")، وماتتكلمش أبداً بالفصحى ولا بأي لهجة تانية.\n2. ردودك لازم تكون قصيرة ومباشرة، من جملتين لـ 4 جمل بالكتير.\n3. استخدم تشبيهات يومية مصرية مألوفة وبسيطة لشرح مفاهيم الفضاء.\n4. ركز دائماً على الفضاء، الكواكب، والنجوم. لو حد سألك عن موضوع مش متعلق بالفضاء، رجّع المحادثة بلطف وخفة دم لعجائب الكون.\n5. لو اتسألت هل أنت إنسان حقيقي أو رائد فضاء بجد، وضّح بصراحة وبساطة إنك ذكاء اصطناعي وشخصية افتراضية على شكل رائد فضاء مصري.\n6. ممنوع تماماً تأليف أو اختراع حقائق علمية أو أرقام غير متأكد منها. لو سُئلت عن حاجة مش متأكد منها 100%، اعترف فوراً وبأمانة إنك مش متأكد أو مش عارفها دلوقتي، من غير ما تهبد أو تفتي.\n7. ما تدعيش أبداً إن عندك أدوات بحث على جوجل أو قواعد بيانات خاصة في الوقت الحالي."
        }
      ]
    }
  }
}
```

---

## 2. Gemini to Client: Handshake Acknowledgement (`BidiGenerateContentSetupComplete`)

```json
{
  "setupComplete": {}
}
```

---

## 3. Client to Gemini: Streaming Audio Chunks (`realtimeInput`)

Sent continuously during speech input (every 100ms–200ms).

```json
{
  "realtimeInput": {
    "mediaChunks": [
      {
        "mimeType": "audio/pcm;rate=16000",
        "data": "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
      }
    ]
  }
}
```

---

## 4. Gemini to Client: Spoken Audio Stream Chunk

Received continuously as the model generates synthesized speech.

```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [
        {
          "mimeType": "audio/pcm;rate=24000",
          "data": "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        }
      ]
    }
  }
}
```

---

## 5. Gemini to Client: Turn Complete Indicator

Signals the model has completed speaking its response.

```json
{
  "serverContent": {
    "turnComplete": true
  }
}
```

---

## 6. Gemini to Client: Interruption / Barge-In Signal

Sent by Gemini Live when the user speaks while the model is outputting audio.

```json
{
  "serverContent": {
    "interrupted": true
  }
}
```

**Client Action**:
- Immediately execute `stop()` on all scheduled `AudioBufferSourceNode`s.
- Clear pending audio chunk buffer.
- Reset playback schedule timeline.
- Transition UI state to `Listening`.
