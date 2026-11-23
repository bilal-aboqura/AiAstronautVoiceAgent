# Contract: Gemini Live Inbound Grounding Metadata Protocol

**File**: `specs/005-google-search-grounding/contracts/gemini-live-grounding-metadata.contract.md`  
**Purpose**: Define the structure of inbound `serverContent` messages containing `groundingMetadata` and client extraction rules.

---

## 1. Full Inbound Grounding Response Frame

When Gemini Live uses Google Search grounding to synthesize a response turn, it delivers a `serverContent` message containing `groundingMetadata`:

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
    },
    "turnComplete": true,
    "groundingMetadata": {
      "webSearchQueries": [
        "SpaceX Starship flight test 6 results"
      ],
      "groundingChunks": [
        {
          "web": {
            "uri": "https://www.space.com/spacex-starship-flight-6-launch-catch",
            "title": "SpaceX launches Starship Flight 6 test flight"
          }
        },
        {
          "web": {
            "uri": "https://www.nasa.gov/news-release/nasa-artemis-starship-progress",
            "title": "NASA Highlights Artemis Starship Milestones"
          }
        }
      ],
      "groundingSupports": [
        {
          "groundingChunkIndices": [0],
          "segment": {
            "startIndex": 0,
            "endIndex": 85,
            "text": "نجحت تجربة ستارشيب السادسة في اختبار المحركات وإعادة دخول الغلاف الجوي..."
          }
        }
      ],
      "searchEntryPoint": {
        "renderedContent": "<div class=\"gemini-grounding\">...</div>"
      }
    }
  }
}
```

---

## 2. Inbound Query-Only Grounding Frame

In some turns or preview models, `groundingMetadata` contains queries without populated `groundingChunks`:

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
    },
    "turnComplete": true,
    "groundingMetadata": {
      "webSearchQueries": [
        "current commander of ISS 2026"
      ]
    }
  }
}
```

**Client Handler Behavior**:
- Safely extracts `webSearchQueries: ["current commander of ISS 2026"]`.
- Sets `sources: []`.
- Does NOT throw null reference exceptions.

---

## 3. Inbound Local Knowledge Turn (No Grounding Metadata)

When an answer is synthesized from local knowledge (`search_knowledge` tool response), `groundingMetadata` is null, empty, or omitted:

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
    },
    "turnComplete": true
  }
}
```

**Client Handler Behavior**:
- `groundingMetadata` is evaluated as undefined.
- Client maintains any local knowledge source attributes already logged during `search_knowledge`.

---

## 4. Defensive Extraction Function Contract

```typescript
export function extractGroundingInfo(metadata: any): GroundingMetadataInfo | null {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  const webSearchQueries: string[] = Array.isArray(metadata.webSearchQueries)
    ? metadata.webSearchQueries.filter((q: any) => typeof q === 'string')
    : [];

  const sources: GroundingSource[] = [];
  if (Array.isArray(metadata.groundingChunks)) {
    for (const chunk of metadata.groundingChunks) {
      if (chunk?.web?.uri) {
        let domain = '';
        try {
          domain = new URL(chunk.web.uri).hostname.replace(/^www\./, '');
        } catch {
          domain = chunk.web.uri;
        }
        sources.push({
          title: chunk.web.title || domain,
          url: chunk.web.uri,
          domain
        });
      }
    }
  }

  return {
    webSearchQueries,
    sources,
    searchEntryPointHtml: metadata.searchEntryPoint?.renderedContent
  };
}
```
