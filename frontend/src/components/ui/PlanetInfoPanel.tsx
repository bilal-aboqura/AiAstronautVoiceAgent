import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  Gauge,
  Globe2,
  Moon,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';
import { PLANETS_DATA, SUN_CONFIG } from '../../data/planets';

export const PlanetInfoPanel: React.FC = () => {
  const selectedPlanetId = useSolarSystemStore((state) => state.selectedPlanetId);
  const resetView = useSolarSystemStore((state) => state.resetView);

  const planet = selectedPlanetId === 'sun'
    ? SUN_CONFIG
    : PLANETS_DATA.find((p) => p.id === selectedPlanetId);

  return (
    <AnimatePresence>
      {planet && (
        <motion.aside
          key={planet.id}
          initial={{ x: -460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -460, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed top-16 md:top-20 bottom-4 left-3 md:left-6 z-30 w-[calc(100vw-1.5rem)] md:w-[420px] max-w-full flex flex-col pointer-events-auto"
        >
          <div className="relative flex-1 flex flex-col overflow-hidden bg-slate-950/85 backdrop-blur-2xl border border-amber-500/35 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.18)] text-slate-200">
            {/* Top Amber Glowing Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 shadow-[0_0_15px_#f59e0b]" />

            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-800/80">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={resetView}
                  aria-label="Back to Solar System overview"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition duration-200 group active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Solar System</span>
                </button>

                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-amber-300/90 bg-slate-900/90 border border-amber-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </div>
              </div>

              {/* Title & Badge */}
              <div className="mt-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider">
                      {planet.name}
                    </h2>
                    <span className="text-lg font-bold text-amber-400/90 font-sans">
                      {planet.arabicName}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/70 font-medium tracking-wide mt-0.5">
                    {planet.tagline}
                  </p>
                </div>

                {/* 3D Color Swatch Badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_currentColor]"
                  style={{ color: planet.color, backgroundColor: `${planet.color}22` }}
                >
                  <Globe2 className="w-5 h-5 text-current" />
                </div>
              </div>

              {/* Short Intro */}
              <p className="mt-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                {planet.description}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar">
              {/* Planetary Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Diameter */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Diameter</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.diameter}
                  </p>
                </div>

                {/* Mass */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mass</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.mass}
                  </p>
                </div>

                {/* Distance From Sun */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Distance from Sun</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.distanceFromSun}
                  </p>
                </div>

                {/* Orbital Period */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Orbital Period</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.orbitalPeriod}
                  </p>
                </div>

                {/* Rotation Period */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rotation Period</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.rotationPeriod}
                  </p>
                </div>

                {/* Moons */}
                <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Moons</span>
                  </div>
                  <p className="mt-1 text-xs md:text-sm font-bold text-white font-mono">
                    {planet.moonsCount} {planet.moonsCount === 1 ? 'Moon' : 'Moons'}
                  </p>
                </div>
              </div>

              {/* Temperature & Atmosphere */}
              <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Thermometer className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-slate-400">Temperature:</span>
                  <span className="text-white font-medium">{planet.temperature}</span>
                </div>
                <div className="flex items-start gap-2 text-xs border-t border-slate-800/60 pt-2">
                  <Wind className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Atmosphere:</span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{planet.atmosphere}</p>
                  </div>
                </div>
              </div>

              {/* Interesting Facts */}
              {planet.facts && planet.facts.length > 0 && (
                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fascinating Astronomical Facts</span>
                  </div>
                  <ul className="space-y-2">
                    {planet.facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Moons list if available */}
              {planet.moonsList && planet.moonsList.length > 0 && (
                <div className="p-3 bg-slate-900/50 border border-slate-800/60 rounded-xl text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Notable Moons: </span>
                  {planet.moonsList.join(', ')}
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
