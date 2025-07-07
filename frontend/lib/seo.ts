import type { Metadata } from 'next';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  author?: string;
}

const SITE_CONFIG = {
  name: 'Emilio Beaufort',
  description: 'Luxury grooming products and philosophy for the discerning gentleman. Premium skincare, shaving, and grooming essentials.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://emiliobeaufort.com',
  logo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/EM.jpg`,
  favicon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/favicon.ico`,
  twitter: '@emiliobeaufort',
  keywords: [
    'luxury grooming',
    'men\'s skincare',
    'premium shaving',
    'grooming products',
    'luxury cosmetics',
    'men\'s beauty',
    'grooming essentials',
    'premium skincare',
    'luxury lifestyle',
    'grooming kit'
  ]
};

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  path = '',
  type = 'website',
  publishedTime,
  author
}: SEOConfig): Metadata {
  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const url = `${SITE_CONFIG.url}${path}`;
  const ogImage = image || SITE_CONFIG.logo;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords].join(', ');

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    
    // Open Graph
    openGraph: {
      type: type as any,
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
    },

    // Twitter Cards
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitter,
      site: SITE_CONFIG.twitter,
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // Icons
    icons: {
      icon: SITE_CONFIG.favicon,
      shortcut: SITE_CONFIG.favicon,
      apple: SITE_CONFIG.favicon,
    },

    // Verification (add your verification codes here)
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
    },
  };
}

// Product-specific metadata
export function generateProductMetadata(product: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}) {
  return generateMetadata({
    title: `${product.name} - Premium ${product.category}`,
    description: `${product.description} Premium luxury grooming product priced at $${product.price}. Free shipping on orders over $100.`,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      'luxury',
      'premium',
      'grooming',
      'skincare'
    ],
    image: product.imageUrl,
    path: `/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'product',
  });
}

// Blog post metadata
export function generateBlogMetadata(post: {
  title: string;
  excerpt?: string;
  content: string;
  slug: string;
  featuredImageUrl?: string;
  createdAt: string;
  author?: string;
}) {
  const description = post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...';
  
  return generateMetadata({
    title: post.title,
    description,
    keywords: [
      'grooming tips',
      'luxury lifestyle',
      'men\'s grooming',
      'skincare advice',
      'grooming guide'
    ],
    image: post.featuredImageUrl,
    path: `/journal/${post.slug}`,
    type: 'article',
    publishedTime: post.createdAt,
    author: post.author || 'Emilio Beaufort',
  });
}

// JSON-LD structured data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@emiliobeaufort.com',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://www.linkedin.com/company/emiliobeaufort',
      'https://instagram.com/emiliobeaufort',
      'https://twitter.com/emiliobeaufort'
    ]
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_CONFIG.name
    },
    category: product.category,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name
      }
    }
  };
}

export function generateArticleSchema(post: {
  title: string;
  content: string;
  slug: string;
  featuredImageUrl?: string;
  createdAt: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    image: post.featuredImageUrl || SITE_CONFIG.logo,
    author: {
      '@type': 'Person',
      name: post.author || 'Emilio Beaufort'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: SITE_CONFIG.logo
      }
    },
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    mainEntityOfPage: `${SITE_CONFIG.url}/journal/${post.slug}`
  };
}

export { SITE_CONFIG }; 