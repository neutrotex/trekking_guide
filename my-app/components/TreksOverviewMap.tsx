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
const trekIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const shopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -30],
});

const wasteIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -30],
});

interface TreksOverviewMapProps {
  treks: Trek[];
}

export default function TreksOverviewMap({ treks }: TreksOverviewMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span>Loading map...</span>
      </div>
    );
  }

  // Calculate center of the map based on all trek points
  const allPoints: Array<{ lat: number; lng: number }> = [];
  
  treks.forEach(trek => {
    if (trek.route && trek.route.length > 0) {
      allPoints.push(...trek.route);
    } else if (trek.shops && trek.shops.length > 0) {
      allPoints.push(...trek.shops);
    }
  });
  
  let center: [number, number] = [27.8, 85.0]; // Nepal center default
  if (allPoints.length > 0) {
    const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
    center = [avgLat, avgLng];
  }

  // Define colors for different treks
  const trekColors = ['red', 'blue', 'green', 'purple', 'orange'];

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        
        {treks.map((trek, trekIndex) => {
          // Route line for each trek
          const routeCoordinates = trek.route?.map(point => [point.lat, point.lng] as [number, number]) || [];
          const trekColor = trekColors[trekIndex % trekColors.length];
          
          return (
            <div key={trek._id}>
              {/* Route line */}
              {routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  color={trekColor}
                  weight={4}
                  opacity={0.8}
                />
              )}
              
              {/* Route points */}
              {trek.route?.map((point, pointIndex) => (
                <Marker key={`${trek._id}-route-${pointIndex}`} position={[point.lat, point.lng]} icon={trekIcon}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <strong>📍 {point.name}</strong>
                      <br />
                      <span className="text-sm text-gray-600">Altitude: {point.altitude}</span>
                      <br />
                      <span className="text-sm font-semibold text-blue-600">{trek.name}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Shops */}
              {trek.shops?.map((shop, shopIndex) => (
                <Marker key={`${trek._id}-shop-${shopIndex}`} position={[shop.lat, shop.lng]} icon={shopIcon}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <strong>🏪 {shop.name}</strong>
                      <br />
                      <span className="text-sm text-gray-600">{shop.description || 'Shop at this location'}</span>
                      <br />
                      <span className="text-sm font-semibold text-blue-600">{trek.name}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Waste points */}
              {trek.wastePoints?.map((point, wasteIndex) => (
                <Marker key={`${trek._id}-waste-${wasteIndex}`} position={[point.lat, point.lng]} icon={wasteIcon}>
                  <Popup>
                    <div className="min-w-[200px]">
                      <strong>♻️ Waste Disposal Point</strong>
                      <br />
                      <span className="text-sm text-gray-600">{point.description || 'Please dispose of waste responsibly'}</span>
                      <br />
                      <span className="text-sm font-semibold text-blue-600">{trek.name}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </div>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <h4 className="font-semibold text-gray-800 mb-2">Map Legend</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Route Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Shops</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Waste Points</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Trek Routes:</div>
            {treks.map((trek, index) => (
              <div key={trek._id} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-1 rounded" 
                  style={{ backgroundColor: trekColors[index % trekColors.length] }}
                ></div>
                <span className="truncate max-w-[120px]">{trek.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
