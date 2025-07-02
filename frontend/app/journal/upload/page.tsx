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

interface FormData {
  title: string;
  content: string;
  featuredImage: File | null;
  excerpt: string;
}

export default function UploadBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    featuredImage: null,
    excerpt: ''
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPost({
        title: formData.title,
        content: formData.content,
        featuredImageUrl: formData.featuredImage ? URL.createObjectURL(formData.featuredImage) : null,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });

      toast.success('Post created successfully!');
      router.push('/journal');
    } catch {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev: FormData) => ({
        ...prev,
        featuredImage: e.target.files![0]
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
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: FormData) => ({ ...prev, excerpt: e.target.value }))}
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
            <Label htmlFor="featuredImage">Featured Image</Label>
            <Input
              id="featuredImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
            Upload Blog Post
          </Button>
        </form>
      </div>
    </div>
  );
} 