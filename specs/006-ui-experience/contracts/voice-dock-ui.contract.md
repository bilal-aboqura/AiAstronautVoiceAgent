# Contract: Voice Dock & Status Feedback UI

**Contract ID**: `CTR-VOICE-DOCK-006`  
**Version**: `1.0.0`  
**Location**: `frontend/src/components/voice/VoiceDock.tsx`  
**Scope**: Voice activation button, operational state presentation, searching indicator, and touch accessibility.

---

## 1. Component Interface & Props

```typescript
export interface VoiceDockProps {
  /** Operational state from useVoiceStore */
  agentState: 'idle' | 'connecting' | 'listening' | 'thinking' | 'searching' | 'speaking' | 'error';
  /** Whether local KB or web search is currently running */
  isSearching: boolean;
  /** Current search stage */
  searchStage?: 'idle' | 'local_kb' | 'web_search';
  /** Localized search label (e.g. "بيبحث في السجلات الفضائية...") */
  searchStatusLabel?: string;
  /** Microphone input volume normalized [0.0, 1.0] */
  inputVolume: number;
  /** Synthesized audio output volume normalized [0.0, 1.0] */
  outputVolume: number;
  /** Callback to start or end the voice session */
  onToggleSession: () => void;
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Whether microphone is muted */
  isMuted?: boolean;
  /** Callback to toggle mute */
  onToggleMute?: () => void;
}
```

---

## 2. Visual States & Design System

The Voice Dock is the conversational command center. It consists of:
1. **Primary Action Orb (Microphone Button)**:
   - Dimensions: `w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300`.
   - Minimum touch target: $\ge 48\times 48\text{px}$.
   - Focus ring: `focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:outline-none`.

2. **State Specific Styling**:
   - **Idle**: `bg-slate-900/80 border-2 border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-white shadow-lg`.
   - **Connecting**: `bg-blue-950/60 border-2 border-blue-500 text-blue-300 animate-pulse`.
   - **Listening**: `bg-cyan-950/60 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.45)] ring-4 ring-cyan-500/20`.
   - **Thinking**: `bg-amber-950/60 border-2 border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-spin-slow`.
   - **Searching**: Displays integrated `SearchingIndicator` badge with satellite dish icon and amber-indigo radar sweep pulse.
   - **Speaking**: `bg-purple-950/60 border-2 border-purple-400 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.45)] ring-4 ring-purple-500/20`.
   - **Error**: `bg-rose-950/70 border-2 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]`.

3. **Audio Level Visualizer**:
   - When **Listening**, an outer SVG pulse ring scales proportionally with `inputVolume` ($1.0$ to $1.35$ scale).
   - When **Speaking**, dynamic wave bars oscillate proportionally with `outputVolume`.

---

## 3. Searching Indicator Integration

- **Appearance**: A dedicated floating status pill anchored directly above or adjacent to the primary mic orb.
- **Typography**: Cairo Medium 13px (`font-cairo text-xs md:text-sm text-cyan-200 font-medium`).
- **Icon**: Radar / Satellite icon with continuous radar ping pulse.
- **Timing**:
  - Appears within $100\text{ms}$ of search tool execution.
  - Automatically hides within $100\text{ms}$ when audio playback commences or search resolves.
- **Interruption**: User interruption immediately clears the indicator and transitions dock to "Listening".

---

## 4. Touch & Accessibility Rules

- Minimum touch target dimension: $48\times 48\text{ CSS pixels}$ on all clickable elements.
- Accessible ARIA labels:
  - Idle: `aria-label="ابدأ المحادثة الصوتية مع رائد الفضاء - Start voice conversation"`
  - Active: `aria-label="إنهاء المحادثة الصوتية - End voice conversation"`
  - Error: `aria-label="حدث خطأ، انقر لإعادة المحاولة - Error occurred, tap to retry"`
- Keyboard triggers: Enter and Space keys toggle the session smoothly.
