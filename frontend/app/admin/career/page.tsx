"use client";

import { useEffect, useState } from "react";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, UploadCloud } from "lucide-react";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="relative border rounded-2xl p-6 shadow-md bg-white group transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Action buttons top right */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(job)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(job.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* Job Icon and Title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <UploadCloud className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">{job.title}</h3>
              </div>
              {/* Department display */}
              {job.department && (
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                  {departmentIcon(job.department)}
                  <span>{job.department}</span>
                </div>
              )}
              <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-2">
                {job.location && <span>{job.location}</span>}
                {job.type && <span>• {job.type}</span>}
                {job.salary && <span>• Salary: {job.salary}</span>}
                {job.application_form_link && <span>• External Form</span>}
              </div>
              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedJob(job);
                    setExpandedJobId(job.id); // for dialog open
                  }}
                >
                  View Details
                </Button>
                <div className="flex gap-2">
                  {job.auto_delete_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
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
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => window.open(job.application_form_link, '_blank')}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                <span>
                  {job.created_at
                    ? (typeof job.created_at === 'string'
                        ? new Date(job.created_at).toLocaleDateString()
                        : (job.created_at && typeof job.created_at === 'object' && 'toDate' in job.created_at
                            ? job.created_at.toDate().toLocaleDateString()
                            : ''))
                    : ''}
                </span>
                {job.auto_delete_at && (
                  <span className="text-orange-600">
                    Auto-delete: {job.auto_delete_at.toDate ? job.auto_delete_at.toDate().toLocaleDateString() : new Date(job.auto_delete_at).toLocaleDateString()}
                  </span>
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