import { NextRequest, NextResponse } from 'next/server';
import GuideModel from '@/models/Guide';
import connectDB from '@/lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const guide = await GuideModel.findById(params.id).populate('userId', 'name email');

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json({ guide }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
