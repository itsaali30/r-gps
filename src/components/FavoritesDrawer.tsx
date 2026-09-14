import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  Globe2,
  Trash2,
  Navigation2,
  Bookmark,
  MapPin,
} from 'lucide-react';
import { FavoriteLocation } from '../types';
import { POPULAR_LOCATIONS } from '../utils/geo';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteLocation[];
  history: FavoriteLocation[];
  onSelectLocation: (lat: number, lng: number, alt?: number) => void;
  onRemoveFavorite: (id: string) => void;
  onClearHistory: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  history,
  onSelectLocation,
  onRemoveFavorite,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'presets' | 'history'>('favorites');

  if (!isOpen) return null;

  const userFavorites = favorites.filter((f) => f.category === 'favorite');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-slate-100 text-base">Locations & Presets</h2>
          </div>
          <button
            id="btn-close-favorites-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 p-1.5 gap-1 bg-slate-950/40">
          <button
            id="tab-saved-favorites"
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'favorites'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Saved ({userFavorites.length})</span>
          </button>

          <button
            id="tab-world-presets"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'presets'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>World Spots</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeTab === 'favorites' && (
            <>
              {userFavorites.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No saved places yet. Click the bookmark icon on the bottom control bar to save any location!
                </div>
              ) : (
                userFavorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-500/40 transition"
                  >
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs text-slate-100 truncate">{fav.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {fav.lat.toFixed(5)}, {fav.lng.toFixed(5)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onSelectLocation(fav.lat, fav.lng, fav.alt);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                        title="Teleport Here"
                      >
                        <Navigation2 className="w-3 h-3" />
                        <span>Go</span>
                      </button>
                      <button
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 px-1">
                Tap any famous spot to immediately teleport your mock GPS location there:
              </p>
              {POPULAR_LOCATIONS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between gap-3 hover:border-sky-500/40 transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs text-slate-100 truncate">{preset.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectLocation(preset.lat, preset.lng, preset.alt);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Navigation2 className="w-3 h-3" />
                    <span>Go</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.length > 0 && (
                <div className="flex justify-end px-1 mb-1">
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                </div>
              )}

              {history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No recent locations recorded yet.
                </div>
              ) : (
                history.map((hist) => (
                  <div
                    key={hist.id}
                    className="p-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="font-mono text-xs text-slate-300">
                      {hist.lat.toFixed(5)}, {hist.lng.toFixed(5)}
                    </div>
                    <button
                      onClick={() => {
                        onSelectLocation(hist.lat, hist.lng, hist.alt);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <Navigation2 className="w-3 h-3" />
                      <span>Teleport</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
