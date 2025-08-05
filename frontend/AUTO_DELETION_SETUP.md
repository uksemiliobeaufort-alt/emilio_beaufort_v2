# Auto-Deletion System for Rejected Applications

## Overview
This system automatically deletes rejected job applications and their associated resume files from Firebase after 1 hour from the rejection time.

## How It Works

### 1. Rejection Process
- When an application is rejected, it's moved from `career_applications` to `rejected_candidates` collection
- A `rejectedAt` timestamp is added to track when the rejection occurred
- An `autoDeleteAt` timestamp is set to 1 hour from the rejection time

### 2. Auto-Deletion Process
- The system runs a cleanup every 5 minutes via a client-side interval
- It queries for rejected applications older than 1 hour
- For each old application:
  - Deletes the associated resume file from Firebase Storage
  - Deletes the application document from Firestore
  - Logs the deletion for monitoring

### 3. Manual Cleanup
- A "Cleanup Old" button appears in the Rejected tab
- Allows manual triggering of the cleanup process
- Useful for testing or immediate cleanup

## API Endpoint

### `/api/auto-delete-rejected`
- **Method**: POST
- **Body**: `{ "action": "cleanup_rejected" }`
- **Response**: 
  ```json
  {
    "message": "Successfully deleted X rejected applications and their associated files",
    "deletedCount": X
  }
  ```

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## Firebase Storage File Deletion

The system handles different Firebase Storage URL formats:
- Standard: `https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile`
- Alternative: `https://firebase.com/storage/bucket/o/path%2Fto%2Ffile`

## Monitoring

- Check browser console for deletion logs
- The UI shows auto-deletion timestamps for rejected applications
- Manual cleanup button provides immediate feedback

## Testing

1. Reject an application
2. Wait for the auto-deletion timestamp to show
3. Use the "Cleanup Old" button to test immediate deletion
4. Check that both the document and resume file are deleted

## Security Notes

- Only applications older than 1 hour are deleted
- File deletion errors don't prevent document deletion
- All operations are logged for audit purposes 