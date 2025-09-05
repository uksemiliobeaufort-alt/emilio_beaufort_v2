"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { firestore, getFirebaseStorageUrl, checkFirebaseStorageAccess } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import HtmlContent from "@/components/ui/HtmlContent";
// import Head from "next/head"; // Unused import - Next.js App Router doesn't use Head component
import Link from "next/link";
import { getSafeImageUrl } from "@/lib/utils";
 

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
  const [slug, setSlug] = useState<string>('');

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

  // Utility function to validate Firebase Storage URLs
  const isValidFirebaseUrl = (url: string): boolean => {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('firebasestorage.googleapis.com') && 
             urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Utility function to get a safe image URL
  const getSafeImageUrl = (url: string): string => {
    if (isValidFirebaseUrl(url)) {
      return url;
    }
    return defaultImageUrl;
  };

  // Function to determine if we should use Next.js Image or regular img tag
  const shouldUseNextImage = (url: string): boolean => {
    // Use regular img tag for Firebase Storage URLs to avoid optimization issues
    if (isValidFirebaseUrl(url)) {
      return false;
    }
    // Use Next.js Image for local images or other external URLs
    return true;
  };

  // Function to preload and validate image
  const preloadImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log('Image preloaded successfully:', url);
        resolve(true);
      };
      img.onerror = () => {
        console.error('Image preload failed:', url);
        resolve(false);
      };
      img.src = url;
    });
  };

  // Enhanced image loading with Firebase Storage URL generation
  const [imageFallbackIndex, setImageFallbackIndex] = useState(0);
  const [generatedFirebaseUrl, setGeneratedFirebaseUrl] = useState<string>('');
  const fallbackImages = [
    '/default-image.jpg',
    'https://via.placeholder.com/800x450/cccccc/666666?text=Image+Unavailable',
    'https://via.placeholder.com/800x450/f0f0f0/999999?text=No+Image'
  ];

  // Generate Firebase Storage URL when post changes
  useEffect(() => {
    if (post?.featured_image_url && isValidFirebaseUrl(post.featured_image_url)) {
      const generateUrl = async () => {
        try {
          console.log('Generating Firebase Storage URL for:', post.featured_image_url);
          
          // Extract the path from the Firebase Storage URL
          const url = new URL(post.featured_image_url);
          const path = url.pathname.split('/o/')[1]?.split('?')[0];
          
          if (path) {
            const decodedPath = decodeURIComponent(path);
            console.log('Extracted path:', decodedPath);
            
            const generatedUrl = await getFirebaseStorageUrl(decodedPath);
            if (generatedUrl) {
              console.log('Generated URL:', generatedUrl);
              setGeneratedFirebaseUrl(generatedUrl);
              
              // Check if the generated URL is accessible
              const isAccessible = await checkFirebaseStorageAccess(generatedUrl);
              console.log('URL accessible:', isAccessible);
              
              if (!isAccessible) {
                console.log('Generated URL not accessible, will use fallback');
                setImageError(true);
              }
            } else {
              console.log('Failed to generate URL, will use fallback');
              setImageError(true);
            }
          }
        } catch (error) {
          console.error('Error generating Firebase Storage URL:', error);
          setImageError(true);
        }
      };
      
      generateUrl();
    }
  }, [post?.featured_image_url]);

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
      setImageFallbackIndex(0); // Reset fallback index for new post
      
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

  // Add timeout mechanism for image loading
  useEffect(() => {
    if (imageLoading && post?.featured_image_url) {
      const timeout = setTimeout(() => {
        console.log('Image loading timeout, trying fallback');
        if (imageFallbackIndex < fallbackImages.length - 1) {
          setImageFallbackIndex(prev => prev + 1);
          setImageLoading(true);
        } else {
          setImageError(true);
          setImageLoading(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [imageLoading, post?.featured_image_url, imageFallbackIndex, fallbackImages.length]);

  const handleImageError = () => {
    console.error('Failed to load post image:', post?.featured_image_url);
    
    // Try next fallback image
    if (imageFallbackIndex < fallbackImages.length - 1) {
      console.log('Trying next fallback image');
      setImageFallbackIndex(prev => prev + 1);
      setImageLoading(true);
    } else {
      console.log('All fallbacks exhausted, showing final error state');
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', post?.featured_image_url);
    setImageError(false);
    setImageLoading(false);
  };

  const getPostImage = (post: BlogPost) => {
    if (imageError) {
      console.log('Using fallback image due to previous error');
      const fallbackUrl = fallbackImages[imageFallbackIndex] || fallbackImages[0];
      console.log('Selected fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
    
    const imageUrl = post.featured_image_url || '';
    console.log('Processing image URL:', imageUrl);
    
    if (isValidFirebaseUrl(imageUrl)) {
      // Use generated Firebase Storage URL if available
      if (generatedFirebaseUrl) {
        console.log('Using generated Firebase Storage URL:', generatedFirebaseUrl);
        return generatedFirebaseUrl;
      }
      
      console.log('No generated URL available, using original URL');
      return imageUrl;
    }
    
    console.log('URL is not valid Firebase Storage URL, using fallback');
    return fallbackImages[0];
  };

  const handleBack = () => {
    router.back();
  };

  const testFirebaseStorageAccess = async () => {
    if (!post?.featured_image_url) {
      console.log('No image URL to test');
      return;
    }

    console.log('=== Testing Firebase Storage Access ===');
    console.log('Original URL:', post.featured_image_url);
    
    try {
      // Test 1: Check if URL is valid Firebase Storage URL
      const isValid = isValidFirebaseUrl(post.featured_image_url);
      console.log('Is valid Firebase URL:', isValid);
      
      if (isValid) {
        // Test 2: Try to generate a new URL
        const url = new URL(post.featured_image_url);
        const path = url.pathname.split('/o/')[1]?.split('?')[0];
        
        if (path) {
          const decodedPath = decodeURIComponent(path);
          console.log('Extracted path:', decodedPath);
          
          const generatedUrl = await getFirebaseStorageUrl(decodedPath);
          console.log('Generated URL:', generatedUrl);
          
          if (generatedUrl) {
            // Test 3: Check if generated URL is accessible
            const isAccessible = await checkFirebaseStorageAccess(generatedUrl);
            console.log('Generated URL accessible:', isAccessible);
            
            // Test 4: Try to fetch the image
            try {
              const response = await fetch(generatedUrl);
              console.log('Fetch response status:', response.status);
              console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
            } catch (fetchError) {
              console.error('Fetch error:', fetchError);
            }
          }
        }
      }
      
      // Test 5: Try to access original URL directly
      try {
        const response = await fetch(post.featured_image_url, { method: 'HEAD' });
        console.log('Original URL response status:', response.status);
        console.log('Original URL headers:', Object.fromEntries(response.headers.entries()));
      } catch (fetchError) {
        console.error('Original URL fetch error:', fetchError);
      }
      
    } catch (error) {
      console.error('Test failed:', error);
    }
    
    console.log('=== End Test ===');
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
                  {/* Use regular img tag for Firebase Storage URLs to avoid Next.js Image optimization issues */}
                  <img
                    src={getPostImage(post)}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
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

            {/* Debug button for Firebase Storage testing */}
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={testFirebaseStorageAccess}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300 group mt-4 ml-8"
              >
                <span className="mr-2 text-sm font-medium">🔍</span>
                <span className="text-sm font-medium group-hover:underline">Test Firebase Storage</span>
              </button>
            )}
            
          </article>
        </div>
      </main>
    </div>
  );
}
