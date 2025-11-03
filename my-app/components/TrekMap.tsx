'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trek } from '@/types/trek';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Custom icons for different marker types
const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const wasteIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const routeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface TrekMapProps {
  trek: Trek;
}

export default function TrekMap({ trek }: TrekMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <span>Loading map...</span>
      </div>
    );
  }

  // Calculate center of the map based on points
  const shops = trek.shops || [];
  const wastePoints = trek.wastePoints || [];
  const routePoints = trek.route || [];
  const allPoints = [...shops, ...wastePoints, ...routePoints];
  
  let center: [number, number] = [28.5, 84.0]; // Annapurna region default
  if (allPoints.length > 0) {
    const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
    center = [avgLat, avgLng];
  }

  // Create route line coordinates
  const routeCoordinates = routePoints.map(point => [point.lat, point.lng] as [number, number]);

  return (
    <div style={{ height: '600px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        className="h-[600px] w-full rounded-lg"
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        
        {/* Route line */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="red"
            weight={3}
            opacity={0.7}
          />
        )}
        
        {/* Route points */}
        {routePoints.map((point, index) => (
          <Marker key={`route-${index}`} position={[point.lat, point.lng]} icon={routeIcon}>
            <Popup>
              <strong>📍 {point.name}</strong>
              <br />
              <span className="text-sm">Altitude: {point.altitude}</span>
            </Popup>
          </Marker>
        ))}
        
        {/* Shops */}
        {shops.map((shop, index) => (
          <Marker key={`shop-${index}`} position={[shop.lat, shop.lng]} icon={shopIcon}>
            <Popup>
              <strong>🏪 {shop.name}</strong>
              <br />
              <span className="text-sm">{shop.description || 'Shop at this location'}</span>
            </Popup>
          </Marker>
        ))}
        
        {/* Waste points */}
        {wastePoints.map((point, index) => (
          <Marker key={`waste-${index}`} position={[point.lat, point.lng]} icon={wasteIcon}>
            <Popup>
              <strong>♻️ Waste Disposal Point</strong>
              <br />
              <span className="text-sm">{point.description || 'Please dispose of waste responsibly'}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
