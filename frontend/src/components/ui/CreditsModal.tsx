import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Asset Credits & Licensing
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            This interactive 3D solar system visualization uses free scientific and celestial textures in accordance with their respective open licenses:
          </p>

          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sky-300">Solar System Scope</span>
              <a
                href="https://www.solarsystemscope.com/textures/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Licensed under <strong>Creative Commons Attribution 4.0 International (CC-BY 4.0)</strong>. High-resolution planetary surface maps.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sky-300">NASA JPL & USGS Astrogeology</span>
              <a
                href="https://solarsystem.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              Public Domain celestial maps and astronomical parameters provided by NASA/JPL-Caltech.
            </p>
          </div>

          <p className="text-xs text-slate-500 italic">
            Zero external proprietary tracking, paid APIs, or commercial telemetry are used.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
