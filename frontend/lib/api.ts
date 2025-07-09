// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

import { supabase } from './supabaseClient';
import { getProducts as getSupabaseProducts, Product as SupabaseProduct } from './supabase';

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
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
}

export interface HomeData {
  cosmetics: Product[];
  hair: Product[];
  posts: Post[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  featuredImageUrl: string;
  gallery: string[];
  slug: string;
}

// Mapping function to convert Supabase Product to API Product format
const mapSupabaseProductToAPIProduct = (supabaseProduct: SupabaseProduct): Product => {
  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    description: supabaseProduct.description || '',
    price: supabaseProduct.price || 0,
    category: supabaseProduct.category === 'cosmetics' ? 'COSMETICS' : 'HAIR',
    imageUrl: supabaseProduct.main_image_url || '',
    gallery: supabaseProduct.gallery_urls || [],
    isSoldOut: !supabaseProduct.in_stock,
    tags: [],
    createdAt: supabaseProduct.created_at || new Date().toISOString(),
    updatedAt: supabaseProduct.updated_at || new Date().toISOString(),
  };
};

// Products API - Using real Supabase functions instead of the old table structure
export async function getProducts(): Promise<Product[]> {
  const supabaseProducts = await getSupabaseProducts();
  return supabaseProducts.map(mapSupabaseProductToAPIProduct);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabaseProducts = await getSupabaseProducts();
  const targetCategory = category === 'COSMETICS' ? 'cosmetics' : 'hair-extension';
  return supabaseProducts
    .filter(product => product.category === targetCategory)
    .map(mapSupabaseProductToAPIProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
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
  return data || [];
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
    return await getProducts();
  },

  async getProductsByCategory(category: 'COSMETICS' | 'HAIR'): Promise<Product[]> {
    return await getProductsByCategory(category);
  },

  async getProduct(id: string): Promise<Product> {
    return await getProduct(id);
  },

  async getPosts(): Promise<Post[]> {
    return await getPosts();
  },

  async getPost(slug: string): Promise<Post> {
    const posts = await getPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) throw new Error('Post not found');
    return post;
  },

  async createPost(data: CreatePostDto): Promise<Post> {
    return await createPost(data);
  },

  async getHomeData(): Promise<HomeData> {
    const [cosmetics, hair, posts] = await Promise.all([
      getProductsByCategory('COSMETICS'),
      getProductsByCategory('HAIR'),
      getPosts()
    ]);
    
    return {
      cosmetics,
      hair,
      posts
    };
  },

  async submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<PartnershipInquiry> {
    await submitPartnershipInquiry(data);
    return {
      id: '1',
      ...data,
      createdAt: new Date().toISOString()
    };
  },
}; 