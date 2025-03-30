// src/app/api/customer-portal/quotations/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import Quotation from '@/models/Quotation';
import Branch from '@/models/Branch';

// For file uploads (this would need to be implemented with your preferred storage solution)
import { uploadFile } from '@/lib/fileStorage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  customerId: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token from cookies - add await here
    const cookieStore = await cookies();
    const token = cookieStore.get('customer-token')?.value;

    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Ensure it's a customer account
    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const customerId = decoded.customerId;
    
    // Get the customer info
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const dataString = formData.get('data') as string;
    const data = JSON.parse(dataString);
    
    // Handle file uploads if any
    const files = formData.getAll('files') as File[];
    const fileUrls: string[] = [];
    
    // Simplified example - in a real app, you'd use a proper file storage service
    if (files.length > 0) {
      for (const file of files) {
        // This is a placeholder - implement actual file upload logic
        const fileUrl = await uploadFile(file);
        fileUrls.push(fileUrl);
      }
    }
    
    // Find the default branch (or implement logic to determine correct branch)
    const defaultBranch = await Branch.findOne({ active: true });
    
    if (!defaultBranch) {
      return NextResponse.json(
        { error: 'No active branch found' },
        { status: 500 }
      );
    }
    
    // Generate a quotation number
    const lastQuotation = await Quotation.findOne().sort({ createdAt: -1 });
    let quotationNumber = 'Q-0001';
    
    if (lastQuotation && lastQuotation.quotationNumber) {
      const lastNumber = parseInt(lastQuotation.quotationNumber.split('-')[1]);
      quotationNumber = `Q-${(lastNumber + 1).toString().padStart(4, '0')}`;
    }
    
    // Transform the items from the request format to the database format
    const items = data.items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      price: 0, // Will be filled by staff
      total: 0, // Will be calculated later
    }));
    
    // Create the quotation request
    const quotation = new Quotation({
      quotationNumber,
      customer: customerId,
      branch: defaultBranch._id,
      issueDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items,
      subtotal: 0, // Will be calculated when prices are added
      tax: 0,
      taxRate: defaultBranch.taxRate || 0,
      total: 0,
      status: 'draft', // Start as draft until staff processes it
      currency: defaultBranch.currency,
      notes: `Customer Request: ${data.title}\n\n${data.description}\n\nAdditional Notes: ${data.additionalNotes || 'None'}\n\nPreferred Due Date: ${data.preferredDueDate || 'Not specified'}`,
      terms: defaultBranch.quotationTerms || 'Standard terms apply.',
      attachments: fileUrls.map(url => ({
        name: url.split('/').pop() || 'attachment',
        fileUrl: url,
        uploadedAt: new Date(),
        type: 'customer-upload'
      }))
    });
    
    await quotation.save();
    
    // Optional: Send notification to staff about new quotation request
    // await sendNotification('staff', 'New quotation request', `${customer.name} has requested a quotation: ${data.title}`);
    
    return NextResponse.json({
      success: true,
      message: 'Quotation request submitted successfully',
      quotationId: quotation._id
    });
  } catch (error) {
    console.error('Quotation request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create quotation request' },
      { status: 500 }
    );
  }
}