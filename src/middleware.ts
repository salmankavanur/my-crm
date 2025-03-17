// middleware.ts (in root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the auth token from the cookies
  const authToken = request.cookies.get('auth-token');
  
  // Check if the request is for a protected route (dashboard or any subpath of dashboard)
  if (request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname.startsWith('/dashboard/')) {
    // If not authenticated, redirect to login
    if (!authToken || authToken.value !== 'authenticated') {
      // Create the login URL with the original URL as the redirect destination
      const loginUrl = new URL('/login', request.url);
      
      // Add the original URL as a search parameter for redirect after login
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      
      // Redirect to login
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Configure which paths should be checked by this middleware
export const config = {
  matcher: [
    // Match dashboard and all its subpaths
    '/dashboard',
    '/dashboard/customers',
    // Add other protected routes as needed
    '/customers/invoices',
  ]
};