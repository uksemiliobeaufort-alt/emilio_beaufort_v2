// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Grooming Kit',
    description: 'Complete luxury grooming kit with everything you need for a perfect look.',
    price: 299.99,
    imageUrl: '/images/Cosmetics Banner.jpeg',
    isSoldOut: false,
    category: 'COSMETICS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Luxury Hair Care Set',
    description: 'Premium hair care collection for the ultimate hair treatment experience.',
    price: 199.99,
    imageUrl: '/images/Ormi Hair.webp',
    isSoldOut: false,
    category: 'HAIR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    slug: 'grooming-essentials',
    title: 'Essential Grooming Tips for Modern Men',
    content: 'Discover the secrets to maintaining a perfect grooming routine...',
    featuredImageUrl: '/images/Cosmetics Banner.jpeg',
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