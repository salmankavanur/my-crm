// app/api/auth/login/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface LoginRequestBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { username, password }: LoginRequestBody = await request.json();
    
    // Check credentials against environment variables
    const validUsername = process.env.NEXT_PUBLIC_USERNAME;
    const validPassword = process.env.NEXT_PUBLIC_PASSWORD;
    
    if (username === validUsername && password === validPassword) {
      // Set a secure cookie for authentication
      const cookieStore = await cookies();
      cookieStore.set('auth-token', 'authenticated', { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/'
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}