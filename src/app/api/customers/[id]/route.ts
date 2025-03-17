import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch customer', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await req.json();
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update customer', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }
    
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete customer', details: error.message },
      { status: 500 }
    );
  }
}