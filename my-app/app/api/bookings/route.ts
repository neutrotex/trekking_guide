import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BookingModel from '@/models/Booking';

// Function to check guide availability
async function checkGuideAvailability(guideId: string, startDate: string, endDate: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/availability?guideId=${guideId}&startDate=${startDate}&endDate=${endDate}`);
    const data = await response.json();
    
    if (data.availability && data.availability.length > 0) {
      // Check if any date in the range is marked as unavailable
      const unavailableDates = data.availability.filter((av: any) => !av.isAvailable);
      return unavailableDates.length === 0;
    }
    
    return true; // Default to available if no specific availability set
  } catch (error) {
    console.error('Error checking availability:', error);
    return true; // Default to available on error
  }
}

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

    // Check guide availability
    const startDate = new Date(from).toISOString().split('T')[0];
    const endDate = new Date(to).toISOString().split('T')[0];
    const isAvailable = await checkGuideAvailability(guideId, startDate, endDate);

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Guide is not available for the selected date range' },
        { status: 409 }
      );
    }

    // Check for conflicting bookings (confirmed or pending)
    const conflictingBooking = await BookingModel.findOne({
      guideId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          from: { $lte: new Date(to) },
          to: { $gte: new Date(from) }
        }
      ]
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Guide is not available for the selected date range' },
        { status: 409 }
      );
    }

    // Create new booking with pending status and 30-minute expiry
    const newBooking = new BookingModel({
      guideId,
      guideName,
      userId,
      userName,
      from: new Date(from),
      to: new Date(to),
      duration,
      totalCost,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    });

    await newBooking.save();
    
    console.log('Booking created successfully:', {
      id: newBooking._id,
      guideId: newBooking.guideId,
      userId: newBooking.userId,
      status: newBooking.status,
      createdAt: newBooking.createdAt
    });

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

    // Auto-expire pending bookings that have passed their expiry time
    await BookingModel.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: 'cancelled' }
      }
    );

    // Build query
    const query: any = {};
    if (guideId) {
      query.guideId = guideId;
    }
    if (userId) {
      query.userId = userId;
    }

    // Fetch bookings from database
    const bookings = await BookingModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('Fetching bookings:', {
      query,
      guideId,
      userId,
      foundBookings: bookings.length,
      bookings: bookings.map(b => ({ id: b._id, guideId: b.guideId, userId: b.userId, status: b.status }))
    });

    return NextResponse.json({ bookings }, { status: 200 });
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

    const booking = await BookingModel.findById(bookingId);

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
      await booking.save();
      return NextResponse.json(
        { error: 'Booking has expired' },
        { status: 410 }
      );
    }

    // Update booking status
    booking.status = status as 'confirmed' | 'rejected';
    await booking.save();

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