import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// Mock booking storage - replace with actual MongoDB collection
let bookings: Array<{
  id: string;
  guideId: string;
  guideName: string;
  userId: string;
  userName: string;
  from: Date;
  to: Date;
  duration: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: Date;
  expiresAt?: Date; // For temporary bookings
}> = [];

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { guideId, guideName, userId, userName, from, to, duration, totalCost } = await req.json();

    // Validate required fields
    if (!guideId || !guideName || !userId || !userName || !from || !to || !duration || !totalCost) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Check for conflicting bookings (confirmed or pending)
    const conflictingBooking = bookings.find(booking => 
      booking.guideId === guideId && 
      (booking.status === 'confirmed' || booking.status === 'pending') &&
      (
        (new Date(from) <= booking.to && new Date(to) >= booking.from)
      )
    );

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Guide is not available for the selected date range' },
        { status: 409 }
      );
    }

    // Create new booking with pending status and 30-minute expiry
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const newBooking = {
      id: `booking_${Date.now()}`,
      guideId,
      guideName,
      userId,
      userName,
      from: new Date(from),
      to: new Date(to),
      duration,
      totalCost,
      status: 'pending' as const,
      createdAt: now,
      expiresAt,
    };

    bookings.push(newBooking);

    return NextResponse.json(
      { 
        booking: newBooking,
        message: 'Booking request sent! Guide has 30 minutes to confirm.' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const guideId = searchParams.get('guideId');
    const userId = searchParams.get('userId');

    // Filter out expired pending bookings
    const now = new Date();
    const activeBookings = bookings.filter(booking => {
      if (booking.status === 'pending' && booking.expiresAt && booking.expiresAt < now) {
        // Auto-expire pending bookings
        booking.status = 'cancelled';
        return false;
      }
      return true;
    });

    let filteredBookings = activeBookings;

    if (guideId) {
      filteredBookings = filteredBookings.filter(booking => booking.guideId === guideId);
    }

    if (userId) {
      filteredBookings = filteredBookings.filter(booking => booking.userId === userId);
    }

    return NextResponse.json({ bookings: filteredBookings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing booking ID or status' },
        { status: 400 }
      );
    }

    if (!['confirmed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "confirmed" or "rejected"' },
        { status: 400 }
      );
    }

    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking is not pending' },
        { status: 400 }
      );
    }

    // Check if booking has expired
    if (booking.expiresAt && booking.expiresAt < new Date()) {
      booking.status = 'cancelled';
      return NextResponse.json(
        { error: 'Booking has expired' },
        { status: 410 }
      );
    }

    // Update booking status
    booking.status = status as 'confirmed' | 'rejected';

    return NextResponse.json(
      { 
        booking,
        message: `Booking ${status} successfully` 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
