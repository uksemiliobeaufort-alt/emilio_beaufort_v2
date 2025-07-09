// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { supabase } from './supabaseClient';

export type ProductCategory = 'COSMETICS' | 'HAIR';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  gallery: string[];
  isSoldOut: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  featuredImageUrl: string;
  gallery: string[];
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
  inquiryType: string;
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
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
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
  gallery?: string[];
  slug: string;
}

const getSupabaseImageUrl = (filename: string) =>
  `https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/product-images/${filename}`;

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Premium Grooming Kit',
    description: 'Complete luxury grooming kit with everything you need for a perfect look.',
    price: 299.99,
    imageUrl: getSupabaseImageUrl('cosmetic_kit1.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Radiant Face Cream',
    description: 'A revitalizing cream for glowing, healthy skin. Infused with natural botanicals.',
    price: 89.99,
    imageUrl: getSupabaseImageUrl('cosmetic1.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Luxury Face Cream',
    description: 'Ultra-smooth face cream for soft, smooth skin every time.',
    price: 39.99,
    imageUrl: getSupabaseImageUrl('cosmetic2.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Hydrating Moisturizer',
    description: 'Deeply hydrates and nourishes for soft, supple skin.',
    price: 85,
    imageUrl: getSupabaseImageUrl('cosmetic3.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: 'Gentle Face Cleanser',
    description: 'Mild, effective cleanser that removes impurities without drying the skin.',
    price: 29.99,
    imageUrl: getSupabaseImageUrl('cosmetic7.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: 'Matte Lipstick',
    description: 'Intense color payoff with a soft, hydrating matte finish.',
    price: 60,
    imageUrl: getSupabaseImageUrl('cosmetic8.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex1',
    name: 'Luminous Silk Foundation',
    description: 'A weightless, buildable foundation for a radiant, flawless finish.',
    price: 120,
    imageUrl: getSupabaseImageUrl('cosmetic5.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex2',
    name: 'Matte Lipstick',
    description: 'Intense color payoff with a soft, hydrating matte finish.',
    price: 60,
    imageUrl: getSupabaseImageUrl('cosmetic9.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex3',
    name: 'Radiance Glow Cream',
    description: 'Revitalize your skin with our luxurious, illuminating Cream.',
    price: 95,
    imageUrl: getSupabaseImageUrl('cosmetic6.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex4',
    name: 'Radiance Sunscreen',
    description: 'Revitalize your skin with our luxurious, illuminating sunscreen.',
    price: 95,
    imageUrl: getSupabaseImageUrl('cosmetic10.jpg'),
    isSoldOut: false,
    category: 'COSMETICS',
    gallery: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h1',
    name: 'Luxury Hair Extension',
    description: 'Premium 100% human hair extension for instant volume and length.',
    price: 2499.00,
    imageUrl: getSupabaseImageUrl('hair1.jpg'),
    isSoldOut: false,
    category: 'HAIR',
    gallery: [],
    tags: ['Extension'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h2',
    name: 'Clip-In Hair Extension',
    description: 'Easy-to-use clip-in extensions for a natural look and feel.',
    price: 1799.00,
    imageUrl: getSupabaseImageUrl('hair2.jpg'),
    isSoldOut: false,
    category: 'HAIR',
    gallery: [],
    tags: ['Clip-In', 'Extension'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'h3',
    name: 'Wavy Hair Extension',
    description: 'Soft, wavy hair extension for a glamorous, voluminous style.',
    price: 2199.00,
    imageUrl: getSupabaseImageUrl('hair3.jpg'),
    isSoldOut: false,
    category: 'HAIR',
    gallery: [],
    tags: ['Wavy', 'Extension'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  cosmetics: [],
  hair: [],
  posts: MOCK_POSTS
};

// Products API
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Blog Post API Functions
export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, post: Partial<Post>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Partnership Inquiries API
export async function submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<void> {
  const { error } = await supabase
    .from('partnership_inquiries')
    .insert([data]);

  if (error) throw error;
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
    const product = await getProducts().then(products => products.find(p => p.id === id));
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