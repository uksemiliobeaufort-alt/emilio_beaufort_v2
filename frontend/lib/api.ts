// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  category: 'COSMETICS' | 'FOUNDATIONS' | 'LIPSTICKS' | 'SERUM' | 'POWDERS' | 'Moisturizer';
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImageUrl: string | null;
  excerpt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  createdAt: string;
}

export interface CareerApplication {
  fullName: string;
  email: string;
  portfolio: string;
  coverLetter: string;
}

export interface WaitlistSignup {
  email: string;
}

export interface CreatePartnershipInquiryDto {
  name: string;
  email: string;
  company: string;
  message: string;
}

export interface HomeData {
  cosmetics: Product[];
  hair: Product[];
  posts: Post[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  featuredImageUrl: string | null;
  slug: string;
}

const getSupabaseImageUrl = (filename: string) =>
  `https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/product-images/${filename}`;

const MOCK_PRODUCTS: Product[] = [
  // {
  //   id: '1',
  //   name: 'Premium Grooming Kit',
  //   description: 'Complete luxury grooming kit with everything you need for a perfect look.',
  //   price: 299.99,
  //   imageUrl: getSupabaseImageUrl('skin_care.jpg'),
  //   isSoldOut: false,
  //   category: 'COSMETICS',
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString()
  // },
  {
    id: '1',
    name: 'Radiant Face Serum',
    description: 'A revitalizing serum for glowing, healthy skin. Infused with natural botanicals.',
    price: 89.99,
    imageUrl: getSupabaseImageUrl('face_serum.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Serum']
  },
  {
    id: '2',
    name: 'Luxury Shaving Cream',
    description: 'Ultra-smooth shaving cream for a close, comfortable shave every time.',
    price: 39.99,
    imageUrl: getSupabaseImageUrl('shaving_cream.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: []
  },
  {
    id: '3',
    name: 'Hydrating Moisturizer',
    description: 'Deeply hydrates and nourishes for soft, supple skin.',
    price: 85,
    imageUrl: getSupabaseImageUrl('moisturizer.jpg'),
    isSoldOut: false,
    category: 'Moisturizer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Moisturizer']
  },
  {
    id: '4',
    name: 'Gentle Face Cleanser',
    description: 'Mild, effective cleanser that removes impurities without drying the skin.',
    price: 29.99,
    imageUrl: getSupabaseImageUrl('cleanser.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: []
  },
  // {
  //   id: '6',
  //   name: 'Luxury Hair Care Set',
  //   description: 'Premium hair care collection for the ultimate hair treatment experience.',
  //   price: 199.99,
  //   imageUrl: getSupabaseImageUrl('hair_care.jpg'),
  //   isSoldOut: false,
  //   category: 'HAIR',
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString()
  // },
  {
    id: 'ex1',
    name: 'Luminous Silk Foundation',
    description: 'A weightless, buildable foundation for a radiant, flawless finish.',
    price: 120,
    imageUrl: getSupabaseImageUrl('cosmetics1.jpg'),
    isSoldOut: false,
    category: 'FOUNDATIONS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Foundations']
  },
  {
    id: 'ex2',
    name: 'Velvet Matte Lipstick',
    description: 'Intense color payoff with a soft, hydrating matte finish.',
    price: 60,
    imageUrl: getSupabaseImageUrl('cosmetics2.jpg'),
    isSoldOut: false,
    category: 'LIPSTICKS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Lipsticks']
  },
  {
    id: 'ex3',
    name: 'Radiance Glow Serum',
    description: 'Revitalize your skin with our luxurious, illuminating serum.',
    price: 95,
    imageUrl: getSupabaseImageUrl('cosmetics3.jpg'),
    isSoldOut: false,
    category: 'SERUM',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Serum']
  },
  {
    id: 'ex4',
    name: 'Opulent Eyeshadow Palette',
    description: 'A curated palette of rich, blendable shades for every occasion.',
    price: 110,
    imageUrl: getSupabaseImageUrl('cosmetics4.jpg'),
    isSoldOut: false,
    category: 'POWDERS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Powders']
  },
  {
    id: 'ex5',
    name: 'Silk Touch Setting Powder',
    description: 'Lock in your look with a silky, translucent powder for all-day perfection.',
    price: 80,
    imageUrl: getSupabaseImageUrl('cosmetics5.jpg'),
    isSoldOut: false,
    category: 'POWDERS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['Powders']
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    slug: 'grooming-essentials',
    title: 'Essential Grooming Tips for Modern Men',
    content: 'Discover the secrets to maintaining a perfect grooming routine...',
    featuredImageUrl: '/images/grooming_kit.jpeg',
    excerpt: 'A comprehensive guide to male grooming essentials.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_HOME_DATA: HomeData = {
  cosmetics: MOCK_PRODUCTS.filter(p => p.category === 'COSMETICS'),
  hair: MOCK_PRODUCTS.filter(p => p.category === 'HAIR'),
  posts: MOCK_POSTS
};

// Products API
export async function getProducts(category?: 'COSMETICS' | 'HAIR'): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return category ? MOCK_PRODUCTS.filter(p => p.category === category) : MOCK_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS.find(p => p.id === id) || null;
}

export async function getFeaturedProduct(): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_PRODUCTS[0] || null;
}

// Posts API
export async function getPosts(): Promise<Post[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_POSTS;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_POSTS.find(p => p.slug === slug) || null;
}

// Partnership Inquiries API
export async function submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<PartnershipInquiry> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: '1',
    ...data,
    createdAt: new Date().toISOString()
  };
}

export async function submitCareerApplication(data: CareerApplication): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Career application submitted:', data);
}

export async function submitWaitlistSignup(data: WaitlistSignup): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Waitlist signup submitted:', data);
}

export const api = {
  async getProducts(): Promise<Product[]> {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCTS;
  },

  async getProductsByCategory(category: 'COSMETICS' | 'HAIR'): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCTS.filter(p => p.category === category);
  },

  async getProduct(id: string): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async getPosts(): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_POSTS;
  },

  async getPost(slug: string): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const post = MOCK_POSTS.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
  },

  async createPost(data: CreatePostDto): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      excerpt: data.content.slice(0, 150) + '...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_POSTS.push(newPost);
    return newPost;
  },

  async getHomeData(): Promise<HomeData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_HOME_DATA;
  },

  async submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<PartnershipInquiry> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: '1',
      ...data,
      createdAt: new Date().toISOString()
    };
  },
};

export async function getSupabaseProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return (data || []).map((product: any) => ({
    ...product,
    imageUrl: `https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/product-images/${product.image_filename}`,
    tags: product.tags ? product.tags.split(',') : []
  }));
} 