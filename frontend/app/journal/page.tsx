"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Share2, Copy, MessageCircle, Linkedin, Twitter, Facebook, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content?: string;
  featured_image_url?: string;
  gallery?: string[];
  featured_image_base64?: string;
  gallery_base64?: string[];
  created_at: string;
  updated_at?: string;
}

export default function JournalPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For mobile carousel
  const [navigating, setNavigating] = useState(false); // For loading animation
  const router = useRouter();

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Optimize query: Only fetch needed fields and limit to 10 posts for marquee
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug, featured_image_base64, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching posts:", error);
          throw error;
        }

        console.log("Fetched journal posts:", data?.length || 0);
        setPosts(data || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const stripHtmlAndTruncate = (html: string, maxLength: number = 150): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate and add ellipsis
    return textContent.length > maxLength 
      ? textContent.slice(0, maxLength) + '...'
      : textContent;
  };

  // Share functionality
  const getPostUrl = (post: BlogPost): string => {
    // Always use production domain for sharing (even in development)
    // This ensures shared links always point to the live site
    const baseUrl = 'https://emiliobeaufort.com';
    return `${baseUrl}/journal/${post.slug}`;
  };

  const copyToClipboard = async (post: BlogPost) => {
    try {
      const url = getPostUrl(post);
      
      // Check if modern Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      setCopiedPostId(post.id);
      toast.success("Link copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedPostId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link");
    }
  };

  const shareOnWhatsApp = (post: BlogPost) => {
    const url = getPostUrl(post);
    const text = `Check out this blog post: ${post.title}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnLinkedIn = (post: BlogPost) => {
    const url = getPostUrl(post);
    const summary = stripHtmlAndTruncate(post.content || '', 200);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(summary)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareOnTwitter = (post: BlogPost) => {
    const url = getPostUrl(post);
    const text = `Check out: ${post.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = (post: BlogPost) => {
    const url = getPostUrl(post);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleNativeShare = async (post: BlogPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: stripHtmlAndTruncate(post.content || '', 100),
          url: getPostUrl(post),
        });
      } catch (error) {
        console.error("Native share failed:", error);
        // Fallback to copy to clipboard
        copyToClipboard(post);
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(post);
    }
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

        {/* Responsive Journal Cards */}
        <div className="mt-8">
          {posts.length > 0 ? (
            <>
              {/* Mobile Carousel */}
              <div className="block sm:hidden w-full flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <motion.div
                    key={posts[currentIndex]?.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-80"
                  >
                    <Link href={`/journal/${posts[currentIndex].slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer group h-full">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          {posts[currentIndex].featured_image_base64 ? (
                            <img
                              src={posts[currentIndex].featured_image_base64}
                              alt={posts[currentIndex].title || 'Blog post image'}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-gray-500">No image available</p>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-xl mb-1 group-hover:text-gray-900 transition-colors line-clamp-2">
                            {posts[currentIndex].title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            Click to read this fascinating article and discover more insights.
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            {new Date(posts[currentIndex].created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <div className="space-y-3">
                            <Button 
                              className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                              variant="default"
                              disabled={navigating}
                              onClick={async (e) => {
                                e.preventDefault();
                                setNavigating(true);
                                // Add a slight delay to show the spinner if navigation is fast
                                setTimeout(() => {
                                  router.push(`/journal/${posts[currentIndex].slug}`);
                                }, 200);
                              }}
                            >
                              {navigating ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                  Loading...
                                </span>
                              ) : (
                                'Read in Detail'
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 w-14 rounded-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 group"
                    onClick={() => router.push('/journal/gallery')}
                  >
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2 font-medium">Show More</p>
              </div>

              {/* Desktop/Tablet Marquee (unchanged) */}
              <div className="hidden sm:flex items-center gap-6">
                {/* Marquee Container */}
                <div className="flex-1 overflow-hidden">
                  <div 
                    className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden" 
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none'
                    }}
                  >
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-shrink-0 w-80"
                      >
                        <Link href={`/journal/${post.slug}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer group h-full">
                            <div className="relative aspect-[4/3] bg-gray-100">
                              {post.featured_image_base64 ? (
                                <img
                                  src={post.featured_image_base64}
                                  alt={post.title || 'Blog post image'}
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  decoding="async"
                                  onError={e => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <p className="text-gray-500">No image available</p>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-semibold text-xl mb-1 group-hover:text-gray-900 transition-colors line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                Click to read this fascinating article and discover more insights.
                              </p>
                              <p className="text-xs text-gray-500 mb-4">
                                {new Date(post.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <div className="space-y-3">
                                <Button 
                                  className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                                  variant="default"
                                  disabled={navigating}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    setNavigating(true);
                                    // Add a slight delay to show the spinner if navigation is fast
                                    setTimeout(() => {
                                      router.push(`/journal/${post.slug}`);
                                    }, 200);
                                  }}
                                >
                                  {navigating ? (
                                    <span className="flex items-center gap-2">
                                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                      Loading...
                                    </span>
                                  ) : (
                                    'Read in Detail'
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Show More Button with Big Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex-shrink-0"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-20 w-20 rounded-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 group"
                    onClick={() => {
                      // Navigate to the blog gallery page
                      router.push('/journal/gallery');
                    }}
                  >
                    <ArrowRight className="h-8 w-8 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-2 font-medium">Show More</p>
                </motion.div>
              </div>
            </>
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
