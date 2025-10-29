import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

// Mock availability data - in production, this would be stored in MongoDB
let availabilityData: Array<{
  guideId: string;
  date: string;
  isAvailable: boolean;
  updatedAt: string;
}> = [];

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

    // Filter availability for the specific guide and date range
    let filteredAvailability = availabilityData.filter(av => av.guideId === guideId);
    
    if (startDate && endDate) {
      filteredAvailability = filteredAvailability.filter(av => 
        av.date >= startDate && av.date <= endDate
      );
    }

    return NextResponse.json({ 
      availability: filteredAvailability,
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
    const now = new Date().toISOString();

    // Update or create availability records
    dates.forEach((date: string) => {
      const existingIndex = availabilityData.findIndex(
        av => av.guideId === guideId && av.date === date
      );

      if (existingIndex >= 0) {
        // Update existing record
        availabilityData[existingIndex] = {
          ...availabilityData[existingIndex],
          isAvailable,
          updatedAt: now
        };
      } else {
        // Create new record
        availabilityData.push({
          guideId,
          date,
          isAvailable,
          updatedAt: now
        });
      }
    });

    console.log(`Updated availability for guide ${guideId}:`, dates, isAvailable);

    return NextResponse.json({ 
      message: 'Availability updated successfully',
      updatedDates: dates,
      isAvailable
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}