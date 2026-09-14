import React from 'react';
import {
  X,
  Plus,
  Play,
  Pause,
  Trash2,
  Repeat,
  Download,
  CheckCircle2,
  MapPin,
  Route as RouteIcon,
} from 'lucide-react';
import { RouteWaypoint, SpeedMode } from '../types';
import { generateGPX, downloadFile } from '../utils/geo';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: RouteWaypoint[];
  onAddCurrentLocationAsWaypoint: () => void;
  onRemoveWaypoint: (index: number) => void;
  onClearWaypoints: () => void;
  isAddingWaypoints: boolean;
  onToggleAddWaypoints: () => void;
  isPlaying: boolean;
  onTogglePlayRoute: () => void;
  isLooping: boolean;
  onToggleLooping: () => void;
  currentWaypointIndex: number;
  speedMode: SpeedMode;
  onSpeedModeChange: (mode: SpeedMode) => void;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  waypoints,
  onAddCurrentLocationAsWaypoint,
  onRemoveWaypoint,
  onClearWaypoints,
  isAddingWaypoints,
  onToggleAddWaypoints,
  isPlaying,
  onTogglePlayRoute,
  isLooping,
  onToggleLooping,
  currentWaypointIndex,
  speedMode,
  onSpeedModeChange,
}) => {
  if (!isOpen) return null;

  const handleExportGPX = () => {
    if (waypoints.length === 0) return;
    const gpxContent = generateGPX('Jaga_Badlo_Simulated_Route', waypoints);
    downloadFile(gpxContent, `jaga_badlo_route_${Date.now()}.gpx`, 'application/gpx+xml');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <RouteIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Route Simulator</h2>
              <p className="text-xs text-slate-400">Simulate moving along multi-point paths</p>
            </div>
          </div>
          <button
            id="btn-close-route-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-toggle-map-click-waypoints"
              onClick={onToggleAddWaypoints}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                isAddingWaypoints
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingWaypoints ? 'Tap Map to Add (ON)' : 'Click Map to Add Waypoint'}</span>
            </button>

            <button
              id="btn-add-current-wp"
              onClick={onAddCurrentLocationAsWaypoint}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Add Current Pin</span>
            </button>
          </div>

          {/* Route Options */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Repeat className="w-4 h-4 text-sky-400" />
              <span>Loop Continuously</span>
            </div>
            <button
              id="btn-toggle-loop"
              onClick={onToggleLooping}
              className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                isLooping ? 'bg-sky-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isLooping ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Waypoints List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Waypoints ({waypoints.length})</span>
              {waypoints.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    id="btn-export-gpx"
                    onClick={handleExportGPX}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export GPX</span>
                  </button>
                  <button
                    id="btn-clear-waypoints"
                    onClick={onClearWaypoints}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {waypoints.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No waypoints yet. Tap &quot;Click Map to Add Waypoint&quot; or &quot;Add Current Pin&quot; to build a walking or driving path.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {waypoints.map((wp, idx) => (
                  <div
                    key={wp.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      idx === currentWaypointIndex && isPlaying
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-[11px] truncate">
                        {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveWaypoint(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition"
                      title="Remove Waypoint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer / Play Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3">
          <button
            id="btn-play-pause-route"
            disabled={waypoints.length < 2}
            onClick={onTogglePlayRoute}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
              waypoints.length < 2
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Route Playback</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Simulating Route</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
