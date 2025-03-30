// src/middleware.ts (updated)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Function to verify JWT token
async function verifyToken(token: string, secretKey: string, role?: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secretKey)
    );
    
    // If role is specified, check if user has the required role
    if (role && payload.role !== role) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  // Admin dashboard routes
  if (request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname.startsWith('/dashboard/')) {
    // Get the auth token from the cookies
    const authToken = request.cookies.get('auth-token');
    
    // If not authenticated, redirect to login
    if (!authToken || authToken.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Customer portal routes
  if (request.nextUrl.pathname === '/customer-portal' || 
      (request.nextUrl.pathname.startsWith('/customer-portal/') && 
       !request.nextUrl.pathname.startsWith('/customer-portal/login'))) {
    
    // Get the customer token from the cookies
    const customerToken = request.cookies.get('customer-token')?.value;
    
    if (!customerToken) {
      const loginUrl = new URL('/customer-portal/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verify the token
    const payload = await verifyToken(customerToken, JWT_SECRET, 'customer');
    
    if (!payload) {
      const loginUrl = new URL('/customer-portal/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Configure which paths should be checked by this middleware
export const config = {
  matcher: [
    // Match admin dashboard and all its subpaths
    '/dashboard',
    '/dashboard/:path*',
    
    // Match customer portal and all its subpaths
    '/customer-portal',
    '/customer-portal/:path*',
  ]
};