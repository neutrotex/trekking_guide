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

interface AvailabilityData {
  guideId: string;
  date: string;
  isAvailable: boolean;
  updatedAt: string;
}

export default function BookingCalendar({ guideName, guideId, guideRate, isOpen, onClose, onConfirm }: BookingCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedRanges, setBookedRanges] = useState<Array<{ from: Date; to: Date; status: string }>>([]);
  const [guideAvailability, setGuideAvailability] = useState<AvailabilityData[]>([]);
  const { data: session, status } = useSession();

  // Fetch existing bookings and availability for this guide
  useEffect(() => {
    if (isOpen && guideId) {
      fetchBookings();
      fetchAvailability();
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

  const fetchAvailability = async () => {
    try {
      console.log('Fetching availability for guideId:', guideId);
      
      // Fetch availability for the next 6 months to cover the calendar view
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(today.getMonth() + 6);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/availability?guideId=${guideId}&startDate=${startDateStr}&endDate=${endDateStr}`);
      const data = await response.json();
      
      console.log('Availability response:', { response: response.ok, data });
      
      if (response.ok) {
        setGuideAvailability(data.availability || []);
        console.log('Set guide availability:', data.availability);
        console.log('Total availability records:', data.availability?.length || 0);
      } else {
        console.error('Failed to fetch availability:', data.error);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const isDateUnavailable = (date: Date) => {
    if (!date) return false;
    
    const dateString = date.toISOString().split('T')[0];
    
    // Check if guide has marked this date as unavailable
    const availability = guideAvailability.find(av => av.date === dateString);
    if (availability && !availability.isAvailable) {
      return true;
    }
    
    // Check if date is in any booked range
    return bookedRanges.some(range => 
      date >= range.from && date <= range.to
    );
  };

  const getDateAvailabilityStatus = (date: Date) => {
    if (!date) return 'available';
    
    const dateString = date.toISOString().split('T')[0];
    
    // Check if guide has marked this date as unavailable
    const availability = guideAvailability.find(av => av.date === dateString);
    if (availability) {
      console.log(`Date ${dateString}: availability found`, availability);
      return availability.isAvailable ? 'available' : 'unavailable';
    }
    
    // Check if date is in any booked range
    const isBooked = bookedRanges.some(range => 
      date >= range.from && date <= range.to
    );
    
    if (isBooked) {
      console.log(`Date ${dateString}: is booked`);
      return 'booked';
    }
    
    console.log(`Date ${dateString}: defaulting to available`);
    return 'available'; // Default to available
  };


  const calculateDuration = () => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    const diffTime = Math.abs(selectedRange.to.getTime() - selectedRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  const calculateTotalCost = () => {
    return calculateDuration() * guideRate;
  };

  const handleBooking = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    if (!session) {
      toast.error('Please log in to book a guide');
      return;
    }

    setIsBooking(true);

    try {
      console.log('Creating booking with data:', {
        guideId,
        guideName,
        userId: session.user.id,
        userName: session.user.name,
        from: selectedRange.from.toISOString(),
        to: selectedRange.to.toISOString(),
        duration: calculateDuration(),
        totalCost: calculateTotalCost(),
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideId,
          guideName,
          userId: session.user.id,
          userName: session.user.name,
          from: selectedRange.from.toISOString(),
          to: selectedRange.to.toISOString(),
          duration: calculateDuration(),
          totalCost: calculateTotalCost(),
        }),
      });

      const data = await response.json();
      console.log('Booking response:', { response: response.ok, data });

      if (response.ok) {
        toast.success('Booking request sent successfully!');
        if (selectedRange.from && selectedRange.to) {
          onConfirm({ from: selectedRange.from, to: selectedRange.to });
        }
        onClose();
      } else {
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      toast.error('Error creating booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Book {guideName}</h2>
              <p className="text-gray-600 text-lg">Select your preferred dates for the trek</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* User Info */}
          {session && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-blue-800 font-semibold text-lg">
                    Booking for: {session.user.name}
                  </p>
                  <p className="text-blue-600 text-sm">{session.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Prompt */}
          {!session && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <p className="text-yellow-800 font-semibold text-lg">
                    Please log in to book this guide
                  </p>
                  <p className="text-yellow-600 text-sm">You need to be logged in to make a booking</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Container */}
          <div className="mb-8 bg-gray-50 rounded-xl p-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Your Dates</h3>
              <p className="text-gray-600">Choose your start and end dates for the trek</p>
            </div>
            
            {/* Custom Calendar Styles */}
            <style jsx global>{`
              /* Remove grid lines and make calendar bigger */
              .rdp-table {
                border-collapse: separate !important;
                border-spacing: 8px !important;
              }
              
              .rdp-day_button {
                width: 3rem !important;
                height: 3rem !important;
                border-radius: 0.75rem !important;
                font-weight: 600 !important;
                font-size: 1rem !important;
                transition: all 0.2s ease !important;
                border: 2px solid transparent !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 4px !important;
              }
              
              .rdp-day_button:hover:not(:disabled) {
                transform: scale(1.05) !important;
              }
              
              .rdp-day_button:disabled {
                cursor: not-allowed !important;
                opacity: 0.6 !important;
              }
              
              .rdp-day_button:not(:disabled) {
                cursor: pointer !important;
              }
              
              /* Override default react-day-picker styles for range selection */
              .rdp-day_button[aria-selected="true"] {
                background-color: #3b82f6 !important;
                color: white !important;
                border-color: #2563eb !important;
                z-index: 2 !important;
              }
              
              .rdp-day_button[aria-selected="true"]:hover {
                background-color: #2563eb !important;
                border-color: #1d4ed8 !important;
              }
              
              /* Range selection styles */
              .rdp-day_button[data-range-start="true"] {
                background-color: #3b82f6 !important;
                color: white !important;
                border-color: #2563eb !important;
                border-radius: 0.75rem !important;
              }
              
              .rdp-day_button[data-range-end="true"] {
                background-color: #3b82f6 !important;
                color: white !important;
                border-color: #2563eb !important;
                border-radius: 0.75rem !important;
              }
              
              .rdp-day_button[data-in-range="true"] {
                background-color: #dbeafe !important;
                color: #1e40af !important;
                border-color: #93c5fd !important;
                border-radius: 0.75rem !important;
              }
              
              /* Ensure proper text colors */
              .rdp-day_button {
                color: inherit !important;
              }
              
              /* Fix any potential duplicate rendering issues */
              .rdp-day {
                position: relative !important;
                padding: 4px !important;
              }
              
              .rdp-day_button[data-available="true"] {
                background-color: #10b981 !important;
                color: white !important;
                border-color: #059669 !important;
              }
              
              .rdp-day_button[data-unavailable="true"] {
                background-color: #ef4444 !important;
                color: white !important;
                border-color: #dc2626 !important;
              }
              
              .rdp-day_button[data-booked="true"] {
                background-color: #f97316 !important;
                color: white !important;
                border-color: #ea580c !important;
              }
              
              .rdp-day_button[data-past="true"] {
                background-color: #9ca3af !important;
                color: white !important;
                border-color: #6b7280 !important;
              }
              
              /* Remove all table borders and grid lines */
              .rdp-table,
              .rdp-table td,
              .rdp-table th,
              .rdp-table tr,
              .rdp-month_table,
              .rdp-month_table td,
              .rdp-month_table th,
              .rdp-month_table tr {
                border: none !important;
                border-collapse: separate !important;
                border-spacing: 8px !important;
              }
              
              .rdp-table td {
                padding: 4px !important;
                border: none !important;
                background: none !important;
              }
              
              .rdp-table th {
                padding: 8px !important;
                border: none !important;
                background: none !important;
              }
              
              /* Remove any remaining borders */
              .rdp-day,
              .rdp-day_button,
              .rdp-cell {
                border: none !important;
                outline: none !important;
              }
              
              /* Remove focus outlines that might look like borders */
              .rdp-day_button:focus {
                outline: none !important;
                box-shadow: none !important;
              }
              
              /* Make month headers bigger */
              .rdp-caption {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                margin-bottom: 1rem !important;
              }
              
              /* Make weekday headers bigger */
              .rdp-head_cell {
                font-size: 0.875rem !important;
                font-weight: 600 !important;
                color: #374151 !important;
              }
            `}</style>
            
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              numberOfMonths={2}
              modifiers={{
                available: (date: Date) => getDateAvailabilityStatus(date) === 'available',
                unavailable: (date: Date) => getDateAvailabilityStatus(date) === 'unavailable',
                booked: (date: Date) => getDateAvailabilityStatus(date) === 'booked',
                past: (date: Date) => date < new Date()
              }}
              modifiersStyles={{
                available: {
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #059669',
                },
                unavailable: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #dc2626',
                },
                booked: {
                  backgroundColor: '#f97316',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #ea580c',
                },
                past: {
                  backgroundColor: '#9ca3af',
                  color: 'white',
                  borderRadius: '8px',
                  border: '2px solid #6b7280',
                },
                selected: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #2563eb',
                },
                range_start: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #2563eb',
                },
                range_end: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #2563eb',
                },
                range_middle: {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: '2px solid #93c5fd',
                },
              }}
              disabled={[
                { before: new Date() },
                (date: Date) => isDateUnavailable(date)
              ]}
              className="w-full"
            />
          </div>

          {/* Enhanced Legend */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <span className="font-semibold text-green-800">Available</span>
                <p className="text-green-600 text-xs">Ready to book</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✗</span>
              </div>
              <div>
                <span className="font-semibold text-red-800">Unavailable</span>
                <p className="text-red-600 text-xs">Guide not available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <span className="font-semibold text-orange-800">Booked</span>
                <p className="text-orange-600 text-xs">Already taken</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">-</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Past</span>
                <p className="text-gray-600 text-xs">Cannot select</p>
              </div>
            </div>
          </div>

          {/* Enhanced Booking Summary */}
          {selectedRange?.from && selectedRange?.to && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <h3 className="text-xl font-bold text-green-800">Booking Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Start Date:</span>
                    <span className="text-gray-800 font-semibold">{selectedRange.from.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">End Date:</span>
                    <span className="text-gray-800 font-semibold">{selectedRange.to.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="text-gray-800 font-semibold">{calculateDuration()} days</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Daily Rate:</span>
                    <span className="text-gray-800 font-semibold">₹{guideRate}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-700">Total Cost:</span>
                      <span className="text-2xl font-bold text-green-600">₹{calculateTotalCost()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleBooking}
              disabled={!selectedRange?.from || !selectedRange?.to || !session || isBooking}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isBooking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Booking...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🎯</span>
                  <span>Book Guide</span>
                </div>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg"
            >
              Cancel
            </button>
          </div>

          {/* Enhanced Instructions */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">💡</div>
              <h3 className="text-lg font-bold text-blue-800">Booking Instructions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm">Select your start and end dates for the trek</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm"><span className="font-semibold text-green-600">Green dates</span> are available for booking</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm"><span className="font-semibold text-red-600">Red dates</span> are unavailable (guide has marked them as unavailable)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm"><span className="font-semibold text-orange-600">Orange dates</span> are already booked by other users</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm">Hover over dates to see their availability status</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm">Your booking will be pending until the guide confirms it</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm">The guide has 30 minutes to respond to your booking request</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="text-blue-700 text-sm">You'll receive a notification once the guide responds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}