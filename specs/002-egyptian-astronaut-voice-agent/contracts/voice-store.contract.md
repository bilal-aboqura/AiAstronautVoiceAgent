# Contract: Frontend Voice State & Hook API

**Feature**: `002-egyptian-astronaut-voice-agent` | **Date**: 2026-11-23

## `useVoiceStore` (Zustand Store Interface)

Headless reactive state store providing unified status to UI components without coupling to 3D scene elements.

```typescript
export interface VoiceState {
  // Session & Agent Lifecycle
  agentState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  error: { code: string; message: string } | null;
  
  // Audio Dynamics
  isMuted: boolean;
  inputVolume: number;   // Normalized [0.0, 1.0] for mic visualizer
  outputVolume: number;  // Normalized [0.0, 1.0] for audio visualizer
  
  // Actions
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  toggleMute: () => void;
  clearError: () => void;
  
  // Internal Setters (consumed by voice agent hook/service)
  setAgentState: (state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error') => void;
  setVolumes: (input: number, output: number) => void;
  setError: (error: { code: string; message: string } | null) => void;
}
```

---

## Hook Interface: `useVoiceAgent`

Orchestrates session lifecycle, microphone capture, WebSocket communication, and audio playback.

```typescript
export interface UseVoiceAgentReturn {
  agentState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  error: { code: string; message: string } | null;
  inputVolume: number;
  outputVolume: number;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  isMuted: boolean;
  toggleMute: () => void;
}
```

---

## Hook Interface: `useMicrophone`

Manages browser microphone permissions, `AudioContext`, `AudioWorklet`, and PCM chunk emission.

```typescript
export interface UseMicrophoneOptions {
  sampleRate?: number; // Default: 16000
  onAudioChunk: (base64Pcm: string, rawVolume: number) => void;
  onError: (error: Error) => void;
}

export interface UseMicrophoneReturn {
  isRecording: boolean;
  hasPermission: boolean | null; // null = prompt not yet answered
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  volume: number; // 0.0 to 1.0
}
```

---

## Hook Interface: `useAudioPlayer`

Manages Web Audio output scheduling, 24kHz PCM decoding, gapless playback, and fast barge-in cancellation.

```typescript
export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  enqueueAudioChunk: (base64Pcm: string) => void;
  stopPlayback: () => void; // Immediate cutoff (<50ms)
  volume: number;           // 0.0 to 1.0
}
```
