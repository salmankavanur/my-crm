import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (customerId) {
      query.customer = customerId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Execute query
    const invoices = await Invoice.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalInvoices = await Invoice.countDocuments(query);
    
    return NextResponse.json({
      invoices,
      pageInfo: {
        currentPage: page,
        totalPages: Math.ceil(totalInvoices / limit),
        totalInvoices,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    
    // Check if customer exists
    const customer = await Customer.findById(body.customer);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let invoiceNumber = 'INV-0001';
    
    if (lastInvoice && lastInvoice.invoiceNumber) {
      // Extract the number part and increment
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      invoiceNumber = `INV-${(lastNumber + 1).toString().padStart(4, '0')}`;
    }
    
    // Create new invoice with the generated number
    const invoiceData = {
      ...body,
      invoiceNumber,
    };
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    return NextResponse.json(
      { message: 'Invoice created successfully', invoice },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create invoice', details: error.message },
      { status: 500 }
    );
  }
}