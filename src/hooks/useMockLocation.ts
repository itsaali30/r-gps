import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GeoCoordinates,
  MockStatus,
  SpeedMode,
  FavoriteLocation,
  RouteWaypoint,
  AppSettings,
} from '../types';
import {
  calculateDestination,
  calculateBearing,
  calculateDistance,
  SPEED_PRESETS_KMH,
  POPULAR_LOCATIONS,
} from '../utils/geo';

const DEFAULT_SETTINGS: AppSettings = {
  speedMode: 'walk',
  customSpeedKmh: 5.0,
  accuracyMeters: 6.0,
  altitudeMeters: 142.0,
  simulatedSatellites: 16,
  speedUnit: 'kmh',
  joystickSize: 'md',
  joystickOpacity: 0.85,
  autoCenterMap: true,
  mapLayer: 'street',
};

const DEFAULT_COORDS: GeoCoordinates = {
  lat: 28.6129, // India Gate default
  lng: 77.2295,
  alt: 142,
  accuracy: 6,
  speed: 0,
  bearing: 0,
};

export function useMockLocation() {
  const [coords, setCoords] = useState<GeoCoordinates>(() => {
    try {
      const saved = localStorage.getItem('jb_last_coords');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_COORDS;
  });

  const [status, setStatus] = useState<MockStatus>('stopped');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('jb_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    try {
      const saved = localStorage.getItem('jb_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return POPULAR_LOCATIONS;
  });

  const [history, setHistory] = useState<FavoriteLocation[]>(() => {
    try {
      const saved = localStorage.getItem('jb_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Route simulation state
  const [routeWaypoints, setRouteWaypoints] = useState<RouteWaypoint[]>([]);
  const [isRoutePlaying, setIsRoutePlaying] = useState(false);
  const [isRouteLooping, setIsRouteLooping] = useState(true);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

  // Active joystick movement direction
  const joystickVectorRef = useRef<{ x: number; y: number } | null>(null);
  const movementIntervalRef = useRef<number | null>(null);

  // Save coordinates to localStorage on change
  useEffect(() => {
    localStorage.setItem('jb_last_coords', JSON.stringify(coords));
  }, [coords]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('jb_settings', JSON.stringify(settings));
  }, [settings]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('jb_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save history
  useEffect(() => {
    localStorage.setItem('jb_history', JSON.stringify(history));
  }, [history]);

  // Get current speed in km/h based on profile
  const getCurrentSpeedKmh = useCallback((): number => {
    if (settings.speedMode === 'custom') {
      return settings.customSpeedKmh;
    }
    return SPEED_PRESETS_KMH[settings.speedMode] || 4.5;
  }, [settings.speedMode, settings.customSpeedKmh]);

  // Teleport to target location
  const teleport = useCallback((lat: number, lng: number, alt?: number) => {
    setCoords((prev) => {
      const updated: GeoCoordinates = {
        ...prev,
        lat: Number(lat.toFixed(7)),
        lng: Number(lng.toFixed(7)),
        alt: alt !== undefined ? alt : prev.alt,
        speed: 0,
      };
      return updated;
    });

    // Add to history
    const historyItem: FavoriteLocation = {
      id: 'hist-' + Date.now(),
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng,
      alt,
      category: 'history',
      timestamp: Date.now(),
    };
    setHistory((prev) => [historyItem, ...prev.slice(0, 24)]);
  }, []);

  // Update joystick movement vector
  const setJoystickVector = useCallback((vector: { x: number; y: number } | null) => {
    joystickVectorRef.current = vector;
  }, []);

  // Continuous movement loop for joystick
  useEffect(() => {
    const TICK_RATE_MS = 200; // 5 updates per second

    movementIntervalRef.current = window.setInterval(() => {
      const vector = joystickVectorRef.current;
      if (!vector || (vector.x === 0 && vector.y === 0)) {
        if (status === 'active') {
          setCoords((prev) => (prev.speed !== 0 ? { ...prev, speed: 0 } : prev));
        }
        return;
      }

      // Calculate bearing from vector:
      // x: right positive, left negative
      // y: up positive (north), down negative (south)
      const angleRad = Math.atan2(vector.x, vector.y);
      let bearing = Math.round((angleRad * 180) / Math.PI);
      if (bearing < 0) bearing += 360;

      const magnitude = Math.min(Math.sqrt(vector.x * vector.x + vector.y * vector.y), 1.0);
      const baseSpeed = getCurrentSpeedKmh();
      const currentSpeed = baseSpeed * magnitude; // scale with joystick displacement

      // distance in meters moved in this tick
      const metersPerSec = (currentSpeed * 1000) / 3600;
      const distanceMeters = metersPerSec * (TICK_RATE_MS / 1000);

      setCoords((prev) => {
        const dest = calculateDestination(prev.lat, prev.lng, distanceMeters, bearing);
        return {
          ...prev,
          lat: dest.lat,
          lng: dest.lng,
          speed: Number(currentSpeed.toFixed(1)),
          bearing,
        };
      });
    }, TICK_RATE_MS);

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, [getCurrentSpeedKmh, status]);

  // Route playback simulation loop
  useEffect(() => {
    if (!isRoutePlaying || routeWaypoints.length < 2) return;

    const ROUTE_TICK_MS = 300;
    const targetWp = routeWaypoints[currentWaypointIndex];

    const timer = window.setInterval(() => {
      setCoords((prev) => {
        const dist = calculateDistance(prev.lat, prev.lng, targetWp.lat, targetWp.lng);
        const speedKmh = getCurrentSpeedKmh();
        const stepMeters = (speedKmh * 1000 * (ROUTE_TICK_MS / 1000)) / 3600;

        if (dist <= stepMeters || dist < 2) {
          // Reached waypoint!
          const nextIndex = currentWaypointIndex + 1;
          if (nextIndex < routeWaypoints.length) {
            setCurrentWaypointIndex(nextIndex);
          } else {
            if (isRouteLooping) {
              setCurrentWaypointIndex(0);
            } else {
              setIsRoutePlaying(false);
            }
          }
          return {
            ...prev,
            lat: targetWp.lat,
            lng: targetWp.lng,
            speed: speedKmh,
          };
        } else {
          const bearing = calculateBearing(prev.lat, prev.lng, targetWp.lat, targetWp.lng);
          const nextPos = calculateDestination(prev.lat, prev.lng, stepMeters, bearing);
          return {
            ...prev,
            lat: nextPos.lat,
            lng: nextPos.lng,
            speed: speedKmh,
            bearing,
          };
        }
      });
    }, ROUTE_TICK_MS);

    return () => clearInterval(timer);
  }, [
    isRoutePlaying,
    routeWaypoints,
    currentWaypointIndex,
    isRouteLooping,
    getCurrentSpeedKmh,
  ]);

  // Toggle mock location status: stopped -> active -> paused -> active ...
  const toggleMockStatus = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'stopped') return 'active';
      if (prev === 'active') return 'paused';
      return 'active';
    });
  }, []);

  const stopMocking = useCallback(() => {
    setStatus('stopped');
    setIsRoutePlaying(false);
    setCoords((prev) => ({ ...prev, speed: 0 }));
  }, []);

  // Add / remove favorites
  const addFavorite = useCallback((name: string, lat: number, lng: number, alt?: number) => {
    const newFav: FavoriteLocation = {
      id: 'fav-' + Date.now(),
      name,
      lat,
      lng,
      alt,
      category: 'favorite',
      timestamp: Date.now(),
    };
    setFavorites((prev) => [newFav, ...prev]);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Real location grabber
  const getDeviceLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, altitude, accuracy } = pos.coords;
          teleport(latitude, longitude, altitude || undefined);
          setCoords((prev) => ({
            ...prev,
            accuracy: Math.round(accuracy || prev.accuracy),
          }));
          resolve({ lat: latitude, lng: longitude });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, [teleport]);

  return {
    coords,
    setCoords,
    status,
    setStatus,
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
    // Route features
    routeWaypoints,
    setRouteWaypoints,
    isRoutePlaying,
    setIsRoutePlaying,
    isRouteLooping,
    setIsRouteLooping,
    currentWaypointIndex,
    setCurrentWaypointIndex,
  };
}
