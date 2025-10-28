'use client';

import { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import 'react-day-picker/dist/style.css';

interface BookingCalendarProps {
  guideName: string;
  guideId: string;
  guideRate: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateRange: { from: Date; to: Date }) => void;
}

export default function BookingCalendar({ guideName, guideId, guideRate, isOpen, onClose, onConfirm }: BookingCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<Array<{ from: Date; to: Date; status: string }>>([]);
  const { data: session, status } = useSession();

  // Fetch existing bookings for this guide
  useEffect(() => {
    if (isOpen && guideId) {
      fetchBookings();
      
      // Set up periodic refresh to handle booking expiry
      const interval = setInterval(() => {
        fetchBookings();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, guideId]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?guideId=${guideId}`);
      const data = await response.json();
      
      if (response.ok) {
        const ranges = data.bookings
          .filter((booking: any) => booking.status === 'confirmed' || booking.status === 'pending')
          .map((booking: any) => ({
            from: new Date(booking.from),
            to: new Date(booking.to),
            status: booking.status
          }));
        setBookedRanges(ranges);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const disabledDates = {
    before: new Date(), // Disable past dates
    filters: [
      (date: Date) => bookedRanges.some(range => 
        date >= range.from && date <= range.to
      )
    ]
  };

  const checkAvailability = (from: Date, to: Date): boolean => {
    // Check if the selected range conflicts with any booked ranges
    return !bookedRanges.some(range => 
      (from <= range.to && to >= range.from)
    );
  };

  const handleConfirm = async () => {
    if (selectedRange?.from && selectedRange?.to) {
      // Check if user is authenticated
      if (status === 'loading') {
        toast.loading('Loading...');
        return;
      }
      
      if (!session) {
        toast.error('Please log in to book a guide');
        return;
      }

      setIsBooking(true);
      
      try {
        const duration = Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const totalCost = duration * guideRate;
        
        // Create booking via API
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guideId,
            guideName,
            userId: session.user?.id,
            userName: session.user?.name,
            from: selectedRange.from.toISOString(),
            to: selectedRange.to.toISOString(),
            duration,
            totalCost,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Immediately add the new booking to bookedRanges for instant visual feedback
          if (selectedRange.from && selectedRange.to) {
            setBookedRanges(prev => [...prev, {
              from: selectedRange.from!,
              to: selectedRange.to!,
              status: 'pending'
            }]);
          }
          
          // Refresh bookings to update availability
          await fetchBookings();
          onConfirm({ from: selectedRange.from, to: selectedRange.to });
          setSelectedRange(undefined);
        } else {
          toast.error(data.error || 'Booking failed. Please try again.');
        }
      } catch (error) {
        console.error('Booking error:', error);
        toast.error('Booking failed. Please try again.');
      }
      
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  // Show login prompt if user is not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to book {guideName}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  window.location.href = '/login';
                }}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Book {guideName}
            </h2>
            {session && (
              <p className="text-sm text-gray-600 mt-1">
                Booking as: <span className="font-medium">{session.user?.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-6 pl-10">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={setSelectedRange}
            disabled={disabledDates}
            className="w-full text-black"
            numberOfMonths={2}
          />
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
              <span className="text-gray-600">Confirmed Bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
              <span className="text-gray-600">Pending Bookings (30min)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <span className="text-gray-600">Past Dates</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
              <span className="text-gray-600">Selected Range</span>
            </div>
          </div>
        </div>

        {/* Selected Date Range Display */}
        {selectedRange?.from && selectedRange?.to && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Selected Date Range:</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              From: {selectedRange.from.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-600">
              To: {selectedRange.to.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Duration: {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
            </p>
            <p className="text-sm text-green-600 font-semibold mt-1">
              Total Cost: ₹{(Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1) * guideRate}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRange?.from || !selectedRange?.to || isBooking}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
