"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { safeMap } from "@/lib/utils";

interface Founder {
  name: string;
  role: string;
  imageUrl?: string;
}

const FOUNDERS: Founder[] = [
  { name: "Manish Jha", role: "Founder & CEO" },
  { name: "Isabella Martinez", role: "Co-Founder & Creative Director" },
  { name: "Dr. Alexander Chen", role: "Co-Founder & Chief Innovation Officer" },
  { name: "Sophie Laurent", role: "Co-Founder & Head of Operations" },
  { name: "Marcus Thompson", role: "Co-Founder & Brand Strategist" },
  { name: "Priya Sharma", role: "Head of Digital Strategy" },
];

export default function FoundersPage() {
  const router = useRouter();
  const [founders, setFounders] = useState<Founder[]>(FOUNDERS);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    auth.init();
    if (!auth.isAdmin()) {
      toast.error('Unauthorized access');
      router.push('/admin/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleImageUpload = async (founderName: string, file: File) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(founderName);
    try {
      // Special case for Manish Jha
      let filePath: string;
      if (founderName.toLowerCase().includes('manish')) {
        const fileExt = file.name.split('.').pop();
        filePath = `manish sir.${fileExt}`;
      } else {
        const normalizedName = founderName.toLowerCase().replace(/\s+/g, '-');
        const fileExt = file.name.split('.').pop();
        filePath = `${normalizedName}.${fileExt}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.FOUNDERS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.FOUNDERS)
        .getPublicUrl(filePath);

      // Update founders state with new image URL
      setFounders(prev => prev.map(founder => 
        founder.name === founderName 
          ? { ...founder, imageUrl: publicUrl }
          : founder
      ));

      toast.success(`Image uploaded successfully for ${founderName}`);
    } catch (error: any) {
      console.error('Image upload failed:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (founderName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(founderName, file);
    }
  };

  const deleteImage = async (founderName: string) => {
    try {
      // Special case for Manish Jha
      let fileName: string;
      if (founderName.toLowerCase().includes('manish')) {
        fileName = 'manish sir.jpg';
      } else {
        const normalizedName = founderName.toLowerCase().replace(/\s+/g, '-');
        fileName = `${normalizedName}.jpg`;
      }
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.FOUNDERS)
        .remove([fileName]);

      if (error) throw error;

      // Update founders state to remove image URL
      setFounders(prev => prev.map(founder => 
        founder.name === founderName 
          ? { ...founder, imageUrl: undefined }
          : founder
      ));

      toast.success(`Image deleted for ${founderName}`);
    } catch (error: any) {
      console.error('Image deletion failed:', error);
      toast.error(error.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Manage Founder Images
          </h1>
          <p className="text-gray-600">
            Upload and manage images for the "Meet The Brains" section. Images should be square and high quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeMap(founders, (founder) => (
            <Card key={founder.name} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{founder.name}</CardTitle>
                <p className="text-sm text-gray-600">{founder.role}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Image Preview */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {founder.imageUrl ? (
                        <img
                          srcSet={founder.imageUrl}
                          alt={founder.name}
                          className="(max-width: 480px) 320px, (max-width: 640px) 480px, (max-width: 768px) 600px, (max-width: 1024px) 900px, 1600px object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-2xl font-bold text-gray-600">${(founder.name || '').split(' ').map(n => n[0]).join('')}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-600">
                          {(founder.name || '').split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2">
                    <Label htmlFor={`upload-${founder.name}`} className="text-sm font-medium">
                      Upload Image
                    </Label>
                    <Input
                      id={`upload-${founder.name}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(founder.name, e)}
                      disabled={uploading === founder.name}
                      className="text-sm"
                    />
                    {uploading === founder.name && (
                      <p className="text-sm text-blue-600">Uploading...</p>
                    )}
                  </div>

                  {/* Delete Button */}
                  {founder.imageUrl && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteImage(founder.name)}
                      className="w-full"
                    >
                      Delete Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload square images (recommended: 400x400px or larger)</li>
            <li>• Use JPG or PNG format</li>
            <li>• Keep file size under 5MB</li>
            <li>• Images will be automatically cropped to circles</li>
            <li>• If no image is uploaded, initials will be displayed as fallback</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 