import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();
const storage = getStorage();

export async function POST(request: NextRequest) {
  try {
    console.log('Auto-delete API called');
    
    // Check if Firebase Admin is properly configured
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Missing Firebase environment variables');
      return NextResponse.json({ 
        error: 'Firebase Admin not configured. Please check environment variables.',
        details: 'Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY'
      }, { status: 500 });
    }

    console.log('Firebase Admin configured successfully');
    const { action } = await request.json();
    console.log('Action received:', action);

    if (action === 'cleanup_rejected') {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      console.log('Looking for applications older than:', oneHourAgo);

      // Query for rejected applications that are older than 1 hour
      const rejectedQuery = db.collection('rejected_candidates')
        .where('rejectedAt', '<', Timestamp.fromDate(oneHourAgo));

      const snapshot = await rejectedQuery.get();
      console.log(`Found ${snapshot.size} applications to delete`);
      
      if (snapshot.empty) {
        return NextResponse.json({ 
          message: 'No rejected applications to delete',
          deletedCount: 0 
        });
      }

      const deletePromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log(`Processing application ${doc.id}:`, data.fullName);
        
        // Delete the resume file from Firebase Storage if it exists
        if (data.resumeUrl) {
          console.log(`Attempting to delete resume: ${data.resumeUrl}`);
          try {
            let filePath = '';
            
            // Handle different Firebase Storage URL formats
            if (data.resumeUrl.includes('firebasestorage.googleapis.com')) {
              // Standard Firebase Storage URL format
              const url = new URL(data.resumeUrl);
              filePath = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '');
              console.log('Extracted file path (standard):', filePath);
            } else if (data.resumeUrl.includes('firebase')) {
              // Alternative Firebase URL format
              const urlParts = data.resumeUrl.split('/');
              const oIndex = urlParts.findIndex(part => part === 'o');
              if (oIndex !== -1 && oIndex + 1 < urlParts.length) {
                filePath = decodeURIComponent(urlParts[oIndex + 1].split('?')[0]);
              }
              console.log('Extracted file path (alternative):', filePath);
            }
            
            if (filePath) {
              try {
                // Try to get the bucket name from environment or use default
                const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
                console.log('Using storage bucket:', bucketName);
                
                const bucket = storage.bucket(bucketName);
                const file = bucket.file(filePath);
                
                // Check if file exists before deleting
                const [exists] = await file.exists();
                console.log(`File exists check for ${filePath}:`, exists);
                if (exists) {
                  await file.delete();
                  console.log(`Successfully deleted resume file: ${filePath}`);
                } else {
                  console.log(`Resume file not found: ${filePath}`);
                }
              } catch (storageError) {
                console.error('Error accessing Firebase Storage:', storageError);
                // Try with default bucket
                try {
                  const bucket = storage.bucket();
                  const file = bucket.file(filePath);
                  const [exists] = await file.exists();
                  if (exists) {
                    await file.delete();
                    console.log(`Successfully deleted resume file with default bucket: ${filePath}`);
                  }
                } catch (defaultError) {
                  console.error('Error with default bucket:', defaultError);
                }
              }
            } else {
              console.log('Could not extract file path from URL:', data.resumeUrl);
            }
          } catch (error) {
            console.error('Error deleting resume file:', error);
            // Continue with document deletion even if file deletion fails
          }
        } else {
          console.log('No resume URL found for application');
        }

        // Delete the document from Firestore
        try {
          await doc.ref.delete();
          console.log(`Successfully deleted rejected application document: ${doc.id}`);
        } catch (error) {
          console.error(`Error deleting document ${doc.id}:`, error);
        }
      });

      await Promise.all(deletePromises);

      return NextResponse.json({ 
        message: `Successfully deleted ${snapshot.size} rejected applications and their associated files`,
        deletedCount: snapshot.size 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in auto-delete rejected applications:', error);
    return NextResponse.json({ 
      error: 'Failed to process auto-deletion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 