# Contract: Knowledge Search REST API

**File**: `specs/004-space-knowledge-base/contracts/knowledge-search-api.contract.md`  
**Endpoint**: `POST /api/knowledge/search`  
**Host**: Express Backend Server (e.g., `http://localhost:3001` or `/api/knowledge/search`)

---

## 1. Request Specification

- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body Schema

```json
{
  "type": "object",
  "required": ["query"],
  "properties": {
    "query": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "The search query in Arabic, English, or transliterated text."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "default": 3,
      "description": "Maximum number of ranked results to return."
    },
    "threshold": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "default": 0.65,
      "description": "Minimum cosine similarity score required for an entry to be returned."
    }
  }
}
```

### Example Request Body

```json
{
  "query": "كم تبلغ درجة حرارة سطح الشمس؟",
  "limit": 3,
  "threshold": 0.65
}
```

---

## 2. Response Specification

### Status 200: Matches Found (`status: "success"`)

```json
{
  "status": "success",
  "query": "كم تبلغ درجة حرارة سطح الشمس؟",
  "total_matches": 1,
  "execution_time_ms": 42.5,
  "results": [
    {
      "id": "sun-photosphere-temp",
      "category": "sun",
      "title": "Sun Surface (Photosphere) Temperature",
      "content": "تبلغ درجة حرارة الغلاف الضوئي (سطح الشمس المرئي) حوالي 5,500 درجة مئوية (9,932 فهرنهايت)، بينما ترتفع الهالة الخارجية (الكورونا) إلى أكثر من مليون درجة مئوية.",
      "source_name": "NASA Solar Science",
      "source_url": "https://science.nasa.gov/sun/facts/",
      "relevance_score": 0.8842
    }
  ]
}
```

### Status 200: No Results Above Threshold (`status: "no_results"`)

```json
{
  "status": "no_results",
  "query": "هل في كائنات فضائية عايشة على بلوتو؟",
  "total_matches": 0,
  "execution_time_ms": 38.1,
  "results": []
}
```

### Status 400: Bad Request (Invalid Query)

```json
{
  "status": "error",
  "error_message": "Query must be a non-empty string with maximum 500 characters."
}
```

### Status 500: Internal Server / Embedding Error

```json
{
  "status": "error",
  "error_message": "Failed to generate query embedding or retrieve knowledge."
}
```
