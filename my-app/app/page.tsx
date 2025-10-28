'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Trek } from '@/types/trek';
import { Guide } from '@/types/guide';

export default function HomePage() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [guides, setGuides] = useState<(Guide & { userId?: { name: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [treksRes, guidesRes] = await Promise.all([
        fetch('/api/treks'),
        fetch('/api/guides'),
      ]);
      
      if (!treksRes.ok || !guidesRes.ok) {
        throw new Error('Failed to fetch data from server');
      }
      
      const treksData = await treksRes.json();
      const guidesData = await guidesRes.json();
      
      setTreks(treksData.treks?.slice(0, 3) || []);
      setGuides(guidesData.guides?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unable to load data. Please check if the server is running and database is connected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            🏔️ Welcome to TrekGuide
          </h1>
          <p className="text-xl mb-8">
            Connect with expert guides and discover amazing trek routes
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/guides"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Find a Guide
            </Link>
            <Link
              href="/treks"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Explore Treks
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Treks */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Featured Treks</h2>
            <Link href="/treks" className="text-green-600 hover:text-green-700 font-semibold">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-600 mt-2">Loading treks...</p>
            </div>
          ) : treks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {treks.map((trek) => (
                <div key={trek._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-6xl">🏔️</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800">{trek.name}</h3>
                    <p className="text-gray-600 mt-2">{trek.description.substring(0, 100)}...</p>
                    <Link
                      href={`/treks/${trek._id}`}
                      className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No treks available yet.</p>
          )}
        </section>

        {/* Featured Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Featured Guides</h2>
            <Link href="/guides" className="text-green-600 hover:text-green-700 font-semibold">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-600 mt-2">Loading guides...</p>
            </div>
          ) : guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <div key={guide._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    {guide.photoUrl ? (
                      <img
                        src={guide.photoUrl}
                        alt={guide.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl text-white">👤</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800">{guide.fullName}</h3>
                    <p className="text-green-600 font-semibold">₹{guide.wagesPerDay}/day</p>
                    <p className="text-gray-600 mt-2">{guide.bio.substring(0, 80)}...</p>
                    <Link
                      href={`/guides/${guide._id}`}
                      className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No guides available yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
