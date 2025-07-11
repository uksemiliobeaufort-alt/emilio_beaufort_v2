"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Share2, Copy, MessageCircle, Linkedin, Twitter, Facebook, Check, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery?: string[];
  featured_image_base64?: string;
  gallery_base64?: string[];
  created_at: string;
  updated_at?: string;
}

export default function BlogGalleryPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Pagination settings
  const postsPerPage = 4;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          throw error;
        }

        console.log("Fetched all blog posts:", data?.length || 0);
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
    const baseUrl = 'https://emilio-beaufort.vercel.app';
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
    const summary = stripHtmlAndTruncate(post.content, 200);
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

  const handleBackToJournal = () => {
    router.push('/#journal');
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={handleBackToJournal}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Journal
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
            Blog Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our complete collection of stories, insights, and perspectives. Dive deep into the world of style, culture, and the pursuit of excellence.
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="mt-8">
          {posts.length > 0 ? (
            <>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {currentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/journal/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        {post.featured_image_base64 ? (
                          <img
                            src={post.featured_image_base64}
                            alt={post.title || 'Blog post image'}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error(`Image failed to load for post: ${post.title}`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-gray-500">No image available</p>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-base mb-2 group-hover:text-gray-900 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
                          {post.content ? stripHtmlAndTruncate(post.content, 100) : 'No content available'}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="space-y-3 mt-auto">
                          <Button 
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                            variant="default"
                            size="sm"
                          >
                            Read Article
                          </Button>
                          
                          {/* Share Section */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Share:</span>
                            <div className="flex items-center gap-1">
                              {/* Copy Link Button */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  copyToClipboard(post);
                                }}
                                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                title="Copy link"
                              >
                                {copiedPostId === post.id ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 text-gray-600" />
                                )}
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  shareOnWhatsApp(post);
                                }}
                                className="p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                title="Share on WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                              </button>

                              {/* LinkedIn */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  shareOnLinkedIn(post);
                                }}
                                className="p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                title="Share on LinkedIn"
                              >
                                <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                              </button>

                              {/* Twitter */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  shareOnTwitter(post);
                                }}
                                className="p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                title="Share on Twitter"
                              >
                                <Twitter className="h-3.5 w-3.5 text-blue-400" />
                              </button>

                              {/* Facebook */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  shareOnFacebook(post);
                                }}
                                className="p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                title="Share on Facebook"
                              >
                                <Facebook className="h-3.5 w-3.5 text-blue-700" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-center items-center gap-4 mt-12"
                >
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageClick(page)}
                        className={`w-10 h-10 ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Current Page Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-center mt-8 pt-6 border-t border-gray-200"
              >
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(endIndex, posts.length)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{posts.length}</span> blog posts
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Page {currentPage} of {totalPages}
                </p>
              </motion.div>
            </>
          ) : (
            <div className="text-center text-gray-600 mt-10">
              <p className="text-xl mb-4">No blog posts available yet.</p>
              <Button
                variant="outline"
                onClick={handleBackToJournal}
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Back to Journal
              </Button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
} 