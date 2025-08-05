import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Firebase Admin connection...');
    
    // Check environment variables
    const envCheck = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    };
    
    console.log('Environment variables check:', envCheck);
    
    if (!envCheck.FIREBASE_PROJECT_ID || !envCheck.FIREBASE_CLIENT_EMAIL || !envCheck.FIREBASE_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing Firebase environment variables',
        envCheck
      }, { status: 500 });
    }

    // Test Firestore connection by trying to read from a collection
    try {
      const testQuery = db.collection('rejected_candidates').limit(1);
      const snapshot = await testQuery.get();
      
      console.log('Firestore connection successful');
      console.log(`Found ${snapshot.size} documents in rejected_candidates collection`);
      
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin is working correctly',
        envCheck,
        firestoreTest: {
          connected: true,
          documentsFound: snapshot.size
        }
      });
    } catch (firestoreError) {
      console.error('Firestore connection failed:', firestoreError);
      return NextResponse.json({
        success: false,
        error: 'Firestore connection failed',
        details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
        envCheck
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 