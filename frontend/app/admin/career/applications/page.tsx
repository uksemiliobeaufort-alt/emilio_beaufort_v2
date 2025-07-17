"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { saveAs } from "file-saver";

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

export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeLinks, setResumeLinks] = useState<Record<number, string>>({});
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("career_form")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setApplications(data || []);
      setLoading(false);
    };
    fetchApplications();
  }, []);

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

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : applications.length === 0 ? (
        <div className="text-gray-500">No applications found.</div>
      ) : (
        <>
          <div className="space-y-8">
            {applications.map(app => (
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
                      <Button
                        variant="destructive"
                        className="mr-2"
                        onClick={async () => {
                          if (!selectedApp) return;
                          const { error } = await supabase.from("career_form").delete().eq("id", selectedApp.id);
                          if (!error) {
                            setDialogOpen(false);
                            setSelectedApp(null);
                            // Refresh applications list
                            const { data, error: fetchError } = await supabase
                              .from("career_form")
                              .select("*")
                              .order("created_at", { ascending: false });
                            if (!fetchError) setApplications(data || []);
                          } else {
                            alert("Failed to delete application.");
                          }
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        className="mr-2"
                        onClick={() => {
                          setDialogOpen(false);
                          setSelectedApp(null);
                          // You can add accept logic here if needed
                        }}
                      >
                        Accept
                      </Button>
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
  );
} 