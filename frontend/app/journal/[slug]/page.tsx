/*"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import HtmlContent from "@/components/ui/HtmlContent";
import Head from "next/head";
import Link from "next/link";
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from "@/components/GoogleAdSense";

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
  const [slug, setSlug] = useState<string>('');

  // Default placeholder image
  const defaultImageUrl = "/default-image.jpg";

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

  const handleImageError = () => {
    console.error('Failed to load post image');
    setImageError(true);
  };

  const getPostImage = (post: BlogPost) => {
    if (imageError) {
      return defaultImageUrl;
    }
    return post.featured_image_url || defaultImageUrl;
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
      {/* <Navbar /> *
      <main className="pt-32 md:pt-36 lg:pt-40 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">{post.title}</h1>
              {/* Only show tags visually, not keywords *
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

            {/* Header Ad 
            <BlogHeaderAd />

            <div className="relative w-full aspect-video rounded-md overflow-hidden mb-10">
              <Image
                src={getPostImage(post)}
                alt={post.title}
                 loading="lazy" //----> added this line 
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={handleImageError}
              />
            </div>

            <div className="mb-12">
              <HtmlContent 
                content={post.content} 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed" 
              />
            </div>

            {/* Content Ad after main content 
            <BlogContentAd />

            {/* Show tags at the bottom as clickable links, just above the back button 
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

            {/* Footer Ad 
            <BlogFooterAd />
          </article>
        </div>
      </main>
    </div>
  );
}
*/

"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import HtmlContent from "@/components/ui/HtmlContent";
import { BlogHeaderAd, BlogContentAd, BlogFooterAd } from "@/components/GoogleAdSense";
import { getDescription } from "./GetDescription";
import PostHeader from "./BlogPostHeader";
import PostImage from "./BlogPostImage";
import BackButton from "./BackButton";
import PostTags from "./BlogPostTags";

/*import PostHeader from "@/components/blog/PostHeader";
import PostImage from "@/components/blog/PostImage";
import PostTags from "@/components/blog/PostTags";
import BackButton from "@/components/ui/BackButton";
import { getDescription } from "@/utils/getDescription";*/

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
  const [slug, setSlug] = useState<string>('');

  const defaultImageUrl = "/default-image.jpg";

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
      try {
        const q = query(
          collection(firestore, 'blog_posts'),
          where('slug', '==', slug)
        );
        const querySnapshot = await getDocs(q);
        const doc = querySnapshot.docs[0];

        if (doc) {
          const d = doc.data();
          setPost({
            id: doc.id,
            title: d.title || '',
            slug: d.slug || '',
            content: d.content || '',
            featured_image_url: d.featured_image_url || '',
            gallery_urls: d.gallery_urls || [],
            created_at: d.created_at?.toDate?.().toISOString() || new Date().toISOString(),
            keywords: d.keywords || [],
            tags: d.tags || [],
          });
        } else {
          setPost(null);
        }
      } catch (error) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

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

  const imageUrl = imageError ? defaultImageUrl : post.featured_image_url || defaultImageUrl;
  const metaDescription = getDescription(post.content);
  const metaKeywords = [...(post.keywords || []), ...(post.tags || [])].join(', ');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{post.title} | Emilio Beaufort Journal</title>
        <meta name="description" content={metaDescription} />
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
      </Head>

      <main className="pt-32 md:pt-36 lg:pt-40 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <article>
            <PostHeader title={post.title} created_at={post.created_at} />

            <BlogHeaderAd />

            <PostImage src={imageUrl} alt={post.title} onError={() => setImageError(true)} />

            <div className="mb-12">
              <HtmlContent
                content={post.content}
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
              />
            </div>

            <BlogContentAd />

          
            {post.tags && post.tags.length > 0 && <PostTags tags={post.tags} />}


            <BackButton />

            <BlogFooterAd />
          </article>
        </div>
      </main>
    </div>
  );
}
