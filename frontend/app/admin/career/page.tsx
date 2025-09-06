"use client";

import { useEffect, useState } from "react";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, UploadCloud, Share2, Copy, Twitter, Linkedin, Facebook, Link as LinkIcon, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import TipTapEditor from "@/app/admin/components/TipTapEditor";
import { Info, PlusCircle } from "lucide-react";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import { Briefcase, Code, Cpu, Users, User } from "lucide-react";
import JobPostForm from "./JobPostForm";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface JobPost {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  salary: string;
  department?: string;
  description: string;
  application_form_link?: string;
  seats_available?: number;
  is_closed?: boolean;
  created_at: string | any; // Firebase Timestamp or string
  auto_delete_at?: string | any; // Firebase Timestamp or string
}

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [jobToShare, setJobToShare] = useState<JobPost | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);



  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'job_posts'));
      const jobsData = querySnapshot.docs.map(docSnap => ({ ...(docSnap.data() as Omit<JobPost, 'id'>), id: docSnap.id }));
      
      // Filter out expired jobs (auto_delete_at has passed)
      const currentTime = new Date();
      const activeJobs = jobsData.filter(job => {
        if (!job.auto_delete_at) return true; // Keep jobs without auto-delete
        
        const deleteTime = job.auto_delete_at.toDate ? job.auto_delete_at.toDate() : new Date(job.auto_delete_at);
        return deleteTime > currentTime;
      });
      
      // Clean up expired jobs from database
      const expiredJobs = jobsData.filter(job => {
        if (!job.auto_delete_at) return false;
        
        const deleteTime = job.auto_delete_at.toDate ? job.auto_delete_at.toDate() : new Date(job.auto_delete_at);
        return deleteTime <= currentTime;
      });
      
      // Delete expired jobs from database
      for (const expiredJob of expiredJobs) {
        try {
          await deleteDoc(doc(firestore, 'job_posts', expiredJob.id));
          console.log(`Deleted expired job: ${expiredJob.title}`);
        } catch (error) {
          console.error(`Failed to delete expired job ${expiredJob.id}:`, error);
        }
      }
      
      setJobs(activeJobs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load jobs');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setLocation("");
    setType("");
    setSalary("");
    setDepartment("");
    setDescription("");
    setSelectedJob(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!title || !description) {
      toast.error('Title and description are required');
      return;
    }
    setIsProcessing(true);
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const jobData = {
      title,
      slug,
      location,
      type,
      salary,
      department,
      description,
    };
    try {
      if (selectedJob) {
        await updateDoc(doc(firestore, 'job_posts', selectedJob.id), jobData);
        toast.success('Job updated');
      } else {
        const newJobData = { 
          ...jobData, 
          created_at: Timestamp.now(),
          is_closed: false // Ensure job is not closed by default
        };
        console.log('Creating new job with data:', newJobData);
        await addDoc(collection(firestore, 'job_posts'), newJobData);
        toast.success('Job posted');
      }
      resetForm();
      setDialogOpen(false);
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save job');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (job: JobPost) => {
    setSelectedJob(job);
    setTitle(job.title);
    setLocation(job.location);
    setType(job.type);
    setSalary(job.salary);
    setDepartment(job.department || "");
    setDescription(job.description);
    setDialogOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(firestore, 'job_posts', jobId));
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete job');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtendAutoDelete = async (jobId: string) => {
    setIsProcessing(true);
    try {
      // Extend auto-delete by 7 more days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      await updateDoc(doc(firestore, 'job_posts', jobId), {
        auto_delete_at: Timestamp.fromDate(sevenDaysFromNow)
      });
      
      toast.success('Auto-delete extended by 7 days');
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to extend auto-delete');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = (job: JobPost) => {
    setJobToShare(job);
    setShareDialogOpen(true);
  };

  const getJobUrl = (job: JobPost) => {
    const baseUrl = 'https://www.emiliobeaufort.com';
    return `${baseUrl}/careers?jobId=${job.id}`;
  };

  const copyJobUrl = async (job: JobPost) => {
    const url = getJobUrl(job);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Job URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const shareOnSocialMedia = (platform: string, job: JobPost) => {
    const url = getJobUrl(job);
    const defaultMessage = `🚀 Exciting Career Opportunity at Emilio Beaufort!\n\n${job.title}\n${job.department ? `Department: ${job.department}` : ''}\n${job.location ? `Location: ${job.location}` : ''}\n${job.type ? `Type: ${job.type}` : ''}\n\nJoin the Emilio Beaufort team and help shape the future of luxury grooming! 💼✨\n\nApply now:`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 Exciting Career Opportunity at Emilio Beaufort: ${job.title}\n\nJoin the Emilio Beaufort team and help shape the future of luxury grooming! 💼✨\n\nApply now: ${url}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(defaultMessage + ' ' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Career Opportunities</h1>
          <p className="text-gray-500">Post and manage job openings</p>
        </div>
        <div className="flex items-center gap-3">
          {dialogOpen && (
            <Button
              onClick={() => {
                resetForm();
                setDialogOpen(false);
              }}
              variant="outline"
              className="hidden md:flex items-center gap-2 border-gray-300 text-gray-700 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="hidden md:flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full shadow-lg hover:bg-gray-900 transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            Post New Job
          </Button>
        </div>
      </div>
      {/* Floating Action Button for New Job */}
      <Button
        onClick={() => {
          resetForm();
          setDialogOpen(true);
        }}
        className="fixed bottom-8 right-8 z-50 flex md:hidden items-center gap-2 bg-black text-white px-5 py-3 rounded-full shadow-2xl hover:bg-gray-900 transition-all"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
      >
        <PlusCircle className="h-6 w-6" />
        Post Job
      </Button>
      {/* Mobile Close Button */}
      {dialogOpen && (
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(false);
          }}
          variant="outline"
          className="fixed bottom-8 left-8 z-50 flex md:hidden items-center gap-2 border-gray-300 text-gray-700 px-4 py-3 rounded-full shadow-2xl hover:bg-gray-50 hover:border-gray-400 transition-all bg-white"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
        >
          <X className="h-5 w-5" />
          Close
        </Button>
      )}
      {/* Job Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        {dialogOpen && (
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content
              className="job-form-dialog fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-6xl h-[85vh] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-2xl border-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                width: '90vw',
                maxWidth: '1000px',
                height: '80vh',
                maxHeight: '80vh',
                margin: 0,
                border: 'none',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Content Container */}
              <div className="h-full w-full overflow-hidden flex flex-col">
                                 <JobPostForm
                   job={selectedJob}
                   onSubmit={async (data) => {
                     setIsProcessing(true);
                     const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                     const jobData = { ...data, slug };
                     
                     console.log('Job form submitted with data:', jobData);
                     
                     try {
                       if (selectedJob) {
                         // For updates, don't include created_at
                         const { created_at, ...updateData } = jobData;
                         await updateDoc(doc(firestore, 'job_posts', selectedJob.id), updateData);
                         toast.success("Job updated");
                       } else {
                         // For new jobs, ensure created_at is a Firebase Timestamp
                         const newJobData = {
                           ...jobData,
                           created_at: Timestamp.now(),
                           is_closed: false
                         };
                         console.log('Creating new job with data:', newJobData);
                         await addDoc(collection(firestore, 'job_posts'), newJobData);
                         toast.success("Job posted");
                       }
                       resetForm();
                       setDialogOpen(false);
                       fetchJobs();
                     } catch (error) {
                       console.error(error);
                       toast.error("Failed to save job");
                     } finally {
                       setIsProcessing(false);
                     }
                   }}
                  isSubmitting={isProcessing}
                  isEdit={!!selectedJob}
                  onClose={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPortal>
        )}
      </Dialog>
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Share Job Opening</DialogTitle>
          </DialogHeader>
          {jobToShare && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{jobToShare.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{jobToShare.department} • {jobToShare.location}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Job URL</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyJobUrl(jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  <Button
                    onClick={() => shareOnSocialMedia('twitter', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm py-2 sm:py-2"
                  >
                    <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('linkedin', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm py-2 sm:py-2"
                  >
                    <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('facebook', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 sm:py-2"
                  >
                    <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Facebook</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('whatsapp', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2 sm:py-2 col-span-2 sm:col-span-3"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Job List */}
      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto text-gray-400 h-6 w-6" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Info className="h-12 w-12 mb-4 text-gray-300" />
          <div className="text-lg font-semibold mb-2">No job posts available</div>
          <div className="mb-4">Start by posting your first job opportunity!</div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            className="bg-black text-white px-6 py-2 rounded-full shadow hover:bg-gray-900"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Post New Job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="relative border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md bg-white group transition-all hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
            >
              {/* Action buttons top right */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2 z-10">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleEdit(job)} 
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/80 backdrop-blur-sm hover:bg-white hover:text-gray-900 text-gray-600 shadow-sm"
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleShare(job)} 
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/80 backdrop-blur-sm hover:bg-white hover:text-gray-900 text-gray-600 shadow-sm"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  onClick={() => handleDelete(job.id)} 
                  className="h-8 w-8 sm:h-9 sm:w-9 shadow-sm hover:bg-red-600 hover:text-white text-red-600"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              {/* Job Header with Icon and Title */}
              <div className="flex items-start gap-3 mb-3 pr-24 sm:pr-28">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-2 sm:p-2.5 flex-shrink-0">
                  <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 line-clamp-2 leading-tight">{job.title}</h3>
                </div>
              </div>
              {/* Department and Job Details */}
              {job.department && (
                <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {departmentIcon(job.department)}
                    <span className="font-medium">{job.department}</span>
                  </div>
                </div>
              )}
              
              {/* Job Details Grid */}
              <div className="space-y-2 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{job.location}</span>
                  </div>
                )}
                {job.type && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">{job.type}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Salary: {job.salary}</span>
                  </div>
                )}
                {job.application_form_link && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <span className="font-medium">External Form Available</span>
                  </div>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedJob(job);
                    setExpandedJobId(job.id);
                  }}
                  className="w-full text-xs sm:text-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 text-gray-700"
                >
                  View Details
                </Button>
                
                <div className="flex gap-2">
                  {job.auto_delete_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 text-xs sm:text-sm"
                      onClick={() => handleExtendAutoDelete(job.id)}
                      disabled={isProcessing}
                    >
                      Extend
                    </Button>
                  )}
                  {job.application_form_link && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:text-white text-xs sm:text-sm shadow-sm"
                      onClick={() => window.open(job.application_form_link, '_blank')}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
              {/* Date Information */}
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>
                    {job.created_at
                      ? (typeof job.created_at === 'string'
                          ? new Date(job.created_at).toLocaleDateString()
                          : (job.created_at && typeof job.created_at === 'object' && 'toDate' in job.created_at
                              ? job.created_at.toDate().toLocaleDateString()
                              : ''))
                      : ''}
                  </span>
                </div>
                {job.auto_delete_at && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                    <span className="font-medium">
                      Auto-delete: {job.auto_delete_at.toDate ? job.auto_delete_at.toDate().toLocaleDateString() : new Date(job.auto_delete_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedJob && expandedJobId === selectedJob.id && (
<Dialog open={true} onOpenChange={() => { setExpandedJobId(null); setSelectedJob(null); }}>
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-0 border-0">
<div className="p-6 sm:p-8">
{/* Header Section */}
<DialogHeader className="mb-6">
<DialogTitle className="text-2xl sm:text-3xl font-bold text-black mb-2">
{selectedJob.title}
</DialogTitle>
<div className="text-gray-600 text-sm sm:text-base">
{selectedJob.department && `${selectedJob.department} • `}{selectedJob.location}
</div>
</DialogHeader>

<div className="space-y-6">
{/* Job Badges */}
<div className="flex flex-wrap gap-2">
{selectedJob.type && (
<span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 break-words max-w-full">
{selectedJob.type}
</span>
)}
{selectedJob.salary && (
<span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-100 break-words max-w-full">
Salary: {selectedJob.salary}
</span>
)}
{selectedJob.application_form_link && (
<span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100 break-words max-w-full">
External Form
</span>
)}
{selectedJob.seats_available && (
<span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100 break-words max-w-full">
Seats: {selectedJob.seats_available}
</span>
)}
</div>

{/* Date Information */}
<div className="text-xs text-gray-400 mb-4">
{selectedJob.created_at && (typeof selectedJob.created_at === 'string' ? new Date(selectedJob.created_at).toLocaleDateString() : '')}
{selectedJob.auto_delete_at && (
<span className="ml-4 text-orange-600">
Expires: {selectedJob.auto_delete_at.toDate ? selectedJob.auto_delete_at.toDate().toLocaleDateString() : new Date(selectedJob.auto_delete_at).toLocaleDateString()}
</span>
)}
</div>

<hr className="my-4 border-gray-200" />

{/* Description */}
<div className="flex-1 overflow-y-auto">
<div className="text-gray-800 text-base sm:text-lg leading-relaxed prose prose-gray max-w-none" style={{minHeight: 80}}>
<div 
className="rich-text-content"
dangerouslySetInnerHTML={{ __html: selectedJob.description }} 
/>
</div>
</div>

{/* Action Buttons */}
<div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
{selectedJob.application_form_link && (
<Button
className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
onClick={() => window.open(selectedJob.application_form_link, '_blank')}
>
<svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
</svg>
Apply Now
</Button>
)}
<Button
variant="outline"
className="w-full sm:w-auto border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all duration-200"
onClick={() => { setExpandedJobId(null); setSelectedJob(null); }}
>
Close
</Button>
</div>
</div>
</div>
</DialogContent>
</Dialog>
)}
    </div>
  );
}

// Helper function for department icon
function departmentIcon(dept: string) {
  if (dept === "Software Development") return <Code className="h-4 w-4 text-gray-500" />;
  if (dept === "AI/ML") return <Cpu className="h-4 w-4 text-gray-500" />;
  if (dept === "HR") return <Users className="h-4 w-4 text-gray-500" />;
  if (dept === "Founder's Office") return <User className="h-4 w-4 text-gray-500" />;
  if (dept === "Social and Outreach") return <Users className="h-4 w-4 text-gray-500" />;
  return null;
}