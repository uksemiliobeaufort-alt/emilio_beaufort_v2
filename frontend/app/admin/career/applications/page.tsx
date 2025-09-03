"use client";

import { useEffect, useState, useRef } from "react";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, addDoc, deleteDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";//DialogClose
// import { saveAs } from "file-saver";
import { toast } from "sonner";


interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  createdAt?: Timestamp;
  portfolio?: string;
  coverLetter?: string;
  jobTitle?: string;
  jobId?: string;
  status?: 'Pending' | 'Shortlisted' | 'Rejected';
  linkedin?: string;
  github?: string;
  hearAbout?: string;
  rejectedAt?: Timestamp;
}

export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Shortlisted' | 'Rejected'>('Pending');
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [sheetsUrl, setSheetsUrl] = useState<string>('');
  const [isCleanupRunning, setIsCleanupRunning] = useState(false);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationRef = useRef<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 5;

  // Get all applications from all collections
  const getAllApplications = async (): Promise<Application[]> => {
    try {
      const allApps: Application[] = [];
      
      // Fetch from career_applications (Pending)
      const pendingQuery = query(collection(firestore, 'career_applications'), orderBy('createdAt', 'desc'));
      const pendingSnapshot = await getDocs(pendingQuery);
      
      pendingSnapshot.docs.forEach(doc => {
        const data = doc.data();
        allApps.push({
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          resumeUrl: data.resumeUrl || '',
          createdAt: data.createdAt,
          portfolio: data.portfolio || '',
          coverLetter: data.coverLetter || '',
          jobTitle: data.jobTitle || '',
          jobId: data.jobId || '',
          status: 'Pending',
          linkedin: data.linkedin || '',
          github: data.github || '',
          hearAbout: data.hearAbout || data.hearabout || '',
        });
      });

      // Fetch from accepted_candidates (Shortlisted)
      const acceptedQuery = query(collection(firestore, 'accepted_candidates'), orderBy('acceptedAt', 'desc'));
      const acceptedSnapshot = await getDocs(acceptedQuery);
      
      acceptedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        allApps.push({
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          resumeUrl: data.resumeUrl || '',
          createdAt: data.createdAt || data.acceptedAt,
          portfolio: data.portfolio || '',
          coverLetter: data.coverLetter || '',
          jobTitle: data.jobTitle || '',
          jobId: data.jobId || '',
          status: 'Shortlisted',
          linkedin: data.linkedin || '',
          github: data.github || '',
          hearAbout: data.hearAbout || data.hearabout || '',
        });
      });

      // Fetch from rejected_candidates (Rejected)
      const rejectedQuery = query(collection(firestore, 'rejected_candidates'), orderBy('rejectedAt', 'desc'));
      const rejectedSnapshot = await getDocs(rejectedQuery);
      
      rejectedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        allApps.push({
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          resumeUrl: data.resumeUrl || '',
          createdAt: data.createdAt || data.rejectedAt,
          portfolio: data.portfolio || '',
          coverLetter: data.coverLetter || '',
          jobTitle: data.jobTitle || '',
          jobId: data.jobId || '',
          status: 'Rejected',
          linkedin: data.linkedin || '',
          github: data.github || '',
          hearAbout: data.hearAbout || data.hearabout || '',
        });
      });

      return allApps;
    } catch (error) {
      console.error('Error fetching all applications:', error);
      return [];
    }
  };

  // Fetch applications based on current filter
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let collectionName = 'career_applications';
      let orderField = 'createdAt';
      
      if (statusFilter === 'Shortlisted') {
        collectionName = 'accepted_candidates';
        orderField = 'acceptedAt';
      } else if (statusFilter === 'Rejected') {
        collectionName = 'rejected_candidates';
        orderField = 'rejectedAt';
      }
      
      console.log(`Fetching from ${collectionName} collection...`);
      
      const q = query(collection(firestore, collectionName), orderBy(orderField, 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log(`Found ${querySnapshot.size} applications in ${collectionName}`);
      
      const apps: Application[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          resumeUrl: data.resumeUrl || '',
          createdAt: data.createdAt || data.acceptedAt || data.rejectedAt,
          portfolio: data.portfolio || '',
          coverLetter: data.coverLetter || '',
          jobTitle: data.jobTitle || '',
          jobId: data.jobId || '',
          status: data.status || statusFilter,
          linkedin: data.linkedin || '',
          github: data.github || '',
          hearAbout: data.hearAbout || data.hearabout || '',
        };
      });
      
      setApplications(apps);
      
      // Sync to Google Sheets via server-side API
      if (apps.length > 0) {
        try {
          // Get all applications from all collections for complete sync
          const allApps = await getAllApplications();
          
          const response = await fetch('/api/sync-applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'sync_all',
              applications: allApps
            })
          });
          
          if (response.ok) {
            console.log('Synced all applications to Google Sheets');
          } else {
            console.error('Failed to sync to Google Sheets:', await response.text());
          }
        } catch (error) {
          console.error('Failed to sync to Google Sheets:', error);
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
      setError((err as Error).message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sheets URL (server-side integration)
  useEffect(() => {
    // For server-side integration, we need the spreadsheet ID
    // The "View Sheets" button will work if you have the spreadsheet ID
    // You can manually set this or get it from your Google Sheets URL
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || 'your-spreadsheet-id-here';
    
    if (spreadsheetId && spreadsheetId !== 'your-spreadsheet-id-here') {
      setSheetsUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
      console.log('Google Sheets URL set:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
    } else {
      console.log('Google Sheets not configured. Add NEXT_PUBLIC_GOOGLE_SHEETS_ID to your .env.local');
    }
  }, []);

  // Auto-cleanup rejected applications (runs every 5 minutes in background)
  useEffect(() => {
    const cleanupRejectedApplications = async () => {
      if (isCleanupRunning) return; // Prevent multiple simultaneous cleanups
      
      setIsCleanupRunning(true);
      try {
        const response = await fetch('/api/auto-delete-rejected', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'cleanup_rejected'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.deletedCount > 0) {
            console.log(`Auto-deleted ${result.deletedCount} rejected applications`);
            // Refresh the applications list if we're on the rejected tab
            if (statusFilter === 'Rejected') {
              await fetchApplications();
            }
          }
          // Don't show notifications for background cleanup to avoid spam
        } else {
          console.error('Failed to cleanup rejected applications:', await response.text());
        }
      } catch (error) {
        console.error('Error during auto-cleanup:', error);
      } finally {
        setIsCleanupRunning(false);
      }
    };

    // Clear any existing interval
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
    }

    // Run cleanup immediately and then every 5 minutes
    cleanupRejectedApplications();
    cleanupIntervalRef.current = setInterval(cleanupRejectedApplications, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [statusFilter]); // Removed isCleanupRunning from dependencies

  // Fetch applications when filter changes
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Handle accept application
  const handleAccept = async (application: Application) => {
    if (!application) return;
    
    setProcessingAction('accept');
    try {
      // Add to accepted_candidates
      await addDoc(collection(firestore, 'accepted_candidates'), {
        ...application,
        originalId: application.id,
        acceptedAt: serverTimestamp(),
        status: 'Accepted'
      });

      // Remove from career_applications
      await deleteDoc(doc(firestore, 'career_applications', application.id));

      // Update Google Sheets via server-side API
      try {
        const response = await fetch('/api/sync-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update',
            application: {
              id: application.id,
              status: 'Accepted'
            }
          })
        });
        
        if (!response.ok) {
          console.error('Failed to update Google Sheets:', await response.text());
        }
      } catch (error) {
        console.error('Failed to update Google Sheets:', error);
      }
      
      // Refresh the list
      await fetchApplications();
      
      setDialogOpen(false);
      setSelectedApp(null);
      toast.success('Application accepted successfully!');
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle reject application
  const handleReject = async (application: Application) => {
    if (!application) return;
    
    setProcessingAction('reject');
    try {
      // Add to rejected_candidates with auto-delete timestamp (1 hour from now)
      const oneHourFromNow = new Date();
      oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
      
      await addDoc(collection(firestore, 'rejected_candidates'), {
        ...application,
        originalId: application.id,
        rejectedAt: serverTimestamp(),
        status: 'Rejected',
        autoDeleteAt: Timestamp.fromDate(oneHourFromNow)
      });

      // Remove from career_applications
      await deleteDoc(doc(firestore, 'career_applications', application.id));

      // Update Google Sheets via server-side API
      try {
        const response = await fetch('/api/sync-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update',
            application: {
              id: application.id,
              status: 'Rejected'
            }
          })
        });
        
        if (!response.ok) {
          console.error('Failed to update Google Sheets:', await response.text());
        }
      } catch (error) {
        console.error('Failed to update Google Sheets:', error);
      }
      
      // Refresh the list
      await fetchApplications();
      
      setDialogOpen(false);
      setSelectedApp(null);
      toast.success('Application rejected. It will be auto-deleted in 1 hour.');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessingAction(null);
    }
  };

  // Open resume in viewer
  // const handleDownload = async (url: string, filename: string) => {
  const handleDownload = async (url: string) => {
    if (!url) {
      toast.error("No resume URL available");
      return;
    }

    try {
      console.log('Resume URL:', url); // Debug log
      
      // For Firebase URLs, allow them to pass through without strict extension checking
      if (url.includes('firebase') || url.includes('firebasestorage')) {
        console.log('Firebase URL detected, opening directly');
        window.open(url, '_blank');
        toast.success("Opening resume in new tab");
        return;
      }
      
      // For non-Firebase URLs, check file extension
      const urlPath = url.split('?')[0]; // Remove query parameters
      const pathParts = urlPath.split('.');
      let fileExtension = '';
      
      if (pathParts.length > 1) {
        fileExtension = pathParts[pathParts.length - 1].toLowerCase();
      }
      
      console.log('Detected file extension:', fileExtension); // Debug log
      
      const supportedFormats = ['pdf', 'doc', 'docx'];
      
      if (!fileExtension || !supportedFormats.includes(fileExtension)) {
        console.log('Unsupported format:', fileExtension); // Debug log
        toast.error("Unsupported file format. Only PDF and DOC files are supported.");
        return;
      }

      // For other URLs, fetch and open
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      
      toast.success("Opening resume in new tab");
    } catch (err) {
      console.error('Error opening file:', err);
      toast.error("Failed to open file. Please try again.");
    }
  };

  // Export applications to CSV
  const exportToCSV = () => {
    if (applications.length === 0) {
      toast.error(`No ${statusFilter.toLowerCase()} applications to export`);
      return;
    }

    // Create CSV headers
    const headers = [
      'Name',
      'Email',
      'Job Title',
      'Job ID',
      'LinkedIn',
      'GitHub',
      'Portfolio',
      'Cover Letter',
      'How did you hear',
      'Resume URL',
      'Submitted Date',
      'Status'
    ];

    // Create CSV data
    const csvData = applications.map(app => [
      app.fullName,
      app.email,
      app.jobTitle || '',
      app.jobId || '',
      app.linkedin || '',
      app.github || '',
      app.portfolio || '',
      (app.coverLetter || '').replace(/"/g, '""'), // Escape quotes
      app.hearAbout || '',
      app.resumeUrl || '',
      app.createdAt && app.createdAt.toDate ? app.createdAt.toDate().toLocaleString() : '',
      app.status || statusFilter
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${statusFilter.toLowerCase()}_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Successfully exported ${applications.length} ${statusFilter.toLowerCase()} applications to CSV`);
  };

  // Filter applications based on search
  const filteredApps = applications.filter(app => {
    const searchLower = search.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      (app.jobTitle && app.jobTitle.toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApps.length / applicationsPerPage);
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const currentApplications = filteredApps.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Applications</h1>
                {sheetsUrl && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Google Sheets connected - Live updates enabled
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                                <Button 
                  onClick={async () => {
                    try {
                      // First test the connection
                      const testResponse = await fetch('/api/test-google-sheets');
                      if (!testResponse.ok) {
                        const testError = await testResponse.json();
                        toast.error('Google Sheets connection failed: ' + (testError.details || testError.error));
                        return;
                      }
                      
                      const allApps = await getAllApplications();
                      const response = await fetch('/api/sync-applications', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'sync_all',
                          applications: allApps
                        })
                      });
                      
                      if (response.ok) {
                        const result = await response.json();
                        toast.success(result.message || `All ${allApps.length} applications synced to Google Sheets!`);
                      } else {
                        const errorData = await response.json();
                        toast.error('Failed to sync: ' + (errorData.details || errorData.error || 'Unknown error'));
                      }
                    } catch (error) {
                      toast.error('Failed to sync: ' + error);
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 text-sm sm:text-base transition-colors"
                >
                  <span className="hidden sm:inline">🔄</span>
                  <span className="sm:hidden">🔄</span>
                  <span className="hidden sm:inline">Sync All</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
                {sheetsUrl ? (
                  <Button 
                    onClick={() => window.open(sheetsUrl, '_blank')}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 text-sm sm:text-base transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">View Sheets</span>
                    <span className="sm:hidden">Sheets</span>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      toast.info('Google Sheets integration not configured. Check GOOGLE_SHEETS_SETUP.md for setup instructions.');
                    }}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 text-sm sm:text-base"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Setup Sheets</span>
                    <span className="sm:hidden">Setup</span>
                  </Button>
                )}

                <Button 
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-1 sm:gap-2 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-800 text-sm sm:text-base transition-colors"
                  disabled={applications.length === 0}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                                {statusFilter === 'Rejected' && (
                  <Button 
                    onClick={async () => {
                      if (isCleanupRunning) {
                        toast.info('Cleanup already in progress...');
                        return;
                      }
                      
                      setIsCleanupRunning(true);
                      try {
                        const response = await fetch('/api/auto-delete-rejected', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action: 'cleanup_rejected'
                          })
                        });

                        if (response.ok) {
                          const result = await response.json();
                          const notificationMessage = result.deletedCount > 0 
                            ? `Manually deleted ${result.deletedCount} old rejected applications`
                            : 'No old rejected applications to delete';
                          
                          // Prevent duplicate notifications
                          if (lastNotificationRef.current !== notificationMessage) {
                            lastNotificationRef.current = notificationMessage;
                            if (result.deletedCount > 0) {
                              toast.success(notificationMessage);
                              await fetchApplications();
                            } else {
                              toast.info(notificationMessage);
                            }
                          }
                        } else {
                          const errorData = await response.json();
                          const errorMessage = 'Failed to cleanup: ' + (errorData.details || errorData.error);
                          if (lastNotificationRef.current !== errorMessage) {
                            lastNotificationRef.current = errorMessage;
                            toast.error(errorMessage);
                          }
                        }
                      } catch (error) {
                        toast.error('Error during manual cleanup: ' + error);
                      } finally {
                        setIsCleanupRunning(false);
                      }
                    }}
                    disabled={isCleanupRunning}
                    variant="outline"
                    className="flex items-center gap-1 sm:gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCleanupRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Cleaning...</span>
                        <span className="sm:hidden">Cleaning...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Manual Cleanup</span>
                        <span className="sm:hidden">Cleanup</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="relative max-w-md mx-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full pl-12 pr-10 py-2 sm:py-3 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-gold focus:border-gold text-sm sm:text-base font-medium transition"
                />
                {search && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all border-2 ${statusFilter === 'Pending' ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setStatusFilter('Pending')}
              >
                Pending Applications
              </button>
              <button
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all border-2 ${statusFilter === 'Shortlisted' ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setStatusFilter('Shortlisted')}
              >
                Shortlisted
              </button>
              <button
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all border-2 ${statusFilter === 'Rejected' ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setStatusFilter('Rejected')}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading ? (
              <div className="flex justify-center items-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gold"></div>
                <span className="ml-3 text-gray-600 text-sm sm:text-base">Loading applications...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-red-600 mb-4 text-sm sm:text-base">Error: {error}</p>
                <Button onClick={fetchApplications} variant="outline" size="sm" className="text-sm">
                  Try Again
                </Button>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-base sm:text-lg">No applications found.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {currentApplications.map((app) => (
                  <div key={app.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{app.fullName}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-1">{app.email}</p>
                        {app.phone && (
                          <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{app.phone}</p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          Submitted: {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                        {statusFilter === 'Rejected' && app.rejectedAt && (
                          <p className="text-xs sm:text-sm text-red-500 font-medium">
                            ⏰ Auto-delete: {app.rejectedAt && app.rejectedAt.toDate ? 
                              new Date(app.rejectedAt.toDate().getTime() + 60 * 60 * 1000).toLocaleString() : 'N/A'}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 sm:gap-2">
                        <Button
                          onClick={() => handleDownload(app.resumeUrl || '', 'resume')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="hidden sm:inline">Resume</span>
                          <span className="sm:hidden">Resume</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedApp(app);
                            setDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredApps.length)} of {filteredApps.length} applications
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[90vw] sm:w-[600px] md:w-[700px] lg:w-[800px] h-[80vh] sm:h-[70vh] md:h-[75vh] bg-white/95 border border-gray-200 rounded-2xl p-0 overflow-hidden flex flex-col">
            {selectedApp && (
              <>
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 text-center flex-shrink-0 border-b border-gray-100">
                  <DialogTitle className="text-lg sm:text-xl font-bold mb-1 text-gray-900">{selectedApp.fullName}</DialogTitle>
                  <div className="text-sm sm:text-base text-gold font-semibold tracking-wide">{selectedApp.jobTitle || "—"}</div>
                </DialogHeader>
                
                <div className="px-4 sm:px-6 py-4 flex-1 overflow-y-auto">
                  {/* Basic Info Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Email:</span>
                        <a href={`mailto:${selectedApp.email}`} className="text-blue-700 underline break-all">{selectedApp.email}</a>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">LinkedIn:</span>
                        {selectedApp.linkedin && selectedApp.linkedin.trim() !== "" ? (
                          <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition">View Profile</a>
                        ) : <span className="text-gray-400">—</span>}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">GitHub:</span>
                        {selectedApp.github && selectedApp.github.trim() !== "" ? (
                          <a href={selectedApp.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition">View Profile</a>
                        ) : <span className="text-gray-400">—</span>}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Portfolio:</span>
                        {selectedApp.portfolio && selectedApp.portfolio.trim() !== "" ? (
                          <a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition">View Portfolio</a>
                        ) : <span className="text-gray-400">—</span>}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Resume:</span>
                        {selectedApp.resumeUrl ? (
                          <button
                            type="button"
                            className="text-blue-600 underline hover:text-blue-800 font-semibold transition"
                            onClick={() => handleDownload(selectedApp.resumeUrl!, 'resume')}
                          >
                            View Resume
                          </button>
                        ) : <span className="text-gray-400">—</span>}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Cover Letter</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {selectedApp.coverLetter && selectedApp.coverLetter.trim() !== "" ? (
                        <div className="text-sm leading-relaxed whitespace-pre-line break-words">
                          {selectedApp.coverLetter}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No cover letter provided</span>
                      )}
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Additional Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-32 flex-shrink-0">How did you hear:</span>
                        <span className="text-gray-800">{selectedApp.hearAbout && selectedApp.hearAbout.trim() !== "" ? selectedApp.hearAbout : <span className="text-gray-400">—</span>}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32 flex-shrink-0">Submitted:</span>
                        <span className="text-gray-500">
                          {selectedApp.createdAt && selectedApp.createdAt.toDate ? selectedApp.createdAt.toDate().toLocaleString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-2 flex-shrink-0 border-t border-gray-100">
                  {statusFilter === 'Pending' ? (
                    <>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReject(selectedApp)}
                        disabled={processingAction !== null}
                        className="w-full sm:w-auto"
                      >
                        {processingAction === 'reject' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          'Reject'
                        )}
                      </Button>
                      <Button 
                        onClick={() => handleAccept(selectedApp)}
                        disabled={processingAction !== null}
                        className="w-full sm:w-auto"
                      >
                        {processingAction === 'accept' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          'Accept'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Close
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 