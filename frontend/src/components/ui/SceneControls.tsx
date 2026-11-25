import React, { useState } from 'react';
import { RotateCcw, Play, Pause, Info, Compass } from 'lucide-react';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { PLANETS_DATA } from '../../data/planets';
import { CreditsModal } from './CreditsModal';

export const SceneControls: React.FC = () => {
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const selectedPlanetId = useSolarSystemStore((state) => state.selectedPlanetId);
  const isOrbiting = useSolarSystemStore((state) => state.isOrbiting);
  const resetView = useSolarSystemStore((state) => state.resetView);
  const toggleOrbit = useSolarSystemStore((state) => state.toggleOrbit);
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet);

  const selectedPlanet = PLANETS_DATA.find((p) => p.id === selectedPlanetId);

  return (
    <>
      {/* Top Header & Overview Bar */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-lg">
          <Compass className="w-5 h-5 text-sky-400 animate-spin-slow" />
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              Solar System 3D
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400">
              النظام الشمسي التفاعلي
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsCreditsOpen(true)}
            aria-label="View Asset Credits"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow transition"
          >
            <Info className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Credits</span>
          </button>
        </div>
      </header>

      {/* Planet Quick-Select Strip (Desktop/Tablet) */}
      <nav aria-label="Planet quick selection" className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-full shadow-lg">
        {PLANETS_DATA.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPlanet(p.id)}
            className={`px-2.5 py-1 text-xs rounded-full transition ${
              selectedPlanetId === p.id
                ? 'bg-sky-500 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {p.name}
          </button>
        ))}
      </nav>

      {/* Bottom Information & Control Dock */}
      <footer className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-20 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Planet Inspector Card (visible when selected) */}
        <div className="pointer-events-auto w-full md:w-auto max-w-md">
          {selectedPlanet ? (
            <div className="p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl shadow-xl animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: selectedPlanet.color }}
                    />
                    <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                      {selectedPlanet.name}
                    </h2>
                    <span className="text-sm font-semibold text-sky-400">
                      {selectedPlanet.arabicName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {selectedPlanet.description}
                  </p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2.5">
                <div>
                  Distance: <span className="text-white font-mono">{selectedPlanet.distance} AU</span>
                </div>
                <div>
                  Radius: <span className="text-white font-mono">{selectedPlanet.radius} R⊕</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-slate-400 shadow">
              Click any planet to inspect &bull; انقر فوق أي كوكب للاستكشاف
            </div>
          )}
        </div>

        {/* Global Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Pause / Resume Orbit Button */}
          <button
            onClick={toggleOrbit}
            aria-label={isOrbiting ? 'Pause orbital motion' : 'Resume orbital motion'}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-slate-900/90 hover:bg-slate-800/90 backdrop-blur-md border border-slate-700/70 rounded-xl shadow-lg transition active:scale-95"
          >
            {isOrbiting ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pause Orbit</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Resume Orbit</span>
              </>
            )}
          </button>

          {/* Reset View Button (active when planet selected) */}
          {selectedPlanetId && (
            <button
              onClick={resetView}
              aria-label="Reset Camera View to Overview"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/30 transition active:scale-95 animate-fadeIn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset View</span>
            </button>
          )}
        </div>
      </footer>

      {/* Asset Credits Dialog */}
      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </>
  );
};
