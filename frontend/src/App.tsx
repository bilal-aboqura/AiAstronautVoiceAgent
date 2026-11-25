import React from 'react';
import { SolarSystemCanvas } from './components/canvas/SolarSystemCanvas';
import { CinematicHUD } from './components/ui/CinematicHUD';

export const App: React.FC = () => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {/* Full-screen 3D WebGL Solar System Canvas with Humanoid Robot */}
      <SolarSystemCanvas />

      {/* Clean Top Header & Navigation Strip */}
      <CinematicHUD />
    </main>
  );
};

export default App;
