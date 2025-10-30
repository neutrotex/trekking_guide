import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AvailabilityModel from '@/models/Availability';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get('guideId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!guideId) {
      return NextResponse.json({ error: 'Guide ID is required' }, { status: 400 });
    }

    // Convert guideId string to ObjectId
    const guideIdObjectId = new mongoose.Types.ObjectId(guideId);

    // Build query for MongoDB
    const query: any = { guideId: guideIdObjectId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch availability from MongoDB
    const availability = await AvailabilityModel.find(query).lean();

    // Format the response to match client expectations
    const formattedAvailability = availability.map(av => ({
      guideId: av.guideId.toString(),
      date: av.date,
      isAvailable: av.isAvailable,
      updatedAt: av.updatedAt
    }));

    console.log('Fetched availability:', {
      guideId,
      startDate,
      endDate,
      foundRecords: availability.length,
      records: formattedAvailability.map(av => ({ date: av.date, isAvailable: av.isAvailable }))
    });

    return NextResponse.json({ 
      availability: formattedAvailability,
      guideId,
      dateRange: { startDate, endDate }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dates, isAvailable } = await request.json();

    if (!dates || !Array.isArray(dates)) {
      return NextResponse.json({ error: 'Dates array is required' }, { status: 400 });
    }

    const guideId = session.user.id;

    // Convert guideId string to ObjectId
    const guideIdObjectId = new mongoose.Types.ObjectId(guideId);

    // Use MongoDB bulk operations for efficiency
    const operations = dates.map((date: string) => ({
      updateOne: {
        filter: { guideId: guideIdObjectId, date },
        update: { 
          $set: { 
            guideId: guideIdObjectId,
            isAvailable, 
            updatedAt: new Date() 
          } 
        },
        upsert: true // Create if doesn't exist
      }
    }));

    await AvailabilityModel.bulkWrite(operations);

    // Verify the save by fetching back the records
    const savedRecords = await AvailabilityModel.find({
      guideId: guideIdObjectId,
      date: { $in: dates }
    }).lean();

    console.log(`Updated availability for guide ${guideId}:`, {
      dates,
      isAvailable,
      savedCount: savedRecords.length,
      savedRecords: savedRecords.map(r => ({ date: r.date, isAvailable: r.isAvailable }))
    });

    return NextResponse.json({ 
      message: 'Availability updated successfully',
      updatedDates: dates,
      isAvailable,
      savedCount: savedRecords.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}