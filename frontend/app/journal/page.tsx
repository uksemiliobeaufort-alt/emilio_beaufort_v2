"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, Post } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageStates, setImageStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  // Get the default image URL from Supabase storage
  const defaultImageUrl = getImageUrl('the-house', 'Cosmetics Banner.jpeg');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        // Pre-process image URLs
        const processedData = data.map(post => ({
          ...post,
          featuredImageUrl: processImageUrl(post.featuredImageUrl)
        }));
        setPosts(processedData);
        
        // Initialize loading state for each post
        const initialStates = processedData.reduce((acc, post) => {
          acc[post.id] = 'loading';
          return acc;
        }, {} as Record<string, 'loading' | 'loaded' | 'error'>);
        setImageStates(initialStates);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const processImageUrl = (url: string | null): string => {
    if (!url) return defaultImageUrl;

    try {
      // If it's already a full URL (including Supabase URLs), return as is
      if (url.startsWith('http')) {
        return url;
      }

      // For any other case, assume it's a filename for the-house bucket
      const filename = url.split('/').pop() || 'Cosmetics Banner.jpeg';
      const imageUrl = getImageUrl('the-house', 'Cosmetics Banner.jpeg');
      return imageUrl || defaultImageUrl;
    } catch (error) {
      return defaultImageUrl;
    }
  };

  const handleImageError = (postId: string) => {
    setImageStates(prev => ({ ...prev, [postId]: 'error' }));
  };

  const handleImageLoad = (postId: string) => {
    setImageStates(prev => ({ ...prev, [postId]: 'loaded' }));
  };

  const getPostImage = (post: Post): string => {
    return post.featuredImageUrl || defaultImageUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
            Journal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insights, stories, and the art of living well. Our journal explores the intersection of style, culture, and the pursuit of excellence.
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="mt-8">
          {posts.length > 0 ? (
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/journal/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition cursor-pointer group">
                      <div className="relative aspect-[4/3]">
                        {/* Loading placeholder */}
                        {imageStates[post.id] === 'loading' && (
                          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                        )}

                        {/* Main image */}
                        <Image
                          src={getPostImage(post)}
                          alt={post.title || 'Blog post image'}
                          fill
                          className={`object-cover transition-all duration-300 ${
                            imageStates[post.id] === 'loaded'
                              ? 'opacity-100 group-hover:scale-105' 
                              : 'opacity-0'
                          }`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={true}
                          onError={() => handleImageError(post.id)}
                          onLoad={() => handleImageLoad(post.id)}
                          quality={100}
                        />

                        {/* Error state */}
                        {imageStates[post.id] === 'error' && (
                          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <p className="text-gray-500">Image not available</p>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-xl mb-1 group-hover:text-gray-900 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.excerpt || (post.content && post.content.slice(0, 100) + '...') || 'No excerpt available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-4">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                            variant="default"
                          >
                            Read in Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 mt-10">
              No blog posts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
