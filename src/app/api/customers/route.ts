import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    
    // Execute query
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalCustomers = await Customer.countDocuments(query);
    
    return NextResponse.json({
      customers,
      pageInfo: {
        currentPage: page,
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Create new customer
    const customer = new Customer(body);
    await customer.save();
    
    return NextResponse.json(
      { message: 'Customer created successfully', customer },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer', details: error.message },
      { status: 500 }
    );
  }
}