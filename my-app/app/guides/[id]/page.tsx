'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Guide } from '@/types/guide';

export default function GuideDetailsPage() {
  const params = useParams();
  const [guide, setGuide] = useState<(Guide & { userId?: { name: string; email: string } }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchGuide();
    }
  }, [params.id]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/guides/${params.id}`);
      const data = await response.json();
      setGuide(data.guide);
    } catch (error) {
      console.error('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Loading guide...</span>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Guide not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-64 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              {guide.photoUrl ? (
                <img
                  src={guide.photoUrl}
                  alt={guide.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-9xl text-white">👤</span>
              )}
            </div>
            
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {guide.fullName}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Experience
                  </h3>
                  <p className="text-xl text-gray-800">{guide.experienceYears} years</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Wages
                  </h3>
                  <p className="text-xl text-green-600 font-semibold">₹{guide.wagesPerDay}/day</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Age
                  </h3>
                  <p className="text-xl text-gray-800">{guide.age} years old</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                    Education
                  </h3>
                  <p className="text-xl text-gray-800">{guide.education}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">{guide.bio}</p>
              </div>
              
              {guide.userId && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Email: <span className="text-gray-800">{guide.userId.email}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}