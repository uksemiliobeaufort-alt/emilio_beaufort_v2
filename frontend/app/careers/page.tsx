"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Brain, Users, User, Globe, HeartHandshake, Search, Loader2, Info, MapPin, BadgeDollarSign, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  title: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  department?: string;
}

const DEPARTMENTS = [
  { name: "All", icon: <Globe className="h-4 w-4 mr-2" /> },
  { name: "Software Development", icon: <Briefcase className="h-4 w-4 mr-2" /> },
  { name: "AI/ML", icon: <Brain className="h-4 w-4 mr-2" /> },
  { name: "HR", icon: <Users className="h-4 w-4 mr-2" /> },
  { name: "Founder's Office", icon: <User className="h-4 w-4 mr-2" /> },
  { name: "Social and Outreach", icon: <HeartHandshake className="h-4 w-4 mr-2" /> },
];

export default function CareersListingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("All");
  const [search, setSearch] = useState("");
  const router = useRouter();

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

  const filteredJobs = jobs.filter((job) => {
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

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
        <div className="flex flex-nowrap gap-3 mb-10 overflow-x-auto justify-center pb-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.name}
              className={`px-5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap flex items-center transition-all
                ${selectedDept === dept.name
                  ? 'bg-black text-white border-black shadow'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}
              `}
              onClick={() => setSelectedDept(dept.name)}
            >
              {dept.icon}
              {dept.name}
            </button>
          ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="relative border border-gray-200 rounded-3xl shadow-lg bg-white p-8 flex flex-col h-full group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.03] hover:border-[#B7A16C] ring-1 ring-transparent hover:ring-[#B7A16C]/40"
                style={{ boxShadow: '0 8px 32px 0 rgba(17,17,17,0.06)' }}
              >
                {/* Icon + Department Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-100 rounded-full p-3 shadow flex items-center justify-center">
                    <Briefcase className="h-7 w-7 text-gray-500" />
                  </div>
                  {job.department && (
                    <span className="ml-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm">{job.department}</span>
                  )}
                </div>
                {/* Job Title */}
                <h2 className="font-serif font-bold text-2xl text-black group-hover:text-gray-900 transition-colors mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{job.title}</h2>
                {/* Tags with icons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />{job.location}</span>
                  <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />{job.type}</span>
                  {job.salary && (
                    <span className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200"><BadgeDollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />Salary: {job.salary}</span>
                  )}
                </div>
                {/* Description */}
                <div className="text-gray-700 text-sm mb-6 line-clamp-2 min-h-[2.5em]">
                  <span dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
                {/* Buttons */}
                <div className="mt-auto pt-2 flex gap-2">
                  <Button
                    className="w-1/2 bg-white text-black border border-gray-300 text-lg py-3 rounded-2xl shadow hover:bg-gray-100 hover:shadow-lg transition-all font-bold"
                    variant="outline"
                    onClick={() => router.push(`/careers/${job.id}`)}
                  >
                    View
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}