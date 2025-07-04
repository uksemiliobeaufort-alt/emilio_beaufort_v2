"use client";

import { useEffect, useState } from "react";
import { api, Post } from "@/lib/api";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getImageUrl } from "@/lib/supabase";

export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get the default image URL from Supabase storage - using existing image
  const defaultImageUrl = getImageUrl('the-house', 'Cosmetics Banner.jpeg');

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.slug) {
        setPost(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.getPost(params.slug as string);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.slug]);

  const handleImageError = () => {
    console.error('Failed to load post image');
    setImageError(true);
  };

  const getPostImage = (featuredImageUrl: string | null): string => {
    // If there's an error or no URL, return default
    if (imageError || !featuredImageUrl) {
      return defaultImageUrl || '';
    }
    
    try {
      // If it's a Supabase URL
      if (featuredImageUrl.includes('storage/v1/object')) {
        const url = new URL(featuredImageUrl);
        const path = url.pathname.split('/public/')[1];
        if (!path) return defaultImageUrl || '';
        
        const supabaseUrl = getImageUrl('the-house', decodeURIComponent(path));
        return supabaseUrl || defaultImageUrl || '';
      }
      
      // If it's an external URL
      return featuredImageUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return defaultImageUrl || '';
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  const imageUrl = getPostImage(post.featuredImageUrl);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 md:pt-36 lg:pt-40 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">{post.title}</h1>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {imageUrl && (
              <div className="relative w-full aspect-video rounded-md overflow-hidden mb-10">
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError}
                  unoptimized={!imageUrl.includes('supabase')}
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-12">
              {post.content}
            </div>

            <button 
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300 group"
            >
              <span className="mr-2 text-sm font-medium">←</span>
              <span className="text-sm font-medium group-hover:underline">Back to Journal</span>
            </button>
          </article>
        </div>
      </main>
    </div>
  );
}
