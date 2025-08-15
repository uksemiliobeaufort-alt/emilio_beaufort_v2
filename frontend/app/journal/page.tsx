"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { useRouter } from "next/navigation";
import { Share2, Copy, MessageCircle, Linkedin, Twitter, Facebook, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from "@/components/GoogleAdSense";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string;
}

export default function JournalPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // For mobile carousel
  const [navigating, setNavigating] = useState(false); // For loading animation
  const router = useRouter();

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(firestore, 'blog_posts'));
        const querySnapshot = await getDocs(q);
        let firebasePosts: BlogPost[] = querySnapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || '',
            slug: d.slug || '',
            content: d.content || '',
            featured_image_url: d.featured_image_url || '',
            gallery_urls: d.gallery_urls || [],
            created_at: d.created_at && d.created_at.toDate ? d.created_at.toDate().toISOString() : (d.created_at || new Date().toISOString()),
            updated_at: d.updated_at && d.updated_at.toDate ? d.updated_at.toDate().toISOString() : (d.updated_at || null),
          };
        });
        // Sort by created_at descending and limit to 10
        firebasePosts = firebasePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
        setPosts(firebasePosts);
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
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-[#f5f5f5] via-white to-[#fafafa]">
        <div className="container-premium mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-premium mb-6 leading-tight pb-2">
              Hair Extension Blog & Real Stories
            </h1>
            <p className="body-premium text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Discover the world of temple hair and hair extensions—real stories, expert tips, and inspiration from the Emilio Beaufort community. Explore our blog for honest advice, transformations, and everything you need to feel confident and beautiful.
            </p>
          </div>

          {/* Header Ad */}
          <BlogHeaderAd />

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
                            {posts[currentIndex].featured_image_url ? (
                              <img
                                src={posts[currentIndex].featured_image_url}
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
                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">{stripHtmlAndTruncate(posts[currentIndex].content || '', 150)}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              {new Date(posts[currentIndex].created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            {/* Share Row */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-600 font-medium">Share it:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  title="Share on WhatsApp"
                                  onClick={e => { e.preventDefault(); shareOnWhatsApp(posts[currentIndex]); }}
                                  className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  type="button"
                                  title="Share on LinkedIn"
                                  onClick={e => { e.preventDefault(); shareOnLinkedIn(posts[currentIndex]); }}
                                  className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors"
                                >
                                  <Linkedin className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  type="button"
                                  title="Share on Twitter"
                                  onClick={e => { e.preventDefault(); shareOnTwitter(posts[currentIndex]); }}
                                  className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors"
                                >
                                  <Twitter className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  type="button"
                                  title="Share on Facebook"
                                  onClick={e => { e.preventDefault(); shareOnFacebook(posts[currentIndex]); }}
                                  className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  <Facebook className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  type="button"
                                  title="Copy Link"
                                  onClick={e => { e.preventDefault(); copyToClipboard(posts[currentIndex]); }}
                                  className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                                >
                                  {copiedPostId === posts[currentIndex].id ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4 text-gray-700" />}
                                </button>
                              </div>
                            </div>
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

                {/* Desktop/Tablet Marquee */}
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
                                {post.featured_image_url ? (
                                  <img
                                    src={post.featured_image_url}
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
                                <p className="text-gray-600 text-sm line-clamp-3 mb-3">{stripHtmlAndTruncate(post.content || '', 150)}</p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {new Date(post.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                {/* Share Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-gray-600 font-medium">Share it:</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      title="Share on WhatsApp"
                                      onClick={e => { e.preventDefault(); shareOnWhatsApp(post); }}
                                      className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                                    >
                                      <MessageCircle className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Share on LinkedIn"
                                      onClick={e => { e.preventDefault(); shareOnLinkedIn(post); }}
                                      className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors"
                                    >
                                      <Linkedin className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Share on Twitter"
                                      onClick={e => { e.preventDefault(); shareOnTwitter(post); }}
                                      className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors"
                                    >
                                      <Twitter className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Share on Facebook"
                                      onClick={e => { e.preventDefault(); shareOnFacebook(post); }}
                                      className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                      <Facebook className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Copy Link"
                                      onClick={e => { e.preventDefault(); copyToClipboard(post); }}
                                      className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                                    >
                                      {copiedPostId === post.id ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4 text-gray-700" />}
                                    </button>
                                  </div>
                                </div>
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

                {/* Content Ad after marquee */}
                <BlogContentAd />
              </>
            ) : (
              <div className="text-center text-gray-600 mt-10">
                No blog posts yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
