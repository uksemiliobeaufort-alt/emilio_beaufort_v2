'use client';
 
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { UploadCloud, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
 
export default function TeamMemberForm() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Local storage queue helpers
  const PENDING_KEY = 'pendingTeamMemberSubmissions';
  const queuePending = (entry: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      existing.push(entry);
      localStorage.setItem(PENDING_KEY, JSON.stringify(existing));
    } catch {}
  };
  const removePending = (id: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      const filtered = existing.filter((e: any) => e.id !== id);
      localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
    } catch {}
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');
    setStatusType('');
 
    let publicUrl = '';
 
    try {
      if (!imageFile) {
        setStatusMessage('Profile image is required.');
        setStatusType('error');
        setIsSubmitting(false);
        return;
      }

      // Queue locally and upload in background so user isn't blocked
      const pendingId = crypto.randomUUID();
      queuePending({
        id: pendingId,
        name,
        department,
        designation,
        description,
        linkedin,
        twitter,
        instagram,
        createdAt: new Date().toISOString(),
      });

      // Build form data for background upload
      const form = new FormData();
      form.append('file', imageFile);
      form.append('name', name);
      form.append('department', department);
      form.append('designation', designation);
      form.append('description', description);
      if (linkedin) form.append('linkedin', linkedin);
      if (twitter) form.append('twitter', twitter);
      if (instagram) form.append('instagram', instagram);

      // Fire-and-forget background upload
      (async () => {
        try {
          const res = await fetch('/api/admin/team-members', { method: 'POST', body: form });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error('Background save failed:', json?.error || res.statusText);
            return;
          }
          removePending(pendingId);
        } catch (err) {
          console.error('Background save error:', err);
        }
      })();

      // Optimistic success UI
      setStatusMessage('Team member listed successfully.');
      setStatusType('success');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 5000);
      // Early form reset
      setName('');
      setDepartment('');
      setDesignation('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setIsDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLinkedin('');
      setTwitter('');
      setInstagram('');
      // Auto-dismiss banner
      setTimeout(() => {
        setStatusMessage('');
        setStatusType('');
      }, 2500);
      setIsSubmitting(false);
      return;
 
      // Insert is already handled server-side

      // The code path above returns early after optimistic queueing
    } catch (err: any) {
      console.error('Unexpected error:', err.message || err);
      setStatusMessage('Something went wrong. Please try again.');
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  return (
    <div className="max-w-3xl mx-auto">
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">Add Team Member</h1>
        <p className="text-sm text-gray-500 mb-6">Fill out the details below. A profile image is required.</p>
        {/* Inline banner retained for errors; success uses modal */}
        {statusMessage && statusType === 'error' && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2 border bg-rose-50 text-rose-700 border-rose-200`}
            role="status"
            aria-live="polite"
          >
            <AlertCircle size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
              placeholder="Emilio Beaufort"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Department + Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a department
                </option>
                <option value="IT Department">IT Department</option>
                <option value="Founder's Office">Founder's Office</option>
                <option value="Sales Department">Sales Department</option>
                <option value="HR Department">HR Department</option>
                <option value="Marketing Department">Marketing Department</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
                placeholder="Co-Founder & CEO"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
            <textarea
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
              rows={4}
              placeholder="Write a short bio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Social Links (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="url"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
                placeholder="LinkedIn URL"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
              <input
                type="url"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
                placeholder="Twitter (X) URL"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
              <input
                type="url"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-black/80"
                placeholder="Instagram URL"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>

          {/* Profile Image (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
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
                  setStatusMessage('❌ Please upload a valid image file.');
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  setStatusMessage('❌ Image must be 5MB or smaller.');
                  return;
                }
                setImageFile(file);
                try { setImagePreview(URL.createObjectURL(file)); } catch {}
              }}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-36 h-36 object-cover rounded-full ring-2 ring-black/10"
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
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith('image/')) {
                    setStatusMessage('❌ Please upload a valid image file.');
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setStatusMessage('❌ Image must be 5MB or smaller.');
                    return;
                  }
                  setStatusMessage('');
                  setImageFile(file);
                  try { setImagePreview(URL.createObjectURL(file)); } catch {}
                }}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">PNG or JPG, up to 5MB.</p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3.5 rounded-full text-lg font-semibold tracking-wide hover:bg-gray-900 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Team Member'}
            </button>
          </div>
        </form>

        {/* status banner rendered above form */}
      </div>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm text-center" aria-describedby={undefined}>
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">Success</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Team member listed successfully.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 
 