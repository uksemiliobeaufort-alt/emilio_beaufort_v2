import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration - Add your config here
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };

// Helper function to generate unique filename
const generateFileName = (originalName: string, productId: string, imageType: 'main' | 'gallery'): string => {
  const timestamp = Date.now();
  const fileExtension = originalName.split('.').pop() || 'jpg';
  return `${productId}/${imageType}_${timestamp}.${fileExtension}`;
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
    // Extract the path from the Firebase URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase URL format');
    }
    
    const imagePath = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage, imagePath);
    
    console.log(`Deleting image from Firebase: ${imagePath}`);
    await deleteObject(imageRef);
    console.log('Image deleted successfully');
    
  } catch (error) {
    console.error('Error deleting image from Firebase:', error);
    throw error;
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