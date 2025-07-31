"use client";

import { useEffect, useState } from "react";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, UploadCloud, Share2, Copy, Twitter, Linkedin, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import TipTapEditor from "@/app/admin/components/TipTapEditor";
import { Info, PlusCircle } from "lucide-react";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import { Briefcase, Code, Cpu, Users, User } from "lucide-react";
import JobPostForm from "./JobPostForm";

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
        await addDoc(collection(firestore, 'job_posts'), { ...jobData, created_at: Timestamp.now() });
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
      {/* Job Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="w-full max-w-full lg:max-w-[60vw] bg-white rounded-2xl shadow-2xl p-0 px-2 md:px-8 animate-fade-in overflow-hidden">
          <JobPostForm
            job={selectedJob}
            onSubmit={async (data) => {
              setIsProcessing(true);
              const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              const jobData = { ...data, slug };
              try {
                if (selectedJob) {
                  await updateDoc(doc(firestore, 'job_posts', selectedJob.id), jobData);
                  toast.success("Job updated");
                } else {
                  await addDoc(collection(firestore, 'job_posts'), jobData);
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
          />
        </DialogContent>
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
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleShare(job)} 
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  onClick={() => handleDelete(job.id)} 
                  className="h-8 w-8 sm:h-9 sm:w-9 shadow-sm"
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
                  className="w-full text-xs sm:text-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  View Details
                </Button>
                
                <div className="flex gap-2">
                  {job.auto_delete_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50 text-xs sm:text-sm"
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
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm shadow-sm"
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
          <DialogContent className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-0 overflow-hidden border border-gray-200 animate-fade-in">
            <div className="flex flex-col h-full min-h-[350px]">
              {/* Custom Header Grid */}
              <div className="flex items-start justify-between px-6 pt-8 pb-2 w-full">
                <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-premium mb-2 break-words max-w-[80%]">{selectedJob.title}</DialogTitle>
                {/* Removed custom close button to avoid duplicate '×' icons */}
              </div>
              <div className="flex flex-wrap gap-2 justify-start mb-2 px-6 w-full max-w-full break-all">
                {selectedJob.department && <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 break-words max-w-full">{departmentIcon(selectedJob.department)}<span className="ml-1">{selectedJob.department}</span></span>}
                {selectedJob.location && <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100 break-words max-w-full">{selectedJob.location}</span>}
                {selectedJob.type && <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 break-words max-w-full">{selectedJob.type}</span>}
                {selectedJob.salary && <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-100 break-words max-w-full">Salary: {selectedJob.salary}</span>}
                {selectedJob.application_form_link && <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100 break-words max-w-full">External Form</span>}
              </div>
              <div className="text-xs text-gray-400 mb-2 px-6">
                {selectedJob.created_at && (typeof selectedJob.created_at === 'string' ? new Date(selectedJob.created_at).toLocaleDateString() : '')}
              </div>
              <hr className="my-2 border-gray-200" />
              {/* Description */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 pt-2 w-full">
                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line break-words break-all max-w-full" style={{minHeight: 80}}>
                  <span dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                </div>
                {/* Apply button for desktop */}
                {selectedJob.application_form_link && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                      className="w-full px-6 py-3 font-semibold rounded-full shadow-lg hover:bg-orange-600 border border-orange-500 text-white bg-orange-500 transition-all"
                      onClick={() => window.open(selectedJob.application_form_link, '_blank')}
                    >
                      Apply Now
                    </button>
                  </div>
                )}
              </div>
              {/* Sticky Close Button for mobile */}
              <div className="px-6 pb-6 pt-2 bg-white flex justify-center sticky bottom-0 z-10 border-t border-gray-100 sm:hidden">
                {selectedJob.application_form_link && (
                                      <button
                      className="px-6 py-3 font-semibold rounded-full shadow hover:bg-orange-100 border border-orange-300 text-orange-700 bg-orange-50 mr-2"
                      onClick={() => window.open(selectedJob.application_form_link, '_blank')}
                    >
                      Apply Now
                    </button>
                )}
                <button
                  className="px-8 py-3 font-semibold rounded-full shadow hover:bg-gray-100 border border-gray-300 text-gray-700 bg-white"
                  onClick={() => { setExpandedJobId(null); setSelectedJob(null); }}
                >
                  Close
                </button>
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