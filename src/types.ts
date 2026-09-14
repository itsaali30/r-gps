export interface GeoCoordinates {
  lat: number;
  lng: number;
  alt: number; // in meters
  accuracy: number; // in meters
  speed: number; // in km/h
  bearing: number; // degrees 0-359
}

export type MockStatus = 'stopped' | 'active' | 'paused';

export type SpeedMode = 'walk' | 'jog' | 'bike' | 'car' | 'custom';

export interface FavoriteLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  alt?: number;
  category?: 'favorite' | 'history' | 'preset';
  timestamp?: number;
}

export interface RouteWaypoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
}

export type MapTileLayer = 'street' | 'satellite' | 'dark' | 'terrain';

export interface AppSettings {
  speedMode: SpeedMode;
  customSpeedKmh: number;
  accuracyMeters: number;
  altitudeMeters: number;
  simulatedSatellites: number;
  speedUnit: 'kmh' | 'mph';
  joystickSize: 'sm' | 'md' | 'lg';
  joystickOpacity: number; // 0.2 to 1.0
  autoCenterMap: boolean;
  mapLayer: MapTileLayer;
}
