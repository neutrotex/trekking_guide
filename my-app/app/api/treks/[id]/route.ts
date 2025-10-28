import { NextRequest, NextResponse } from 'next/server';
import TrekModel from '@/models/Trek';
import connectDB from '@/lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const trek = await TrekModel.findById(params.id);

    if (!trek) {
      return NextResponse.json({ error: 'Trek not found' }, { status: 404 });
    }

    return NextResponse.json({ trek }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
