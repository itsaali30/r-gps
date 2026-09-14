import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Layers,
  Settings,
  Download,
  HelpCircle,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { MapTileLayer, MockStatus, GeoCoordinates } from '../types';

interface TopHeaderProps {
  status: MockStatus;
  coords: GeoCoordinates;
  mapLayer: MapTileLayer;
  onMapLayerChange: (layer: MapTileLayer) => void;
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  onOpenSettings: () => void;
  onOpenApkModal: () => void;
  onOpenHelp: () => void;
  onToggleMock: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  status,
  coords,
  mapLayer,
  onMapLayerChange,
  onLocationSelect,
  onOpenSettings,
  onOpenApkModal,
  onOpenHelp,
  onToggleMock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
        setShowLayersDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search query with geocoding
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    // Direct coordinates check (e.g. "28.6139, 77.2090" or "28.6139 77.2090")
    const coordMatch = val.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setSearchResults([
          {
            display_name: `Jump to Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            lat: lat.toString(),
            lon: lng.toString(),
          },
        ]);
        setShowResults(true);
        return;
      }
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val
          )}&limit=5`
        );
        if (resp.ok) {
          const data = await resp.json();
          setSearchResults(data);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectResult = (latStr: string, lonStr: string, name: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);
    onLocationSelect(lat, lng, name);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header
      id="main-app-header"
      className="absolute top-0 left-0 right-0 z-20 px-3 py-2 sm:px-4 sm:py-3 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-lg">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-sky-600 text-white font-black text-sm shadow">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-sm tracking-tight">
                  Jaga Badlo
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                  GPS Emulator
                </span>
              </div>
            </div>
          </div>

          {/* Center Status Badge (Interactive toggle) */}
          <button
            id="btn-status-badge"
            onClick={onToggleMock}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition text-xs font-semibold ${
              status === 'active'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
                : status === 'paused'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 hover:bg-amber-900/80'
                : 'bg-slate-900/90 border-slate-700/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {status === 'active' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>MOCKING LOCATION</span>
                <Pause className="w-3 h-3 text-emerald-400 ml-0.5" />
              </>
            ) : status === 'paused' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>PAUSED</span>
                <Play className="w-3 h-3 text-amber-400 ml-0.5" />
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>GPS IDLE</span>
              </>
            )}
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Layers Switcher Button */}
            <div className="relative">
              <button
                id="btn-layer-switch"
                onClick={() => setShowLayersDropdown((p) => !p)}
                className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition ${
                  showLayersDropdown
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700/70 hover:bg-slate-800 hover:text-white'
                }`}
                title="Change Map Tiles"
              >
                <Layers className="w-4 h-4" />
              </button>

              {showLayersDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-44 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-30"
                >
                  {(
                    [
                      { id: 'street', label: 'Street Map' },
                      { id: 'satellite', label: 'Satellite Hybrid' },
                      { id: 'dark', label: 'Dark Tactical' },
                      { id: 'terrain', label: 'Topographic' },
                    ] as const
                  ).map((layer) => (
                    <button
                      key={layer.id}
                      id={`layer-option-${layer.id}`}
                      onClick={() => {
                        onMapLayerChange(layer.id);
                        setShowLayersDropdown(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg text-left flex items-center justify-between transition ${
                        mapLayer === layer.id
                          ? 'bg-sky-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{layer.label}</span>
                      {mapLayer === layer.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Need APK / Install Button */}
            <button
              id="btn-get-apk"
              onClick={onOpenApkModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/40 transition active:scale-95"
              title="Download APK / Install on Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get APK</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Developer Guide */}
            <button
              id="btn-open-help"
              onClick={onOpenHelp}
              className="p-2 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700/70 backdrop-blur-md shadow-lg hover:bg-slate-800 hover:text-white transition"
              title="Android Mock Location Setup Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700/70 backdrop-blur-md shadow-lg hover:bg-slate-800 hover:text-white transition"
              title="Settings & Accuracy"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="relative w-full max-w-lg mx-auto pointer-events-auto">
          <div className="relative flex items-center w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden focus-within:border-sky-500 transition">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              id="input-location-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true);
              }}
              placeholder="Search city, address, or lat, lng (e.g. 28.6139, 77.2295)"
              className="w-full bg-transparent px-3 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin mr-3 shrink-0" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="p-1 mr-2 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/98 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto z-40 divide-y divide-slate-800">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  id={`search-result-${i}`}
                  onClick={() =>
                    handleSelectResult(res.lat, res.lon, res.display_name)
                  }
                  className="w-full px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-start gap-2.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="line-clamp-2 leading-relaxed">{res.display_name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {parseFloat(res.lat).toFixed(5)}, {parseFloat(res.lon).toFixed(5)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
