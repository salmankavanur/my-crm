// src/app/api/branches/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Branch from '@/models/Branch';
import { verifyAdmin } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET a single branch
export async function GET(req: NextRequest, { params }: Params) {
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
    
    const { id } = params;
    const branch = await Branch.findById(id);
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    );
  }
}

// Update a branch
export async function PUT(req: NextRequest, { params }: Params) {
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
    
    const { id } = params;
    const data = await req.json();
    
    // Ensure code is uppercase
    if (data.code) {
      data.code = data.code.toUpperCase();
      
      // Check if branch code already exists (except for current branch)
      const existingBranch = await Branch.findOne({ 
        code: data.code, 
        _id: { $ne: id } 
      });
      
      if (existingBranch) {
        return NextResponse.json(
          { error: 'A branch with this code already exists' },
          { status: 400 }
        );
      }
    }
    
    const branch = await Branch.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Branch updated successfully',
      branch,
    });
  } catch (error: any) {
    console.error('Error updating branch:', error);
    
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
      { error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

// Partially update a branch (for status changes)
export async function PATCH(req: NextRequest, { params }: Params) {
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
    
    const { id } = params;
    const data = await req.json();
    
    // Only allow partial updates to specific fields
    const allowedFields = ['active', 'taxRate'];
    const updateData: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const branch = await Branch.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Branch updated successfully',
      branch,
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Failed to update branch' },
      { status: 500 }
    );
  }
}

// Delete a branch
export async function DELETE(req: NextRequest, { params }: Params) {
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
    
    const { id } = params;
    
    // Check if branch is used in any invoices, quotations, or projects
    // This would be implemented in a real application to prevent data inconsistency
    
    const branch = await Branch.findByIdAndDelete(id);
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    );
  }
}