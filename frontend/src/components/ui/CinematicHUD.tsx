import React, { useState } from 'react';
import { Play, Pause, Info, RotateCcw } from 'lucide-react';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { PLANETS_DATA, SUN_CONFIG } from '../../data/planets';
import { CreditsModal } from './CreditsModal';

export const CinematicHUD: React.FC = () => {
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const selectedPlanetId = useSolarSystemStore((state) => state.selectedPlanetId);
  const isOrbiting = useSolarSystemStore((state) => state.isOrbiting);
  const toggleOrbit = useSolarSystemStore((state) => state.toggleOrbit);
  const resetView = useSolarSystemStore((state) => state.resetView);
  const selectPlanet = useSolarSystemStore((state) => state.selectPlanet);

  const activePlanet = selectedPlanetId === 'sun'
    ? SUN_CONFIG
    : PLANETS_DATA.find((p) => p.id === selectedPlanetId);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-3.5 py-3 md:px-6 md:py-4 pointer-events-none">
        {/* Quick Planet Navigation Strip (Desktop & Tablet) */}
        <nav aria-label="Planet navigation" className="pointer-events-auto hidden lg:flex items-center gap-1 px-3 py-1.5 bg-slate-950/80 backdrop-blur-xl border border-amber-500/25 rounded-full shadow-lg">
          <button
            onClick={() => selectPlanet('sun')}
            className={`px-2.5 py-1 text-xs rounded-full transition font-medium ${
              selectedPlanetId === 'sun'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-amber-300/70 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {SUN_CONFIG.name}
          </button>
          {PLANETS_DATA.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPlanet(p.id)}
              className={`px-2.5 py-1 text-xs rounded-full transition font-medium ${
                selectedPlanetId === p.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {p.name}
            </button>
          ))}
        </nav>

        {/* Top Right Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Active Planet Indicator & Reset View Button */}
          {activePlanet && (
            <button
              onClick={resetView}
              aria-label="Reset View"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/30 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset View ({activePlanet.name})</span>
            </button>
          )}

          {/* Orbit Pause / Resume */}
          <button
            onClick={toggleOrbit}
            aria-label={isOrbiting ? 'Pause orbital motion' : 'Resume orbital motion'}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-lg transition active:scale-95"
          >
            {isOrbiting ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Credits Dialog Toggle */}
          <button
            onClick={() => setIsCreditsOpen(true)}
            aria-label="View asset attribution"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-lg transition active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Credits</span>
          </button>
        </div>
      </header>

      {/* Asset Attribution Modal */}
      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </>
  );
};
