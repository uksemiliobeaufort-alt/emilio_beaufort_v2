import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

interface BlogPost {
  slug: string;
  updatedAt?: string | Date;
  coverImage?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.emiliobeaufort.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partnerships`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/waitlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/philosophy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch blogs dynamically from API route
  const res = await fetch(`${baseUrl}/api/sitemap-data`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  const blogs: BlogPost[] = await res.json();

  const dynamicBlogPages: MetadataRoute.Sitemap = blogs.map((data) => ({
    url: `${baseUrl}/journal/${data.slug}`,
    lastModified: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
    images: data.coverImage ? [data.coverImage] : [],
  }));

  return [...staticPages, ...dynamicBlogPages];
}
