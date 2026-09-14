/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useMockLocation } from './hooks/useMockLocation';
import { MapComponent } from './components/MapComponent';
import { TopHeader } from './components/TopHeader';
import { BottomControlBar } from './components/BottomControlBar';
import { FloatingJoystick } from './components/FloatingJoystick';
import { RouteModal } from './components/RouteModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ApkExportModal } from './components/ApkExportModal';
import { SettingsModal } from './components/SettingsModal';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const {
    coords,
    status,
    toggleMockStatus,
    stopMocking,
    settings,
    setSettings,
    favorites,
    addFavorite,
    removeFavorite,
    history,
    clearHistory,
    teleport,
    setJoystickVector,
    getDeviceLocation,
    getCurrentSpeedKmh,
    routeWaypoints,
    setRouteWaypoints,
    isRoutePlaying,
    setIsRoutePlaying,
    isRouteLooping,
    setIsRouteLooping,
    currentWaypointIndex,
    setCurrentWaypointIndex,
  } = useMockLocation();

  // Modals & UI states
  const [isJoystickOpen, setIsJoystickOpen] = useState(true);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAddingWaypoints, setIsAddingWaypoints] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Override browser geolocation when mock location is active
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    if (status === 'active') {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      const originalWatchPosition = navigator.geolocation.watchPosition;

      const createMockPosition = (): GeolocationPosition => {
        return {
          coords: {
            latitude: coords.lat,
            longitude: coords.lng,
            accuracy: settings.accuracyMeters,
            altitude: settings.altitudeMeters,
            altitudeAccuracy: 5,
            heading: coords.bearing,
            speed: (coords.speed * 1000) / 3600,
            toJSON: () => ({}),
          },
          timestamp: Date.now(),
          toJSON: () => ({}),
        } as unknown as GeolocationPosition;
      };

      // Mock getCurrentPosition
      navigator.geolocation.getCurrentPosition = function (success, error, options) {
        success(createMockPosition());
      };

      // Mock watchPosition
      navigator.geolocation.watchPosition = function (success, error, options) {
        success(createMockPosition());
        const intervalId = window.setInterval(() => {
          success(createMockPosition());
        }, 1000);
        return intervalId;
      };

      return () => {
        navigator.geolocation.getCurrentPosition = originalGetCurrentPosition;
        navigator.geolocation.watchPosition = originalWatchPosition;
      };
    }
  }, [status, coords.lat, coords.lng, coords.bearing, coords.speed, settings.accuracyMeters, settings.altitudeMeters]);

  // Handle location picking from map or search
  const handleLocationSelect = useCallback(
    (lat: number, lng: number, name?: string) => {
      teleport(lat, lng);
      showToast(name ? `Teleported to ${name.split(',')[0]}` : `Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    },
    [teleport, showToast]
  );

  // Waypoints management
  const handleAddWaypoint = useCallback((lat: number, lng: number) => {
    setRouteWaypoints((prev) => [
      ...prev,
      {
        id: 'wp-' + Date.now(),
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      },
    ]);
    showToast('Waypoint added to route');
  }, [setRouteWaypoints, showToast]);

  const handleAddCurrentLocationAsWaypoint = useCallback(() => {
    handleAddWaypoint(coords.lat, coords.lng);
  }, [handleAddWaypoint, coords.lat, coords.lng]);

  const handleRemoveWaypoint = useCallback((index: number) => {
    setRouteWaypoints((prev) => prev.filter((_, idx) => idx !== index));
  }, [setRouteWaypoints]);

  const handleClearWaypoints = useCallback(() => {
    setRouteWaypoints([]);
    setIsRoutePlaying(false);
    showToast('Route cleared');
  }, [setRouteWaypoints, setIsRoutePlaying, showToast]);

  // Device location
  const handleGetDeviceLocation = async () => {
    try {
      showToast('Acquiring device GPS...');
      const loc = await getDeviceLocation();
      showToast(`Centered on device: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Permission denied';
      showToast(`Could not fetch location: ${msg}`);
    }
  };

  return (
    <div id="jaga-badlo-app" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      <OfflineIndicator />

      {/* Interactive Map Surface */}
      <MapComponent
        coords={coords}
        status={status}
        mapLayer={settings.mapLayer}
        accuracyMeters={settings.accuracyMeters}
        autoCenter={settings.autoCenterMap}
        routeWaypoints={routeWaypoints}
        currentWaypointIndex={currentWaypointIndex}
        isAddingWaypoints={isAddingWaypoints}
        onLocationSelect={handleLocationSelect}
        onAddWaypoint={handleAddWaypoint}
      />

      {/* Top Header Controls (Search, Status, APK, Settings) */}
      <TopHeader
        status={status}
        coords={coords}
        mapLayer={settings.mapLayer}
        onMapLayerChange={(mapLayer) => setSettings((prev) => ({ ...prev, mapLayer }))}
        onLocationSelect={handleLocationSelect}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onToggleMock={toggleMockStatus}
      />

      {/* Floating GPS Joystick Overlay */}
      <FloatingJoystick
        onVectorChange={setJoystickVector}
        speedMode={settings.speedMode}
        onSpeedModeChange={(speedMode) => setSettings((prev) => ({ ...prev, speedMode }))}
        currentSpeed={coords.speed}
        bearing={coords.bearing}
        opacity={settings.joystickOpacity}
        isOpen={isJoystickOpen}
        onToggleOpen={() => setIsJoystickOpen((p) => !p)}
      />

      {/* Bottom Main Action Bar & Coordinates Card */}
      <BottomControlBar
        coords={coords}
        status={status}
        isJoystickOpen={isJoystickOpen}
        onToggleJoystick={() => setIsJoystickOpen((p) => !p)}
        onToggleMock={toggleMockStatus}
        onStopMock={stopMocking}
        onRecenter={() => teleport(coords.lat, coords.lng)}
        onDeviceLocation={handleGetDeviceLocation}
        onOpenFavorites={() => setIsFavoritesDrawerOpen(true)}
        onSaveBookmark={() => setIsAddBookmarkModalOpen(true)}
        onOpenRoute={() => setIsRouteModalOpen(true)}
      />

      {/* Route Simulator Modal */}
      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        waypoints={routeWaypoints}
        onAddCurrentLocationAsWaypoint={handleAddCurrentLocationAsWaypoint}
        onRemoveWaypoint={handleRemoveWaypoint}
        onClearWaypoints={handleClearWaypoints}
        isAddingWaypoints={isAddingWaypoints}
        onToggleAddWaypoints={() => {
          setIsAddingWaypoints((p) => !p);
          if (!isAddingWaypoints) {
            showToast('Tap anywhere on the map to add waypoints');
            setIsRouteModalOpen(false);
          }
        }}
        isPlaying={isRoutePlaying}
        onTogglePlayRoute={() => {
          if (!isRoutePlaying) {
            setIsRoutePlaying(true);
            showToast('Simulating route movement...');
          } else {
            setIsRoutePlaying(false);
            showToast('Route simulation paused');
          }
        }}
        isLooping={isRouteLooping}
        onToggleLooping={() => setIsRouteLooping((p) => !p)}
        currentWaypointIndex={currentWaypointIndex}
        speedMode={settings.speedMode}
        onSpeedModeChange={(speedMode) => setSettings((prev) => ({ ...prev, speedMode }))}
      />

      {/* Favorites, History & World Presets Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesDrawerOpen}
        onClose={() => setIsFavoritesDrawerOpen(false)}
        favorites={favorites}
        history={history}
        onSelectLocation={(lat, lng, alt) => {
          teleport(lat, lng, alt);
          showToast('Teleported to selected spot');
        }}
        onRemoveFavorite={removeFavorite}
        onClearHistory={clearHistory}
      />

      {/* Save Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddBookmarkModalOpen}
        onClose={() => setIsAddBookmarkModalOpen(false)}
        coords={coords}
        onSave={(name, lat, lng, alt) => {
          addFavorite(name, lat, lng, alt);
          showToast(`Saved "${name}" to Favorites`);
        }}
      />

      {/* APK Export & Install Modal */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Android Developer Options Setup Guide */}
      <AndroidGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Settings Modal (Accuracy, Altitude, Satellites) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
      />

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs font-medium px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Waypoint Adding Banner Indicator */}
      {isAddingWaypoints && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <span>Click anywhere on the map to add waypoint</span>
          <button
            onClick={() => {
              setIsAddingWaypoints(false);
              setIsRouteModalOpen(true);
            }}
            className="px-2 py-0.5 rounded bg-slate-950 text-white text-[10px] font-semibold hover:bg-slate-900"
          >
            Done ({routeWaypoints.length} pts)
          </button>
        </div>
      )}
    </div>
  );
}
