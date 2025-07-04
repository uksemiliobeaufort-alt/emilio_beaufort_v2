"use client";

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from '@/lib/auth';
import { toast } from 'sonner';
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let featuredImageBase64 = null;
      if (formData.featuredImage) {
        featuredImageBase64 = await convertFileToBase64(formData.featuredImage);
      }

      const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { error } = await supabase.from('blog_posts').insert([
        {
          title: formData.title,
          slug: slug,
          content: formData.content,
          featured_image_base64: featuredImageBase64,
        }
      ]);

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

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