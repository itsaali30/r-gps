import React from 'react';
import {
  X,
  Sliders,
  Gauge,
  Satellite,
  Compass,
  Move,
  Layers,
  Check,
} from 'lucide-react';
import { AppSettings, SpeedMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">GPS Emulator Settings</h2>
              <p className="text-xs text-slate-400">Configure accuracy, altitude, and joystick telemetry</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Accuracy Setting */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>GPS Accuracy Radius</span>
              </div>
              <span className="font-mono text-sky-400 font-bold">±{settings.accuracyMeters} meters</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulates realistic GPS jitter and positional variance radius.
            </p>
            <input
              id="slider-accuracy"
              type="range"
              min="1"
              max="100"
              value={settings.accuracyMeters}
              onChange={(e) => onUpdateSettings({ accuracyMeters: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Altitude Setting */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>Simulated Altitude (Elevation)</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">{settings.altitudeMeters} m ASL</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Altitude above sea level fed into mock GPS NMEA sentence.
            </p>
            <input
              id="slider-altitude"
              type="range"
              min="-20"
              max="3500"
              step="5"
              value={settings.altitudeMeters}
              onChange={(e) => onUpdateSettings({ altitudeMeters: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Satellites in View */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Satellite className="w-4 h-4 text-amber-400" />
                <span>Simulated Satellites in View</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">{settings.simulatedSatellites} satellites</span>
            </div>
            <input
              id="slider-satellites"
              type="range"
              min="4"
              max="32"
              value={settings.simulatedSatellites}
              onChange={(e) => onUpdateSettings({ simulatedSatellites: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Custom Speed Slider */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold">Custom Speed Setting</span>
              <span className="font-mono text-sky-400 font-bold">{settings.customSpeedKmh} km/h</span>
            </div>
            <input
              id="slider-custom-speed"
              type="range"
              min="1"
              max="200"
              step="1"
              value={settings.customSpeedKmh}
              onChange={(e) => onUpdateSettings({ customSpeedKmh: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Joystick Opacity */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Move className="w-4 h-4 text-cyan-400" />
                <span>Joystick Overlay Opacity</span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(settings.joystickOpacity * 100)}%</span>
            </div>
            <input
              id="slider-joystick-opacity"
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={settings.joystickOpacity}
              onChange={(e) => onUpdateSettings({ joystickOpacity: Number(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Auto Center Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-200 font-semibold">Auto-Center Map on Move</span>
              <p className="text-[11px] text-slate-400">Keep marker in viewport while walking or driving</p>
            </div>
            <button
              id="btn-toggle-autocenter"
              onClick={() => onUpdateSettings({ autoCenterMap: !settings.autoCenterMap })}
              className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                settings.autoCenterMap ? 'bg-sky-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoCenterMap ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
