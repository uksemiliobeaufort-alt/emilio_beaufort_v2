import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import TipTapEditor, { TipTapEditorHandle } from "@/app/admin/components/TipTapEditor";
import { Code, Cpu, User, Users, X } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";//DialogHeader,
import { uploadJobPostImagesToFirebase } from '@/lib/firebase';
// import { Timestamp } from 'firebase/firestore';
import { toast } from "sonner";

// Error boundary component for TipTapEditor
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class TipTapEditorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('TipTapEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border rounded-lg overflow-hidden">
          <div className="min-h-[180px] flex items-center justify-center text-red-500 p-4">
            <div className="text-center">
              <p className="mb-2">Editor failed to load</p>
              <Button 
                type="button"
                onClick={() => this.setState({ hasError: false })}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function JobPostForm({ job, onSubmit, isSubmitting, isEdit, onClose }: { job?: any, onSubmit: (data: any) => void, isSubmitting?: boolean, isEdit?: boolean, onClose?: () => void }) {
  const [title, setTitle] = useState(job?.title || "");
  const [department, setDepartment] = useState(job?.department || "");
  const [type, setType] = useState(job?.type || "");
  const [location, setLocation] = useState(job?.location || "");
  const [salary, setSalary] = useState(job?.salary || "");
  const [description, setDescription] = useState(job?.description || "");
  const [applicationFormLink, setApplicationFormLink] = useState(job?.application_form_link || "");
  const [seatsAvailable, setSeatsAvailable] = useState(job?.seats_available || "");
  const [isJobClosed, setIsJobClosed] = useState(job?.is_closed || false);
  const [section, setSection] = useState(1); // 1: fields, 2: editor
  const [useFallbackEditor, setUseFallbackEditor] = useState(false);
  const editorRef = useRef<TipTapEditorHandle>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced onChange handler for TipTap editor
  const handleEditorChange = useCallback((content: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDescription(content);
    }, 300); // 300ms debounce
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Update form fields when job changes
  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDepartment(job.department || "");
      setType(job.type || "");
      setLocation(job.location || "");
      setSalary(job.salary || "");
      setDescription(job.description || "");
      setApplicationFormLink(job.application_form_link || "");
      setSeatsAvailable(job.seats_available || "");
      setIsJobClosed(job.is_closed || false);
    } else {
      setTitle("");
      setDepartment("");
      setType("");
      setLocation("");
      setSalary("");
      setDescription("");
      setApplicationFormLink("");
      setSeatsAvailable("");
      setIsJobClosed(false);
    }
    // Reset section to 1 when job changes
    setSection(1);
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) return toast.error('Job title is required');
    if (!department.trim()) return toast.error('Department is required');
    if (!type.trim()) return toast.error('Job type is required');
    if (!location.trim()) return toast.error('Location is required');
    if (!salary.trim()) return toast.error('Salary is required');
    if (!description.trim()) return toast.error('Job description is required');
    
    let html = description;
    let images: File[] = [];
    if (useFallbackEditor) {
      html = description;
      images = [];
    } else if (editorRef.current) {
      try {
        const editorHtml = editorRef.current.getHTML();
        const editorImages = editorRef.current.getImages();
        if (editorHtml && editorHtml.trim() !== '') html = editorHtml;
        if (editorImages && editorImages.length > 0) images = editorImages;
      } catch (error) {
        console.error('Error accessing editor ref:', error);
        html = description;
        images = [];
      }
    }
    let htmlWithUrls = html;
    if (images.length > 0) {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const firebaseUrls = await uploadJobPostImagesToFirebase(images, slug);
      images.forEach((file, idx) => {
        const matches = Array.from(html.matchAll(/src=["'](blob:[^"']+)["']/g));
        const localMatch = matches.find(match => Array.isArray(match) && typeof match[1] === 'string' && match[1].includes(file.name)) as RegExpMatchArray | undefined;
        if (localMatch && localMatch[1]) {
          htmlWithUrls = htmlWithUrls.replace(new RegExp(localMatch[1], 'g'), firebaseUrls[idx]);
        }
      });
    }
    // Compose jobData to match parent expectations
    const jobData: any = { 
      title, 
      department, 
      type, 
      location, 
      salary, 
      description: htmlWithUrls,
    };
    
    // Only add optional fields if they have values
    if (applicationFormLink.trim()) {
      jobData.application_form_link = applicationFormLink.trim();
    }
    
    if (seatsAvailable.trim()) {
      jobData.seats_available = parseInt(seatsAvailable.trim());
    }
    
    jobData.is_closed = isJobClosed;
    
    // Add created_at timestamp for new jobs (not for edits)
    if (!isEdit) {
      jobData.created_at = new Date();
    }
    
    onSubmit(jobData);
  };

  function departmentIcon(dept: string) {
    if (dept === "Software Development") return <Code className="h-4 w-4 text-gray-500" />;
    if (dept === "AI/ML") return <Cpu className="h-4 w-4 text-gray-500" />;
    if (dept === "HR") return <Users className="h-4 w-4 text-gray-500" />;
    if (dept === "Founder's Office") return <User className="h-4 w-4 text-gray-500" />;
    if (dept === "Social and Outreach") return <Users className="h-4 w-4 text-gray-500" />;
    if (dept === "Sales and Marketing") return <Users className="h-4 w-4 text-gray-500" />;
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-bold text-gray-900">
          {isEdit ? "Edit Job" : "Post a New Job"}
        </DialogTitle>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              <span className="text-red-500 font-bold">⚠️</span> Required fields marked with <span className="text-red-500 font-bold">*</span>
            </div>
            <button
              type="button"
              onClick={() => {
                // Reset form and close dialog
                setTitle("");
                setDepartment("");
                setType("");
                setLocation("");
                setSalary("");
                setDescription("");
                setApplicationFormLink("");
                setSeatsAvailable("");
                setIsJobClosed(false);
                setSection(1);
                // Close the dialog using the onClose prop
                if (onClose) {
                  onClose();
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Left Column - Basic Info */}
          <div className="w-1/2 border-r border-gray-200 p-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {/* Job Title */}
          <div>
                <label className="block font-semibold mb-2 text-sm text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Frontend Developer" 
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                  required 
                />
          </div>
          
              {/* Department & Type */}
              <div className="grid grid-cols-2 gap-3">
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
              <BootstrapDropdown
                    trigger={
                      <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-500">
                        <span className="flex items-center gap-2 text-sm">
                          {departmentIcon(department)}
                          {department || "Select department"}
                        </span>
                      </div>
                    }
                items={[
                  { label: "Software Development", onClick: () => setDepartment("Software Development") },
                  { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                  { label: "HR", onClick: () => setDepartment("HR") },
                  { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                  { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
                  { label: "Sales and Marketing", onClick: () => setDepartment("Sales and Marketing") },
                ]}
                    className="w-full"
              />
            </div>
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
              <BootstrapDropdown
                    trigger={
                      <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-500">
                        <span className="text-sm">{type || "Select type"}</span>
                      </div>
                    }
                items={[
                  { label: "Internship", onClick: () => setType("Internship") },
                  { label: "Full-time", onClick: () => setType("Full-time") },
                ]}
                    className="w-full"
              />
            </div>
          </div>
          
              {/* Location & Salary */}
              <div className="grid grid-cols-2 gap-3">
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="e.g. Remote, Bangalore" 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    required 
                  />
            </div>
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={salary} 
                    onChange={e => setSalary(e.target.value)} 
                    placeholder="e.g. 20 LPA, Performance" 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    required 
                  />
            </div>
          </div>
          
              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-3">
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Seats Available
                  </label>
              <Input 
                type="number" 
                min="1" 
                value={seatsAvailable} 
                onChange={e => setSeatsAvailable(e.target.value)} 
                placeholder="5" 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
              />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
            </div>
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Application Form Link
                  </label>
              <Input 
                value={applicationFormLink} 
                onChange={e => setApplicationFormLink(e.target.value)} 
                placeholder="https://forms.google.com/..." 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
              />
                  <p className="text-xs text-gray-500 mt-1">Optional external form</p>
            </div>
          </div>
          
              {/* Job Status */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isJobClosed"
                checked={isJobClosed}
                onChange={(e) => setIsJobClosed(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isJobClosed" className="text-sm font-medium text-gray-700">
                Close this job opening
              </label>
            {isJobClosed && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    Applications disabled
              </span>
            )}
              </div>
          </div>
        </div>
        
          {/* Right Column - Description */}
          <div className="w-1/2 p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <label className="block font-semibold mb-2 text-sm text-gray-700">
                Job Description <span className="text-red-500">*</span>
              </label>
            {useFallbackEditor ? (
                <div className="h-full">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed job description..."
                    className="w-full h-full min-h-[300px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Using simple text editor. 
                    <button 
                      type="button" 
                      onClick={() => setUseFallbackEditor(false)} 
                      className="text-blue-600 underline ml-1"
                    >
                      Try rich editor
                    </button>
                  </p>
              </div>
            ) : (
                <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                <TipTapEditorErrorBoundary>
                  <TipTapEditor 
                    ref={editorRef} 
                    content={description} 
                      onChange={handleEditorChange} 
                      placeholder="Write detailed job description..."
                  />
                </TipTapEditorErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </div>
      
        {/* Mobile Layout */}
        <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${section === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${section === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
                <span className="text-xs font-medium">Basic Info</span>
              </div>
              <div className="w-6 h-1 bg-gray-200 rounded"></div>
              <div className={`flex items-center space-x-2 ${section === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${section === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-xs font-medium">Description</span>
              </div>
          </div>
        </div>
        
          {/* Mobile Form Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
        {section === 1 && (
              <div className="p-4 space-y-4">
                {/* Job Title */}
            <div>
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Frontend Developer" 
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                    required 
                  />
            </div>
            
                {/* Department & Type */}
                <div className="grid grid-cols-1 gap-3">
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                <BootstrapDropdown
                      trigger={
                        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-500">
                          <span className="flex items-center gap-2 text-sm">
                            {departmentIcon(department)}
                            {department || "Select department"}
                          </span>
                        </div>
                      }
                  items={[
                    { label: "Software Development", onClick: () => setDepartment("Software Development") },
                    { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                    { label: "HR", onClick: () => setDepartment("HR") },
                    { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                    { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
                    { label: "Sales and Marketing", onClick: () => setDepartment("Sales and Marketing") },
                  ]}
                      className="w-full"
                />
              </div>
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Type <span className="text-red-500">*</span>
                    </label>
                <BootstrapDropdown
                      trigger={
                        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:border-blue-500">
                          <span className="text-sm">{type || "Select type"}</span>
                        </div>
                      }
                  items={[
                    { label: "Internship", onClick: () => setType("Internship") },
                    { label: "Full-time", onClick: () => setType("Full-time") },
                  ]}
                      className="w-full"
                />
              </div>
            </div>
            
                {/* Location & Salary */}
                <div className="grid grid-cols-1 gap-3">
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      placeholder="e.g. Remote, Bangalore" 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      required 
                    />
              </div>
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={salary} 
                      onChange={e => setSalary(e.target.value)} 
                      placeholder="e.g. 20 LPA, Performance" 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      required 
                    />
              </div>
            </div>
            
                {/* Optional Fields */}
                <div className="grid grid-cols-1 gap-3">
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Seats Available
                    </label>
                <Input 
                  type="number" 
                  min="1" 
                  value={seatsAvailable} 
                  onChange={e => setSeatsAvailable(e.target.value)} 
                  placeholder="5" 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
              </div>
              <div>
                    <label className="block font-semibold mb-2 text-sm text-gray-700">
                      Application Form Link
                    </label>
                <Input 
                  value={applicationFormLink} 
                  onChange={e => setApplicationFormLink(e.target.value)} 
                  placeholder="https://forms.google.com/..." 
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                />
                    <p className="text-xs text-gray-500 mt-1">Optional external form</p>
              </div>
            </div>
            
                {/* Job Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isJobClosedMobile"
                  checked={isJobClosed}
                  onChange={(e) => setIsJobClosed(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isJobClosedMobile" className="text-sm font-medium text-gray-700">
                  Close this job opening
                </label>
              {isJobClosed && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Applications disabled
                </span>
              )}
            </div>
              </div>
            )}
            
            {section === 2 && (
              <div className="p-4 h-full flex flex-col">
                <div className="flex-1">
                  <label className="block font-semibold mb-2 text-sm text-gray-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  {useFallbackEditor ? (
                    <div className="h-full">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write detailed job description..."
                        className="w-full h-full min-h-[250px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Using simple text editor. 
                        <button 
                          type="button" 
                          onClick={() => setUseFallbackEditor(false)} 
                          className="text-blue-600 underline ml-1"
                        >
                          Try rich editor
                        </button>
              </p>
            </div>
                  ) : (
                    <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                      <TipTapEditorErrorBoundary>
                        <TipTapEditor 
                          ref={editorRef} 
                          content={description} 
                          onChange={handleEditorChange} 
                          placeholder="Write detailed job description..."
                        />
                      </TipTapEditorErrorBoundary>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
      
      {/* Footer with Submit Button - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Navigation */}
          <div className="lg:hidden flex gap-2">
            {section === 2 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSection(1)}
                className="px-3 py-1 text-xs"
              >
                Back
              </Button>
            )}
            {section === 1 && (
              <Button 
                type="button" 
                onClick={() => {
                  // Validate required fields before allowing next
                  if (!title.trim()) {
                    toast.error('Job title is required');
                    return;
                  }
                  if (!department.trim()) {
                    toast.error('Department is required');
                    return;
                  }
                  if (!type.trim()) {
                    toast.error('Job type is required');
                    return;
                  }
                  if (!location.trim()) {
                    toast.error('Location is required');
                    return;
                  }
                  if (!salary.trim()) {
                    toast.error('Salary is required');
                    return;
                  }
                  setSection(2);
                }}
                disabled={!title.trim() || !department.trim() || !type.trim() || !location.trim() || !salary.trim()}
                className="px-3 py-1 text-xs"
              >
                Next
              </Button>
            )}
          </div>
          
          {/* Submit Button - Hidden on mobile first page, shown on second page and desktop */}
          <div className={`flex-1 lg:flex-none lg:ml-auto ${section === 1 ? 'lg:block hidden' : 'block'}`}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
              onClick={handleSubmit}
            >
                {isSubmitting ? (isEdit ? "Updating..." : "Posting...") : (isEdit ? "Update Job" : "Post Job")}
              </Button>
            </div>
          </div>
      </div>
    </div>
  );
} 