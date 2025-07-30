"use client";

import { useEffect, useState, Suspense } from "react";
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

// Component that uses useSearchParams
function CareersContent() {
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

  // Check for jobId in URL params and open dialog if found
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSelectedJob(job);
        setIsDialogOpen(true);
      }
    }
  }, [searchParams, jobs]);

  // Filter jobs based on selected department and search
  const filteredJobs = jobs.filter(job => {
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    const matchesSearch = !search || 
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <span className="ml-3 text-gray-600">Loading job opportunities...</span>
          </div>
        )}

        {/* No Jobs Found */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No positions found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && filteredJobs.length > 0 && (
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {paginatedJobs.map((job) => {
              const availability = jobAvailability[job.id] || { isAvailable: true, applicationsCount: 0 };
              const gradient = DEPARTMENT_GRADIENTS[job.department || 'Default'] || DEPARTMENT_GRADIENTS['Default'];
              
              return (
                <div
                  key={job.id}
                  className="relative border border-gray-200 flex flex-col h-full group transition-all duration-300 ring-1 ring-transparent hover:ring-[#B7A16C]/40 sm:rounded-3xl sm:shadow-lg sm:p-8 p-4 rounded-none shadow-none hover:shadow-none sm:hover:shadow-2xl sm:hover:-translate-y-2 sm:hover:scale-[1.03] hover:border-[#B7A16C]"
                  style={{
                    boxShadow: '0 8px 32px 0 rgba(17,17,17,0.06)',
                    background: gradient,
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
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
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
      </div>

      {/* Job Detail Dialog */}
      {selectedJob && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">
                {selectedJob.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedJob.department && `${selectedJob.department} • `}{selectedJob.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Job Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedJob.type && <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 break-words max-w-full">{selectedJob.type}</span>}
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
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      {jobToShare && (
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Job Opportunity</DialogTitle>
              <DialogDescription>
                Share this position with your network
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Copy URL */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => copyJobUrl(jobToShare)}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
              </div>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => shareOnSocialMedia('twitter', jobToShare)}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnSocialMedia('linkedin', jobToShare)}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => shareOnSocialMedia('facebook', jobToShare)}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareOnSocialMedia('whatsapp', jobToShare)}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {/* Email Share */}
              <Button
                onClick={() => shareOnSocialMedia('email', jobToShare)}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function CareersListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 pt-16 md:pt-20 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading careers page...</p>
        </div>
      </div>
    }>
      <CareersContent />
    </Suspense>
  );
}