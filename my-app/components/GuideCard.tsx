'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Guide } from '@/types/guide';
import BookingCalendar from './BookingCalendar';

interface GuideCardProps {
  guide: Guide & { userId?: { name: string; email: string } };
}

export default function GuideCard({ guide }: GuideCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { data: session } = useSession();

  const handleBookGuide = () => {
    setShowModal(false);
    setShowCalendar(true);
  };

  const handleConfirmBooking = (dateRange: { from: Date; to: Date }) => {
    toast.success(`✅ Booking request sent to ${guide.fullName}! Guide has 30 minutes to confirm.`, {
      duration: 5000,
    });
    setShowCalendar(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center overflow-hidden">
          {guide.photoUrl ? (
            <img
              src={guide.photoUrl}
              alt={guide.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl text-white filter drop-shadow-lg">👤</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{guide.fullName}</h3>
          
          {/* Key Information in Points */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span className="font-medium">Age:</span>
              <span className="ml-1">{guide.age} years</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="font-medium">Experience:</span>
              <span className="ml-1">{guide.experienceYears} years</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              <span className="font-medium">Education:</span>
              <span className="ml-1">{guide.education}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              <span className="font-medium">Rate:</span>
              <span className="ml-1 text-green-600 font-semibold">₹{guide.wagesPerDay}/day</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              ⭐ {guide.experienceYears} years exp
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md"
            >
              View Profile →
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{guide.fullName}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Profile Image */}
              <div className="h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
                {guide.photoUrl ? (
                  <img
                    src={guide.photoUrl}
                    alt={guide.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-8xl text-white filter drop-shadow-lg">👤</span>
                )}
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Personal Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{guide.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{guide.education}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Professional Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{guide.experienceYears} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-medium text-green-600">₹{guide.wagesPerDay}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{guide.bio}</p>
              </div>

              {/* Contact Info */}
              {guide.userId && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact</h3>
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {guide.userId.email}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBookGuide}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md"
                >
                  📅 Book Guide
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Calendar */}
      <BookingCalendar
        guideName={guide.fullName}
        guideId={guide._id || ''}
        guideRate={guide.wagesPerDay}
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleConfirmBooking}
      />
    </>
  );
}

