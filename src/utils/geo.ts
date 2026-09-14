import { FavoriteLocation, RouteWaypoint } from '../types';

export const SPEED_PRESETS_KMH = {
  walk: 4.5,
  jog: 11.0,
  bike: 22.0,
  car: 65.0,
};

// Haversine formula to compute distance in meters between two lat/lng coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Destination point given distance (m) and bearing (degrees)
export function calculateDestination(
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingDeg: number
): { lat: number; lng: number } {
  const R = 6371e3;
  const δ = distanceMeters / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;

  const sinφ2 =
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
  const x = Math.cos(δ) - Math.sin(φ1) * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);

  const newLat = (φ2 * 180) / Math.PI;
  let newLng = (λ2 * 180) / Math.PI;

  // Normalize lng to [-180, 180]
  newLng = ((((newLng + 180) % 360) + 360) % 360) - 180;

  return { lat: Number(newLat.toFixed(7)), lng: Number(newLng.toFixed(7)) };
}

// Calculate bearing between two points in degrees (0 - 359)
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const brng = ((θ * 180) / Math.PI + 360) % 360;

  return Math.round(brng);
}

// Convert decimal to DMS (Degrees, Minutes, Seconds)
export function toDMS(coordinate: number, isLat: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  let direction = '';
  if (isLat) {
    direction = coordinate >= 0 ? 'N' : 'S';
  } else {
    direction = coordinate >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

// Format coordinates to standard decimal display string
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// Generate GPX file contents
export function generateGPX(
  name: string,
  waypoints: RouteWaypoint[] | { lat: number; lng: number }[]
): string {
  const time = new Date().toISOString();
  const trkpts = waypoints
    .map(
      (wp) =>
        `    <trkpt lat="${wp.lat}" lon="${wp.lng}">
      <time>${time}</time>
    </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Jaga Badlo GPS Emulator" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
    <time>${time}</time>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

// Download a text/blob file in browser
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Preset popular locations for quick testing and teleport
export const POPULAR_LOCATIONS: FavoriteLocation[] = [
  {
    id: 'delhi-india-gate',
    name: 'India Gate, New Delhi',
    lat: 28.6129,
    lng: 77.2295,
    alt: 215,
    category: 'preset',
  },
  {
    id: 'mumbai-gateway',
    name: 'Gateway of India, Mumbai',
    lat: 18.9220,
    lng: 72.8347,
    alt: 12,
    category: 'preset',
  },
  {
    id: 'taj-mahal',
    name: 'Taj Mahal, Agra',
    lat: 27.1751,
    lng: 78.0421,
    alt: 171,
    category: 'preset',
  },
  {
    id: 'dubai-burj',
    name: 'Burj Khalifa, Dubai',
    lat: 25.1972,
    lng: 55.2744,
    alt: 828,
    category: 'preset',
  },
  {
    id: 'tokyo-shibuya',
    name: 'Shibuya Crossing, Tokyo',
    lat: 35.6595,
    lng: 139.7005,
    alt: 32,
    category: 'preset',
  },
  {
    id: 'paris-eiffel',
    name: 'Eiffel Tower, Paris',
    lat: 48.8584,
    lng: 2.2945,
    alt: 35,
    category: 'preset',
  },
  {
    id: 'nyc-times-square',
    name: 'Times Square, New York',
    lat: 40.7580,
    lng: -73.9855,
    alt: 15,
    category: 'preset',
  },
  {
    id: 'london-big-ben',
    name: 'Big Ben, London',
    lat: 51.5007,
    lng: -0.1246,
    alt: 10,
    category: 'preset',
  },
  {
    id: 'sydney-opera',
    name: 'Opera House, Sydney',
    lat: -33.8568,
    lng: 151.2153,
    alt: 5,
    category: 'preset',
  },
];
