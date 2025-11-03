'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TrekPhotoGallery from '@/components/TrekPhotoGallery';
import { Trek } from '@/types/trek';

export default function TrekPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
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
          <span className="text-gray-600">Loading photos...</span>
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

  if (!trek.photos || trek.photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href={`/treks/${trek._id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              ← Back to Trek Details
            </Link>
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <span className="text-6xl mb-4 block">📷</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Photos Available</h2>
              <p className="text-gray-600 mb-6">This trek doesn't have any photos yet.</p>
              <Link
                href={`/treks/${trek._id}`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Back to Trek Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if a specific photo should be opened
  const photoIndex = searchParams.get('photo');
  const initialPhotoIndex = photoIndex ? parseInt(photoIndex, 10) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button and header */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={`/treks/${trek._id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {trek.name}
            </Link>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {trek.photos.length} {trek.photos.length === 1 ? 'photo' : 'photos'}
            </div>
          </div>

          {/* Full Photo Gallery */}
          <TrekPhotoGallery 
            photos={trek.photos} 
            trekName={trek.name}
            initialPhotoIndex={initialPhotoIndex}
          />
        </div>
      </div>
    </div>
  );
}

