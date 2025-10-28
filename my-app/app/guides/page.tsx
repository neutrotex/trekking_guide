'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import GuideCard from '@/components/GuideCard';
import { Guide } from '@/types/guide';

export default function GuidesPage() {
  const [guides, setGuides] = useState<(Guide & { userId?: { name: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/guides');
      
      if (!response.ok) {
        throw new Error('Failed to fetch guides from server');
      }
      
      const data = await response.json();
      setGuides(data.guides || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setError('Unable to load guides. Please check if the server is running and database is connected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          🧭 Guide Directory
        </h1>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchGuides}
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
            <p className="text-gray-600 mt-2">Loading guides...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No guides found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

