'use client';

import { useState, useEffect } from 'react';
import { TrekPhoto } from '@/types/trek';

interface TrekPhotoGalleryProps {
  photos: TrekPhoto[];
  trekName: string;
  initialPhotoIndex?: number | null;
}

export default function TrekPhotoGallery({ photos, trekName, initialPhotoIndex = null }: TrekPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(initialPhotoIndex);
  
  // Open modal if initialPhotoIndex is provided
  useEffect(() => {
    if (initialPhotoIndex !== null && initialPhotoIndex >= 0 && initialPhotoIndex < photos.length) {
      setSelectedPhoto(initialPhotoIndex);
    }
  }, [initialPhotoIndex, photos.length]);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📸 Photos from Start to Finish
        </h2>
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">📷</span>
          <p>No photos available for this trek yet.</p>
        </div>
      </div>
    );
  }

  const openModal = (index: number) => {
    setSelectedPhoto(index);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhoto === null) return;
    
    if (direction === 'prev') {
      setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : photos.length - 1);
    } else {
      setSelectedPhoto(selectedPhoto < photos.length - 1 ? selectedPhoto + 1 : 0);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📸 Photos from Start to Finish
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>
        
        {/* Photo Grid - Masonry style layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-4 cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => openModal(index)}
            >
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1} of ${trekName}`}
                  className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-lg flex items-center justify-center">
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
                  <div className="text-xs text-gray-400 mt-2">
                    Photo {index + 1} of {photos.length}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen Modal */}
      {selectedPhoto !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-6xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all"
                  aria-label="Previous photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigatePhoto('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all"
                  aria-label="Next photo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo */}
            <img
              src={photos[selectedPhoto].url}
              alt={photos[selectedPhoto].caption || `Photo ${selectedPhoto + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Photo info in modal */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 rounded-b-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {photos[selectedPhoto].routePointName && (
                <div className="text-white font-semibold text-lg mb-2">
                  📍 {photos[selectedPhoto].routePointName}
                </div>
              )}
              {photos[selectedPhoto].caption && (
                <p className="text-white text-sm mb-2">{photos[selectedPhoto].caption}</p>
              )}
              <div className="text-white/70 text-sm">
                Photo {selectedPhoto + 1} of {photos.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

