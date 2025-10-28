import { NextRequest, NextResponse } from 'next/server';
import TrekModel from '@/models/Trek';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Fetching treks...');
    
    // Check if environment variables are loaded
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      return NextResponse.json({ 
        error: 'Database configuration not found. Please check environment variables.',
        code: 'ENV_NOT_LOADED'
      }, { status: 500 });
    }
    
    await connectDB();
    console.log('Database connected, querying treks...');
    const treks = await TrekModel.find();
    console.log(`Found ${treks.length} treks`);
    return NextResponse.json({ treks }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/treks:', error);
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
    const body = await req.json();
    const newTrek = new TrekModel(body);
    await newTrek.save();
    return NextResponse.json({ trek: newTrek }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trek:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
