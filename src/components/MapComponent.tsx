import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GeoCoordinates, MapTileLayer, RouteWaypoint, MockStatus } from '../types';

interface MapComponentProps {
  coords: GeoCoordinates;
  status: MockStatus;
  mapLayer: MapTileLayer;
  accuracyMeters: number;
  autoCenter: boolean;
  routeWaypoints: RouteWaypoint[];
  currentWaypointIndex: number;
  isAddingWaypoints: boolean;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddWaypoint: (lat: number, lng: number) => void;
}

const TILE_URLS: Record<MapTileLayer, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 20,
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  coords,
  status,
  mapLayer,
  accuracyMeters,
  autoCenter,
  routeWaypoints,
  currentWaypointIndex,
  isAddingWaypoints,
  onLocationSelect,
  onAddWaypoint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 16,
      zoomControl: false,
    });

    // Custom attribution positioning
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Initial tile layer
    const layerConfig = TILE_URLS[mapLayer];
    const tileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Accuracy Circle
    const accuracyCircle = L.circle([coords.lat, coords.lng], {
      radius: accuracyMeters,
      color: status === 'active' ? '#10b981' : '#3b82f6',
      fillColor: status === 'active' ? '#10b981' : '#3b82f6',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: status === 'active' ? undefined : '4, 4',
    }).addTo(map);
    accuracyCircleRef.current = accuracyCircle;

    // Custom DivIcon for Mock Pin
    const createMarkerIcon = (bearing: number, isActive: boolean) => {
      const pinColor = isActive ? '#10b981' : '#2563eb';
      const pulseHtml = isActive
        ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>`
        : '';

      return L.divIcon({
        className: 'custom-gps-pin',
        html: `
          <div class="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6">
            ${pulseHtml}
            <!-- Outer ring -->
            <div class="w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform"
                 style="background: ${pinColor}; transform: rotate(${bearing}deg)">
              <!-- Direction arrow -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
              </svg>
            </div>
            <!-- Center target dot -->
            <div class="absolute w-2 h-2 rounded-full bg-white shadow-sm"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Marker
    const marker = L.marker([coords.lat, coords.lng], {
      draggable: true,
      icon: createMarkerIcon(coords.bearing, status === 'active'),
    }).addTo(map);

    marker.on('dragend', (e) => {
      const target = e.target as L.Marker;
      const pos = target.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });

    markerRef.current = marker;
    mapRef.current = map;

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isAddingWaypoints) {
        onAddWaypoint(e.latlng.lat, e.latlng.lng);
      } else {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    });

    // ResizeObserver to keep leaflet container sized correctly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer when mapLayer changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const layerConfig = TILE_URLS[mapLayer];
    const newLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
    }).addTo(mapRef.current);
    tileLayerRef.current = newLayer;
  }, [mapLayer]);

  // Update marker position and appearance
  useEffect(() => {
    if (!markerRef.current || !accuracyCircleRef.current || !mapRef.current) return;

    const latLng = L.latLng(coords.lat, coords.lng);
    markerRef.current.setLatLng(latLng);

    // Update marker icon with heading & active color
    const pinColor = status === 'active' ? '#10b981' : '#2563eb';
    const pulseHtml = status === 'active'
      ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>`
      : '';

    const newIcon = L.divIcon({
      className: 'custom-gps-pin',
      html: `
        <div class="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6">
          ${pulseHtml}
          <div class="w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform duration-200"
               style="background: ${pinColor}; transform: rotate(${coords.bearing}deg)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
          <div class="absolute w-2 h-2 rounded-full bg-white shadow-sm"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    markerRef.current.setIcon(newIcon);

    // Update Accuracy Circle
    accuracyCircleRef.current.setLatLng(latLng);
    accuracyCircleRef.current.setRadius(accuracyMeters);
    accuracyCircleRef.current.setStyle({
      color: status === 'active' ? '#10b981' : '#3b82f6',
      fillColor: status === 'active' ? '#10b981' : '#3b82f6',
      fillOpacity: status === 'active' ? 0.2 : 0.12,
      dashArray: status === 'active' ? undefined : '4, 4',
    });

    if (autoCenter) {
      mapRef.current.panTo(latLng, { animate: true, duration: 0.4 });
    }
  }, [coords.lat, coords.lng, coords.bearing, status, accuracyMeters, autoCenter]);

  // Update Route Polyline & Waypoints
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old waypoint markers
    waypointMarkersRef.current.forEach((m) => m.remove());
    waypointMarkersRef.current = [];

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (routeWaypoints.length > 0) {
      const latLngs = routeWaypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);

      routePolylineRef.current = L.polyline(latLngs, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(mapRef.current);

      // Add small numbered markers
      routeWaypoints.forEach((wp, idx) => {
        const isCurrent = idx === currentWaypointIndex;
        const wpIcon = L.divIcon({
          className: 'custom-wp-pin',
          html: `
            <div class="flex items-center justify-center w-6 h-6 -ml-3 -mt-3 rounded-full text-[11px] font-bold text-white border-2 border-white shadow-md ${
              isCurrent ? 'bg-emerald-600 scale-125 ring-4 ring-emerald-400/40' : 'bg-amber-600'
            }">
              ${idx + 1}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const m = L.marker([wp.lat, wp.lng], { icon: wpIcon }).addTo(mapRef.current!);
        waypointMarkersRef.current.push(m);
      });
    }
  }, [routeWaypoints, currentWaypointIndex]);

  return (
    <div className="relative w-full h-full">
      <div id="leaflet-map-container" ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Screen Center Crosshair Reticle for precision pinpointing */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-8 h-[1px] bg-slate-400/50"></div>
          <div className="h-8 w-[1px] bg-slate-400/50 absolute"></div>
          <div className="w-3 h-3 rounded-full border border-sky-400/70 absolute"></div>
        </div>
      </div>
    </div>
  );
};
