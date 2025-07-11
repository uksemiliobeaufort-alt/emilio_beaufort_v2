"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

// Sample team members data (replace with API call in the future)
const ALL_TEAM_MEMBERS = [
  // ...add as many as you want for demo...
  { name: "Priya Sharma", role: "Lead Product Designer", description: "Expert in user experience and luxury product design, blending tradition with innovation.", location: "Mumbai, India", gradient: "from-yellow-500 via-orange-400 to-pink-500" },
  { name: "Liam O'Connor", role: "Senior Engineer", description: "Full-stack developer with a passion for scalable systems.", location: "Dublin, Ireland", gradient: "from-blue-900 via-blue-400 to-blue-900" },
  { name: "Ava Müller", role: "Marketing Lead", description: "Brand storyteller and digital marketing strategist.", location: "Berlin, Germany", gradient: "from-gray-700 via-gray-400 to-gray-700" },
  { name: "Noah Kim", role: "Product Manager", description: "Drives product vision and cross-functional teams.", location: "Seoul, South Korea", gradient: "from-green-700 via-green-300 to-green-700" },
  { name: "Sofia Rossi", role: "Customer Success", description: "Ensures every client has a premium experience.", location: "Rome, Italy", gradient: "from-pink-700 via-pink-300 to-pink-700" },
  { name: "Lucas Dubois", role: "Supply Chain Lead", description: "Logistics and operations expert.", location: "Lyon, France", gradient: "from-purple-700 via-purple-300 to-purple-700" },
  { name: "Maya Patel", role: "QA Specialist", description: "Quality is her obsession.", location: "Delhi, India", gradient: "from-red-700 via-red-300 to-red-700" },
  { name: "Oliver Smith", role: "Finance Manager", description: "Numbers and strategy.", location: "London, UK", gradient: "from-gray-900 via-gray-400 to-gray-900" },
  { name: "Emma Johansson", role: "UX Researcher", description: "User insights for better products.", location: "Stockholm, Sweden", gradient: "from-blue-700 via-blue-300 to-blue-700" },
  { name: "Ethan Lee", role: "Data Analyst", description: "Turning data into decisions.", location: "San Francisco, USA", gradient: "from-green-900 via-green-400 to-green-900" },
];

const PAGE_SIZE = 6;

export default function TeamMembersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams?.get("page") || "1", 10);

  // Simulate server-side pagination
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return ALL_TEAM_MEMBERS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const totalPages = Math.ceil(ALL_TEAM_MEMBERS.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <h1 className="text-4xl font-serif font-bold text-center mb-10 text-premium">Our Team Members</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {paginatedMembers.map((member, idx) => (
          <div
            key={member.name + idx}
            className="relative h-[420px] bg-white rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-700"
          >
            {/* Animated Gradient Border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl p-1`}>
              <div className="w-full h-full bg-white rounded-3xl"></div>
            </div>
            {/* Card Content */}
            <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
              {/* Top Section */}
              <div className="text-center flex-1">
                {/* Avatar with Animated Ring */}
                <div className="relative mb-6">
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl overflow-hidden`}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  {/* Animated Ring */}
                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${member.gradient} rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`}></div>
                </div>
                {/* Name and Role */}
                <h4 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-premium mb-2 group-hover:text-[#B7A16C] transition-colors duration-300">
                  {member.name}
                </h4>
                <p className="text-[#B7A16C] font-semibold text-sm sm:text-base mb-3 group-hover:scale-105 transition-transform duration-300">
                  {member.role}
                </p>
              </div>
              {/* Bottom Section */}
              <div className="text-center flex-shrink-0">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {member.description}
                </p>
              </div>
            </div>
            {/* Floating Background Elements */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${member.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br ${member.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center mt-10 gap-4">
        <button
          className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          onClick={() => router.push(`/team-members?page=${page - 1}`)}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-600 font-medium">Page {page} of {totalPages}</span>
        <button
          className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
          onClick={() => router.push(`/team-members?page=${page + 1}`)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
} 