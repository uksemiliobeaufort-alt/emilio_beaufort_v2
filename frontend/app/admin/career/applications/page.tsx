"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { saveAs } from "file-saver";
import { Input } from "@/components/ui/input";
import { Inbox, CheckCircle, Search, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: number;
  full_name: string;
  email: string;
  resume_url?: string;
  created_at?: string;
  portfolio?: string;
  cover_letter?: string;
  job_title?: string;
}

// Fix for linter: declare 'file-saver' module if types are missing
// @ts-ignore
// eslint-disable-next-line
declare module 'file-saver';

export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeLinks, setResumeLinks] = useState<Record<number, string>>({});
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'received' | 'accepted' | 'rejected'>("received");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      let table = "career_form";
      if (filter === 'accepted') table = "accepted_candidates";
      if (filter === 'rejected') table = "rejected_candidates";
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setApplications(data || []);
      setLoading(false);
    };
    fetchApplications();
  }, [filter]);

  // Generate signed URLs for resumes after applications are loaded
  useEffect(() => {
    const getSignedUrls = async () => {
      const links: Record<number, string> = {};
      for (const app of applications) {
        if (app.resume_url) {
          // Extract just the file path (after 'career-form/')
          let filePath = app.resume_url;
          if (filePath.startsWith('career-form/')) {
            filePath = filePath.replace('career-form/', '');
          } else if (filePath.includes('/career-form/')) {
            filePath = filePath.split('/career-form/')[1];
          }
          const { data, error } = await supabase.storage
            .from('career-form')
            .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
          if (data?.signedUrl) {
            links[app.id] = data.signedUrl;
          }
        }
      }
      setResumeLinks(links);
    };
    if (applications.length > 0) {
      getSignedUrls();
    }
  }, [applications]);

  // Download handler for signed URLs
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (err) {
      alert("Failed to download file.");
    }
  };

  // Filtered applications based on search
  const filteredApplications = applications.filter(app => {
    const searchLower = search.toLowerCase();
    return (
      app.full_name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.job_title?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-8">Job Applications</h1>
      {/* Modern Search & Filter Controls */}
      <div className="flex flex-col items-center w-full">
        {/* Search Bar with Icon */}
        <div className="relative w-full max-w-md mb-6 px-2 sm:px-0">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <Input
            type="text"
            placeholder="Search applications by name, email, or job title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 shadow-sm focus:border-premium focus:ring-1 focus:ring-premium text-base w-full"
          />
        </div>
        {/* Capsule Filter Buttons (responsive, scrollable on mobile) */}
        <div className="flex gap-3 mb-10 w-full overflow-x-auto px-2 sm:justify-center sm:w-auto">
          <button
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border text-sm sm:text-base font-medium transition-colors min-w-max
              ${filter === 'received'
                ? 'bg-gray-900 text-white border-gray-900 shadow ring-2 ring-gray-300'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-200 hover:text-gray-900'}
            `}
            onClick={() => setFilter('received')}
          >
            <Inbox className="w-4 h-4" />
            <span className="hidden xs:inline">Received Applications</span>
            <span className="inline xs:hidden">Received</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border text-sm sm:text-base font-medium transition-colors min-w-max
              ${filter === 'accepted'
                ? 'bg-gray-900 text-white border-gray-900 shadow ring-2 ring-gray-300'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-200 hover:text-gray-900'}
            `}
            onClick={() => setFilter('accepted')}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Accepted Applications</span>
            <span className="inline xs:hidden">Accepted</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border text-sm sm:text-base font-medium transition-colors min-w-max
              ${filter === 'rejected'
                ? 'bg-gray-900 text-white border-gray-900 shadow ring-2 ring-gray-300'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-200 hover:text-gray-900'}
            `}
            onClick={() => setFilter('rejected')}
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Rejected Applications</span>
            <span className="inline xs:hidden">Rejected</span>
          </button>
        </div>
      </div>
      {/* Main content below controls */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-gray-500">No applications found.</div>
        ) : (
          <>
            <div className="space-y-8">
              {filteredApplications.map(app => (
                <div key={app.id} className="bg-white/90 border border-gray-200 rounded-2xl shadow p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div>
                      <div className="text-2xl font-extrabold text-gray-900">{app.full_name}</div>
                      <div className="text-lg text-gold font-semibold tracking-wide">{app.job_title || "—"}</div>
                    </div>
                    <div className="text-gray-500 text-sm">Submitted: {app.created_at ? new Date(app.created_at).toLocaleString() : "—"}</div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setDialogOpen(true); }}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-xl w-full bg-white/90 border border-gray-200 rounded-2xl p-0 overflow-hidden">
                {selectedApp && (
                  <>
                    <DialogHeader className="px-8 pt-8 pb-2">
                      <DialogTitle className="text-2xl font-extrabold mb-1 text-gray-900">{selectedApp.full_name}</DialogTitle>
                      <DialogDescription asChild>
                        <div className="mb-2 text-lg text-gold font-semibold tracking-wide">{selectedApp.job_title || "—"}</div>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="px-8 pb-8 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="font-semibold text-gray-700">Email:</div>
                        <div><a href={`mailto:${selectedApp.email}`} className="text-blue-700 underline break-all">{selectedApp.email}</a></div>
                        <div className="font-semibold text-gray-700">Portfolio:</div>
                        <div>{selectedApp.portfolio && selectedApp.portfolio !== "EMPTY" ? (<a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 transition">View</a>) : <span className="text-gray-400">—</span>}</div>
                        <div className="font-semibold text-gray-700">Resume:</div>
                        <div>
                          {selectedApp.resume_url && resumeLinks[selectedApp.id] ? (
                            <div className="flex gap-3">
                              <a
                                href={resumeLinks[selectedApp.id]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800 font-semibold transition"
                              >
                                View
                              </a>
                              <button
                                type="button"
                                className="text-blue-600 underline hover:text-blue-800 font-semibold transition"
                                onClick={() => {
                                  // Try to extract filename from URL or fallback
                                  let filename = "resume.pdf";
                                  const match = (selectedApp.resume_url || '').match(/([^/]+)$/);
                                  if (match) filename = match[1];
                                  handleDownload(resumeLinks[selectedApp.id], filename);
                                }}
                              >
                                Download
                              </button>
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </div>
                        <div className="font-semibold text-gray-700">Cover Letter:</div>
                        <div className="whitespace-pre-line break-words max-w-full">{selectedApp.cover_letter && selectedApp.cover_letter !== "EMPTY" ? selectedApp.cover_letter : <span className="text-gray-400">—</span>}</div>
                        <div className="font-semibold text-gray-700">Submitted:</div>
                        <div className="text-gray-500">{selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : "—"}</div>
                      </div>
                      <div className="flex justify-end mt-8">
                        {filter === 'received' && (
                          <>
                            <Button
                              variant="destructive"
                              className="mr-2"
                              onClick={async () => {
                                if (!selectedApp) return;
                                const sourceTable = filter === 'received' ? 'career_form' : filter === 'accepted' ? 'accepted_candidates' : '';
                                // Insert into rejected_candidates
                                const { error: insertError } = await supabase.from("rejected_candidates").insert([
                                  {
                                    full_name: selectedApp.full_name,
                                    email: selectedApp.email,
                                    resume_url: selectedApp.resume_url,
                                    portfolio: selectedApp.portfolio,
                                    cover_letter: selectedApp.cover_letter,
                                    job_title: selectedApp.job_title,
                                    rejected_at: new Date().toISOString(),
                                  },
                                ]);
                                if (!insertError) {
                                  // Delete from source table
                                  const { error: deleteError } = await supabase.from(sourceTable).delete().eq("id", selectedApp.id);
                                  if (!deleteError) {
                                    setDialogOpen(false);
                                    setSelectedApp(null);
                                    // Refresh applications list
                                    const { data, error: fetchError } = await supabase
                                      .from(sourceTable)
                                      .select("*")
                                      .order("created_at", { ascending: false });
                                    if (!fetchError) setApplications(data || []);
                                    toast.success("Application rejected successfully!", { position: "top-center" });
                                  } else {
                                    toast.error("Rejected, but failed to remove from source table.", { position: "top-center" });
                                  }
                                } else {
                                  toast.error("Failed to reject application: " + insertError.message, { position: "top-center" });
                                }
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="default"
                              className="mr-2"
                              onClick={async () => {
                                if (!selectedApp) return;
                                // TODO: Ensure 'accepted_candidates' table exists with the same schema as 'career_form' plus 'accepted_at' timestamp
                                const { error: insertError } = await supabase.from("accepted_candidates").insert([
                                  {
                                    full_name: selectedApp.full_name,
                                    email: selectedApp.email,
                                    resume_url: selectedApp.resume_url,
                                    portfolio: selectedApp.portfolio,
                                    cover_letter: selectedApp.cover_letter,
                                    job_title: selectedApp.job_title,
                                    accepted_at: new Date().toISOString(),
                                  },
                                ]);
                                if (!insertError) {
                                  // Delete from career_form
                                  const { error: deleteError } = await supabase.from("career_form").delete().eq("id", selectedApp.id);
                                  if (!deleteError) {
                                    setDialogOpen(false);
                                    setSelectedApp(null);
                                    // Refresh applications list
                                    const { data, error: fetchError } = await supabase
                                      .from("career_form")
                                      .select("*")
                                      .order("created_at", { ascending: false });
                                    if (!fetchError) setApplications(data || []);
                                    toast.success("Application accepted successfully!", { position: "top-center" });
                                  } else {
                                    toast.error("Accepted, but failed to remove from career_form.", { position: "top-center" });
                                  }
                                } else {
                                  toast.error("Failed to accept application: " + insertError.message, { position: "top-center" });
                                }
                              }}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
} 