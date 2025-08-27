'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Linkedin, Instagram, Users } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

type TeamMember = {
  id: string;
  name: string | null;
  designation: string | null;
  description: string | null;
  image_url: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  department: string | null;
};

const roleColors: Record<string, string> = {
  All: '#000000',
  "IT Department": '#e7b923',
  "Founder's Office": '#e7b923',
  "Sales Department": '#e7b923',
  "HR Department": '#e7b923',
  "Marketing Department": '#e7b923',
  "Social Media Department": '#e7b923',
};

const getRoleColor = (department?: string | null): string => {
  if (!department) return roleColors.All;
  return roleColors[department] || roleColors.All;
};

const TeamMembersSection = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState('All');

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase.from('team_members').select('*');
    if (!error && data) {
      setTeamMembers(data as TeamMember[]);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const filteredMembers =
    filter === 'All'
      ? teamMembers
      : teamMembers.filter((member) => (member.department || '') === filter);

  const filters = [
    'All',
    "IT Department",
    "Founder's Office",
    "Sales Department",
    "HR Department",
    "Marketing Department",
    "Social Media Department",
  ];

  return (
    <div className="bg-gradient-to-br from-white via-[#fdfdfd] to-[#f7f7f7] pt-20 md:pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-serif font-extrabold text-gray-900 mb-6 md:mb-8">
          Meet the Team
        </h1>
        <p className="text-gray-500 text-lg mb-12 md:mb-14 font-light">
        A dedicated team behind every refined Emilio Beaufort experience.
       </p>

        <div className="flex justify-center gap-4 mb-10 md:mb-12 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition duration-200 ${
                filter === f
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-2xl bg-white/70">
            <Users className="text-gray-400 mb-3" size={32} />
            <h3 className="text-gray-900 font-semibold">No team members to show</h3>
            <p className="text-gray-500 text-sm mt-1">Check back soon as we grow the team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {filteredMembers.map((member) => {
              const roleColor = getRoleColor(member.department);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-between text-center relative transition-all duration-300"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${roleColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                >
                  {member.image_url && (
                    <Image
                      src={member.image_url}
                      alt={member.name || 'Team Member'}
                      width={120}
                      height={120}
                      className="rounded-full object-cover mb-4"
                      style={{
                        border: `3px solid ${roleColor}`,
                      }}
                    />
                  )}
                  <h2 className="text-xl font-serif font-extrabold text-gray-900">
                    {member.name}
                  </h2>
                  <p className="text-md font-semibold my-2" style={{ color: roleColor }}>
                    {member.designation}
                  </p>
                  <p className="text-gray-600 text-sm font-light leading-relaxed mb-6 max-w-xs">
                    {member.description}
                  </p>

                  <div className="flex gap-4 justify-center">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <FaXTwitter size={20} />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                  </div>

                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-bl-full"
                    style={{ backgroundColor: roleColor }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-16 h-16 rounded-tr-full"
                    style={{ backgroundColor: roleColor }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersSection;


