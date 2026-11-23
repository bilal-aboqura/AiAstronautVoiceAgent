# Contract: Backend Ephemeral Token API

**Feature**: `002-egyptian-astronaut-voice-agent` | **Date**: 2026-11-23

## Endpoint: `POST /api/session/token`

Generates a short-lived ephemeral session token for direct client-to-Gemini Multimodal Live API communication. Permanent API keys remain strictly stored on the server.

### Request

- **Method**: `POST`
- **Path**: `/api/session/token`
- **Headers**:
  - `Content-Type: application/json`
- **Body**: (Optional parameters)
  ```json
  {
    "clientLocale": "ar-EG"
  }
  ```

### Response

#### Success: `200 OK`
```json
{
  "token": "AIzaSy..._ephemeral_token_string",
  "expiresAt": 1763901600000,
  "model": "gemini-2.0-flash-exp",
  "wsUrl": "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent",
  "config": {
    "inputSampleRate": 16000,
    "outputSampleRate": 24000,
    "voiceName": "Aoede",
    "locale": "ar-EG"
  }
}
```

#### Error: `500 Internal Server Error` (API Key Missing or Google API Failure)
```json
{
  "error": {
    "code": "EPHEMERAL_TOKEN_CREATION_FAILED",
    "message": "Failed to create ephemeral session token from Gemini API.",
    "retryable": true
  }
}
```

#### Error: `503 Service Unavailable` (Configuration Missing)
```json
{
  "error": {
    "code": "SERVER_MISCONFIGURED",
    "message": "Gemini API key or Live model environment variables are not configured.",
    "retryable": false
  }
}
```

---

## Health Check: `GET /api/health`

Verifies that the backend server is running and configuration is populated.

### Response `200 OK`
```json
{
  "status": "ok",
  "service": "astronaut-voice-backend",
  "liveModelConfigured": true,
  "timestamp": 1763900000000
}
```
