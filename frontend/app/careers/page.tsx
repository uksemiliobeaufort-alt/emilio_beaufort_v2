// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { Briefcase, Brain, Users, User, Globe, HeartHandshake, Search, Loader2, Info, MapPin, BadgeDollarSign, Clock } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

// interface Job {
//   id: number;
//   title: string;
//   location: string;
//   type: string;
//   salary?: string;
//   description: string;
//   department?: string;
//   created_at?: string; // Added for date display
// }

// const DEPARTMENTS = [
//   { name: "All", icon: <Globe className="h-4 w-4 mr-2" /> },
//   { name: "Software Development", icon: <Briefcase className="h-4 w-4 mr-2" /> },
//   { name: "AI/ML", icon: <Brain className="h-4 w-4 mr-2" /> },
//   { name: "HR", icon: <Users className="h-4 w-4 mr-2" /> },
//   { name: "Founder's Office", icon: <User className="h-4 w-4 mr-2" /> },
//   { name: "Social and Outreach", icon: <HeartHandshake className="h-4 w-4 mr-2" /> },
// ];

// export default function CareersListingPage() {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDept, setSelectedDept] = useState("All");
//   const [search, setSearch] = useState("");
//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchJobs = async () => {
//       const { data, error } = await supabase
//         .from("job_posts")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (!error) setJobs(data || []);
//       setLoading(false);
//     };

//     fetchJobs();
//   }, []);

//   const filteredJobs = jobs.filter((job) => {
//     const matchesDept = selectedDept === "All" || job.department === selectedDept;
//     const matchesSearch =
//       job.title.toLowerCase().includes(search.toLowerCase()) ||
//       (job.description && job.description.toLowerCase().includes(search.toLowerCase()));
//     return matchesDept && matchesSearch;
//   });

//   // Pagination logic
//   const jobsPerPage = 6;
//   const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
//   const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

//   // Reset to first page when filters/search change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedDept, search]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 pt-16 md:pt-20 relative overflow-hidden">
//       {/* Soft gradient and pattern background */}
//       <div className="absolute inset-0 z-0 pointer-events-none" style={{background: 'radial-gradient(circle at 50% 60%, #f5e9c6 0%, #bfa14a 40%, transparent 80%)', opacity: 0.10}} />
//       <div className="absolute inset-0 z-0 bg-pattern-grid opacity-5" />
//       <div className="max-w-5xl mx-auto relative z-10">
//         <div className="text-center mb-10">
//           <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-2">Open Positions</h1>
//           <p className="text-gray-500 text-lg">Join our team and help shape the future of luxury grooming.</p>
//         </div>
//         {/* Search Bar */}
//         <div className="flex justify-center mb-8">
//           <div className="relative w-full max-w-md">
//             <input
//               type="text"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search jobs by title or keyword..."
//               className="w-full rounded-full border border-gray-200 py-3 pl-12 pr-4 text-base bg-white shadow-sm focus:ring-2 focus:ring-gold focus:border-gold transition-premium"
//             />
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
//           </div>
//         </div>
//         {/* Department Filter Buttons with Icons */}
//         <div className="relative">
//           <div className="flex flex-nowrap gap-3 mb-8 overflow-x-auto justify-start pb-2 px-2 sm:px-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
//             {DEPARTMENTS.map((dept) => (
//               <button
//                 key={dept.name}
//                 className={`px-5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap flex items-center transition-all min-w-0 sm:min-w-[120px] flex-shrink-0 ${selectedDept === dept.name ? 'bg-black text-white border-black shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
//                 onClick={() => setSelectedDept(dept.name)}
//               >
//                 {dept.icon}
//                 <span className="truncate max-w-[100px] sm:max-w-none">{dept.name}</span>
//               </button>
//             ))}
//           </div>
//           {/* Optional: Add a fade effect at the right edge for scroll hint */}
//           <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/90 to-transparent hidden sm:block" />
//         </div>
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-24">
//             <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
//             <span className="text-gray-500 text-lg">Loading job postings...</span>
//           </div>
//         ) : filteredJobs.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-24 text-gray-500">
//             <Info className="h-12 w-12 mb-4 text-gray-300" />
//             <div className="text-lg font-semibold mb-2">No job openings available right now.</div>
//             <div>Check back soon for new opportunities!</div>
//           </div>
//         ) : (
//           <>
//             <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
//               {paginatedJobs.map((job) => (
//                 <div
//                   key={job.id}
//                   className="relative border border-gray-200 bg-white flex flex-col h-full group transition-all duration-300 ring-1 ring-transparent hover:ring-[#B7A16C]/40 sm:rounded-3xl sm:shadow-lg sm:p-8 p-4 rounded-none shadow-none hover:shadow-none sm:hover:shadow-2xl sm:hover:-translate-y-2 sm:hover:scale-[1.03] hover:border-[#B7A16C]"
//                   style={{ boxShadow: '0 8px 32px 0 rgba(17,17,17,0.06)' }}
//                 >
//                   {/* Job Title */}
//                   <div className="text-xl font-bold text-premium mb-2 line-clamp-2 min-h-[2.5em]">{job.title}</div>
//                   {/* Department and tags */}
//                   <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 font-semibold flex-wrap">
//                     {job.department && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 mr-1 text-gray-400" />{job.department}</span>}
//                     {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{job.location}</span>}
//                     {job.type && <span className="flex items-center gap-1"><Clock className="h-4 w-4 mr-1 text-gray-400" />{job.type}</span>}
//                     {job.salary && <span className="flex items-center gap-1"><BadgeDollarSign className="h-4 w-4 mr-1 text-gray-400" />{job.salary}</span>}
//                   </div>
//                   {/* Buttons */}
//                   <div className="mt-auto pt-2 flex gap-2">
//                     <Button
//                       className="w-1/2 bg-white text-black border border-gray-300 text-lg py-3 rounded-2xl shadow hover:bg-gray-100 hover:shadow-lg transition-all font-bold"
//                       variant="outline"
//                       onClick={() => {
//                         setSelectedJob(job);
//                         setIsDialogOpen(true);
//                       }}
//                     >
//                       View Details
//                     </Button>
//                     <Link
//                       href={`/careersForm?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}
//                       className="w-1/2"
//                     >
//                       <Button className="w-full bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold">
//                         Apply
//                       </Button>
//                     </Link>
//                   </div>
//                   <div className="text-xs text-gray-400 mt-2">{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</div>
//                 </div>
//               ))}
//             </div>
//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-4 mt-10">
//                 <Button
//                   variant="outline"
//                   className="px-6 py-2 rounded-full"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 >
//                   Previous
//                 </Button>
//                 <span className="text-lg font-semibold">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <Button
//                   variant="outline"
//                   className="px-6 py-2 rounded-full"
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//                 >
//                   Next
//                 </Button>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//       {/* Job Details Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-3xl w-full p-0 sm:p-0">
//           {selectedJob && (
//             <div className="flex flex-col h-[80vh] sm:h-[80vh]">
//               <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
//                 <DialogHeader>
//                   <DialogTitle className="text-2xl font-bold mb-2">{selectedJob.title}</DialogTitle>
//                   <DialogDescription asChild>
//                     <div className="flex flex-wrap gap-2 mb-8">
//                       <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />{selectedJob.location}</span>
//                       <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />{selectedJob.type}</span>
//                       {selectedJob.salary && (
//                         <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><BadgeDollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />Salary: {selectedJob.salary}</span>
//                       )}
//                       {selectedJob.department && (
//                         <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">{selectedJob.department}</span>
//                       )}
//                     </div>
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="text-gray-700 text-base mb-6 whitespace-pre-line mt-6">
//                   <span dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:px-10">
//                 <Link
//                   href={`/careersForm?jobId=${selectedJob.id}&jobTitle=${encodeURIComponent(selectedJob.title)}`}
//                   className="w-1/2"
//                   onClick={() => setIsDialogOpen(false)}
//                 >
//                   <Button className="w-full bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold">
//                     Apply
//                   </Button>
//                 </Link>
//                 <DialogClose asChild>
//                   <Button variant="outline" className="w-1/2 text-lg py-3 rounded-2xl">
//                     Close
//                   </Button>
//                 </DialogClose>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Brain, Users, User, Globe, HeartHandshake, Search, Loader2, Info, MapPin, BadgeDollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface Job {
  id: number;
  title: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  department?: string;
  created_at?: string; // Added for date display
}

const CATEGORY_FILTERS = [
  {
    name: "Software Developer",
    key: "Software Development",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "Sales",
    key: "Sales",
    img: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "AI/ML",
    key: "AI/ML",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "HR",
    key: "HR",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "AI Developer",
    key: "AI Developer",
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "Automation Engineer",
    key: "Automation Engineer",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=facearea&w=400&h=400&q=80"
  },
  {
    name: "UI/UX Designer",
    key: "UI/UX Designer",
    img: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=facearea&w=400&h=400&q=80"
  }
];

// Utility to strip HTML tags from a string
function stripHtmlTags(str: string) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
}

export default function CareersListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setJobs(data || []);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const jobsForCategory = selectedCategory ? jobs.filter(j => j.department === selectedCategory) : [];

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8 pt-16 md:pt-20 relative overflow-hidden">
      {/* Soft gradient and pattern background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{background: 'radial-gradient(circle at 50% 60%, #f5e9c6 0%, #bfa14a 40%, transparent 80%)', opacity: 0.10}} />
      <div className="absolute inset-0 z-0 bg-pattern-grid opacity-5" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-6">Join Our Team</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-4">
            At Emilio Beaufort, we believe in redefining luxury grooming through innovation, creativity, and a passion for excellence. Join a team where your ideas matter, your growth is supported, and your work shapes the experiences of tomorrow. We value diversity, collaboration, and a relentless pursuit of quality in everything we do.
          </p>
        </div>
        {/* Category Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16 place-items-center">
          {CATEGORY_FILTERS.map((cat) => {
            const openCount = jobs.filter(j => j.department === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setIsDialogOpen(true); }}
                className={`flex flex-col items-center focus:outline-none group ${selectedCategory === cat.key && isDialogOpen ? 'ring-2 ring-gold' : ''}`}
              >
                <div className="w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-gray-100 group-hover:border-gold transition-all">
                  <img src={cat.img} alt={cat.name} className="object-cover w-full h-full" />
                </div>
                <div className="mt-6 text-xl font-semibold text-gray-800 group-hover:text-gold text-center">{cat.name}</div>
                <div className="text-gray-500 text-base text-center">{openCount} open jobs</div>
              </button>
            );
          })}
        </div>
        <blockquote className="mt-2 mb-10 text-xl italic text-black font-serif max-w-xl mx-auto text-center border-l-4 border-gold pl-4">
          “The future belongs to those who believe in the beauty of their dreams.”
        </blockquote>
        {/* Job List Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl w-full p-0 sm:p-0">
            <div className="flex flex-col h-[70vh]">
              <DialogHeader>
                <DialogTitle asChild>
                  <h1 className="text-10xl font-extrabold text-black text-center mb-10">{selectedCategory ? CATEGORY_FILTERS.find(c => c.key === selectedCategory)?.name : ''} Jobs</h1>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {jobsForCategory.length === 0 ? (
                  <div className="text-gray-500 text-lg text-center mt-10">No open jobs in this category.</div>
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    {jobsForCategory.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col h-full">
                        <div className="text-xl font-extrabold text-black mb-2 line-clamp-2 min-h-[2.5em]">{job.title}</div>
                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 font-semibold flex-wrap">
                          {job.department && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 mr-1 text-gray-400" />{job.department}</span>}
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 mr-1 text-gray-400" />{job.location}</span>}
                          {job.type && <span className="flex items-center gap-1"><Clock className="h-4 w-4 mr-1 text-gray-400" />{job.type}</span>}
                          {job.salary && <span className="flex items-center gap-1"><BadgeDollarSign className="h-4 w-4 mr-1 text-gray-400" />{job.salary}</span>}
                        </div>
                        <div className="text-gray-700 text-sm line-clamp-3 mb-2 flex-1">{stripHtmlTags(job.description)}</div>
                        <div className="mt-auto pt-2 flex gap-2">
                          <Button
                            className="w-1/2 bg-white text-black border border-gray-300 text-lg py-3 rounded-2xl shadow hover:bg-gray-100 hover:shadow-lg transition-all font-bold"
                            variant="outline"
                            onClick={() => setSelectedJob(job)}
                          >
                            View Details
                          </Button>
                          <Link
                            href={`/careersForm?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}
                            className="w-1/2"
                          >
                            <Button className="w-full bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold">
                              Apply
                            </Button>
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t border-gray-100 bg-white px-6 py-4">
                <DialogClose asChild>
                  <Button variant="outline" className="text-lg py-2 px-6 rounded-xl">Close</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Job Details Dialog (nested) */}
        <Dialog open={!!selectedJob} onOpenChange={open => { if (!open) setSelectedJob(null); }}>
          <DialogContent className="max-w-3xl w-full p-0 sm:p-0">
            {selectedJob && (
              <div className="flex flex-col h-[80vh] sm:h-[80vh]">
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-2">{selectedJob.title}</DialogTitle>
                    <DialogDescription asChild>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />{selectedJob.location}</span>
                        <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />{selectedJob.type}</span>
                        {selectedJob.salary && (
                          <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><BadgeDollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />Salary: {selectedJob.salary}</span>
                        )}
                        {selectedJob.department && (
                          <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">{selectedJob.department}</span>
                        )}
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-gray-700 text-base mb-6 whitespace-pre-line mt-6">
                    <span dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:px-10">
                  <Link
                    href={`/careersForm?jobId=${selectedJob.id}&jobTitle=${encodeURIComponent(selectedJob.title)}`}
                    className="w-1/2"
                    onClick={() => setSelectedJob(null)}
                  >
                    <Button className="w-full bg-black text-white text-lg py-3 rounded-2xl shadow hover:bg-gray-900 hover:shadow-lg transition-all font-bold">
                      Apply
                    </Button>
                  </Link>
                  <DialogClose asChild>
                    <Button variant="outline" className="w-1/2 text-lg py-3 rounded-2xl">
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}