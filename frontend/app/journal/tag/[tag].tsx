/*import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  tags?: string[];
}

const POSTS_PER_PAGE = 6;

export default function TagArchivePage({ params }: { params: { tag: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const tag = decodeURIComponent(params.tag);

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
            tags: d.tags || [],
          };
        });
        // Filter by tag
        firebasePosts = firebasePosts.filter(post => post.tags && post.tags.includes(tag));
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
  }, [tag]);

  // Pagination logic
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Posts tagged with <span className="text-blue-600">#{tag}</span></h1>

        {/* Header Ad *
        <BlogHeaderAd />

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/journal/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg cursor-pointer group transition">
                    <div className="relative aspect-[4/3]">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                          <span>No image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-xl mb-1 group-hover:text-gray-900 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                        {post.content?.replace(/<[^>]+>/g, '').slice(0, 150)}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Content Ad after posts *
            <BlogContentAd />

            {/* Pagination Controls *
            <div className="flex justify-center gap-2 mb-8">
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
          <div className="text-center text-gray-500">No posts found for this tag.</div>
        )}
      </div>
    </div>
  );
} */

  "use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import PostCard from './PostCard';        // reusable post card component
import Pagination from './Pagination';    // reusable pagination component
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from '@/components/GoogleAdSense';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

const POSTS_PER_PAGE = 6;

export default function TagArchivePage({ params }: { params: { tag: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const tag = decodeURIComponent(params.tag);

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
            tags: d.tags || [],
          };
        });
        // Filter posts by the selected tag
        firebasePosts = firebasePosts.filter(post => post.tags && post.tags.includes(tag));
        // Sort posts by created_at descending
        firebasePosts = firebasePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPosts(firebasePosts);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    setCurrentPage(1);  // Reset to first page when tag changes
  }, [tag]);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Posts tagged with <span className="text-blue-600">#{tag}</span>
        </h1>

        {/* Header Ad */}
        <BlogHeaderAd />

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {paginatedPosts.map(post => (
                <PostCard key={post.id} post={post} />//------>post card<------//
              ))}
            </div>

            {/* Content Ad */}
            <BlogContentAd />

            {/* Pagination Controls */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

            {/* Footer Ad */}
            <BlogFooterAd />
          </>
        ) : (
          <div className="text-center text-gray-500">No posts found for this tag.</div>
        )}
      </div>
    </div>
  );
}
