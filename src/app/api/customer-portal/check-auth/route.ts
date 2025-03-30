// src/app/api/customer-portal/check-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  customerId: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('customer-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Ensure it's a customer account
    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid token' },
        { status: 403 }
      );
    }
    
    // Get user and customer info
    const user = await User.findById(decoded.id)
      .select('-password')
      .exec();
      
    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: 'User not found' },
        { status: 401 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { authenticated: false, message: 'Account is inactive' },
        { status: 403 }
      );
    }
    
    const customer = await Customer.findById(decoded.customerId)
      .select('name email phone company')
      .exec();
      
    if (!customer) {
      return NextResponse.json(
        { authenticated: false, message: 'Customer not found' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company
        }
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}