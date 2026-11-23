# Quickstart & Verification Guide: Real-Time Egyptian Astronaut Voice Agent

**Feature**: `002-egyptian-astronaut-voice-agent` | **Date**: 2026-11-23

This guide provides step-by-step instructions to set up, run, and verify the Real-Time Egyptian Astronaut Voice Agent across all acceptance scenarios.

---

## 1. Prerequisites & Environment Setup

### Environment Variables
Create or verify `.env` in the project root or `backend/.env`:

```env
# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

> [!IMPORTANT]
> The permanent `GEMINI_API_KEY` must **never** be placed in the frontend `.env` or committed to source control.

---

## 2. Running the Applications

### Start the Express Backend
```powershell
cd backend
npm install
npm run dev
# Server starts on http://localhost:3001
```

Verify backend health:
```powershell
curl http://localhost:3001/api/health
# Expected: {"status":"ok","service":"astronaut-voice-backend","liveModelConfigured":true}
```

### Start the Vite Frontend
```powershell
cd frontend
npm install
npm run dev
# Client runs at http://localhost:5173
```

---

## 3. End-to-End Verification Scenarios

### Scenario 1: Ephemeral Token & Connection Handshake
1. Open `http://localhost:5173` in a modern browser (Chrome or Edge recommended).
2. Open Browser DevTools -> **Network** tab -> filter by `WS` and `Fetch`.
3. Click the microphone button in the voice HUD dock.
4. **Verification**:
   - `POST http://localhost:3001/api/session/token` is called and returns `200 OK` with an ephemeral token.
   - Browser opens a direct WebSocket connection to `wss://generativelanguage.googleapis.com/ws/...`.
   - The initial `BidiGenerateContentSetup` message is sent, and `setupComplete` is received.
   - The HUD status changes from **Idle (في انتظارك)** to **Listening (بيسمعك...)**.

### Scenario 2: Bidirectional Audio & Egyptian Arabic Persona
1. With the session active, speak into your microphone: *"إيه هو أكبر كوكب في المجموعة الشمسية؟"*
2. Observe the status transition to **Thinking (بيفكر...)** when speech ends, then **Speaking (بيتكلم...)**.
3. **Verification**:
   - Audio begins playing smoothly through your speakers.
   - The astronaut answers in natural Egyptian colloquial Arabic (e.g., *"كوكب المشترى يا بطل، ده غول المجموعة الشمسية وأكبر كوكب عندنا..."*).
   - The answer is concise (2–4 sentences).
   - Dialect is strictly Egyptian Arabic (no Modern Standard Arabic phrasing).
   - Once the response completes, status transitions back to **Listening**.

### Scenario 3: Interruption / Barge-In (< 200 ms)
1. Ask the astronaut a question: *"احكيلي عن رحلة أبولو 11"*.
2. While the astronaut is midway through speaking, speak loudly into the microphone: *"استنى يا كابتن، قولي الأول مين أول إنسان طلع الفضاء؟"*.
3. **Verification**:
   - Audio playback cuts off instantly ($< 200\text{ ms}$).
   - No audio overlap or stutter occurs.
   - The astronaut switches to answering the new question about Yuri Gagarin.

### Scenario 4: AI Identity & Uncertainty Handling
1. Ask: *"هو أنت إنسان حقيقي عايش في الفضاء بجد؟"*.
   - **Expected**: Astronaut warmly clarifies in Egyptian Arabic that he is an AI character.
2. Ask: *"كم عدد حبات الرمل على قمر كاليستو بالضبط؟"*.
   - **Expected**: Astronaut admits uncertainty honestly in Egyptian Arabic without making up a fictional number.
3. Ask: *"إزاي أعمل كشري مصري؟"*.
   - **Expected**: Astronaut politely redirects back to space exploration with friendly humor.

### Scenario 5: Clean Teardown & Resource Release
1. During an active session, click the red "End Session" control.
2. **Verification**:
   - Audio playback stops immediately.
   - Browser tab microphone indicator (recording red dot) disappears immediately.
   - WebSocket connection closes cleanly with code `1000`.
   - UI returns to **Idle**.

### Scenario 6: Hardware Permission Rejection
1. Reset browser microphone permissions to "Block" for `http://localhost:5173`.
2. Click the microphone button.
3. **Verification**:
   - System displays a friendly Egyptian Arabic error: *"برجاء السماح بالوصول للميكروفون للمتابعة"*.
   - Application remains responsive and does not crash.
