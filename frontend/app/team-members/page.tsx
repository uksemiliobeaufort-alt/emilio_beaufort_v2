"use client";

import { useSearchParams, useRouter } from "next/navigation";
<<<<<<< HEAD
import { useMemo, Suspense } from "react";
import { getFounderImageUrl } from "@/lib/supabase";
=======
import { useMemo, useState, Suspense } from "react";
import Script from "next/script";
>>>>>>> bd6ffb6ce029a8b7afdb4f1482868cf23e01972f

const ALL_TEAM_MEMBERS = [
  { name: "Priya Sharma", role: "Lead Product Designer", category: "Design", description: "Expert in user experience and luxury product design, blending tradition with innovation.", location: "Mumbai, India", gradient: "from-yellow-500 via-orange-400 to-pink-500", imageUrl: "https://randomuser.me/api/portraits/women/65.jpg" },
  { name: "Liam O'Connor", role: "Senior Engineer", category: "Developers", description: "Full-stack developer with a passion for scalable systems.", location: "Dublin, Ireland", gradient: "from-blue-900 via-blue-400 to-blue-900", imageUrl: "https://randomuser.me/api/portraits/men/44.jpg" },
  { name: "Ava Müller", role: "Marketing Lead", category: "Marketing", description: "Brand storyteller and digital marketing strategist.", location: "Berlin, Germany", gradient: "from-gray-700 via-gray-400 to-gray-700", imageUrl: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Noah Kim", role: "Product Manager", category: "Sales", description: "Drives product vision and cross-functional teams.", location: "Seoul, South Korea", gradient: "from-green-700 via-green-300 to-green-700", imageUrl: "https://randomuser.me/api/portraits/men/56.jpg" },
  { name: "Sofia Rossi", role: "Customer Success", category: "Sales", description: "Ensures every client has a premium experience.", location: "Rome, Italy", gradient: "from-pink-700 via-pink-300 to-pink-700", imageUrl: "https://randomuser.me/api/portraits/women/77.jpg" },
  { name: "Lucas Dubois", role: "Supply Chain Lead", category: "Sales", description: "Logistics and operations expert.", location: "Lyon, France", gradient: "from-purple-700 via-purple-300 to-purple-700", imageUrl: "https://randomuser.me/api/portraits/men/60.jpg" },
  { name: "Maya Patel", role: "QA Specialist", category: "Developers", description: "Quality is her obsession.", location: "Delhi, India", gradient: "from-red-700 via-red-300 to-red-700", imageUrl: "https://randomuser.me/api/portraits/women/21.jpg" },
  { name: "Oliver Smith", role: "Finance Manager", category: "Marketing", description: "Numbers and strategy.", location: "London, UK", gradient: "from-gray-900 via-gray-400 to-gray-900", imageUrl: "https://randomuser.me/api/portraits/men/33.jpg" },
  { name: "Emma Johansson", role: "UX Researcher", category: "Design", description: "User insights for better products.", location: "Stockholm, Sweden", gradient: "from-blue-700 via-blue-300 to-blue-700", imageUrl: "https://randomuser.me/api/portraits/women/39.jpg" },
  { name: "Ethan Lee", role: "Data Analyst", category: "Marketing", description: "Turning data into decisions.", location: "San Francisco, USA", gradient: "from-green-900 via-green-400 to-green-900", imageUrl: "https://randomuser.me/api/portraits/men/45.jpg" },
];

const PAGE_SIZE = 6;

function TeamMembersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const page = parseInt(searchParams?.get("page") || "1", 10);

  const filteredMembers = useMemo(() => {
    if (selectedCategory === "All") return ALL_TEAM_MEMBERS;
    return ALL_TEAM_MEMBERS.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <h1 className="text-4xl font-serif font-bold text-center mb-10 text-premium">Our Team Members</h1>

      {/* Category Buttons  */}
      <div className="flex justify-center mb-10">
        <div className="flex flex-wrap gap-3">
          {["All", "Developers", "Design", "Marketing", "Sales"].map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                router.push("/team-members?page=1");
              }}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 border ${
                selectedCategory === category
                  ? "bg-black text-white shadow-md scale-105 border-[#B7A16C]"
                  : "bg-white text-black border-gray-300 hover:border-[#B7A16C] hover:scale-105"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {paginatedMembers.map((member, idx) => (
          <div
            key={member.name + idx}
            className="relative h-[460px] bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.015] transition-all duration-300"

          >
            <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl p-1`}>
              <div className="w-full h-full bg-white rounded-3xl"></div>
            </div>
            <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
              <div className="text-center flex-1">
                <div className="relative mb-6">
<<<<<<< HEAD
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl overflow-hidden`}>
                    {/* Team Member Image from Supabase */}
                    <img
                      src={getFounderImageUrl(member.name)}
                      alt={`${member.name} - ${member.role}`}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center';
                          fallback.innerHTML = `<span class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">${member.name.split(' ').map(n => n[0]).join('')}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
=======
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg overflow-hidden`}>
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
>>>>>>> bd6ffb6ce029a8b7afdb4f1482868cf23e01972f
                  </div>
                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${member.gradient} rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`}></div>
                </div>
                <h4 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-premium mb-2 group-hover:text-[#B7A16C] transition-colors duration-300">
                  {member.name}
                </h4>
                <p className="text-[#B7A16C] font-semibold text-sm sm:text-base mb-3 group-hover:scale-105 transition-transform duration-300">
                  {member.role}
                </p>
              </div>

              {/* Description + Social Icons */}
              <div className="text-center flex-shrink-0">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                  {member.description}
                </p>
                <div className="flex justify-center gap-4">
                  <a href="https://linkedin.com/company/emiliobeaufort" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#B7A16C] hover:text-white transition">
                    <i className="fab fa-linkedin-in text-sm"></i>
                  </a>
                  <a href="https://twitter.com/emiliobeaufort" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#B7A16C] hover:text-white transition">
                    <i className="fab fa-x-twitter text-sm"></i>
                  </a>
                  <a href="https://instagram.com/emiliobeaufort" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#B7A16C] hover:text-white transition">
                    <i className="fab fa-instagram text-sm"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Decorative Circles */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${member.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br ${member.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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

export default function TeamMembersPage() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/js/all.min.js"
        strategy="beforeInteractive"
        crossOrigin="anonymous"
      />
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-2xl font-serif text-gray-900">Loading team members...</div>
        </div>
      }>
        <TeamMembersContent />
      </Suspense>
    </>
  );
}
