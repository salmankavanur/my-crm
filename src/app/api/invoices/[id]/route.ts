import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
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
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }
    
    const invoice = await Invoice.findById(id).populate('customer', 'name email phone company');
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error.message },
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
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('customer', 'name email');
    
    if (!updatedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error.message },
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
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }
    
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    
    if (!deletedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Invoice deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete invoice', details: error.message },
      { status: 500 }
    );
  }
}