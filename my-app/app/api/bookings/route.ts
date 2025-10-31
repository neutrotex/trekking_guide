import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BookingModel from '@/models/Booking';
import mongoose from 'mongoose';

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

    console.log('Creating booking with data:', {
      guideId, guideName, userId, userName, from, to, duration, totalCost
    });

    // Validate required fields
    if (!guideId || !guideName || !userId || !userName || !from || !to || !duration || !totalCost) {
      console.error('Missing required fields:', {
        guideId: !!guideId,
        guideName: !!guideName,
        userId: !!userId,
        userName: !!userName,
        from: !!from,
        to: !!to,
        duration: !!duration,
        totalCost: !!totalCost
      });
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // IDs are stored as strings in Booking schema; keep them as strings

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
      guideId: guideId,
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
      guideId: guideId,
      guideName,
      userId: userId,
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

    console.log('Fetching bookings with params:', { guideId, userId });

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

    // Build query (IDs are stored as strings in Booking schema)
    const query: any = {};
    if (guideId) {
      query.guideId = guideId;
    }
    if (userId) {
      query.userId = userId;
    }

    // Fetch bookings from database (avoid lean() to keep typings simple)
    const bookings = await BookingModel.find(query)
      .sort({ createdAt: -1 });

    // Format the bookings to include id field
    const formattedBookings = bookings.map(booking => ({
      id: booking._id.toString(),
      guideId: booking.guideId,
      userId: booking.userId,
      guideName: booking.guideName,
      userName: booking.userName,
      from: booking.from,
      to: booking.to,
      duration: booking.duration,
      totalCost: booking.totalCost,
      status: booking.status,
      createdAt: booking.createdAt,
      expiresAt: booking.expiresAt
    }));

    console.log('Fetching bookings:', {
      query,
      guideId,
      userId,
      foundBookings: formattedBookings.length,
      bookings: formattedBookings.map(b => ({ id: b.id, guideId: b.guideId, userId: b.userId, status: b.status }))
    });

    return NextResponse.json({ bookings: formattedBookings }, { status: 200 });
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
    
    // Parse the request body
    const body = await req.json();
    const { bookingId, status } = body;

    console.log('PUT Request received:', {
      body,
      bookingId,
      status,
      hasBookingId: !!bookingId,
      hasStatus: !!status
    });

    if (!bookingId || !status) {
      console.error('Missing booking ID or status:', { bookingId: !!bookingId, status: !!status, body });
      return NextResponse.json(
        { error: 'Missing booking ID or status', received: { bookingId: !!bookingId, status: !!status } },
        { status: 400 }
      );
    }

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      console.error('Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status. Must be "confirmed", "rejected", or "cancelled"' },
        { status: 400 }
      );
    }

    // Convert bookingId to ObjectId
    let bookingIdObjectId;
    try {
      bookingIdObjectId = new mongoose.Types.ObjectId(bookingId);
    } catch (error) {
      console.error('Invalid bookingId format:', bookingId);
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }

    const booking = await BookingModel.findById(bookingIdObjectId);

    if (!booking) {
      console.error('Booking not found:', bookingId);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'pending' && status !== 'cancelled') {
      console.error('Invalid status change:', { currentStatus: booking.status, newStatus: status });
      return NextResponse.json(
        { error: 'Only pending bookings can be confirmed or rejected' },
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
    booking.status = status as 'confirmed' | 'rejected' | 'cancelled';
    await booking.save();

    console.log('Booking updated successfully:', {
      id: booking._id,
      status: booking.status
    });

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