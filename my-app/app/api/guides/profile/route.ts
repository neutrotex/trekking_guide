import { NextRequest, NextResponse } from 'next/server';
import GuideModel from '@/models/Guide';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    console.log('Profile check - Session:', session);

    if (!session || session.user.role !== 'guide') {
      console.log('Profile check - Unauthorized or not a guide');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile check - Looking for guide with userId:', session.user.id);
    const guide = await GuideModel.findOne({ userId: session.user.id }).populate('userId', 'name email');

    console.log('Profile check - Found guide:', guide);

    if (!guide) {
      console.log('Profile check - No guide profile found');
      return NextResponse.json({ hasProfile: false }, { status: 200 });
    }

    console.log('Profile check - Guide profile found');
    return NextResponse.json({ hasProfile: true, guide }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking guide profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
