const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  category: 'COSMETICS' | 'HAIR';
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImageUrl: string;
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

// Products API
export async function getProducts(category?: 'COSMETICS' | 'HAIR'): Promise<Product[]> {
  const url = category 
    ? `${API_BASE_URL}/products?category=${category}`
    : `${API_BASE_URL}/products`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function getFeaturedProduct(): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/featured`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

// Posts API
export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const response = await fetch(`${API_BASE_URL}/posts/${slug}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

// Partnership Inquiries API
export async function submitPartnershipInquiry(data: CreatePartnershipInquiryDto): Promise<PartnershipInquiry> {
  const response = await fetch(`${API_BASE_URL}/partnership-inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit partnership inquiry');
  }
  return response.json();
}

export async function submitCareerApplication(data: CareerApplication): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/careers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit career application');
  }
}

export async function submitWaitlistSignup(data: WaitlistSignup): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit waitlist signup');
  }
}

export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductsByCategory(category: 'COSMETICS' | 'HAIR'): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async getPost(slug: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  async getHomeData(): Promise<HomeData> {
    const response = await fetch(`${API_BASE_URL}/home-data`);
    if (!response.ok) throw new Error('Failed to fetch home data');
    return response.json();
  },
}; 