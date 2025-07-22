import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();

export async function GET() {
  const blogsSnapshot = await db.collection('blog_posts').get();
  const blogs = blogsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: data.slug,
      updatedAt: data.updatedAt || null,
      coverImage: data.coverImage || null,
    };
  });
  return NextResponse.json(blogs);
} 