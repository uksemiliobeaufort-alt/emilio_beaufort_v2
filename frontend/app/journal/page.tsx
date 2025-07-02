"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, Post } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/supabase";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Get the default image URL from Supabase storage
  const defaultImageUrl = getImageUrl('the-house', 'Cosmetics Banner.jpeg');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleImageError = (postId: string) => {
    console.error(`Failed to load image for post ${postId}`);
    setImageError(prev => ({ ...prev, [postId]: true }));
  };

  const getPostImage = (post: Post) => {
    if (imageError[post.id]) {
      return defaultImageUrl;
    }
    
    if (post.featuredImageUrl) {
      // If the featuredImageUrl is from Supabase storage, use getImageUrl
      if (post.featuredImageUrl.includes('storage/v1/object')) {
        try {
          const url = new URL(post.featuredImageUrl);
          const path = url.pathname.split('/public/')[1];
          if (path) {
            return getImageUrl('the-house', decodeURIComponent(path));
          }
        } catch (error) {
          console.error('Error parsing featured image URL:', error);
        }
      }
      return post.featuredImageUrl;
    }
    
    return defaultImageUrl;
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
                        <Image
                          src={getPostImage(post)}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority
                          onError={() => handleImageError(post.id)}
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-xl mb-1 group-hover:text-gray-900 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.excerpt || post.content.slice(0, 100)}...
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
