"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import HtmlContent from "@/components/ui/HtmlContent";
import Head from "next/head";
import Link from "next/link";
 

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  keywords?: string[];
  tags?: string[];
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function BlogPostPage({ params }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [slug, setSlug] = useState<string>('');

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

  // Process journal images with WebP conversion - with fallback strategy
  const processJournalImageUrl = (originalUrl: string | undefined): string => {
    if (!originalUrl) return defaultImageUrl;
    
    // For Firebase images, try WebP conversion with fallback
    if (originalUrl.includes('firebasestorage.googleapis.com') && process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL) {
      try {
        const url = new URL(originalUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
        
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const processorUrl = process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL;
          // Try WebP conversion with fallback to original if needed
          const webpUrl = `${processorUrl}?path=${encodeURIComponent(filePath)}&format=webp&quality=85&force=true`;
          
          console.log('📰 Detail WebP URL generated:', {
            original: originalUrl,
            webp: webpUrl
          });
          
          return webpUrl;
        }
      } catch (error) {
        console.error('❌ WebP conversion failed:', error);
        // Fallback to original image if WebP conversion fails
        return originalUrl;
      }
    }
    
    // For non-Firebase images, return original
    return originalUrl;
  };

  // Simplified image handling - removed complex validation functions

  const fallbackImages = [
    '/default-image.jpg',
    'https://via.placeholder.com/800x450/cccccc/666666?text=Image+Unavailable',
    'https://via.placeholder.com/800x450/f0f0f0/999999?text=No+Image'
  ];

  // Simplified image loading - no need for complex Firebase URL generation
  // The processJournalImageUrl function handles WebP conversion

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
      } catch (error) {
        console.error("Failed to resolve params:", error);
      }
    };

    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setLoading(true);
      // Reset image states when fetching new post
      setImageError(false);
      setImageLoading(true);
      
      try {
        const q = query(collection(firestore, 'blog_posts'));
        const querySnapshot = await getDocs(q);
        const firebasePosts: BlogPost[] = querySnapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || '',
            slug: d.slug || '',
            content: d.content || '',
            featured_image_url: d.featured_image_url || '',
            gallery_urls: d.gallery_urls || [],
            created_at: d.created_at && d.created_at.toDate ? d.created_at.toDate().toISOString() : (d.created_at || new Date().toISOString()),
            keywords: d.keywords || [],
            tags: d.tags || [],
          };
        });
        const found = firebasePosts.find(p => p.slug === slug);
        setPost(found || null);
      } catch (error) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Reset image state when post changes
  useEffect(() => {
    if (post) {
      setImageError(false);
      setImageLoading(true);
      setImageRetryCount(0);
      setCurrentImageUrl('');
    }
  }, [post]);

  // Simplified image loading - removed complex timeout logic

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    console.error('❌ Image failed to load:', img.src);
    
    // Retry logic: try original image if WebP fails
    if (imageRetryCount === 0 && post?.featured_image_url && img.src.includes('format=webp')) {
      console.log('🔄 Retrying with original image...');
      setImageRetryCount(1);
      setCurrentImageUrl(post.featured_image_url);
      return;
    }
    
    // Final fallback to default image
    console.log('🔄 Using default image as final fallback');
    setImageError(true);
    setImageLoading(false);
    setCurrentImageUrl(defaultImageUrl);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', currentImageUrl);
    setImageError(false);
    setImageLoading(false);
  };

  const getPostImage = (post: BlogPost) => {
    if (currentImageUrl) {
      return currentImageUrl;
    }
    
    // Try WebP first, then fallback to original
    const webpUrl = processJournalImageUrl(post.featured_image_url);
    setCurrentImageUrl(webpUrl);
    return webpUrl;
  };

  const handleBack = () => {
    // Proper redirection to journal section with hash navigation
    router.push('/#journal');
  };

  // Removed complex test function to simplify image loading

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

  // SEO helpers
  const getDescription = (html: string, maxLength = 160) => {
    if (!html) return '';
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : { innerHTML: html, textContent: '' };
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || '';
    return textContent.length > maxLength ? textContent.slice(0, maxLength) + '...' : textContent;
  };
  const metaDescription = getDescription(post.content);
  const metaKeywords = [
    ...(post.keywords || []),
    ...(post.tags || [])
  ].join(', ');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{post.title} | Emilio Beaufort Journal</title>
        <meta name="description" content={metaDescription} />
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={post.featured_image_url || '/default-image.jpg'} />
      </Head>
      {/* <Navbar /> */}
      <main className="pt-32 md:pt-36 lg:pt-40 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">{post.title}</h1>
              {/* Only show tags visually, not keywords */}
              {(post.tags && post.tags.length > 0) && (
                <></> // Remove tags from the top
              )}
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            

            <div className="relative w-full aspect-video rounded-md overflow-hidden mb-10">
              {!imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading image...</p>
                      </div>
                    </div>
                  )}
                  {/* Use OptimizedImage for WebP conversion */}
                  <img
                    src={processJournalImageUrl(post.featured_image_url)}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Image unavailable</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-12">
              <HtmlContent 
                content={post.content} 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed" 
              />
            </div>

            

            {/* Show tags at the bottom as clickable links, just above the back button */}
            {(post.tags && post.tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, idx) => (
                  <Link key={idx} href={`/journal/tag/${encodeURIComponent(tag)}`}>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition">#{tag}</span>
                  </Link>
                ))}
              </div>
            )}

            <button 
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300 group mt-8"
            >
              <span className="mr-2 text-sm font-medium">←</span>
              <span className="text-sm font-medium group-hover:underline">Back to Journal</span>
            </button>

            {/* Removed debug button to simplify image loading */}
            
          </article>
        </div>
      </main>
    </div>
  );
}
