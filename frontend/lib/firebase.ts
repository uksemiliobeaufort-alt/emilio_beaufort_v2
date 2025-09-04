import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp, getDocs, Firestore } from 'firebase/firestore';
import { doc, getDoc } from "firebase/firestore";

// Firebase configuration - Add your config here
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug Firebase configuration
console.log("Firebase config check:", {
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Initialize Firebase
let app: any;
let storage: FirebaseStorage;
let firestore: Firestore;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  firestore = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Provide fallback or throw error
  throw new Error("Firebase initialization failed. Please check your environment variables.");
}

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    
    if (!firestore) {
      console.error("Firestore is not initialized");
      return { success: false, error: "Firestore not initialized" };
    }
    
    // Try to read a document from hair_extensions collection
    const testDocRef = doc(firestore, "hair_extensions", "TNW6ncPc6cQ81DLntQ4u");
    const testDocSnap = await getDoc(testDocRef);
    
    if (testDocSnap.exists()) {
      console.log("Firebase connection successful - test document exists");
      return { success: true, data: testDocSnap.data() };
    } else {
      console.log("Firebase connection successful - but test document doesn't exist");
      return { success: true, error: "Test document not found" };
    }
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export { storage, firestore, auth };

// Function to generate public Firebase Storage URLs
export const getFirebaseStorageUrl = async (path: string): Promise<string> => {
  try {
    if (!path || !storage) {
      console.error('Invalid path or storage not initialized');
      return '';
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Create a reference to the file
    const fileRef = ref(storage, cleanPath);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(fileRef);
    console.log('Generated Firebase Storage URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Failed to generate Firebase Storage URL:', error);
    return '';
  }
};

// Function to check if Firebase Storage URL is accessible
export const checkFirebaseStorageAccess = async (url: string): Promise<boolean> => {
  try {
    if (!url) return false;
    
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Firebase Storage access check failed:', error);
    return false;
  }
};

// Helper function to generate unique filename
const generateFileName = (originalName: string, productId: string, imageType: 'main' | 'gallery'): string => {
  const timestamp = Date.now();
  const fileExtension = originalName.split('.').pop() || 'jpg';
  return `${productId}/${imageType}_${timestamp}.${fileExtension}`;
};

// Helper function to sanitize text data
const sanitizeText = (text: any): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove any non-printable characters and encoding artifacts
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Helper function to sanitize object data
const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : sanitizeObject(item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const getHairExtensionById = async (id: string) => {
  try {
    console.log("Fetching hair extension with ID:", id);
    
    // Check if firestore is available
    if (!firestore) {
      console.error("Firestore is not initialized");
      throw new Error("Firestore is not initialized");
    }
    
    const docRef = doc(firestore, "hair_extensions", id);
    console.log("Document reference created:", docRef);
    
    const docSnap = await getDoc(docRef);
    console.log("Document snapshot retrieved:", docSnap.exists());

    if (!docSnap.exists()) {
      console.log("Document does not exist for ID:", id);
      return null;
    }

    const rawData = docSnap.data();
    console.log("Raw Firebase data:", rawData);

    // Sanitize the data to prevent encoding issues
    const data = sanitizeObject(rawData);
    console.log("Sanitized Firebase data:", data);

    // Handle different data structures - check for variants array or separate remy/virgin variants
    let remyVariants = [];
    let virginVariants = [];
    
    if (data.variants && Array.isArray(data.variants)) {
      // If data has a single variants array, split by type
      remyVariants = data.variants.filter((v: any) => v.type === 'remy' || !v.type);
      virginVariants = data.variants.filter((v: any) => v.type === 'virgin');
    } else {
      // If data has separate remyVariants and virginVariants arrays
      remyVariants = data.remyVariants || [];
      virginVariants = data.virginVariants || [];
    }

    // Normalize variant fields (convert price to number, and colors to object[])
    const normalizedRemyVariants = remyVariants.map((variant: any) => ({
      ...variant,
      price: Number(variant.price) || 0,
      colors: (variant.colors || []).map((color: string) => ({ 
        name: sanitizeText(color) 
      })),
    }));

    const normalizedVirginVariants = virginVariants.map((variant: any) => ({
      ...variant,
      price: Number(variant.price) || 0,
      colors: (variant.colors || []).map((color: string) => ({ 
        name: sanitizeText(color) 
      })),
    }));

    const result = {
      id: docSnap.id,
      ...data,
      remyVariants: normalizedRemyVariants,
      virginVariants: normalizedVirginVariants,
    };
    
    console.log("Normalized hair extension data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching hair extension by ID:", error);
    // Log more specific error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};
// Hair extension
export const getHairExtensionsFromFirebase = async () => {
  const hairExtensionsRef = collection(firestore, 'hair_extensions');
  const snapshot = await getDocs(hairExtensionsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


// Upload product image to Firebase Storage
export const uploadProductImageToFirebase = async (
  file: File,
  productId: string,
  category: 'cosmetics' | 'hair-extension',
  imageType: 'main' | 'gallery' = 'gallery'
): Promise<string> => {
  try {
    const fileName = generateFileName(file.name, productId, imageType);
    const imagePath = `${category}/${fileName}`;
    const imageRef = ref(storage, imagePath);

    console.log(`Uploading image to Firebase: ${imagePath}`);

    // Upload file
    const snapshot = await uploadBytes(imageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`Image uploaded successfully: ${downloadURL}`);
    return downloadURL;

  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
};

// Delete product image from Firebase Storage
export const deleteProductImageFromFirebase = async (imageUrl: string): Promise<void> => {
  try {
    // Check if URL is valid
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn('Invalid image URL provided:', imageUrl);
      return;
    }

    // Extract the path from the Firebase URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) {
      console.warn('Invalid Firebase URL format:', imageUrl);
      return;
    }

    const imagePath = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage, imagePath);

    console.log(`Deleting image from Firebase: ${imagePath}`);
    await deleteObject(imageRef);
    console.log('Image deleted successfully');

  } catch (error) {
    console.error('Error deleting image from Firebase:', error);
    // Don't throw the error, just log it and continue
    // This prevents the entire deletion process from failing if one image fails
  }
};

// Upload multiple images to Firebase
export const uploadMultipleImagesToFirebase = async (
  files: File[],
  productId: string,
  category: 'cosmetics' | 'hair-extension'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file =>
      uploadProductImageToFirebase(file, productId, category, 'gallery')
    );

    const urls = await Promise.all(uploadPromises);
    return urls;

  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Helper function to get category from Firebase URL
export const getCategoryFromFirebaseUrl = (url: string): 'cosmetics' | 'hair-extension' | null => {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);

    if (!pathMatch) return null;

    const imagePath = decodeURIComponent(pathMatch[1]);

    if (imagePath.startsWith('cosmetics/')) return 'cosmetics';
    if (imagePath.startsWith('hair-extension/')) return 'hair-extension';

    return null;
  } catch {
    return null;
  }
};

// Helper function to upload job post images to Firebase
export const uploadJobPostImagesToFirebase = async (
  files: File[],
  slug: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, idx) => {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const imagePath = `job_posts/${slug}_${timestamp}_${idx}.${fileExtension}`;
      const imageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading job post images:', error);
    throw error;
  }
};

// Helper function to upload blog images to 'blog_posts' folder
export const uploadBlogImagesToFirebase = async (
  files: File[],
  slug: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, idx) => {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const imagePath = `blog_posts/${slug}_${timestamp}_${idx}.${fileExtension}`;
      const imageRef = ref(storage, imagePath);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading blog images:', error);
    throw error;
  }
};