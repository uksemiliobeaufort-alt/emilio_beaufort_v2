import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Function to automatically delete rejected applications after 7 days
export const cleanupRejectedApplications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      
      // Query for rejected applications that are older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo);
      
      const rejectedQuery = db.collection('rejected_candidates')
        .where('autoDeleteAt', '<=', now)
        .where('autoDeleteAt', '>=', sevenDaysAgoTimestamp);
      
      const snapshot = await rejectedQuery.get();
      
      if (snapshot.empty) {
        console.log('No rejected applications to delete');
        return null;
      }
      
      const batch = db.batch();
      let deletedCount = 0;
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`Deleting rejected application: ${data.fullName} (${data.email})`);
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      await batch.commit();
      console.log(`Successfully deleted ${deletedCount} rejected applications`);
      
      return null;
    } catch (error) {
      console.error('Error in cleanupRejectedApplications:', error);
      throw error;
    }
  });

// Function to manually trigger cleanup (for testing)
export const manualCleanupRejectedApplications = functions.https.onRequest(async (req, res) => {
  try {
    const now = admin.firestore.Timestamp.now();
    
    const rejectedQuery = db.collection('rejected_candidates')
      .where('autoDeleteAt', '<=', now);
    
    const snapshot = await rejectedQuery.get();
    
    if (snapshot.empty) {
      res.json({ message: 'No rejected applications to delete', deletedCount: 0 });
      return;
    }
    
    const batch = db.batch();
    let deletedCount = 0;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`Deleting rejected application: ${data.fullName} (${data.email})`);
      batch.delete(doc.ref);
      deletedCount++;
    });
    
    await batch.commit();
    
    res.json({ 
      message: `Successfully deleted ${deletedCount} rejected applications`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup rejected applications' });
  }
});

// Function to get statistics about applications
export const getApplicationStats = functions.https.onRequest(async (req, res) => {
  try {
    const [pendingSnapshot, acceptedSnapshot, rejectedSnapshot] = await Promise.all([
      db.collection('career_applications').get(),
      db.collection('accepted_candidates').get(),
      db.collection('rejected_candidates').get()
    ]);
    
    const stats = {
      pending: pendingSnapshot.size,
      accepted: acceptedSnapshot.size,
      rejected: rejectedSnapshot.size,
      total: pendingSnapshot.size + acceptedSnapshot.size + rejectedSnapshot.size
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting application stats:', error);
    res.status(500).json({ error: 'Failed to get application statistics' });
  }
}); 