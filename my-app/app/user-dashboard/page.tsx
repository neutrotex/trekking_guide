'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role === 'user') {
      fetchBookings();
    } else if (status === 'authenticated' && session?.user.role === 'guide') {
      router.push('/dashboard');
    }
  }, [status, session]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?userId=${session?.user.id}`);
      const data = await response.json();
      setBookings(data.bookings || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {session?.user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Manage your trek bookings and explore new adventures
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/guides"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">🧭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Find a Guide</h3>
            <p className="text-gray-600">Browse experienced trekking guides</p>
          </Link>
          
          <Link
            href="/treks"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">🏔️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Explore Treks</h3>
            <p className="text-gray-600">Discover amazing trek routes</p>
          </Link>
          
          <Link
            href="/guides"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Book Guide</h3>
            <p className="text-gray-600">Schedule your next adventure</p>
          </Link>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </span>
                <div className="text-xs text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {booking.guideName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Booked on {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">Start your adventure by booking a guide!</p>
              <Link
                href="/guides"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Browse Guides
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
