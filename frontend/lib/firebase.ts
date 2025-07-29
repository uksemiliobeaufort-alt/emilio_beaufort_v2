// import { initializeApp } from 'firebase/app';
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// // Firebase configuration - Add your config here
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
// const firestore = getFirestore(app);

// export { storage, firestore };

// // Helper function to generate unique filename
// const generateFileName = (originalName: string, productId: string, imageType: 'main' | 'gallery'): string => {
//   const timestamp = Date.now();
//   const fileExtension = originalName.split('.').pop() || 'jpg';
//   return `${productId}/${imageType}_${timestamp}.${fileExtension}`;
// };

// // Upload product image to Firebase Storage
// export const uploadProductImageToFirebase = async (
//   file: File, 
//   productId: string, 
//   category: 'cosmetics' | 'hair-extension', 
//   imageType: 'main' | 'gallery' = 'gallery'
// ): Promise<string> => {
//   try {
//     const fileName = generateFileName(file.name, productId, imageType);
//     const imagePath = `${category}/${fileName}`;
//     const imageRef = ref(storage, imagePath);
    
//     console.log(`Uploading image to Firebase: ${imagePath}`);
    
//     // Upload file
//     const snapshot = await uploadBytes(imageRef, file);
    
//     // Get download URL
//     const downloadURL = await getDownloadURL(snapshot.ref);
    
//     console.log(`Image uploaded successfully: ${downloadURL}`);
//     return downloadURL;
    
//   } catch (error) {
//     console.error('Error uploading image to Firebase:', error);
//     throw error;
//   }
// };

// // Delete product image from Firebase Storage
// export const deleteProductImageFromFirebase = async (imageUrl: string): Promise<void> => {
//   try {
//     const url = new URL(imageUrl);
//     const oIndex = url.pathname.indexOf('/o/');
//     if (oIndex === -1) throw new Error('Invalid Firebase URL format');
//     let imagePath = url.pathname.substring(oIndex + 3);
//     imagePath = decodeURIComponent(imagePath.split('?')[0]);
//     const imageRef = ref(storage, imagePath);

//     console.log(`Deleting image from Firebase: ${imagePath}`);
//     await deleteObject(imageRef);
//     console.log('Image deleted successfully');
//   } catch (error: any) {
//     // Ignore 'object-not-found' error
//     if (error.code === 'storage/object-not-found') {
//       console.warn('Image not found in Firebase Storage, skipping delete.');
//       return;
//     }
//     console.error('Error deleting image from Firebase:', error);
//     throw error;
//   }
// };

// // Upload multiple images to Firebase
// export const uploadMultipleImagesToFirebase = async (
//   files: File[], 
//   productId: string, 
//   category: 'cosmetics' | 'hair-extension'
// ): Promise<string[]> => {
//   try {
//     const uploadPromises = files.map(file => 
//       uploadProductImageToFirebase(file, productId, category, 'gallery')
//     );
    
//     const urls = await Promise.all(uploadPromises);
//     return urls;
    
//   } catch (error) {
//     console.error('Error uploading multiple images:', error);
//     throw error;
//   }
// };

// // Helper function to get category from Firebase URL
// export const getCategoryFromFirebaseUrl = (url: string): 'cosmetics' | 'hair-extension' | null => {
//   try {
//     const urlObj = new URL(url);
//     const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    
//     if (!pathMatch) return null;
    
//     const imagePath = decodeURIComponent(pathMatch[1]);
    
//     if (imagePath.startsWith('cosmetics/')) return 'cosmetics';
//     if (imagePath.startsWith('hair-extension/')) return 'hair-extension';
    
//     return null;
//   } catch {
//     return null;
//   }
// }; 

// // Helper function to upload blog images to 'blog_posts' folder
// export const uploadBlogImagesToFirebase = async (
//   files: File[],
//   slug: string
// ): Promise<string[]> => {
//   try {
//     const uploadPromises = files.map(async (file, idx) => {
//       const timestamp = Date.now();
//       const fileExtension = file.name.split('.').pop() || 'jpg';
//       const imagePath = `blog_posts/${slug}_${timestamp}_${idx}.${fileExtension}`;
//       const imageRef = ref(storage, imagePath);
//       const snapshot = await uploadBytes(imageRef, file);
//       const downloadURL = await getDownloadURL(snapshot.ref);
//       return downloadURL;
//     });
//     return await Promise.all(uploadPromises);
//   } catch (error) {
//     console.error('Error uploading blog images:', error);
//     throw error;
//   }
// }; 

// // Helper function to upload job post images to 'job_posts' folder
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



import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

export { storage, firestore };

// Helper function to generate unique filename
const generateFileName = (originalName: string, productId: string, imageType: 'main' | 'gallery'): string => {
  const timestamp = Date.now();
  const fileExtension = originalName.split('.').pop() || 'jpg';
  return `${productId}/${imageType}_${timestamp}.${fileExtension}`;
};
export const getHairExtensionById = async (id: string) => {
  try {
    console.log("Fetching hair extension with ID:", id);
    const docRef = doc(firestore, "hair_extensions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("Document does not exist for ID:", id);
      return null;
    }

    const data = docSnap.data();
    console.log("Raw Firebase data:", data);

    // Normalize variant fields (convert price to number, and colors to object[])
    const normalizedVariants = (data.variants || []).map((variant: any) => ({
      ...variant,
      price: Number(variant.price) || 0,
      colors: (variant.colors || []).map((color: string) => ({ name: color })),
    }));

    const result = {
      id: docSnap.id,
      ...data,
      variants: normalizedVariants,
    };
    
    console.log("Normalized hair extension data:", result);
    return result;
  } catch (error) {
    console.error("Error fetching hair extension by ID:", error);
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