"use client";

import { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Brain, Users, User, Globe, HeartHandshake, Search, Loader2, Info, MapPin, BadgeDollarSign, Clock, Users as UsersIcon, Share2, Copy, Twitter, Linkedin, Facebook, Mail, Link as LinkIcon, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { checkJobAvailability } from "@/lib/api";
import { toast } from "sonner";

interface Job {
  id: string; // changed from number to string for Firestore
  title: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  department?: string;
  application_form_link?: string; // External form link
  seats_available?: number;
  is_closed?: boolean;
  created_at?: string | any; // Firebase Timestamp or string
  auto_delete_at?: string | any; // Firebase Timestamp or string
}

const DEPARTMENTS = [
  { name: "All", icon: <Globe className="h-4 w-4 mr-2" /> },
  { name: "Software Development", icon: <Briefcase className="h-4 w-4 mr-2" /> },
  { name: "AI/ML", icon: <Brain className="h-4 w-4 mr-2" /> },
  { name: "HR", icon: <Users className="h-4 w-4 mr-2" /> },
  { name: "Founder's Office", icon: <User className="h-4 w-4 mr-2" /> },
  { name: "Social and Outreach", icon: <HeartHandshake className="h-4 w-4 mr-2" /> },
];

const DEPARTMENT_GRADIENTS: Record<string, string> = {
  'Software Development': 'linear-gradient(135deg, #e3f0ff 0%, #f7fbff 100%)',
  'AI/ML': 'linear-gradient(135deg, #f3e8ff 0%, #f9f6ff 100%)',
  'HR': 'linear-gradient(135deg, #fff0e6 0%, #fff8f3 100%)',
  "Founder's Office": 'linear-gradient(135deg, #fffbe6 0%, #fdf6e3 100%)',
  'Social and Outreach': 'linear-gradient(135deg, #e6fff7 0%, #f3fffb 100%)',
  'Default': 'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 100%)',
};

export default function CareersListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAvailability, setJobAvailability] = useState<Record<string, { isAvailable: boolean; applicationsCount: number }>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [jobToShare, setJobToShare] = useState<Job | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(firestore, "job_posts"), orderBy("created_at", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(docSnap => ({ ...(docSnap.data() as Omit<Job, 'id'>), id: docSnap.id }));
        
        // Filter out expired jobs (auto_delete_at has passed)
        const currentTime = new Date();
        const activeJobs = jobsData.filter(job => {
          if (!job.auto_delete_at) return true; // Keep jobs without auto-delete
          
          const deleteTime = job.auto_delete_at.toDate ? job.auto_delete_at.toDate() : new Date(job.auto_delete_at);
          return deleteTime > currentTime;
        });
        
        setJobs(activeJobs);
        
        // Check availability for each job
        const availabilityPromises = jobsData.map(async (job) => {
          const availability = await checkJobAvailability(job.id, job.seats_available, job.is_closed);
          return { jobId: job.id, ...availability };
        });
        
        const availabilityResults = await Promise.all(availabilityPromises);
        const availabilityMap = availabilityResults.reduce((acc, result) => {
          acc[result.jobId] = { isAvailable: result.isAvailable, applicationsCount: result.applicationsCount };
          return acc;
        }, {} as Record<string, { isAvailable: boolean; applicationsCount: number }>);
        
        setJobAvailability(availabilityMap);
      } catch (error) {
        console.error("Failed to fetch jobs from Firestore:", error);
        setJobs([]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  // Handle jobId query parameter to open specific job dialog
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSelectedJob(job);
        setIsDialogOpen(true);
        // Remove the jobId from URL without page reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('jobId');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, jobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  // Pagination logic
  const jobsPerPage = 6;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDept, search]);

  // Share functionality
  const handleShare = (job: Job) => {
    setJobToShare(job);
    setShareDialogOpen(true);
  };

  const getJobUrl = (job: Job) => {
    const baseUrl = 'https://www.emiliobeaufort.com';
    return `${baseUrl}/careers?jobId=${job.id}`;
  };

  const copyJobUrl = async (job: Job) => {
    const url = getJobUrl(job);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Job URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const shareOnSocialMedia = (platform: string, job: Job) => {
    const url = getJobUrl(job);
    
    // Create a cleaner, more professional message
    const createShareMessage = (job: Job) => {
      const parts = [];
      parts.push("🚀 Exciting Career Opportunity at Emilio Beaufort!");
      parts.push("");
      parts.push(`Position: ${job.title}`);
      if (job.department) parts.push(`Department: ${job.department}`);
      if (job.location) parts.push(`Location: ${job.location}`);
      if (job.type) parts.push(`Type: ${job.type}`);
      parts.push("");
      parts.push("Join our team and help shape the future of luxury grooming! 💼✨");
      parts.push("");
      parts.push("Apply now:");
      return parts.join("\n");
    };
    
    const defaultMessage = createShareMessage(job);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        const twitterMessage = `🚀 Exciting Career Opportunity at Emilio Beaufort: ${job.title}\n\nJoin our team and help shape the future of luxury grooming! 💼✨\n\nApply now: ${url}`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
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
      case 'email':
        const emailSubject = `Career Opportunity at Emilio Beaufort: ${job.title}`;
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(defaultMessage + ' ' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 pt-16 md:pt-20 relative overflow-hidden">
      {/* Soft gradient and pattern background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{background: 'radial-gradient(circle at 50% 60%, #f5e9c6 0%, #bfa14a 40%, transparent 80%)', opacity: 0.10}} />
      <div className="absolute inset-0 z-0 bg-pattern-grid opacity-5" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-2">Open Positions</h1>
          <p className="text-gray-500 text-lg">Join our team and help shape the future of luxury grooming.</p>
        </div>
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs by title or keyword..."
              className="w-full rounded-full border border-gray-200 py-3 pl-12 pr-4 text-base bg-white shadow-sm focus:ring-2 focus:ring-gold focus:border-gold transition-premium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
        {/* Department Filter Buttons with Icons */}
        <div className="relative">
          <div className="flex flex-nowrap gap-3 mb-8 overflow-x-auto justify-start pb-2 px-2 sm:px-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.name}
                className={`px-5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap flex items-center transition-all min-w-0 sm:min-w-[120px] flex-shrink-0 ${selectedDept === dept.name ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                onClick={() => setSelectedDept(dept.name)}
              >
                {dept.icon}
                <span className="truncate max-w-[100px] sm:max-w-none">{dept.name}</span>
              </button>
            ))}
          </div>
          {/* Optional: Add a fade effect at the right edge for scroll hint */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/90 to-transparent hidden sm:block" />
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <span className="text-gray-500 text-lg">Loading job postings...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <Info className="h-12 w-12 mb-4 text-gray-300" />
            <div className="text-lg font-semibold mb-2">No job openings available right now.</div>
            <div>Check back soon for new opportunities!</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="relative border border-gray-200 flex flex-col h-full group transition-all duration-300 ring-1 ring-transparent hover:ring-[#B7A16C]/40 sm:rounded-3xl sm:shadow-lg sm:p-8 p-4 rounded-none shadow-none hover:shadow-none sm:hover:shadow-2xl sm:hover:-translate-y-2 sm:hover:scale-[1.03] hover:border-[#B7A16C]"
                  style={{
                    boxShadow: '0 8px 32px 0 rgba(17,17,17,0.06)',
                    background: DEPARTMENT_GRADIENTS[job.department as keyof typeof DEPARTMENT_GRADIENTS] || DEPARTMENT_GRADIENTS['Default'],
                  }}
                >
                  {/* Share button - top right */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShare(job);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Job Title */}
                  <div className="text-xl font-bold text-premium mb-2 line-clamp-2 min-h-[2.5em]">{job.title}</div>
                  {/* Department and tags */}
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 font-semibold flex-wrap">
                    {job.department && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 mr-1 text-gray-400" />{job.department}</span>}
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{job.location}</span>}
                    {job.type && <span className="flex items-center gap-1"><Clock className="h-4 w-4 mr-1 text-gray-400" />{job.type}</span>}
                    {job.salary && <span className="flex items-center gap-1"><BadgeDollarSign className="h-4 w-4 mr-1 text-gray-400" />{job.salary}</span>}
                    {job.seats_available && jobAvailability[job.id] && (
                      <span className={`flex items-center gap-1 ${jobAvailability[job.id].isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {jobAvailability[job.id].applicationsCount}/{job.seats_available}
                      </span>
                    )}
                  </div>
                  {/* Buttons */}
                  <div className="mt-auto pt-2 flex gap-2">
                    <Button
                      className="w-1/2 bg-white text-black border border-gray-300 text-lg py-3 rounded-2xl shadow transition-all font-bold
                        hover:bg-black hover:text-white hover:border-black hover:shadow-lg focus:ring-2 focus:ring-black focus:outline-none"
                      variant="outline"
                      onClick={() => {
                        setSelectedJob(job);
                        setIsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    {job.application_form_link ? (
                      <Button 
                        className="w-1/2 bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => window.open(job.application_form_link, '_blank')}
                        disabled={!!(job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable)}
                      >
                        {job.is_closed ? 'Closed' : (job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable ? 'Full' : 'Apply')}
                      </Button>
                    ) : (
                      <Link
                        href={job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable ? '#' : `/careersForm?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}
                        className="w-1/2"
                        onClick={(e) => {
                          if (job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Button 
                          className="w-full bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                  disabled={!!(job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable)}
                        >
                          {job.is_closed ? 'Closed' : (job.seats_available && jobAvailability[job.id] && !jobAvailability[job.id].isAvailable ? 'Full' : 'Apply')}
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    <div>
                      {job.created_at
                        ? (typeof job.created_at === 'string'
                            ? new Date(job.created_at).toLocaleDateString()
                            : (job.created_at && typeof job.created_at === 'object' && 'toDate' in job.created_at
                                ? job.created_at.toDate().toLocaleDateString()
                                : ''))
                        : ''}
                    </div>
                    {job.auto_delete_at && (
                      <div className="text-orange-600">
                        Expires: {job.auto_delete_at.toDate ? job.auto_delete_at.toDate().toLocaleDateString() : new Date(job.auto_delete_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-full"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-lg font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-full"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
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
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    onClick={() => shareOnSocialMedia('twitter', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm py-2"
                  >
                    <Twitter className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('linkedin', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm py-2"
                  >
                    <Linkedin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('facebook', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2"
                  >
                    <Facebook className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Facebook</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('whatsapp', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                  <Button
                    onClick={() => shareOnSocialMedia('email', jobToShare)}
                    className="flex items-center gap-1 sm:gap-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm py-2 col-span-2"
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Job Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl w-full p-0 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
          {selectedJob && (
            <div className="flex flex-col h-[80vh] w-full bg-white">
              {/* Header */}
              <div className="relative flex items-center justify-center px-4 sm:px-8 py-6 sm:py-8 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-3xl">
                <div className="relative group w-full flex justify-center">
                  <DialogTitle asChild>
                    <h2 className="font-extrabold text-black break-words text-center w-full cursor-pointer text-xl sm:text-[30px]">
                      {selectedJob.title}
                    </h2>
                  </DialogTitle>
                  <div className="absolute left-1/2 top-full z-50 w-max max-w-xs -translate-x-1/2 mt-2 px-4 py-2 rounded-lg bg-black text-white text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-pre-line text-center">
                    {selectedJob.title}
                  </div>
                </div>
                {/* Share button in dialog header */}
                <button
                  onClick={() => handleShare(selectedJob)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 bg-gray-100 border-b w-full rounded-b-none">
                {selectedJob.location && (
                  <span className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white border text-xs font-semibold text-gray-700 shadow-sm max-w-full break-words whitespace-normal">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" />{selectedJob.location}
                  </span>
                )}
                {selectedJob.type && (
                  <span className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white border text-xs font-semibold text-gray-700 shadow-sm max-w-full break-words whitespace-normal">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" />{selectedJob.type}
                  </span>
                )}
                {selectedJob.salary && (
                  <span className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white border text-xs font-semibold text-gray-700 shadow-sm max-w-full break-words whitespace-normal">
                    <BadgeDollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" />{selectedJob.salary}
                  </span>
                )}
                {selectedJob.department && (
                  <span className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-white border text-xs font-semibold text-gray-700 shadow-sm max-w-full break-words whitespace-normal">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" />{selectedJob.department}
                  </span>
                )}
                {selectedJob.seats_available && jobAvailability[selectedJob.id] && (
                  <span className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full border text-xs font-semibold shadow-sm max-w-full break-words whitespace-normal ${
                    jobAvailability[selectedJob.id].isAvailable 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {jobAvailability[selectedJob.id].applicationsCount}/{selectedJob.seats_available} seats
                  </span>
                )}

              </div>
              {/* Description */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 bg-white rounded-b-2xl">
                <div className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line break-words break-all">
                  <span dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                </div>
              </div>
              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 border-t bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 rounded-b-2xl">
                {selectedJob.application_form_link ? (
                  <Button 
                    className="w-full sm:w-32 bg-black text-white text-base sm:text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      window.open(selectedJob.application_form_link, '_blank');
                      setIsDialogOpen(false);
                    }}
                    disabled={!!(selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable)}
                  >
                    {selectedJob.is_closed ? 'Closed' : (selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable ? 'Full' : 'Apply')}
                  </Button>
                ) : (
                  <Link
                    href={selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable ? '#' : `/careersForm?jobId=${selectedJob.id}&jobTitle=${encodeURIComponent(selectedJob.title)}`}
                    onClick={(e) => {
                      if (selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable) {
                        e.preventDefault();
                      } else {
                        setIsDialogOpen(false);
                      }
                    }}
                  >
                    <Button 
                      className="w-full sm:w-32 bg-black text-white text-base sm:text-lg py-3 rounded-xl shadow hover:bg-gray-900 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!!(selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable)}
                    >
                      {selectedJob.is_closed ? 'Closed' : (selectedJob.seats_available && jobAvailability[selectedJob.id] && !jobAvailability[selectedJob.id].isAvailable ? 'Full' : 'Apply')}
                    </Button>
                  </Link>
                )}
                <DialogClose asChild>
                  <Button variant="outline" className="w-full sm:w-32 text-base sm:text-lg py-3 rounded-xl">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}