'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import TrekCard from '@/components/TrekCard';
import { Trek } from '@/types/trek';

const TreksOverviewMap = dynamic(() => import('@/components/TreksOverviewMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <span>Loading map...</span>
    </div>
  ),
});

export default function TreksPage() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/treks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch treks from server');
      }
      
      const data = await response.json();
      console.log('Fetched treks data:', data);
      setTreks(data.treks || []);
    } catch (error) {
      console.error('Error fetching treks:', error);
      setError('Unable to load treks. Please check if the server is running and database is connected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          🏔️ Trek Routes
        </h1>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchTreks}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading treks...</p>
          </div>
        ) : treks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No treks found yet.</p>
            
            {/* Show empty map */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🗺️ Trek Routes Map
              </h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-gray-500 text-lg">No trek data available</span>
                    <br />
                    <span className="text-gray-400 text-sm">Connect to database to see trek routes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Map Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🗺️ All Trek Routes Overview
              </h2>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
                <TreksOverviewMap treks={treks} />
              </div>
            </div>
            
            {/* Trek Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treks.map((trek) => (
                <TrekCard key={trek._id} trek={trek} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

