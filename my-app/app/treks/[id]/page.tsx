'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { Trek } from '@/types/trek';

const TrekMap = dynamic(() => import('@/components/TrekMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <span>Loading map...</span>
    </div>
  ),
});

export default function TrekDetailsPage() {
  const params = useParams();
  const [trek, setTrek] = useState<Trek | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTrek();
    }
  }, [params.id]);

  const fetchTrek = async () => {
    try {
      const response = await fetch(`/api/treks/${params.id}`);
      const data = await response.json();
      console.log('Fetched trek data:', data);
      setTrek(data.trek);
    } catch (error) {
      console.error('Error fetching trek:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Loading trek...</span>
        </div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Trek not found.</span>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="h-64 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-9xl">🏔️</span>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-800">
                  {trek.name}
                </h1>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${difficultyColors[trek.difficulty]}`}>
                  {trek.difficulty.toUpperCase()}
                </span>
              </div>
              
              {/* Trek Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {trek.duration && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase mb-1">Duration</h3>
                    <p className="text-lg font-bold text-blue-800">{trek.duration}</p>
                  </div>
                )}
                {trek.maxAltitude && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-600 uppercase mb-1">Max Altitude</h3>
                    <p className="text-lg font-bold text-red-800">{trek.maxAltitude}</p>
                  </div>
                )}
                {trek.bestSeason && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-600 uppercase mb-1">Best Season</h3>
                    <p className="text-lg font-bold text-green-800">{trek.bestSeason}</p>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                {trek.description}
              </p>
              
              {/* Highlights */}
              {trek.highlights && trek.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🌟 Trek Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trek.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Route Information */}
              {trek.route && trek.route.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🗺️ Trek Route</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {trek.route.map((point, index) => (
                        <div key={index} className="text-center p-2 bg-white rounded border">
                          <div className="font-semibold text-gray-800">{point.name}</div>
                          <div className="text-sm text-gray-600">{point.altitude}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Shops on Route
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {trek.shops?.length || 0}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Waste Disposal Points
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {trek.wastePoints?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery Preview - Show first 3 photos */}
          {trek.photos && trek.photos.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📸 Photos from Start to Finish
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {trek.photos.length} {trek.photos.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
                
                {/* Show first 3 photos in grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {trek.photos.slice(0, 3).map((photo, index) => (
                    <Link
                      key={index}
                      href={`/treks/${trek._id}/photos?photo=${index}`}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer block"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Photo ${index + 1} of ${trek.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg">
                            🔍 View
                          </span>
                        </div>
                      </div>
                      
                      {/* Photo info */}
                      {(photo.caption || photo.routePointName) && (
                        <div className="p-3 bg-white">
                          {photo.routePointName && (
                            <div className="text-sm font-semibold text-blue-600 mb-1">
                              📍 {photo.routePointName}
                            </div>
                          )}
                          {photo.caption && (
                            <p className="text-sm text-gray-600 line-clamp-2">{photo.caption}</p>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Show More button if there are more than 3 photos */}
                {trek.photos.length > 3 && (
                  <div className="text-center">
                    <Link
                      href={`/treks/${trek._id}/photos`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                    >
                      Show More Photos ({trek.photos.length - 3} more) →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📍 Interactive Map (OSM) - Annapurna Circuit
            </h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                🔴 Route Points ({trek.route?.length || 0})
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                🔵 Shops ({trek.shops?.length || 0})
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                🟢 Waste Points ({trek.wastePoints?.length || 0})
              </span>
            </div>
            <TrekMap trek={trek} />
          </div>
        </div>
      </div>
    </div>
  );
}
