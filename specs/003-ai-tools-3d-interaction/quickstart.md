# Quickstart & Verification Guide: AI Tools & 3D Interaction

**Feature**: `003-ai-tools-3d-interaction`  
**Date**: 2026-11-23  
**Status**: Ready for Verification  

---

## Overview

This guide details the end-to-end validation procedures for verifying the Gemini Live function calling integration with the 3D solar system. It covers prerequisites, automated test execution, and manual voice walkthroughs for all 3 frontend tools (`focus_planet`, `show_fact_card`, and `reset_view`).

---

## 1. Prerequisites & Environment Setup

1. **Node.js**: Ensure Node.js 20 LTS or later is installed.
2. **Environment Variables**:
   In `backend/.env`:
   ```bash
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_LIVE_MODEL=gemini-2.0-flash-exp # or configured Live model
   ```
3. **Start Applications**:
   - Backend:
     ```bash
     cd backend && npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend && npm run dev
     ```
   - Open browser at `http://localhost:5173`.

---

## 2. Automated Test Execution

Run the automated unit and contract test suites:

```bash
# In frontend directory:
npm run test:unit
```

Tests verify:
- `validatePlanetName`: Validates all 11 celestial bodies (`sun`, `mercury`, `venus`, `earth`, `moon`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`) case-insensitively and rejects invalid names (e.g. `'krypton'`).
- `validateFactCardArgs`: Validates non-empty title and string array facts; rejects empty strings and bad types.
- `executeToolCall`: Verifies that `focus_planet`, `show_fact_card`, and `reset_view` mutate `useSolarSystemStore` state and return properly structured `ToolResponsePayload` envelopes conforming to [frontend-tool-handler.contract.md](contracts/frontend-tool-handler.contract.md).
- `GeminiLiveService`: Verifies outbound `BidiGenerateContentSetup` includes tool declarations conforming to [gemini-tool-declarations.contract.md](contracts/gemini-tool-declarations.contract.md), and inbound `toolCall` messages trigger `toolResponse` frames.

---

## 3. Manual Voice Walkthrough Scenarios

### Scenario 1: Focus on Earth
1. Click the microphone button to start a voice session (state transitions to `Listening`).
2. Speak in Arabic or English:  
   *Egyptian Arabic*: `"عايز أشوف كوكب الأرض"` or `"كلمنا عن كوكبنا الأرض"`  
   *English*: `"Show me Earth"` or `"Focus on Earth"`
3. **Expected Results**:
   - The astronaut begins speaking in Egyptian Arabic (e.g., `"من عيني، يلا بينا على كوكب الأرض، كوكبنا الأزرق الجميل..."`).
   - The 3D camera smoothly glides from the overview to close-up orbit tracking of Earth within 1.5–2.5 seconds.
   - The Earth planetary information card appears on the screen.
   - The astronaut's voice continues speaking naturally without stutter or interruption.

---

### Scenario 2: Focus on Saturn (Rings Inspection)
1. In the same active session, say:  
   *Egyptian Arabic*: `"طب وريني كوكب زحل وحلقاته"`  
   *English*: `"Take me to Saturn"`
2. **Expected Results**:
   - The camera smoothly interpolates from Earth directly to Saturn.
   - Saturn's tilted ring system is framed clearly.
   - The information card updates to Saturn's data.
   - The astronaut continues explaining Saturn's ring composition in Egyptian Arabic.

---

### Scenario 3: Fact Card Display (`show_fact_card`)
1. Ask the astronaut for interesting facts:  
   *Egyptian Arabic*: `"إيه أغرب حقائق عن كوكب المريخ؟"` or `"قولي كام معلومة عن المشترى"`  
   *English*: `"Tell me three facts about Jupiter"`
2. **Expected Results**:
   - The agent invokes `show_fact_card` with a relevant title and facts array.
   - A high-contrast glassmorphic fact card appears floating over the canvas.
   - If in Arabic, the card renders in **Right-to-Left (RTL)** layout with clean typography.
   - If in English, the card renders in **Left-to-Right (LTR)** layout.
   - The card has a visible close button (`X`) that cleanly dismisses it when clicked.

---

### Scenario 4: Reset View to Overview (`reset_view`)
1. While focused on any planet with cards open, say:  
   *Egyptian Arabic*: `"ورّيني المجموعة الشمسية كلها تاني"` or `"ارجع للمنظر العام"`  
   *English*: `"Show me the whole solar system"` or `"Reset the view"`
2. **Expected Results**:
   - The agent executes `reset_view`.
   - The 3D camera smoothly pulls back to the default wide solar system overview.
   - The selected planet state is cleared to `null`.
   - Any open fact cards or planetary info cards close automatically.
   - The astronaut warmly confirms in Egyptian Arabic (e.g., `"تمام يا بطل، رجعنا نشوف كل كواكبنا من فوق"`).

---

### Scenario 5: Error Handling & Conversational Resilience
1. Ask the astronaut about a non-existent or fictional planet:  
   *Egyptian Arabic*: `"عايز أزور كوكب كريبتون"` or `"وريني كوكب زمرّدة"`  
   *English*: `"Show me planet Krypton"`
2. **Expected Results**:
   - The agent may attempt `focus_planet(name="krypton")`.
   - The frontend tool handler rejects the argument safely and returns an error response envelope to the Gemini Live session.
   - **Crucial**: The voice session remains completely connected and the microphone remains active.
   - The astronaut responds naturally in colloquial Egyptian Arabic, explaining that this body isn't in our solar system (e.g., `"يا بطل كوكب كريبتون ده في أفلام سوبرمان بس! المجموعة الشمسية بتاعتنا مفهاش غير الـ 8 كواكب وبلوتو والشمس والقمر"`).

---

### Scenario 6: Coexistence of Manual and Voice Controls
1. Click manually on **Jupiter** on the 3D canvas; the camera zooms to Jupiter.
2. Say into the microphone: `"وريني عطارد"` (`"Show me Mercury"`).
3. **Expected Results**:
   - The voice command smoothly redirects the camera to Mercury, updating the UI info card.
4. Click the manual **"Reset View"** HUD button; the camera returns to the overview.
5. Say: `"ركّز على القمر"` (`"Focus on the Moon"`).
6. **Expected Results**:
   - The camera smoothly navigates to Earth's Moon without conflict.
