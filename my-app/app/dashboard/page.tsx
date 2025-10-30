'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { Guide } from '@/types/guide';

interface Booking {
  id: string;
  guideId: string;
  guideName: string;
  userId: string;
  userName: string;
  from: string;
  to: string;
  duration: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [message, setMessage] = useState('');
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role === 'guide') {
      fetchProfile();
    } else if (status === 'authenticated' && session?.user.role === 'user') {
      router.push('/user-dashboard');
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', session?.user.id);
      const response = await fetch('/api/guides/profile');
      const data = await response.json();
      
      console.log('Profile check result:', data);
      
      if (data.hasProfile && data.guide) {
        setGuide(data.guide);
      } else {
        console.log('No guide profile found, redirecting to create profile');
        router.push('/create-profile');
        return;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings when guide profile is loaded
  useEffect(() => {
    if (guide?._id) {
      console.log('Guide profile loaded, fetching bookings for guideId:', guide._id);
      fetchBookings();
    }
  }, [guide]);

  const fetchBookings = async (_showRefreshing = false) => {
    try {
      
      console.log('Guide dashboard fetching bookings for guide profile:', guide);
      console.log('Using guide._id as guideId:', guide?._id);
      
      if (!guide?._id) {
        // Guide profile not yet loaded; skip fetch silently
        setBookings([]);
        return;
      }
      
      const response = await fetch(`/api/bookings?guideId=${guide._id}`);
      const data = await response.json();
      console.log('Guide dashboard received bookings:', data);
      
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status }),
      });

      if (response.ok) {
        setMessage(`Booking ${status} successfully`);
        await fetchBookings(); // Refresh bookings
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error updating booking status');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    console.log('Cancelling booking with ID:', bookingId);

    setCancellingBooking(bookingId);
    try {
      const payload = { bookingId, status: 'cancelled' };
      console.log('Sending payload:', payload);
      
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        setMessage('Booking cancelled successfully');
        await fetchBookings(); // Refresh bookings
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setMessage('Error cancelling booking');
    } finally {
      setCancellingBooking(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate dashboard statistics
  const getDashboardStats = () => {
    const totalRequests = bookings.length;
    const pendingRequests = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedTreks = bookings.filter(b => b.status === 'confirmed').length; // Assuming confirmed = completed
    const totalEarnings = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalCost, 0);
    const rejectionRate = totalRequests > 0 ? 
      ((bookings.filter(b => b.status === 'rejected').length / totalRequests) * 100).toFixed(1) : '0';
    
    return {
      totalRequests,
      pendingRequests,
      confirmedBookings,
      completedTreks,
      totalEarnings,
      rejectionRate
    };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'guide') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 w-[90%]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome back, {guide?.fullName}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your bookings and track your performance
              </p>
            </div>
            
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{getDashboardStats().totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{getDashboardStats().pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Treks</p>
                <p className="text-2xl font-bold text-gray-900">{getDashboardStats().completedTreks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{getDashboardStats().totalEarnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{getDashboardStats().confirmedBookings}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
                <p className="text-3xl font-bold text-gray-900">{getDashboardStats().rejectionRate}%</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Management Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Profile Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Management</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/edit-profile')}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-left"
              >
                ✏️ Edit Profile Information
              </button>
              <button
                onClick={() => {/* TODO: Add photo upload */}}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-left"
              >
                📸 Update Profile Photo
              </button>
              <button
                onClick={() => setShowAvailabilityCalendar(true)}
                className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition font-semibold text-left"
              >
                📅 Set Availability Calendar
              </button>
            </div>
          </div>

          {/* Booking Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Management</h2>
            <div className="space-y-3">
              
              <button
                onClick={() => {/* TODO: Add booking history */}}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-left"
              >
                📋 View Booking History
              </button>
              <button
                onClick={() => {/* TODO: Add earnings report */}}
                className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition font-semibold text-left"
              >
                💰 View Earnings Report
              </button>
            </div>
          </div>
        </div>

        {/* Guide Status & Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Guide Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <span className="text-green-600">✓</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Rate</p>
                <p className="text-lg font-bold text-gray-900">₹{guide?.wagesPerDay || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-blue-600">₹</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Experience</p>
                <p className="text-lg font-bold text-gray-900">{guide?.experienceYears || 0} years</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <span className="text-purple-600">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings & Performance Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Earnings & Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹{getDashboardStats().totalEarnings}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{getDashboardStats().confirmedBookings}</div>
              <div className="text-sm text-gray-600">Completed Jobs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {getDashboardStats().totalRequests > 0 ? 
                  ((getDashboardStats().confirmedBookings / getDashboardStats().totalRequests) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {getDashboardStats().totalRequests > 0 ? 
                  Math.round(getDashboardStats().totalEarnings / getDashboardStats().confirmedBookings) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg. per Job</div>
            </div>
          </div>
        </div>

        {/* Guide Tools & Resources */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Guide Tools & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <button className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition font-semibold text-left">
                🗺️ Trek Route Planner
              </button>
              <button className="w-full bg-cyan-600 text-white px-4 py-3 rounded-lg hover:bg-cyan-700 transition font-semibold text-left">
                🎒 Equipment Checklist
              </button>
              <button className="w-full bg-sky-600 text-white px-4 py-3 rounded-lg hover:bg-sky-700 transition font-semibold text-left">
                🌤️ Weather Forecast
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-semibold text-left">
                🚨 Emergency Contacts
              </button>
              <button className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition font-semibold text-left">
                🩹 First Aid Guide
              </button>
              <button className="w-full bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition font-semibold text-left">
                👥 Guide Community
              </button>
            </div>
          </div>
        </div> */}

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Booking Requests</h2>
            <div className="flex items-center gap-4">
              {bookings.filter(b => b.status === 'pending').length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-600">
                    {bookings.filter(b => b.status === 'pending').length} New Request{bookings.filter(b => b.status === 'pending').length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition ${
                    booking.status === 'pending' 
                      ? 'border-red-300 bg-red-50 shadow-md' 
                      : 'border-gray-200'
                  }`}
                >
                  {booking.status === 'pending' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-red-600">NEW REQUEST - Action Required</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {booking.userName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Start Date:</span> {formatDate(booking.from)}
                        </div>
                        <div>
                          <span className="font-medium">End Date:</span> {formatDate(booking.to)}
                        </div>
                        <div>
                          <span className="font-medium">Total Cost:</span> ₹{booking.totalCost}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        Requested on {formatDate(booking.createdAt)}
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'rejected')}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {/* Guides cannot cancel bookings; only accept/reject when pending */}
                    </div>
                  </div>
                </div>
              ))}
              
              {bookings.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Showing 5 of {bookings.length} bookings
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No booking requests yet</h3>
              <p className="text-gray-600">Your booking requests will appear here when users book your services.</p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Calendar Modal */}
      {showAvailabilityCalendar && (
        <AvailabilityCalendar onClose={() => setShowAvailabilityCalendar(false)} />
      )}
    </div>
  );
}