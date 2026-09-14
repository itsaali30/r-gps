import React, { useState } from 'react';
import {
  Play,
  Square,
  Pause,
  Crosshair,
  Compass,
  Star,
  BookmarkPlus,
  Route,
  Copy,
  Check,
  Move,
  Navigation,
} from 'lucide-react';
import { GeoCoordinates, MockStatus } from '../types';
import { toDMS } from '../utils/geo';

interface BottomControlBarProps {
  coords: GeoCoordinates;
  status: MockStatus;
  isJoystickOpen: boolean;
  onToggleJoystick: () => void;
  onToggleMock: () => void;
  onStopMock: () => void;
  onRecenter: () => void;
  onDeviceLocation: () => void;
  onOpenFavorites: () => void;
  onSaveBookmark: () => void;
  onOpenRoute: () => void;
}

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  coords,
  status,
  isJoystickOpen,
  onToggleJoystick,
  onToggleMock,
  onStopMock,
  onRecenter,
  onDeviceLocation,
  onOpenFavorites,
  onSaveBookmark,
  onOpenRoute,
}) => {
  const [copied, setCopied] = useState(false);
  const [useDMS, setUseDMS] = useState(false);

  const handleCopyCoords = () => {
    const text = `${coords.lat.toFixed(7)}, ${coords.lng.toFixed(7)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer
      id="bottom-control-bar"
      className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-4 pointer-events-none"
    >
      <div className="max-w-xl mx-auto flex flex-col gap-2 pointer-events-auto">
        {/* Floating Quick Action Row (Above main card) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/70 shadow-lg">
            {/* Recenter */}
            <button
              id="btn-recenter"
              onClick={onRecenter}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Recenter Map on Target"
            >
              <Crosshair className="w-4 h-4 text-sky-400" />
            </button>

            {/* My Real Location */}
            <button
              id="btn-my-location"
              onClick={onDeviceLocation}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Get My Real Device GPS Location"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Save current location to favorites */}
            <button
              id="btn-save-bookmark"
              onClick={onSaveBookmark}
              className="p-2.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Bookmark this Location"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>

            {/* Route Simulator */}
            <button
              id="btn-open-route"
              onClick={onOpenRoute}
              className="p-2.5 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition"
              title="Route Simulator & Waypoints"
            >
              <Route className="w-4 h-4" />
            </button>

            {/* Favorites & History */}
            <button
              id="btn-open-favorites"
              onClick={onOpenFavorites}
              className="p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition"
              title="Favorites & World Presets"
            >
              <Star className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Toggle Joystick floating button */}
          <button
            id="btn-toggle-joystick-bar"
            onClick={onToggleJoystick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border backdrop-blur-md shadow-lg transition text-xs font-semibold ${
              isJoystickOpen
                ? 'bg-sky-600/90 text-white border-sky-400'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/70 hover:bg-slate-800'
            }`}
            title="Toggle Floating Joystick"
          >
            <Move className="w-4 h-4" />
            <span className="hidden sm:inline">Joystick</span>
          </button>
        </div>

        {/* Primary Control Card */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
          {/* Coordinates & Telemetry Readout */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Target Coordinates
                </span>
                <button
                  onClick={() => setUseDMS((p) => !p)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                >
                  {useDMS ? 'DMS' : 'DEC'}
                </button>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-sm sm:text-base font-mono font-bold text-slate-100 tracking-tight">
                  {useDMS
                    ? `${toDMS(coords.lat, true)}, ${toDMS(coords.lng, false)}`
                    : `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`}
                </span>
                <button
                  id="btn-copy-coords"
                  onClick={handleCopyCoords}
                  className="p-1 rounded text-slate-400 hover:text-white transition"
                  title="Copy Coordinates"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Sub-telemetry: Altitude & Accuracy */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>Alt: <strong className="text-slate-200">{coords.alt}m</strong></span>
                <span>•</span>
                <span>Acc: <strong className="text-slate-200">±{coords.accuracy}m</strong></span>
                <span>•</span>
                <span>Speed: <strong className="text-sky-400">{coords.speed} km/h</strong></span>
              </div>
            </div>

            {/* Quick Stop Button if Active */}
            {status !== 'stopped' && (
              <button
                id="btn-stop-mock"
                onClick={onStopMock}
                className="p-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 transition shrink-0 flex items-center justify-center"
                title="Stop Mocking"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>

          {/* Big Start / Pause Main Action Button */}
          <div className="w-full">
            <button
              id="btn-main-mock-toggle"
              onClick={onToggleMock}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 transition duration-200 shadow-xl active:scale-[0.98] ${
                status === 'active'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
                  : status === 'paused'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/50'
              }`}
            >
              {status === 'active' ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Mock GPS</span>
                </>
              ) : status === 'paused' ? (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Resume Mock GPS</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Jaga Badlo (Mock GPS)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
