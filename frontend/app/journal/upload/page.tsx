"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from '@/lib/auth';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface FormData {
  title: string;
  content: string;
  featuredImage: File | null;
}

export default function UploadBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    featuredImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    auth.init(); // Initialize auth state
    if (!auth.isAdmin()) {
      toast.error('Unauthorized access');
      router.push('/journal');
    }
  }, [router]);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `journal/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('the-house')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/${filePath}`;
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let featuredImageUrl = null;
      if (formData.featuredImage) {
        featuredImageUrl = await uploadImageToSupabase(formData.featuredImage);
        if (!featuredImageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      await api.createPost({
        title: formData.title,
        content: formData.content,
        featuredImageUrl,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });

      toast.success('Post created successfully!');
      router.push('/journal');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData((prev: FormData) => ({
        ...prev,
        featuredImage: file
      }));
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/journal');
  };

  // If not authenticated, don't render the form
  if (!auth.isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif">Upload Blog Post</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: FormData) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: FormData) => ({ ...prev, content: e.target.value }))}
              className="min-h-[300px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image (Max 5MB)</Label>
            <Input
              id="featuredImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-8" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Blog Post'}
          </Button>
        </form>
      </div>
    </div>
  );
} 