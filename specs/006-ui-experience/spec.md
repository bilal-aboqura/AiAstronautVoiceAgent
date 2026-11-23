# Feature Specification: UI/UX & Experience Polish

**Feature Branch**: `006-ui-experience`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Implement Feature 006 (006-ui-experience) for the Egyptian Astronaut Voice Agent. Goal: Polish the existing website interface and make it responsive, readable, accessible, and easy to use on laptop and mobile screens. Existing project architecture: Frontend: Vite + React + TypeScript. Styling: Tailwind CSS. 3D: Three.js, React Three Fiber and Drei. Voice: Gemini Live API. Backend: Node.js + Express. Agent persona: Egyptian colloquial Arabic. Features 001–005 provide the solar system, voice agent, function calling, local knowledge base and Google Search grounding. Functional requirements: 1. Main layout: Full-screen dark space theme, keep 3D solar system as main visual element, display astronaut character in foreground, responsive layout for laptop and mobile. 2. Voice controls and states: Clearly display Idle, Listening, Thinking/searching, Speaking; reuse existing voice-agent state rather than creating conflicting state management. 3. Planet information card: Arabic and English planet names, 4–5 key facts, distance from the Sun, updates when focused planet changes, readable layout that does not unnecessarily obscure 3D scene. 4. Live captions: Display astronaut's spoken words, support Arabic RTL layout, use Cairo or Tajawal typography, keep captions synchronized as closely as API permits. 5. Search indicator: Display searching indicator while a search tool is running, hide it when search completes, reuse existing search and voice status information. 6. Visual polish: Consistent spacing, typography, colors, controls, subtle transitions, touch-friendly controls, responsive planet cards and captions, readable text on dark background, credit free NASA / Solar System Scope textures. 7. Accessibility: Accessible labels for interactive controls, clear visual control states, readable text, no important elements overlapping on mobile. Constraints: Reuse existing components and state wherever possible, do not rebuild working features, do not add new AI capabilities or providers, do not change Gemini Live architecture, do not introduce unnecessary dependencies, preserve all functionality from Features 001–005, keep implementation simple and reliable. Acceptance criteria: Verify laptop and mobile layouts, voice states, planet information cards, RTL captions, search indicator, touch controls, accessibility, and regression behavior."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Responsive Space Viewport & Foreground Astronaut Presence (Priority: P1)

As a visitor exploring the solar system on either a laptop or a mobile phone, I want a full-screen, high-contrast dark space environment where the interactive 3D solar system remains the central visual spectacle and the Egyptian astronaut companion is displayed gracefully in the foreground, so that I experience an immersive, balanced, and aesthetically cohesive space environment on any screen size.

**Why this priority**: The visual canvas and layout structure represent the primary stage for all user interactions. If the 3D scene is distorted, obscured, or clips on mobile or laptop displays, all downstream features (voice conversation, planet inspection, captions) suffer in usability and immersion.

**Independent Test**: Load the application across various viewport sizes (desktop/laptop wide screens down to compact mobile displays at 360px width) in both portrait and landscape modes. Verify that the dark space theme spans the full viewport, the 3D canvas scales seamlessly without aspect-ratio distortion, the astronaut character is prominently positioned in the foreground without blocking celestial bodies, and no elements overflow horizontally.

**Acceptance Scenarios**:

1. **Given** any standard browser on laptop or mobile viewports, **When** the page loads, **Then** the interface presents a full-screen, immersive dark space theme with deep celestial contrast and starfield ambiance.
2. **Given** the 3D solar system canvas, **When** rendered on any viewport from 360px to 4K resolution, **Then** the canvas occupies the central visual area with correct aspect ratio and no clipped UI bars or scrollbars.
3. **Given** the foreground astronaut character display, **When** viewed on desktop, **Then** the astronaut is framed in the foreground (e.g., lower corner HUD dock) with crisp visibility and expressive presence.
4. **Given** a mobile viewport in portrait or landscape orientation, **When** viewed, **Then** the astronaut presence scales proportionally and adapts its dock position so the celestial bodies remain clearly visible and interactive.

---

### User Story 2 - Synchronized Live Arabic Captions with Cultural Typography (Priority: P1)

As a visitor conversing with the astronaut in a noisy environment or someone who prefers reading along, I want to see real-time captions of the astronaut's spoken words formatted in authentic Arabic typography (Cairo or Tajawal) with proper Right-to-Left (RTL) text layout on a high-contrast backdrop, so that I can easily read and follow what the astronaut is saying as he speaks.

**Why this priority**: Real-time captions are essential for accessibility, comprehension of scientific terminology, and multi-modal engagement. Authentic RTL typography using Cairo or Tajawal guarantees cultural authenticity and high readability against the dark space background.

**Independent Test**: Start a voice session and ask an astronomical question in Arabic. As synthesized speech plays, observe the caption container. Captions appear synchronously with the spoken dialogue, styled in Cairo or Tajawal font, aligned RTL, legible against a dark semi-translucent backdrop, and smoothly transition without erratic flickering or overflow.

**Acceptance Scenarios**:

1. **Given** the astronaut begins speaking in Egyptian colloquial Arabic, **When** synthesized audio streams to the visitor, **Then** live text captions appear synchronized as closely as the stream allows, displaying the spoken words.
2. **Given** Arabic caption text, **When** rendered on screen, **Then** the text direction is strictly Right-to-Left (RTL) with appropriate alignment, line height, and Cairo or Tajawal typography.
3. **Given** caption display over dynamic 3D space backgrounds, **When** rendered, **Then** captions feature a subtle, high-contrast translucent backdrop (glassmorphic dark plate) ensuring effortless readability regardless of underlying planetary or starfield brightness.
4. **Given** a long multi-sentence response, **When** text accumulates, **Then** captions auto-scroll or gracefully paginate/fade older lines to keep the current sentence immediately readable without dominating the viewport.
5. **Given** the astronaut finishes speaking, **When** speech audio ends, **Then** captions remain comfortably readable for a brief duration before gently fading or tucking away into a collapsed state.

---

### User Story 3 - Integrated Voice Controls, Operational States & Search Feedback (Priority: P1)

As a visitor interacting with the voice companion, I want an intuitive, touch-friendly voice dock that clearly communicates whether the astronaut is Idle, Listening, Thinking, Searching, or Speaking, so that I always understand what the agent is doing and whether my microphone is actively capturing sound.

**Why this priority**: Clear conversational state feedback prevents user confusion, eliminates accidental interruptions, and builds trust. Displaying the search state specifically reassures the user that the system is researching their space inquiry rather than stalling.

**Independent Test**: Connect to the voice agent and observe state transitions through Idle -> Listening -> Thinking -> Searching -> Speaking -> Idle. Each state displays distinct visual cues (e.g., glowing rings, pulsing mic icon, animated search badge, wave indicators) and descriptive bilingual labels ("بيسمعك..." / "بيفكر..." / "بيبحث في السجلات..."), updating responsively without creating conflicting state logic.

**Acceptance Scenarios**:

1. **Given** an inactive session, **When** viewing the voice controls, **Then** the interface clearly indicates an "Idle" state with an accessible start button.
2. **Given** an active session, **When** the visitor speaks, **Then** the voice dock immediately reflects the "Listening" state with dynamic visual feedback (e.g., audio level glow or pulse).
3. **Given** speech processing begins, **When** the model evaluates the input, **Then** the status transitions to "Thinking".
4. **Given** the system initiates a local knowledge lookup or Google Search grounding, **When** the search tool executes, **Then** a prominent yet discreet searching indicator is displayed (e.g., "بيبحث في السجلات الفضائية..." / "Searching space archives...") indicating active retrieval.
5. **Given** search completes and synthesized speech begins, **When** audio starts playing, **Then** the search indicator hides immediately and the status transitions to "Speaking" with audio output visualization.
6. **Given** existing voice stores from Features 002, 003, and 005, **When** displaying states, **Then** the UI directly consumes existing state variables without creating redundant or divergent state stores.

---

### User Story 4 - Responsive Bilingual Planet Information HUD (Priority: P2)

As an explorer inspecting a planet (selected either by voice command or by clicking/tapping in 3D), I want a polished, responsive information card displaying the celestial body's Arabic and English names, distance from the Sun, and 4–5 key scientific facts, structured so that it does not obscure the planet being inspected and scales neatly on both mobile and laptop screens.

**Why this priority**: Scientific education is the astronaut's core mission. The planet information card provides the visual grounding for astronomical facts, reinforcing spoken details with precise written figures and bilingual nomenclature.

**Independent Test**: Select different planets (e.g., Mars, Jupiter, Saturn) via direct touch/click or voice command (`focus_planet`). Verify that the information card updates smoothly with correct Arabic and English names, formatted distance from the Sun, and 4–5 verified bulleted facts. Check that the card does not overlap the centered planet in 3D, includes a close/minimize control, and adapts to a compact bottom-sheet or corner drawer on mobile viewports.

**Acceptance Scenarios**:

1. **Given** a celestial body is focused (e.g., Earth or Mars), **When** the selection takes effect, **Then** the information card displays both the Arabic name (e.g., "المريخ") and the English name (e.g., "Mars").
2. **Given** the planet card is rendered, **When** examining its contents, **Then** it presents the formatted distance from the Sun (in astronomical units and kilometers) and exactly 4 to 5 concise, verified key facts (e.g., diameter, surface temperature, day length, atmospheric composition).
3. **Given** the 3D camera frames the focused planet, **When** the card is displayed on desktop or laptop, **Then** it anchors gracefully (e.g., side HUD card) with backdrop blur and dark translucency so the 3D planet remains fully visible.
4. **Given** a mobile screen in portrait orientation, **When** the planet card opens, **Then** it renders as an elegant bottom drawer or collapsible sheet that can be minimized or dismissed with a single tap, preventing collision with the astronaut or 3D target.
5. **Given** the camera resets to solar system overview (via reset button or voice `reset_view`), **When** the reset occurs, **Then** the planet card automatically closes or smoothly collapses.

---

### User Story 5 - Accessibility, Touch Optimization & Asset Attribution (Priority: P2)

As a visitor using a touchscreen phone, tablet, keyboard, or assistive technology, I want all buttons and controls to be comfortably tappable with clear focus states and descriptive labels, with zero overlapping elements on small screens, and with proper attribution crediting NASA and Solar System Scope textures.

**Why this priority**: Modern web applications must be inclusive, touch-friendly, and legally/ethically compliant regarding open-source asset usage. Meeting accessibility standards ensures an enjoyable experience for diverse audiences.

**Independent Test**: Navigate the entire interface using touch gestures on mobile and keyboard navigation (Tab/Shift-Tab/Enter/Space) on desktop. Verify that touch targets are at least 44x44 pixels, interactive elements have visible focus rings and ARIA labels, text contrast satisfies WCAG AA, no elements collide or overlap on small viewports, and an accessible attribution dialog or footer acknowledges texture sources.

**Acceptance Scenarios**:

1. **Given** any touch-enabled device, **When** interacting with controls (voice button, planet selection, reset button, card dismiss), **Then** all tap targets measure at least 44x44 CSS pixels with generous touch padding.
2. **Given** keyboard navigation, **When** tabbing through the UI, **Then** all interactive controls receive clear, high-contrast focus rings and activate reliably on Enter and Space keys.
3. **Given** screen readers and assistive tools, **When** inspecting controls, **Then** all buttons and status elements provide meaningful, descriptive ARIA labels in Arabic and English (e.g., `aria-label="ابدأ المحادثة الصوتية - Start voice conversation"`).
4. **Given** a mobile viewport (360px–430px wide), **When** all UI overlays (voice dock, astronaut avatar, captions, planet card) are active, **Then** elements stack or position responsively with zero unreadable text overlapping or clipped buttons.
5. **Given** the free texture assets utilized from NASA and Solar System Scope, **When** the user inspects credits, **Then** a clean, non-intrusive attribution link or modal explicitly cites and thanks NASA and Solar System Scope for public textures.

---

### Edge Cases

- **Rapid Viewport Resizing / Mobile Orientation Flipping**: When a user rotates their phone between portrait and landscape during an active voice session with an open planet card, the layout must re-calculate dimensions instantly without visual jitter, modal clipping, or canvas aspect distortion.
- **Very Long Arabic Spoken Responses**: If the astronaut speaks a comprehensive 4-sentence response with extended scientific descriptions, captions must not push essential voice controls off-screen or cover the 3D planet; a disciplined line clamping / smooth auto-scroll mechanism must keep the latest text visible within a capped height.
- **Simultaneous Search and Barge-In**: If the visitor interrupts while the search indicator is visible, the UI must immediately dismiss the search indicator, clear pending captions, and transition directly to the "Listening" state in under 200 milliseconds.
- **Concurrent Planet Switching**: If a user taps another planet while an information card is currently open and animating, the card content must cross-fade or update smoothly to the new planet's facts without blinking or showing stale data.
- **Mixed Arabic and English Spoken Words**: When captions contain mixed Arabic text with English space terms (e.g., "James Webb", "Parker Solar Probe", "Voyager"), bidirectional text isolation (`<bdi>` or unicode directional formatting) must ensure English words and numbers render in correct typographical order without flipping surrounding Arabic phrases.
- **Extreme Font Scaling / User Zoom**: If the visitor has enlarged browser font sizes (e.g., 150% text zoom), the HUD cards and caption containers must expand gracefully using relative units (`rem`/`em`) without text truncation or element overflow.
- **Slow Network / Font Loading**: If the Cairo or Tajawal Google Font is still downloading or fails to load, fallback system fonts (e.g., `system-ui`, `Segoe UI`, `Tahoma`, `sans-serif`) must render immediately without invisible text flashing (FOIT).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a full-screen, responsive space environment utilizing a deep obsidian/dark theme that serves as the backdrop for all interface elements.
- **FR-002**: The 3D solar system canvas MUST remain the central, unclipped visual element occupying the primary viewport space across all device sizes.
- **FR-003**: The system MUST display the Egyptian astronaut character in the foreground, visually harmonized with the dark space environment and voice interaction states.
- **FR-004**: The system MUST provide responsive layouts specifically tailored for desktop/laptop displays (wide HUD layout) and mobile screens (compact vertical/stacked layout down to 360px viewport width).
- **FR-005**: The system MUST provide accessible voice controls that clearly and distinctively present five operational states: Idle, Listening, Thinking, Searching, and Speaking.
- **FR-006**: The voice controls MUST reuse existing voice agent state stores (from Features 002, 003, and 005) without introducing conflicting, duplicated, or desynchronized state management.
- **FR-007**: The system MUST display a prominent yet subtle searching indicator (e.g., "بيبحث في السجلات الفضائية...") whenever a local knowledge search or Google Search grounding tool is executing.
- **FR-008**: The searching indicator MUST automatically appear upon search tool activation and disappear within 100 milliseconds of search completion or speech playback commencement.
- **FR-009**: The system MUST display an informative celestial body card whenever a planet or major body is focused, presenting:
  - Arabic celestial name.
  - English celestial name.
  - Formatted distance from the Sun (in AU and kilometers).
  - 4 to 5 concise, verified key scientific facts.
- **FR-010**: The planet information card MUST automatically update its data and bilingual titles whenever the focused celestial body changes (via 3D pointer selection or `focus_planet` tool invocation).
- **FR-011**: The planet information card MUST be styled and positioned to avoid unnecessarily obscuring the focused 3D celestial body or astronaut presence.
- **FR-012**: The planet information card MUST provide a one-touch/one-click dismiss control to close the card and allow unobstructed 3D viewing.
- **FR-013**: The system MUST display real-time live captions of the astronaut's spoken words, synchronized as closely as the streaming audio API permits.
- **FR-014**: Spoken captions MUST be displayed in Right-to-Left (RTL) layout with authentic Arabic typography using Cairo or Tajawal fonts.
- **FR-015**: Captions MUST feature a high-contrast semi-translucent backdrop ensuring clear readability against the variable brightness of stars, Sun glow, and planetary textures.
- **FR-016**: The caption container MUST limit maximum height and provide graceful auto-scrolling or fade-out to prevent obscuring other interactive controls during multi-sentence answers.
- **FR-017**: All interactive controls (buttons, toggles, dismiss triggers) MUST provide minimum touch target dimensions of 44x44 CSS pixels on touch-enabled devices.
- **FR-018**: Visual styling across the entire interface MUST adhere to a consistent design system with unified spacing, galactic color palettes (dark navy, deep space slate, starlight cyan, orbital gold), glassmorphism accents, and subtle CSS transitions.
- **FR-019**: The user interface MUST prevent overlapping collisions between open overlays (captions, planet card, voice dock, and navigation controls) on mobile viewports.
- **FR-020**: All interactive elements MUST provide accessible ARIA labels, descriptive roles, and visible keyboard focus rings.
- **FR-021**: The system MUST provide an accessible attribution notice crediting free celestial textures from NASA and Solar System Scope.
- **FR-022**: The system MUST preserve all existing capabilities from Features 001 through 005 without regressions.

---

### Key Entities *(include if feature involves data)*

- **UI Layout State**: Encapsulates active breakpoint category (`desktop` vs. `mobile`), screen orientation (`portrait` vs. `landscape`), viewport dimensions, and overlay visibility flags.
- **Voice Agent Display State**: Represents the visual presentation of the voice companion, including current operational state (`idle`, `listening`, `thinking`, `searching`, `speaking`, `error`), audio activity volume levels, and search label message.
- **Planet Card Entity**: Encapsulates display data for the focused celestial body, containing `id`, `nameAr` (Arabic name), `nameEn` (English name), `distanceFromSun` (formatted string with AU and km), `facts` (array of 4–5 bulleted scientific strings), and `isDismissed` (boolean).
- **Live Caption Stream**: Represents real-time spoken text chunks, containing `id`, `text` (accumulated utterance), `direction` (`rtl` or `ltr`), `isFinal`, and `timestamp`.
- **Texture Attribution Record**: Represents asset provenance information, containing provider name, source URL, license type, and list of attributed planetary and space textures.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of interface layouts adapt smoothly across all viewports from 360px width (compact mobile) to 3840px (4K desktop) without horizontal scrolling, clipped controls, or overlapping panels.
- **SC-002**: Visual voice state transitions (between Idle, Listening, Thinking, Searching, and Speaking) render on screen within 100 milliseconds of underlying voice state updates.
- **SC-003**: Spoken captions display in authentic Arabic typography (Cairo/Tajawal) with RTL direction within 150 milliseconds of audio chunk reception.
- **SC-004**: The planet information card updates its Arabic name, English name, distance, and 4–5 key facts within 200 milliseconds of celestial body focus change.
- **SC-005**: The search indicator appears within 100 milliseconds of a search tool initiating and hides within 100 milliseconds of speech commencement or search completion.
- **SC-006**: 100% of interactive buttons and touch controls satisfy the minimum 44x44 CSS pixel touch target standard on mobile and tablet screens.
- **SC-007**: 100% of text elements achieve a minimum visual contrast ratio of 4.5:1 for standard body text and 3:1 for large display headers against their respective backdrops, satisfying WCAG 2.1 Level AA.
- **SC-008**: 0 regressions introduced across 3D navigation (Feature 001), voice streaming (Feature 002), function calling (Feature 003), local RAG search (Feature 004), and Google Search grounding (Feature 005).

---

## Assumptions

- **Target Browsers & Platforms**: Modern evergreen web browsers (Chrome, Edge, Safari, Firefox on desktop and mobile) supporting WebGL, Web Audio API, and CSS Flexbox/Grid.
- **Typography Delivery**: Google Fonts web font services (Cairo or Tajawal) are loaded via standard link/font stylesheet with clean system font fallbacks (`sans-serif`, `system-ui`, `Segoe UI`, `Tahoma`).
- **State Reuse**: Existing React/Zustand or hook-based stores for voice state (`voice-store`), 3D solar system (`solar-system-store`), and search states established in prior features will be utilized directly without creating conflicting state machinery.
- **Asset Attribution**: Public celestial textures sourced from NASA and Solar System Scope remain free for non-commercial educational use as established in Feature 001.
- **Egyptian Arabic Persona**: Spoken responses and UI microcopy continue to embody the warm, scientifically accurate Egyptian astronaut persona.
- **Mobile Viewport Target**: Supported mobile devices include viewports starting at 360px width (such as compact Android devices and iPhone SE) up to large modern smartphones and tablets in both portrait and landscape orientations.
