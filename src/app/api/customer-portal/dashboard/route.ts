// src/app/api/customer-portal/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Project from '@/models/Project';
import Invoice from '@/models/Invoice';
import Quotation from '@/models/Quotation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  customerId: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token from cookies
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
    
    // Get summary data
    const activeProjects = await Project.countDocuments({ 
      customer: customerId,
      status: { $in: ['planning', 'active'] },
      isVisible: true
    });
    
    const pendingQuotations = await Quotation.countDocuments({
      customer: customerId,
      status: { $in: ['draft', 'sent'] }
    });
    
    const unpaidInvoices = await Invoice.countDocuments({
      customer: customerId,
      status: { $in: ['sent', 'overdue'] }
    });
    
    // Calculate total outstanding amount
    const outstandingInvoices = await Invoice.find({
      customer: customerId,
      status: { $in: ['sent', 'overdue'] }
    });
    
    let totalOutstanding = 0;
    // In a real application, you'd need to handle currency conversion
    outstandingInvoices.forEach(invoice => {
      totalOutstanding += invoice.total;
    });
    
    // Get recent projects (limit to 5)
    const recentProjects = await Project.find({
      customer: customerId,
      isVisible: true
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('_id title status startDate endDate');
    
    // Get recent invoices (limit to 5)
    const recentInvoices = await Invoice.find({
      customer: customerId
    })
    .sort({ issueDate: -1 })
    .limit(5)
    .select('_id invoiceNumber issueDate dueDate total status currency');
    
    // Get recent quotations (limit to 5)
    const recentQuotations = await Quotation.find({
      customer: customerId
    })
    .sort({ issueDate: -1 })
    .limit(5)
    .select('_id quotationNumber issueDate validUntil total status currency');
    
    // Add progress calculation for projects
    // This is a simplified example - in a real app, you might calculate this based on completed milestones
    const projectsWithProgress = recentProjects.map(project => {
      const data = project.toObject();
      // Simple progress calculation for demo purposes
      const progress = project.status === 'completed' ? 100 : 
                     project.status === 'active' ? Math.floor(Math.random() * 60) + 20 : 
                     project.status === 'planning' ? Math.floor(Math.random() * 20) : 0;
      
      return {
        ...data,
        progress
      };
    });
    
    return NextResponse.json({
      summary: {
        activeProjects,
        pendingQuotations,
        unpaidInvoices,
        totalOutstanding
      },
      recentProjects: projectsWithProgress,
      recentInvoices,
      recentQuotations
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}