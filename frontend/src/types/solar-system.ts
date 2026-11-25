export type CelestialBodyType = 'star' | 'planet' | 'moon';

export interface RingConfig {
  innerRadius: number;
  outerRadius: number;
  textureUrl?: string;
  tilt: number; // in radians
  opacity: number;
  color?: string;
}

export interface MoonConfig {
  id: string;
  name: string;
  arabicName: string;
  radius: number;
  distance: number; // distance from parent planet
  orbitalSpeed: number;
  rotationSpeed: number;
  color: string;
  textureUrl?: string;
}

export interface OrbitalElements {
  eccentricity: number;       // e (0 to <1)
  inclination: number;        // i in degrees relative to ecliptic
  longAscendingNode: number;  // Ω in degrees
  argPerihelion: number;      // ω in degrees
}

export interface CelestialBodyConfig {
  id: string;
  name: string;
  arabicName: string;
  type: CelestialBodyType;
  radius: number;
  distance: number; // distance from Sun (origin)
  orbitalSpeed: number; // relative orbital speed
  rotationSpeed: number; // self-rotation speed
  color: string; // fallback color
  textureUrl?: string;
  cloudsTextureUrl?: string;
  normalTextureUrl?: string;
  specularTextureUrl?: string;
  tilt?: number; // axial tilt in radians
  rings?: RingConfig;
  moons?: MoonConfig[];
  fixedPosition?: [number, number, number];
  orbitalElements?: OrbitalElements;
  orbitColor?: string;
  description: string;

  // Extended scientific specs for the futuristic information panel
  tagline: string;
  diameter: string;
  mass: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  moonsCount: number;
  moonsList: string[];
  temperature: string;
  atmosphere: string;
  facts: string[];
  atmosphereGlowColor?: string;
  hasAtmosphereGlow?: boolean;
}

export type CameraViewMode = 'overview' | 'focused';
export type RobotState = 'center' | 'walking_to_right' | 'right' | 'walking_to_center';
export type RobotAnimation = 'Idle' | 'Walking' | 'Running' | 'Wave' | 'Yes' | 'ThumbsUp' | 'Dance' | 'Punch' | 'Jump' | 'Standing';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  planetId?: string;
}

export interface SolarSystemState {
  // 3D Scene & Selection State
  selectedPlanetId: string | null;
  hoveredPlanetId: string | null;
  cameraMode: CameraViewMode;
  isOrbiting: boolean;
  orbitSpeedMultiplier: number;

  // Robot State
  robotState: RobotState;
  robotAnimation: RobotAnimation;
  robotPosition: [number, number, number];

  // Chat & AI State
  messages: ChatMessage[];
  isAiThinking: boolean;
  isChatOpen: boolean;

  // Actions
  selectPlanet: (id: string | null, source?: 'chat' | 'click' | 'button') => void;
  hoverPlanet: (id: string | null) => void;
  resetView: () => void;
  toggleOrbit: () => void;
  setOrbitSpeedMultiplier: (speed: number) => void;
  setRobotState: (state: RobotState) => void;
  setRobotAnimation: (anim: RobotAnimation) => void;
  setRobotPosition: (pos: [number, number, number]) => void;
  sendMessage: (text: string) => Promise<void>;
  setIsChatOpen: (open: boolean) => void;
  clearChat: () => void;
}
