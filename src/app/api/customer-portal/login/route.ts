// src/app/api/customer-portal/login/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const { email, password }: LoginRequestBody = await request.json();
    
    // Find the user by email
    const user = await User.findOne({ email, role: 'customer' })
      .populate('customer', 'name email phone company')
      .exec();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if customer account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account is currently inactive. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Create JWT token with user info
    const token = jwt.sign(
      { 
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customer._id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set a secure cookie for authentication - add await here
    const cookieStore = await cookies();
    cookieStore.set('customer-token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        customer: user.customer
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}