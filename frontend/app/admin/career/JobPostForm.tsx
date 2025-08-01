import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import TipTapEditor, { TipTapEditorHandle } from "@/app/admin/components/TipTapEditor";
import { Code, Cpu, User, Users } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadJobPostImagesToFirebase } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
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

export default function JobPostForm({ job, onSubmit, isSubmitting, isEdit }: { job?: any, onSubmit: (data: any) => void, isSubmitting?: boolean, isEdit?: boolean }) {
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
    
    // Prevent submission if form is not ready
    if (isSubmitting) {
      return;
    }
    
    // Validate required fields
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
    
    if (!description.trim()) {
      toast.error('Job description is required');
      return;
    }
    
    let html = description;
    let images: File[] = [];
    
    // If using fallback editor, use the description directly
    if (useFallbackEditor) {
      html = description;
      images = [];
    } else if (editorRef.current) {
      try {
        const editorHtml = editorRef.current.getHTML();
        const editorImages = editorRef.current.getImages();
        // Only use editor content if it's not empty
        if (editorHtml && editorHtml.trim() !== '') {
          html = editorHtml;
        }
        if (editorImages && editorImages.length > 0) {
          images = editorImages;
        }
      } catch (error) {
        console.error('Error accessing editor ref:', error);
        // Fallback to description if ref fails
        html = description;
        images = [];
      }
    }
    // Upload images to Firebase and replace local URLs
    let htmlWithUrls = html;
    if (images.length > 0) {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const firebaseUrls = await uploadJobPostImagesToFirebase(images, slug);
      images.forEach((file, idx) => {
        // Find the local object URL in the HTML
        const matches = Array.from(html.matchAll(/src=["'](blob:[^"']+)["']/g));
        const localMatch = matches.find(match => Array.isArray(match) && typeof match[1] === 'string' && match[1].includes(file.name)) as RegExpMatchArray | undefined;
        if (localMatch && localMatch[1]) {
          htmlWithUrls = htmlWithUrls.replace(new RegExp(localMatch[1], 'g'), firebaseUrls[idx]);
        }
      });
    }
    // Add created_at only for new jobs
    const jobData: any = { 
      title, 
      department, 
      type, 
      location, 
      salary, 
      description: htmlWithUrls,
    };
    
    // Only add application_form_link if it has a value
    const trimmedApplicationFormLink = applicationFormLink.trim();
    if (trimmedApplicationFormLink) {
      jobData.application_form_link = trimmedApplicationFormLink;
    }
    
    // Add seats_available if it has a value
    const trimmedSeatsAvailable = seatsAvailable.trim();
    if (trimmedSeatsAvailable) {
      jobData.seats_available = parseInt(trimmedSeatsAvailable);
    }
    
    // Add is_closed field
    jobData.is_closed = isJobClosed;
    
    if (!isEdit) {
      jobData.created_at = Timestamp.now();
      // Set auto-delete timestamp to 7 days from now
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      jobData.auto_delete_at = Timestamp.fromDate(sevenDaysFromNow);
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
    <form onSubmit={handleSubmit} className="w-full lg:w-[50vw] mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8 mt-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          {isEdit ? "Edit Job" : "Post a New Job"}
        </DialogTitle>
      </DialogHeader>
             {/* Desktop: two-column layout */}
       <div className="hidden lg:grid grid-cols-2 gap-6">
         <div className="space-y-4">
           <div>
             <label className="block font-semibold mb-1">Job Title <span className="text-red-500">*</span></label>
             <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="rounded-xl bg-gray-50 focus:bg-white" required />
           </div>
           <div className="flex gap-4">
             <div className="flex-1">
               <label className="block font-semibold mb-1">Department <span className="text-red-500">*</span></label>
               <BootstrapDropdown
                 trigger={<span className="flex items-center gap-2">{departmentIcon(department)}{department || "Select department"}</span>}
                 items={[
                   { label: "Software Development", onClick: () => setDepartment("Software Development") },
                   { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                   { label: "HR", onClick: () => setDepartment("HR") },
                   { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                   { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
                   { label: "Sales and Marketing", onClick: () => setDepartment("Sales and Marketing") },
                 ]}
                 className="w-full rounded-xl bg-white border-gray-200"
               />
             </div>
             <div className="flex-1">
               <label className="block font-semibold mb-1">Type <span className="text-red-500">*</span></label>
               <BootstrapDropdown
                 trigger={<span className="flex items-center gap-2">{type || "Select type"}</span>}
                 items={[
                   { label: "Internship", onClick: () => setType("Internship") },
                   { label: "Full-time", onClick: () => setType("Full-time") },
                 ]}
                 className="w-full rounded-xl bg-white border-gray-200"
               />
             </div>
           </div>
           <div className="flex gap-4">
             <div className="w-1/2">
               <label className="block font-semibold mb-1">Location <span className="text-red-500">*</span></label>
               <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, Bangalore" className="rounded-xl bg-gray-50 focus:bg-white" required />
             </div>
             <div className="w-1/2">
               <label className="block font-semibold mb-1">Salary <span className="text-red-500">*</span></label>
               <Input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 20 LPA, Performance" className="rounded-xl bg-gray-50 focus:bg-white" required />
             </div>
           </div>
           <div className="flex gap-4">
             <div className="w-1/2">
               <label className="block font-semibold mb-1">Seats Available</label>
               <Input 
                 type="number" 
                 min="1" 
                 value={seatsAvailable} 
                 onChange={e => setSeatsAvailable(e.target.value)} 
                 placeholder="5" 
                 className="rounded-xl bg-gray-50 focus:bg-white" 
               />
               <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited applications.</p>
             </div>
             <div className="w-1/2">
               <label className="block font-semibold mb-1">Application Form Link</label>
               <Input 
                 value={applicationFormLink} 
                 onChange={e => setApplicationFormLink(e.target.value)} 
                 placeholder="https://forms.google.com/..." 
                 className="rounded-xl bg-gray-50 focus:bg-white" 
               />
               <p className="text-xs text-gray-500 mt-1">Optional external form link.</p>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <input
                 type="checkbox"
                 id="isJobClosed"
                 checked={isJobClosed}
                 onChange={(e) => setIsJobClosed(e.target.checked)}
                 className="rounded border-gray-300 text-black focus:ring-black"
               />
               <label htmlFor="isJobClosed" className="text-sm font-medium text-gray-700">
                 Close this job opening
               </label>
             </div>
             {isJobClosed && (
               <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                 Applications will be disabled
               </span>
             )}
           </div>
         </div>
         <div className="space-y-4 flex flex-col h-full">
           <div className="flex-1 flex flex-col">
             <label className="block font-semibold mb-1">Job Description <span className="text-red-500">*</span></label>
             {useFallbackEditor ? (
               <div>
                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Write job details..."
                   className="min-h-[180px] max-h-[300px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                 />
                 <p className="text-xs text-gray-500 mt-1">Using simple text editor. <button type="button" onClick={() => setUseFallbackEditor(false)} className="text-blue-600 underline">Try rich editor again</button></p>
               </div>
             ) : (
               <TipTapEditorErrorBoundary>
                 <TipTapEditor 
                   ref={editorRef} 
                   content={description} 
                   onChange={setDescription} 
                   placeholder="Write job details..."
                 />
               </TipTapEditorErrorBoundary>
             )}
           </div>
         </div>
               </div>
                 {/* Required fields note for desktop */}
         <div className="hidden lg:block">
           <p className="text-xs text-gray-600 text-left mt-4 mb-2">
             <span className="text-red-500 font-bold">⚠️</span> Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are compulsory to be filled
           </p>
         </div>
        {/* Sticky footer for desktop button */}
        <div className="hidden lg:block sticky bottom-0 left-0 w-full bg-white pt-4 z-10">
          <Button
            type="submit"
            className="w-full bg-black text-white text-lg py-3 rounded-xl font-bold shadow hover:bg-gray-900 hover:scale-[1.02] transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? "Updating..." : "Posting...") : (isEdit ? "Update Job" : "Post Job")}
          </Button>
        </div>
       {/* Tablet and Mobile: two-page layout */}
       <div className="lg:hidden">
         {/* Progress indicator */}
         <div className="flex items-center justify-center mb-6">
           <div className="flex items-center space-x-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${section === 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
               1
             </div>
             <div className="w-8 h-1 bg-gray-200 rounded"></div>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${section === 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
               2
             </div>
           </div>
         </div>
         
         {section === 1 && (
           <div className="space-y-4">
             <div>
               <label className="block font-semibold mb-1">Job Title <span className="text-red-500">*</span></label>
               <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="rounded-xl bg-gray-50 focus:bg-white" required />
             </div>
             <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block font-semibold mb-1">Department <span className="text-red-500">*</span></label>
                 <BootstrapDropdown
                   trigger={<span className="flex items-center gap-2">{departmentIcon(department)}{department || "Select department"}</span>}
                   items={[
                     { label: "Software Development", onClick: () => setDepartment("Software Development") },
                     { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                     { label: "HR", onClick: () => setDepartment("HR") },
                     { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                     { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
                     { label: "Sales and Marketing", onClick: () => setDepartment("Sales and Marketing") },
                   ]}
                   className="w-full rounded-xl bg-white border-gray-200"
                 />
               </div>
               <div className="flex-1">
                 <label className="block font-semibold mb-1">Type <span className="text-red-500">*</span></label>
                 <BootstrapDropdown
                   trigger={<span className="flex items-center gap-2">{type || "Select type"}</span>}
                   items={[
                     { label: "Internship", onClick: () => setType("Internship") },
                     { label: "Full-time", onClick: () => setType("Full-time") },
                   ]}
                   className="w-full rounded-xl bg-white border-gray-200"
                 />
               </div>
             </div>
             <div className="flex gap-4">
               <div className="w-1/2">
                 <label className="block font-semibold mb-1">Location <span className="text-red-500">*</span></label>
                 <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, Bangalore" className="rounded-xl bg-gray-50 focus:bg-white" required />
               </div>
               <div className="w-1/2">
                 <label className="block font-semibold mb-1">Salary <span className="text-red-500">*</span></label>
                 <Input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 20 LPA, Performance" className="rounded-xl bg-gray-50 focus:bg-white" required />
               </div>
             </div>
             <div className="flex gap-4">
               <div className="w-1/2">
                 <label className="block font-semibold mb-1">Seats Available</label>
                 <Input 
                   type="number" 
                   min="1" 
                   value={seatsAvailable} 
                   onChange={e => setSeatsAvailable(e.target.value)} 
                   placeholder="5" 
                   className="rounded-xl bg-gray-50 focus:bg-white" 
                 />
                 <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited applications.</p>
               </div>
               <div className="w-1/2">
                 <label className="block font-semibold mb-1">Application Form Link</label>
                 <Input 
                   value={applicationFormLink} 
                   onChange={e => setApplicationFormLink(e.target.value)} 
                   placeholder="https://forms.google.com/..." 
                   className="rounded-xl bg-gray-50 focus:bg-white" 
                 />
                 <p className="text-xs text-gray-500 mt-1">Optional external form link.</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   id="isJobClosedMobile"
                   checked={isJobClosed}
                   onChange={(e) => setIsJobClosed(e.target.checked)}
                   className="rounded border-gray-300 text-black focus:ring-black"
                 />
                 <label htmlFor="isJobClosedMobile" className="text-sm font-medium text-gray-700">
                   Close this job opening
                 </label>
               </div>
               {isJobClosed && (
                 <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                   Applications will be disabled
                 </span>
               )}
             </div>
                                                       {/* Required fields note for mobile page 1 */}
               <div className="mt-4 mb-2">
                 <p className="text-xs text-gray-600 text-left">
                   <span className="text-red-500 font-bold">⚠️</span> Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are compulsory to be filled
                 </p>
               </div>
              <div className="pt-4">
                <Button 
                  type="button" 
                  className="w-full bg-black text-white text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
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
                >
                  Next
                </Button>
              </div>
           </div>
         )}
                 {section === 2 && (
           <div className="space-y-4">
             <div className="flex-1 flex flex-col">
               <label className="block font-semibold mb-1">Job Description <span className="text-red-500">*</span></label>
               {useFallbackEditor ? (
                 <div>
                   <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     placeholder="Write job details..."
                     className="min-h-[300px] max-h-[400px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                   />
                   <p className="text-xs text-gray-500 mt-1">Using simple text editor. <button type="button" onClick={() => setUseFallbackEditor(false)} className="text-blue-600 underline">Try rich editor again</button></p>
                 </div>
               ) : (
                 <TipTapEditorErrorBoundary>
                   <TipTapEditor 
                     ref={editorRef} 
                     content={description} 
                     onChange={setDescription} 
                     placeholder="Write job details..."
                   />
                 </TipTapEditorErrorBoundary>
               )}
                           </div>
                             {/* Required fields note for mobile page 2 */}
               <div className="mt-4 mb-2">
                 <p className="text-xs text-gray-600 text-left">
                   <span className="text-red-500 font-bold">⚠️</span> Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are compulsory to be filled
                 </p>
               </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="w-1/2 rounded-xl" onClick={() => setSection(1)}>
                  Back
                </Button>
                <Button type="submit" className="w-1/2 bg-black text-white text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all" disabled={isSubmitting}>
                  {isSubmitting ? (isEdit ? "Updating..." : "Posting...") : (isEdit ? "Update Job" : "Post Job")}
                </Button>
              </div>
           </div>
         )}
      </div>
    </form>
  );
} 