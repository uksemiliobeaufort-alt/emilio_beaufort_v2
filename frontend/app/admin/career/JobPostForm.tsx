import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import TipTapEditor, { TipTapEditorHandle } from "@/app/admin/components/TipTapEditor";
import { Code, Cpu, User, Users } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

export default function JobPostForm({ job, onSubmit, isSubmitting, isEdit }: { job?: any, onSubmit: (data: any) => void, isSubmitting?: boolean, isEdit?: boolean }) {
  const [title, setTitle] = useState(job?.title || "");
  const [department, setDepartment] = useState(job?.department || "");
  const [type, setType] = useState(job?.type || "");
  const [location, setLocation] = useState(job?.location || "");
  const [salary, setSalary] = useState(job?.salary || "");
  const [description, setDescription] = useState(job?.description || "");
  const [section, setSection] = useState(1); // 1: fields, 2: editor
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
    } else {
      setTitle("");
      setDepartment("");
      setType("");
      setLocation("");
      setSalary("");
      setDescription("");
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let html = description;
    // If editorRef is set, get images and HTML
    if (editorRef.current) {
      html = editorRef.current.getHTML();
      const images = editorRef.current.getImages();
      // Map of localUrl to publicUrl
      let htmlWithUrls = html;
      for (const file of images) {
        // Find the local object URL in the HTML
        const matches = Array.from(html.matchAll(/src=["'](blob:[^"']+)["']/g)) as RegExpMatchArray[];
        const localMatch = matches.find(match => match && match[1] && match[1].includes(file.name));
        // Upload to Supabase
        const filePath = `job-images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('the-house')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) continue;
        const { data: { publicUrl } } = supabase.storage
          .from('the-house')
          .getPublicUrl(filePath);
        // Replace localUrl with publicUrl in HTML
        if (localMatch && localMatch[1]) {
          htmlWithUrls = htmlWithUrls.replace(new RegExp(localMatch[1], 'g'), publicUrl);
        }
      }
      html = htmlWithUrls;
    }
    onSubmit({ title, department, type, location, salary, description: html });
  };

  function departmentIcon(dept: string) {
    if (dept === "Software Development") return <Code className="h-4 w-4 text-gray-500" />;
    if (dept === "AI/ML") return <Cpu className="h-4 w-4 text-gray-500" />;
    if (dept === "HR") return <Users className="h-4 w-4 text-gray-500" />;
    if (dept === "Founder's Office") return <User className="h-4 w-4 text-gray-500" />;
    if (dept === "Social and Outreach") return <Users className="h-4 w-4 text-gray-500" />;
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full lg:w-[40vw] mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8 mt-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          {isEdit ? "Edit Job" : "Post a New Job"}
        </DialogTitle>
      </DialogHeader>
      {/* Desktop: two-column layout */}
      <div className="hidden md:grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Job Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="rounded-xl bg-gray-50 focus:bg-white" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Department</label>
            <BootstrapDropdown
              trigger={<span className="flex items-center gap-2">{departmentIcon(department)}{department || "Select department"}</span>}
              items={[
                { label: "Software Development", onClick: () => setDepartment("Software Development") },
                { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                { label: "HR", onClick: () => setDepartment("HR") },
                { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
              ]}
              className="w-full max-w-xs rounded-xl bg-white border-gray-200"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Type</label>
            <div className="flex gap-2 mt-1">
              <Button type="button" variant={type === "Internship" ? "default" : "outline"} className="rounded-full px-6 py-2" onClick={() => setType("Internship")}>Internship</Button>
              <Button type="button" variant={type === "Full-time" ? "default" : "outline"} className="rounded-full px-6 py-2" onClick={() => setType("Full-time")}>Full-time</Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-semibold mb-1">Location</label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, Bangalore" className="rounded-xl bg-gray-50 focus:bg-white" required />
            </div>
            <div className="w-1/2">
              <label className="block font-semibold mb-1">Salary</label>
              <Input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 20 LPA, Performance" className="rounded-xl bg-gray-50 focus:bg-white" />
            </div>
          </div>
        </div>
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex-1 flex flex-col">
            <label className="block font-semibold mb-1">Job Description</label>
            <TipTapEditor ref={editorRef} content={description} onChange={setDescription} placeholder="Write job details..." />
          </div>
        </div>
      </div>
      {/* Sticky footer for desktop button */}
      <div className="hidden md:block sticky bottom-0 left-0 w-full bg-white pt-4 z-10">
        <Button
          type="submit"
          className="w-full bg-black text-white text-lg py-3 rounded-xl font-bold shadow hover:bg-gray-900 hover:scale-[1.02] transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEdit ? "Updating..." : "Posting...") : (isEdit ? "Update Job" : "Post Job")}
        </Button>
      </div>
      {/* Mobile: sectioned layout */}
      <div className="md:hidden">
        {section === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Job Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="rounded-xl bg-gray-50 focus:bg-white" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <BootstrapDropdown
                trigger={<span className="flex items-center gap-2">{departmentIcon(department)}{department || "Select department"}</span>}
                items={[
                  { label: "Software Development", onClick: () => setDepartment("Software Development") },
                  { label: "AI/ML", onClick: () => setDepartment("AI/ML") },
                  { label: "HR", onClick: () => setDepartment("HR") },
                  { label: "Founder's Office", onClick: () => setDepartment("Founder's Office") },
                  { label: "Social and Outreach", onClick: () => setDepartment("Social and Outreach") },
                ]}
                className="w-full max-w-xs rounded-xl bg-white border-gray-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Type</label>
              <div className="flex gap-2 mt-1">
                <Button type="button" variant={type === "Internship" ? "default" : "outline"} className="rounded-full px-6 py-2" onClick={() => setType("Internship")}>Internship</Button>
                <Button type="button" variant={type === "Full-time" ? "default" : "outline"} className="rounded-full px-6 py-2" onClick={() => setType("Full-time")}>Full-time</Button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-semibold mb-1">Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, Bangalore" className="rounded-xl bg-gray-50 focus:bg-white" required />
              </div>
              <div className="w-1/2">
                <label className="block font-semibold mb-1">Salary</label>
                <Input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 20 LPA, Performance" className="rounded-xl bg-gray-50 focus:bg-white" />
              </div>
            </div>
            <div className="pt-4">
              <Button type="button" className="w-full bg-black text-white text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all" onClick={() => setSection(2)}>
                Next
              </Button>
            </div>
          </div>
        )}
        {section === 2 && (
          <div className="space-y-4">
            <div className="flex-1 flex flex-col">
              <label className="block font-semibold mb-1">Job Description</label>
              <TipTapEditor ref={editorRef} content={description} onChange={setDescription} placeholder="Write job details..." />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="w-1/2 rounded-xl" onClick={() => setSection(1)}>
                Back
              </Button>
              <Button type="submit" className="w-1/2 bg-black text-white text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
} 