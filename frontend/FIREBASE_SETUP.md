# Firebase Setup Guide

## Issue: Firebase Data Not Fetching

The ProductDetailDialog is not fetching data from Firebase because the Firebase configuration is missing or incomplete.

## Steps to Fix:

### 1. Create Environment File
Create a `.env.local` file in the `frontend` directory with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app or create a new one
6. Copy the configuration values

### 3. Verify Firebase Collection
Make sure you have a `hair_extensions` collection in Firestore with the test document ID: `TNW6ncPc6cQ81DLntQ4u`

### 4. Check Browser Console
After setting up the environment variables:
1. Restart your development server
2. Open browser console
3. Look for Firebase initialization messages
4. Check for any error messages

### 5. Test Firebase Connection
The code now includes better error handling and debugging. Check the console for:
- "Firebase config check" - shows which environment variables are set
- "Firebase initialized successfully" - confirms Firebase is working
- Detailed error messages if something fails

## Common Issues:

1. **Missing Environment Variables**: All Firebase config values must be set
2. **Wrong Project ID**: Make sure you're using the correct Firebase project
3. **Firestore Rules**: Ensure your Firestore rules allow reading the `hair_extensions` collection
4. **Document Doesn't Exist**: The test document ID might not exist in your Firebase project

## Debugging Steps:

1. Check browser console for Firebase initialization messages
2. Verify all environment variables are set correctly
3. Test Firebase connection with a simple document read
4. Check Firestore rules and permissions
5. Verify the document exists in your Firebase project

## Alternative: Use Supabase Instead

If Firebase setup is problematic, you can modify the ProductDetailDialog to use Supabase for all products instead of Firebase for hair extensions. 