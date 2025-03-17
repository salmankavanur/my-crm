// app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  // Remove the auth cookie
  cookieStore.delete('auth-token');
  
  return NextResponse.json({ success: true });
}
