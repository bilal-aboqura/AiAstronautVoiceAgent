import { create } from 'zustand';
import { SolarSystemState, RobotState, RobotAnimation, ChatMessage } from '../types/solar-system';
import { processAiQuery } from '../data/ai-knowledge';

export const useSolarSystemStore = create<SolarSystemState>((set, get) => ({
  // Scene & Selection
  selectedPlanetId: null,
  hoveredPlanetId: null,
  cameraMode: 'overview',
  isOrbiting: true,
  orbitSpeedMultiplier: 1.0,

  // Robot
  robotState: 'center',
  robotAnimation: 'Idle',
  robotPosition: [0, -2.2, 7],

  // Chat
  messages: [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Greetings, Explorer! I am your AI Space Exploration Guide. Ask me anything about our Solar System, like "Tell me about Earth" or "Explore Mars".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isAiThinking: false,
  isChatOpen: true,

  selectPlanet: (id: string | null) => {
    if (id !== null) {
      set({
        selectedPlanetId: id,
        cameraMode: 'focused',
        robotState: 'walking_to_right',
        robotAnimation: 'Walking',
      });
    } else {
      // Deselecting a planet: reset camera but keep robot stationary
      set({
        selectedPlanetId: null,
        cameraMode: 'overview',
        robotState: 'center',
        robotAnimation: 'Idle',
      });
    }
  },

  hoverPlanet: (id: string | null) =>
    set({
      hoveredPlanetId: id,
    }),

  resetView: () => {
    set({
      selectedPlanetId: null,
      cameraMode: 'overview',
      // Robot stays still — do not trigger walk animation on empty-space clicks
      robotState: 'center',
      robotAnimation: 'Idle',
    });
  },

  toggleOrbit: () =>
    set((state) => ({
      isOrbiting: !state.isOrbiting,
    })),

  setOrbitSpeedMultiplier: (speed: number) =>
    set({
      orbitSpeedMultiplier: speed,
    }),

  setRobotState: (robotState: RobotState) => set({ robotState }),
  setRobotAnimation: (robotAnimation: RobotAnimation) => set({ robotAnimation }),
  setRobotPosition: (robotPosition: [number, number, number]) => set({ robotPosition }),

  setIsChatOpen: (isChatOpen: boolean) => set({ isChatOpen }),

  clearChat: () =>
    set({
      messages: [
        {
          id: 'welcome-reset',
          sender: 'assistant',
          text: 'Memory refreshed. What celestial mystery shall we investigate next?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }),

  sendMessage: async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isAiThinking: true,
    }));

    // Realistic processing latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = processAiQuery(text);

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      planetId: result.planetId,
    };

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isAiThinking: false,
    }));

    if (result.planetId) {
      get().selectPlanet(result.planetId, 'chat');
    }

    if (result.animation) {
      get().setRobotAnimation(result.animation);
    }
  },
}));
