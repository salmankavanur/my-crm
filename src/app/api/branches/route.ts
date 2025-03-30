// src/app/api/branches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Branch from '@/models/Branch';
import { verifyAdmin } from '@/lib/auth';

// GET all branches
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify admin access
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const active = searchParams.get('active');
    
    // Build query
    const query: any = {};
    if (active !== null) {
      query.active = active === 'true';
    }

    // Get branches
    const branches = await Branch.find(query).sort({ name: 1 });
    
    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

// Create a new branch
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verify admin access
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await req.json();

    // Check if branch code already exists
    const existingBranch = await Branch.findOne({ code: data.code.toUpperCase() });
    if (existingBranch) {
      return NextResponse.json(
        { error: 'A branch with this code already exists' },
        { status: 400 }
      );
    }

    // Ensure code is uppercase
    data.code = data.code.toUpperCase();
    
    // Create branch
    const branch = new Branch(data);
    await branch.save();
    
    return NextResponse.json(
      { message: 'Branch created successfully', branch },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating branch:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: string[] = [];
      
      for (const field in error.errors) {
        validationErrors.push(error.errors[field].message);
      }
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    );
  }
}