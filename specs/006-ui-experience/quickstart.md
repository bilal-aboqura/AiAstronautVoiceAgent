# Quickstart & Verification Guide: UI/UX & Experience Polish

**Feature**: `006-ui-experience` | **Date**: 2026-11-23

---

## 1. Overview & Setup

This guide walks through manual and automated verification of the polished interface for the Egyptian Astronaut Voice Agent across desktop, laptop, tablet, and mobile viewports.

### Prerequisites
- Node.js 20 LTS installed.
- Modern web browser (Chrome, Edge, Safari, Firefox).
- Environment configured with Gemini Live access (`.env` with `GEMINI_API_KEY`).

### Launch Commands
```bash
# Terminal 1: Start Express backend
cd server && npm run dev

# Terminal 2: Start Vite frontend
cd frontend && npm run dev
```
Open `http://localhost:5173` in a desktop browser or inspect with Chrome DevTools Device Mode for mobile testing.

---

## 2. Verification Scenarios

### Scenario 1: Responsive Main Layout (Laptop & Mobile)
1. **Desktop Verification (1280px–1920px)**:
   - Load `http://localhost:5173`.
   - Verify the 3D canvas spans the entire screen in full dark space mode.
   - Verify the astronaut companion is visible in the foreground (bottom-left quadrant).
   - Verify the top navigation bar displays the overview reset control and credits button.
2. **Mobile Portrait Verification (360px–430px)**:
   - In DevTools, switch to iPhone SE (375x667) or Pixel 7 (412x915).
   - Verify no horizontal scrollbars exist.
   - Verify the astronaut scales to an unobtrusive floating badge or integrated dock.
   - Verify controls fit comfortably with safe area spacing.
3. **Mobile Landscape Verification**:
   - Rotate device to landscape in DevTools.
   - Verify HUD elements stack or tuck to sides without blocking the central planet view.

---

### Scenario 2: Voice Controls & Operational States
1. **Idle State**:
   - Observe voice dock at bottom of screen.
   - Confirm grey/slate accent ring with microphone icon and label "اضغط للتحدث" / "Tap to talk".
2. **Connecting & Listening States**:
   - Click/tap the microphone button.
   - Allow microphone permissions.
   - Observe transition to "Listening" with cyan/green glowing ring.
   - Speak into the microphone; confirm the outer pulse ring expands with your input volume.
3. **Thinking & Speaking States**:
   - Stop speaking; observe transition to "Thinking" (amber rotating ring).
   - When the astronaut speaks, observe transition to "Speaking" (purple glow with oscillating audio bars).
4. **Barge-in Cutoff**:
   - Speak while the astronaut is speaking; verify active speech stops in $<200\text{ms}$ and dock immediately returns to "Listening".

---

### Scenario 3: Real-Time Arabic Captions with Cairo Typography
1. **Font & RTL Verification**:
   - While the astronaut speaks, observe the caption container above the voice dock.
   - Inspect element with DevTools: verify `font-family` applies `'Cairo', 'Tajawal', sans-serif`.
   - Verify text direction is strictly Right-to-Left (`dir="rtl"`).
2. **Contrast & Glassmorphism**:
   - Move the 3D camera so a bright star or planet is directly behind the captions.
   - Confirm captions remain 100% legible against the translucent dark slate plate (`bg-slate-950/85 backdrop-blur-md`).
3. **Linger & Fade**:
   - When the astronaut finishes speaking, verify captions remain readable for ~4 seconds, then smoothly fade out over ~700ms.

---

### Scenario 4: Planet Information Card
1. **Selection & Display**:
   - Click or tap on Mars in the 3D scene (or say "ورّيني كوكب المريخ" via voice).
   - Observe the camera smoothly animating to Mars.
   - Verify the Planet Information Card appears with:
     - Arabic name: "المريخ" in Cairo Bold.
     - English name: "Mars".
     - Formatted distance from Sun: `1.52 AU (~227.9 مليون كم)`.
     - Exactly 4–5 verified scientific facts.
2. **Desktop Framing**:
   - On desktop, confirm the card floats on the right side (`top-20 right-8`), leaving Mars centered and visible.
3. **Mobile Bottom Sheet**:
   - On mobile, verify the card renders as a bottom drawer (`inset-x-3 bottom-24`).
   - Tap the close button (`X`); verify the card dismisses cleanly.
4. **Reset View**:
   - Click "Reset View" (or say "نرجع للمنظر العام"); verify the camera resets to solar system overview and any open card closes.

---

### Scenario 5: Search Indicator Feedback
1. **Trigger External Search**:
   - Ask an obscure/recent space question not in local records (e.g., "إيه آخر أخبار تجارب مركبة ستارشيب الفضائية؟").
   - Observe the `SearchingIndicator` badge appear in the voice dock with a pulsing satellite dish icon and label:
     `"بيبحث في السجلات الفضائية..."`.
2. **Timing**:
   - Verify the indicator appears within $100\text{ms}$ of search invocation.
   - When synthesized audio begins, verify the indicator immediately disappears.

---

### Scenario 6: Accessibility & Touch Standards
1. **Touch Targets**:
   - Inspect all clickable buttons (mic orb, reset button, dismiss X, credits trigger) in DevTools.
   - Verify every touch target has computed dimensions $\ge 44\times 44\text{px}$.
2. **Keyboard Navigation**:
   - Use `Tab` and `Shift+Tab` to navigate through the interface without a mouse.
   - Verify prominent cyan focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`).
   - Press `Enter` or `Space` to activate controls.
3. **Contrast Ratio**:
   - Run Chrome DevTools Lighthouse / Accessibility audit; verify text contrast passes WCAG 2.1 AA ($> 4.5:1$).

---

### Scenario 7: NASA & Solar System Scope Texture Attribution
1. **Credits Modal**:
   - Click the "المصادر / Credits" button in the top navigation bar.
   - Verify the attribution modal opens with a smooth backdrop blur.
   - Confirm explicit attribution to **NASA / JPL-Caltech** and **Solar System Scope** with official links.
   - Press `Escape` or click the `X` button; verify the modal closes immediately.

---

### Scenario 8: Non-Regression Check (Features 001–005)
1. **Feature 001 (3D Solar System)**: 8 planets, Sun, Moon, Saturn rings, orbital movement, zoom, reset all function smoothly.
2. **Feature 002 (Voice Agent)**: Bidirectional audio, Egyptian Arabic persona, sub-200ms barge-in function as expected.
3. **Feature 003 (Function Calling)**: `focus_planet`, `show_fact_card`, `reset_view` execute seamlessly with 3D camera.
4. **Feature 004 (Local Space Knowledge Base)**: Curated local search (`search_knowledge`) returns verified facts and sources.
5. **Feature 005 (Google Search Grounding)**: Native web grounding activates seamlessly when local knowledge is insufficient.
