"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  id: number;
  title: string;
  slug: string;
  location: string;
  type: string;
  salary: string;
  department?: string;
  description: string;
  created_at: string;
}

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

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
    const { data, error } = await supabase
      .from("job_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load jobs");
    } else {
      setJobs(data || []);
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
      toast.error("Title and description are required");
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
        const { error } = await supabase
          .from("job_posts")
          .update(jobData)
          .eq("id", selectedJob.id);
        if (error) throw error;
        toast.success("Job updated");
      } else {
        const { error } = await supabase.from("job_posts").insert([jobData]);
        if (error) throw error;
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

  const handleDelete = async (jobId: number) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from("job_posts").delete().eq("id", jobId);
      if (error) throw error;
      toast.success("Job deleted");
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
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
                  const { error } = await supabase
                    .from("job_posts")
                    .update(jobData)
                    .eq("id", selectedJob.id);
                  if (error) throw error;
                  toast.success("Job updated");
                } else {
                  const { error } = await supabase.from("job_posts").insert([jobData]);
                  if (error) throw error;
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
              <div className="text-sm text-gray-500 mb-1 flex flex-wrap gap-2">
                {job.location && <span>{job.location}</span>}
                {job.type && <span>• {job.type}</span>}
                {job.salary && <span>• Salary: {job.salary}</span>}
              </div>
              {/* Description preview and expand */}
              <div className="text-gray-700 text-sm mb-2">
                <span
                  className={
                    expandedJobId === job.id ? "" : "line-clamp-2"
                  }
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
                {job.description && job.description.length > 120 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 text-blue-600 hover:underline"
                    onClick={() =>
                      setExpandedJobId(
                        expandedJobId === job.id ? null : job.id
                      )
                    }
                  >
                    {expandedJobId === job.id ? "Show Less" : "View Details"}
                  </Button>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
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