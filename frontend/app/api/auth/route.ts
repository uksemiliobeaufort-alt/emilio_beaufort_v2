import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, AuthError } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      const user = await verifyCredentials(email, password);
      const adminToken = btoa(`${user.email}:${Date.now()}`);

      return NextResponse.json({
        user: {
          ...user,
          admin_token: adminToken
        }
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 