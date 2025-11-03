import { NextRequest, NextResponse } from 'next/server';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    console.log('User registration attempt...');
    
    // Check if environment variables are loaded
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      return NextResponse.json({ 
        error: 'Database configuration not found. Please check environment variables.',
        code: 'ENV_NOT_LOADED'
      }, { status: 500 });
    }
    
    await connectDB();
    console.log('Database connected for registration...');
    
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new UserModel({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'user',
    });

    await user.save();
    console.log(`User registered successfully: ${normalizedEmail}`);

    return NextResponse.json(
      { 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        },
        message: 'User registered successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json({ 
      error: error.message,
      code: 'REGISTRATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
