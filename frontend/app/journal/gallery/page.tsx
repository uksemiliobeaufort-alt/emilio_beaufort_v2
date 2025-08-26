/*"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Share2, Copy, MessageCircle, Linkedin, Twitter, Facebook, Check } from "lucide-react";
import { toast } from "sonner";
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from "@/components/GoogleAdSense";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string;
}

const POSTS_PER_PAGE = 6;

export default function BlogGalleryPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Share/copy helpers (adapted from journal page)
  const getPostUrl = (post: BlogPost): string => {
    const baseUrl = 'https://emiliobeaufort.com';
    return `${baseUrl}/journal/${post.slug}`;
  };
  const copyToClipboard = async (post: BlogPost) => {
    try {
      const url = getPostUrl(post);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
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
      setTimeout(() => { setCopiedPostId(null); }, 2000);
    } catch (error) {
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
    const summary = post.content?.replace(/<[^>]+>/g, '').slice(0, 200) || '';
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
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
        // Sort by created_at descending
        firebasePosts = firebasePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPosts(firebasePosts);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 mt-12">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 text-center">Gallery</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center">
            Explore our complete collection of stories, insights, and perspectives. Dive deep into the world of style, culture, and the pursuit of excellence.
          </p>
        </div>

        {/* Header Ad *
        <BlogHeaderAd />

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/journal/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer group h-full flex flex-col">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl mb-1 group-hover:text-gray-900 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2 flex-1">
                        {post.content?.replace(/<[^>]+>/g, '').slice(0, 150)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {/* Share Row *
                      <div className="flex items-center justify-between mb-3 mt-2">
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
                      <Button className="w-full bg-black text-white hover:bg-gray-800 mt-4">Read Article</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Content Ad after posts 
            <BlogContentAd />

            {/* Pagination Controls *
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>

            {/* Footer Ad *
            <BlogFooterAd />
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-xl mb-4">No blog posts available yet.</p>
            <Link href="/journal" className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white inline-block px-4 py-2 border rounded">
              Back to Journal
            </Link>
          </div>
        )}
      </div>
    </div>
  );}*/
  
  "use client";

import { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { toast } from "sonner";
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from "@/components/GoogleAdSense";
import Pagination from "./Pagination";
import BlogPostCard from "./BlogPostCard";
import { BlogPost } from "@/types/BlogPost";

/*interface BlogPost {------> it was created in under types/BlogPost.ts
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string;
}*/

const POSTS_PER_PAGE = 6;

export default function BlogGalleryPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(firestore, "blog_posts"));
        const querySnapshot = await getDocs(q);
        let firebasePosts: BlogPost[] = querySnapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || "",
            slug: d.slug || "",
            content: d.content || "",
            featured_image_url: d.featured_image_url || "",
            gallery_urls: d.gallery_urls || [],
            created_at: d.created_at?.toDate?.().toISOString?.() || new Date().toISOString(),
            updated_at: d.updated_at?.toDate?.().toISOString?.() || null,
          };
        });
        firebasePosts = firebasePosts.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setPosts(firebasePosts);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const copyToClipboard = async (post: BlogPost) => {
    const url = `https://emiliobeaufort.com/journal/${post.slug}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedPostId(post.id);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 mt-12">
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our complete collection of stories, insights, and perspectives.
          </p>
        </div>

        <BlogHeaderAd />

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onCopy={copyToClipboard}
                  copied={copiedPostId === post.id}
                />
              ))}
            </div>

            <BlogContentAd />

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <BlogFooterAd />
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-xl mb-4">No blog posts available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
