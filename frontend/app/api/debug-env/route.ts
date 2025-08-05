import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_STORAGE_BUCKET: !!process.env.FIREBASE_STORAGE_BUCKET,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    // Show partial values for debugging (first 10 chars)
    const partialValues = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID.substring(0, 10) + '...' : 'NOT_SET',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? process.env.FIREBASE_CLIENT_EMAIL.substring(0, 10) + '...' : 'NOT_SET',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 10) + '...' : 'NOT_SET',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'NOT_SET',
    };
    
    return NextResponse.json({
      success: true,
      envCheck,
      partialValues,
      message: 'Environment variables check completed'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 