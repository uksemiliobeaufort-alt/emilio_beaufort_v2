import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with additional headers
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false // Don't persist the session
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);

export async function saveFeedback(data: {
  name?: string;
  email?: string;
  type: string;
  message: string;
}) {
  const { error } = await supabase.from("feedback").insert([data]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
}

// Product management functions
export interface Product {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  category: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  ingredients?: string;
  usage_instructions?: string;
  main_image_url?: string;
  gallery_images?: string[];
  metadata?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file: File, productId: string, imageType: 'main' | 'gallery' = 'gallery'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}/${imageType}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  // Extract the file path from the URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const fileName = pathParts.slice(-2).join('/'); // Get the last two parts (productId/filename)

  const { error } = await supabase.storage
    .from('product-images')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Helper function to get public URL for an image in a bucket
export const getImageUrl = (bucketName: string, path: string) => {
  if (!bucketName || !path) {
    console.error('Missing bucket name or path:', { bucketName, path });
    return '';
  }

  try {
    // Get the public URL directly from Supabase
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      console.error('No public URL returned for', { bucketName, path });
      return '';
    }

    // Ensure the URL is properly encoded
    const url = new URL(data.publicUrl);
    return url.toString();
  } catch (error) {
    console.error('Error getting public URL:', error, 'for', { bucketName, path });
    return '';
  }
};

// Helper function to upload an image to a bucket
export const uploadImage = async (bucketName: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
};

// Custom error class for duplicate email
export class DuplicateEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}

// Helper function to save partnership inquiry
export const savePartnershipInquiry = async (data: {
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
}) => {
  try {
    // First, check if an inquiry with this email already exists
    const { data: existingInquiry } = await supabase
      .from('partnership_inquiries')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingInquiry) {
      throw new DuplicateEmailError(
        'An inquiry with this email already exists. We will get back to you soon.'
      );
    }

    const { data: result, error } = await supabase
      .from('partnership_inquiries')
      .insert([
        {
          full_name: data.name,
          email: data.email,
          company: data.company,
          message: data.message,
          inquiry_type: data.inquiryType,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      // Check if the error is a unique constraint violation
      if (error.code === '23505') {
        throw new DuplicateEmailError(
          'An inquiry with this email already exists. We will get back to you soon.'
        );
      }
      console.error('Supabase error:', error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
};

// Analytics Types
export interface PageView {
  id: string;
  page_path: string;
  user_agent: string;
  referrer: string;
  created_at: string;
}

export interface DailyStats {
  date: string;
  count: number;
  hour?: number;
}

// Track page view with debug logging
export const trackPageView = async (pagePath: string) => {
  console.log('Tracking page view for:', pagePath); // Debug log

  // Don't track admin pages
  if (pagePath.startsWith('/admin')) {
    console.log('Skipping admin page tracking'); // Debug log
    return;
  }

  try {
    const { data, error } = await supabase
      .from('page_views')
      .insert([
        {
          page_path: pagePath,
          user_agent: window.navigator.userAgent,
          referrer: document.referrer || 'direct',
        }
      ])
      .select();

    if (error) {
      console.error('Error tracking page view:', error); // Debug log
      throw error;
    }

    console.log('Successfully tracked page view:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Failed to track page view:', error);
    // Don't throw error to prevent breaking the app
    return null;
  }
};

// Get daily traffic data with debug logging
export const getDailyTraffic = async (days: number = 7): Promise<DailyStats[]> => {
  console.log('Fetching daily traffic for last', days, 'days'); // Debug log
  
  const now = new Date();
  const startDate = new Date(now.setDate(now.getDate() - days));

  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching traffic data:', error); // Debug log
      throw error;
    }

    console.log('Raw traffic data:', data); // Debug log

    // Group by day
    const dailyStats = data?.reduce((acc: { [key: string]: number }, view) => {
      const date = new Date(view.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by date
    const result = Object.entries(dailyStats || {})
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Processed traffic data:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Error fetching daily traffic:', error);
    return [];
  }
};

// Subscribe to real-time page views
export const subscribeToPageViews = (callback: (payload: any) => void) => {
  return supabase
    .channel('page_views_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'page_views',
      },
      callback
    )
    .subscribe();
}; 