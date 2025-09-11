'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Linkedin, Instagram, Users, ChevronLeft, ChevronRight, Pencil, Trash2, X, Save, UploadCloud, Camera, AlertTriangle } from 'lucide-react';
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
  "IT Department": '#2f8deb',
  "Founder's Office": '#e7b923',
  "Sales Department": '#028139',
  "HR Department": '#a05edd',
  "Marketing Department": '#ff7f50',
  "Social Media Department": '#641df2ff',
};

const getRoleColor = (department?: string | null): string => {
  if (!department) return roleColors.All;
  return roleColors[department] || roleColors.All;
};

export default function AdminViewTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleting, setConfirmDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formTwitter, setFormTwitter] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase.from('team_members').select('*');
    if (!error && data) {
      setTeamMembers(data as TeamMember[]);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setFormName(member.name || '');
    setFormDepartment(member.department || '');
    setFormDesignation(member.designation || '');
    setFormDescription(member.description || '');
    setFormLinkedin(member.linkedin || '');
    setFormTwitter(member.twitter || '');
    setFormInstagram(member.instagram || '');
    setFormImage(null);
    setImagePreview(member.image_url || null);
    setIsDragOver(false);
  };

  const closeEdit = () => {
    setEditing(null);
    setIsSaving(false);
    setFormImage(null);
    setImagePreview(null);
    setIsDragOver(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      const form = new FormData();
      form.append('name', formName);
      form.append('department', formDepartment);
      form.append('designation', formDesignation);
      form.append('description', formDescription);
      if (formLinkedin) form.append('linkedin', formLinkedin);
      if (formTwitter) form.append('twitter', formTwitter);
      if (formInstagram) form.append('instagram', formInstagram);
      if (formImage) form.append('file', formImage);

      const res = await fetch(`/api/admin/team-members/${editing.id}`, {
        method: 'PATCH',
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to update');

      // Optimistic local update using server-returned member when available
      const updatedMember: TeamMember = json?.member
        ? json.member
        : {
            ...(editing as TeamMember),
            name: formName,
            department: formDepartment,
            designation: formDesignation,
            description: formDescription,
            linkedin: formLinkedin || null,
            twitter: formTwitter || null,
            instagram: formInstagram || null,
            image_url: formImage ? imagePreview : (editing as TeamMember).image_url,
          };

      setTeamMembers((prev) => prev.map((m) => (m.id === editing.id ? updatedMember : m)));
      closeEdit();
      // Background re-fetch to ensure consistency
      fetchTeamMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleting(true);
    setIsDeletingId(id);
    // Optimistic UI: remove immediately
    let previousMembers: TeamMember[] | null = null;
    setTeamMembers((prev) => {
      previousMembers = prev;
      return prev.filter((m) => m.id !== id);
    });
    try {
      const res = await fetch(`/api/admin/team-members/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to delete');
      setConfirmDeleteId(null);
      // Background refresh to ensure consistency
      fetchTeamMembers();
    } catch (err) {
      console.error(err);
      // Revert optimistic change on failure
      if (previousMembers) setTeamMembers(previousMembers);
    } finally {
      setConfirmDeleting(false);
      setIsDeletingId(null);
    }
  };

  const filteredMembers =
    filter === 'All'
      ? teamMembers
      : teamMembers.filter((member) => (member.department || '') === filter);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

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
    <div className="pt-2 pb-6 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">View Team Members</h1>
          <p className="text-sm text-gray-500">All members from the team_members table</p>
        </div>

        <div className="flex justify-start gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-full border text-xs sm:text-sm transition duration-200 ${
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
          <div className="flex flex-col items-center justify-center py-12 border border-gray-200 rounded-2xl bg-white/70">
            <Users className="text-gray-400 mb-3" size={28} />
            <h3 className="text-gray-900 font-semibold">No team members to show</h3>
            <p className="text-gray-500 text-sm mt-1">Add members from the Add page.</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedMembers.map((member) => {
              const roleColor = getRoleColor(member.department);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-[2rem] p-6 flex flex-col items-center justify-between text-center relative transition-all duration-300"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${roleColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                >
                  {/* Card actions */}
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      onClick={() => openEdit(member)}
                      className="p-2 rounded-full bg-white/90 border hover:bg-gray-50 shadow-sm"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-2 rounded-full bg-white/90 border hover:bg-gray-50 shadow-sm"
                      title="Delete"
                      disabled={isDeletingId === member.id}
                    >
                      <Trash2 className={`h-4 w-4 ${isDeletingId === member.id ? 'text-gray-400' : 'text-rose-600'}`} />
                    </button>
                  </div>
                  {member.image_url && (
                    <Image
                      src={member.image_url}
                      alt={member.name || 'Team Member'}
                      width={110}
                      height={110}
                      className="rounded-full object-cover mb-3"
                      style={{ border: `3px solid ${roleColor}` }}
                    />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
                  <p className="text-sm font-medium my-1" style={{ color: roleColor }}>
                    {member.designation}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-xs">
                    {member.description}
                  </p>

                  <div className="flex gap-3 justify-center">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <FaXTwitter size={18} />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#E0DFDC] p-2 rounded-full text-black transition"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                  </div>

                  <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full z-0 pointer-events-none" style={{ backgroundColor: roleColor }} />
                  <div className="absolute bottom-0 left-0 w-12 h-12 rounded-tr-full z-0 pointer-events-none" style={{ backgroundColor: roleColor }} />
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                className="px-3 py-2 rounded-lg border text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPageClamped === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg border text-sm transition ${
                    page === currentPageClamped
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-current={page === currentPageClamped ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="px-3 py-2 rounded-lg border text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageClamped === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl relative max-h-[85vh] flex flex-col">
            <div className="p-6 pb-3 border-b relative">
              <button
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
                onClick={closeEdit}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">Edit Team Member</h2>
            </div>
            <div className="p-6 pt-4 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select className="w-full rounded-xl border border-gray-300 px-4 py-2" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)}>
                    <option value="">Select a department</option>
                    <option value="IT Department">IT Department</option>
                    <option value="Founder's Office">Founder's Office</option>
                    <option value="Sales Department">Sales Department</option>
                    <option value="HR Department">HR Department</option>
                    <option value="Marketing Department">Marketing Department</option>
                    <option value="Social Media Department">Social Media Department</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Bio</label>
                <textarea className="w-full rounded-xl border border-gray-300 px-4 py-2" rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2" placeholder="LinkedIn URL" value={formLinkedin} onChange={(e) => setFormLinkedin(e.target.value)} />
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2" placeholder="Twitter URL" value={formTwitter} onChange={(e) => setFormTwitter(e.target.value)} />
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2" placeholder="Instagram URL" value={formInstagram} onChange={(e) => setFormInstagram(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Replace Image (optional)</label>
                <div
                  className={`rounded-2xl p-6 text-center transition border-2 border-dashed cursor-pointer ${
                    isDragOver ? 'border-black bg-gray-100' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith('image/')) {
                      alert('Please upload a valid image file.');
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image must be 5MB or smaller.');
                      return;
                    }
                    setFormImage(file);
                    try { setImagePreview(URL.createObjectURL(file)); } catch {}
                  }}
                >
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        srcSet={imagePreview}
                        alt="Preview"
                        loading='lazy'
                        className="w-36 h-36 (max-width: 480px) 320px, (max-width: 640px) 480px, (max-width: 768px) 600px, (max-width: 1024px) 900px, 1600px object-cover rounded-full ring-2 ring-black/10"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 shadow hover:bg-gray-900"
                        aria-label="Change image"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-4">
                      <UploadCloud className="text-gray-500" size={28} />
                      <p className="text-sm text-gray-600">Drag & drop your image here or click to browse</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        alert('Please upload a valid image file.');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image must be 5MB or smaller.');
                        return;
                      }
                      setFormImage(file);
                      try { setImagePreview(URL.createObjectURL(file)); } catch {}
                    }}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG or JPG, up to 5MB.</p>
              </div>
            </div>
            <div className="p-6 pt-3 border-t flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={closeEdit} disabled={isSaving}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-black text-white flex items-center gap-2 disabled:opacity-60" onClick={saveEdit} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl relative">
            <div className="p-6 pb-3 border-b relative">
              <button
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
                onClick={() => setConfirmDeleteId(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Delete team member?</h2>
              </div>
            </div>
            <div className="p-6 pt-4">
              <p className="text-sm text-gray-600">This action cannot be undone. The team member will be permanently removed from the database.</p>
            </div>
            <div className="p-6 pt-3 border-t flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setConfirmDeleteId(null)} disabled={confirmDeleting}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-60" onClick={confirmDelete} disabled={confirmDeleting}>
                {confirmDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


