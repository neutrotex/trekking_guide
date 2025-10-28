import { NextRequest, NextResponse } from 'next/server';
import GuideModel from '@/models/Guide';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Fetching guides...');
    
    // Check if environment variables are loaded
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      return NextResponse.json({ 
        error: 'Database configuration not found. Please check environment variables.',
        code: 'ENV_NOT_LOADED'
      }, { status: 500 });
    }
    
    await connectDB();
    console.log('Database connected, querying guides...');
    const guides = await GuideModel.find().populate('userId', 'name email');
    console.log(`Found ${guides.length} guides`);
    return NextResponse.json({ guides }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/guides:', error);
    return NextResponse.json({ 
      error: error.message,
      code: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    let guide = await GuideModel.findOne({ userId: session.user.id });

    if (guide) {
      // Update existing guide
      Object.assign(guide, body);
      await guide.save();
    } else {
      // Create new guide
      guide = new GuideModel({
        userId: session.user.id,
        ...body,
      });
      await guide.save();
    }

    return NextResponse.json({ guide }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
