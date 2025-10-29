'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface AvailabilityData {
  guideId: string;
  date: string;
  isAvailable: boolean;
  updatedAt: string;
}

interface AvailabilityCalendarProps {
  onClose: () => void;
}

export default function AvailabilityCalendar({ onClose }: AvailabilityCalendarProps) {
  const { data: session } = useSession();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availabilityMode, setAvailabilityMode] = useState<'available' | 'unavailable'>('available');
  const [loading, setLoading] = useState(false);
  const [existingAvailability, setExistingAvailability] = useState<AvailabilityData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth]);

  const fetchAvailability = async () => {
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
      
      const response = await fetch(
        `/api/availability?guideId=${session?.user.id}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      );
      const data = await response.json();
      setExistingAvailability(data.availability || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([]);
      return;
    }
    setSelectedDates(dates);
  };

  const handleBulkUpdate = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates to update');
      return;
    }

    setLoading(true);
    try {
      const dates = selectedDates.map(date => date.toISOString().split('T')[0]);
      
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dates,
          isAvailable: availabilityMode === 'available',
        }),
      });

      if (response.ok) {
        toast.success(`${availabilityMode === 'available' ? 'Available' : 'Unavailable'} dates updated successfully`);
        setSelectedDates([]);
        fetchAvailability();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Error updating availability');
    } finally {
      setLoading(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const availability = existingAvailability.find(av => av.date === dateString);
    return availability ? availability.isAvailable : true; // Default to available
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Set Your Availability</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setAvailabilityMode('available')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  availabilityMode === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✅ Mark as Available
              </button>
              <button
                onClick={() => setAvailabilityMode('unavailable')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  availabilityMode === 'unavailable'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ❌ Mark as Unavailable
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              Select dates and click "Update Selected Dates" to mark them as {availabilityMode === 'available' ? 'available' : 'unavailable'}
            </p>
          </div>

          {/* Calendar - Two Months Side by Side */}
          <div className="mb-6 text-black">
            <DayPicker
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              modifiers={{
                available: (date: Date) => isDateAvailable(date),
                unavailable: (date: Date) => !isDateAvailable(date),
                selected: (date: Date) => selectedDates.some(d => d.toDateString() === date.toDateString())
              }}
              modifiersStyles={{
                available: {
                  backgroundColor: 'green',
                  color: 'white',
                },
                unavailable: {
                  backgroundColor: 'red',
                  color: 'white',
                },
                selected: {
                  backgroundColor: 'yellow',
                  color: 'white',
                },
              }}
              numberOfMonths={2}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full"
              disabled={{ before: new Date() }} // Disable past dates
            />
          </div>

          {/* Legend */}
          <div className="mb-6 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                const dates = [];
                for (let d = new Date(today); d <= nextWeek; d.setDate(d.getDate() + 1)) {
                  dates.push(new Date(d));
                }
                setSelectedDates(dates);
              }}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
            >
              Next 7 Days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const dates = [];
                for (let d = new Date(today); d <= nextMonth; d.setDate(d.getDate() + 1)) {
                  dates.push(new Date(d));
                }
                setSelectedDates(dates);
              }}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
            >
              Rest of Month
            </button>
            <button
              onClick={() => setSelectedDates([])}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Clear Selection
            </button>
            
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBulkUpdate}
              disabled={loading || selectedDates.length === 0}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                availabilityMode === 'available'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Updating...' : `Update ${selectedDates.length} Selected Dates`}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Close
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click on individual dates to select them</li>
              <li>• Use quick action buttons to select common date ranges</li>
              <li>• Green dates are available, red dates are unavailable</li>
              <li>• You can only set availability for future dates</li>
              <li>• Changes are reflected immediately for users booking your services</li>
              <li>• Two-month view helps you plan availability more effectively</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}