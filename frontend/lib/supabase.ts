import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Storage bucket names
export const STORAGE_BUCKETS = {
  COSMETICS: 'cosmetics-images',
  HAIR_EXTENSIONS: 'hair-extensions-images',
  FOUNDERS: 'founders'
} as const;

// Helper function to get bucket name based on product category
export const getBucketForCategory = (category: 'cosmetics' | 'hair-extension') => {
  return category === 'cosmetics' ? STORAGE_BUCKETS.COSMETICS : STORAGE_BUCKETS.HAIR_EXTENSIONS;
};

// Upload a single image and return its URL
export const uploadProductImage = async (
  file: File,
  category: 'cosmetics' | 'hair-extension',
  fileName?: string
): Promise<string> => {
  try {
    const bucket = getBucketForCategory(category);
    const fileExt = file.name.split('.').pop();
    const filePath = fileName 
      ? `${fileName}.${fileExt}`
      : `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Upload multiple images and return their URLs
export const uploadMultipleImages = async (
  files: File[],
  category: 'cosmetics' | 'hair-extension'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file, category));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

// Delete an image from storage
export const deleteProductImage = async (
  imageUrl: string,
  category: 'cosmetics' | 'hair-extension'
): Promise<void> => {
  try {
    const bucket = getBucketForCategory(category);
    
    // Extract file path from URL
    const url = new URL(imageUrl);
    const filePath = url.pathname.split(`${bucket}/`)[1];
    
    if (!filePath) {
      throw new Error('Invalid image URL');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

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

// Base product interface with common fields
export interface BaseProduct {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  in_stock: boolean;
  stock_quantity: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  main_image_url?: string;
  gallery_images?: string[];
  main_image_base64?: string;
  gallery_base64?: string[];
  metadata?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Cosmetics product interface (includes all fields, hair extension fields will be empty)
export interface Cosmetics {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  category: 'cosmetics';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  in_stock: boolean;
  stock_quantity?: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  created_at?: string;
  updated_at?: string;
  
  // Cosmetics specific fields
  ingredients?: string;
  skin_type?: string;
  product_benefits?: string;
  spf_level?: string;
  volume_size?: string;
  dermatologist_tested?: boolean;
  cruelty_free?: boolean;
  organic_natural?: boolean;
  
  // Image fields
  main_image_url?: string;
  gallery_urls?: string[];
  
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

// Hair Extensions product interface (includes all fields, cosmetics fields will be empty)
export interface HairExtensions {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  category: 'hair-extension';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  in_stock: boolean;
  stock_quantity?: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  created_at?: string;
  updated_at?: string;
  
  // Hair extension specific fields
  hair_type?: string;
  hair_texture?: string;
  hair_length?: string;
  hair_weight?: string;
  hair_color_shade?: string;
  installation_method?: string;
  care_instructions?: string;
  quantity_in_set?: string;
  
  // Image fields
  main_image_url?: string;
  gallery_urls?: string[];
  
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

// Union type for all products
export type Product = Cosmetics | HairExtensions;

// Type guards
export function isCosmeticsProduct(product: Product): product is Cosmetics {
  return product.category === 'cosmetics';
}

export function isHairExtensionsProduct(product: Product): product is HairExtensions {
  return product.category === 'hair-extension';
}

export const getProducts = async (): Promise<Product[]> => {
  console.log('Starting getProducts...');
  // Try to use admin operations first (bypasses RLS)
  try {
    console.log('Attempting to use admin operations...');
    const { adminOperations } = await import('./supabase-admin');
    const products = await adminOperations.getProducts();
    console.log('Successfully fetched products via admin:', products.length);
    // Sort by created_at descending
    return products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (adminError) {
    console.warn('Admin operations not available, using regular client:', adminError);
    
    console.log('Fetching cosmetics products...');
    // Get cosmetics products
    const { data: cosmeticsData, error: cosmeticsError } = await supabase
      .from('cosmetics')
      .select('*')
      .order('created_at', { ascending: false });

    if (cosmeticsError) {
      console.error('Error fetching cosmetics:', cosmeticsError);
      throw cosmeticsError;
    }
    console.log('Successfully fetched cosmetics:', cosmeticsData?.length || 0);

    console.log('Fetching hair extensions products...');
    // Get hair extensions products
    const { data: hairExtensionsData, error: hairExtensionsError } = await supabase
      .from('hair_extensions')
      .select('*')
      .order('created_at', { ascending: false });

    if (hairExtensionsError) {
      console.error('Error fetching hair extensions:', hairExtensionsError);
      throw hairExtensionsError;
    }
    console.log('Successfully fetched hair extensions:', hairExtensionsData?.length || 0);

    // Add category field to products and combine
    const cosmeticsWithCategory = (cosmeticsData || []).map(product => ({
      ...product,
      category: 'cosmetics' as const
    }));

    const hairExtensionsWithCategory = (hairExtensionsData || []).map(product => ({
      ...product,
      category: 'hair-extension' as const
    }));

    const allProducts: Product[] = [
      ...cosmeticsWithCategory,
      ...hairExtensionsWithCategory
    ];

    console.log('Total products combined:', allProducts.length);

    // Sort by created_at descending
    allProducts.sort((a, b) => {
      const dateA = new Date(a.created_at || new Date()).getTime();
      const dateB = new Date(b.created_at || new Date()).getTime();
      return dateB - dateA;
    });

    return allProducts;
  }
};

export const getProduct = async (id: string, category: 'cosmetics' | 'hair-extension'): Promise<Product | null> => {
  const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data ? { ...data, category } : null;
};

// Helper function to generate a unique SKU
const generateUniqueSKU = async (category: 'cosmetics' | 'hair-extension', productName: string): Promise<string> => {
  const prefix = category === 'cosmetics' ? 'COS' : 'HE';
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const namePrefix = productName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3) || 'PRD';
  
  return `${prefix}-${namePrefix}-${timestamp}`;
};

export const createProduct = async (productData: any): Promise<Product> => {
  console.log('Creating product with data:', productData);
  
  // Try to use admin operations first (bypasses RLS)
  try {
    const { adminOperations } = await import('./supabase-admin');
    return await adminOperations.createProduct(productData);
  } catch (adminError) {
    console.warn('Admin operations not available, using regular client:', adminError);
    
    const { category, ...cleanedProductData } = productData;
    
    // Handle empty SKU - generate unique SKU or set to null
    if (!cleanedProductData.sku || cleanedProductData.sku.trim() === '') {
      cleanedProductData.sku = await generateUniqueSKU(category, cleanedProductData.name || 'Product');
    }
    
    // Determine which table to use based on category
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    
    console.log('Saving to table:', tableName);
    console.log('Product data:', cleanedProductData);

    // Save directly to the appropriate table (all fields, some will be empty)
    const { data, error } = await supabase
      .from(tableName)
      .insert([cleanedProductData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};

export const updateProduct = async (id: string, productData: any, category: 'cosmetics' | 'hair-extension'): Promise<Product> => {
  console.log('Starting product update:', { id, category });
  console.log('Update data:', productData);
  
  // Try to use admin operations first (bypasses RLS)
  try {
    console.log('Attempting admin operations update...');
    const { adminOperations } = await import('./supabase-admin');
    const result = await adminOperations.updateProduct(id, productData, category);
    console.log('Admin update successful:', result);
    return result;
  } catch (adminError) {
    console.warn('Admin operations not available, using regular client:', adminError);
    
    const { category: _, ...cleanedProductData } = productData;
    
    // Handle empty SKU during update - generate unique SKU if being set to empty
    if (cleanedProductData.hasOwnProperty('sku') && (!cleanedProductData.sku || cleanedProductData.sku.trim() === '')) {
      cleanedProductData.sku = await generateUniqueSKU(category, cleanedProductData.name || 'Product');
    }
    
    // Determine which table to use based on category
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    console.log('Using table:', tableName);

    // Remove undefined values to avoid unnecessary updates
    Object.keys(cleanedProductData).forEach(key => {
      if (cleanedProductData[key] === undefined) {
        delete cleanedProductData[key];
      }
    });
    
    console.log('Cleaned product data:', cleanedProductData);

    // Update directly in the appropriate table (all fields, some will be empty)
    try {
      console.log('Executing Supabase update...');
      const { data, error } = await supabase
        .from(tableName)
        .update(cleanedProductData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Update successful:', data);
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const deleteProduct = async (id: string, category: 'cosmetics' | 'hair-extension'): Promise<void> => {
  // Try to use admin operations first (bypasses RLS)
  try {
    const { adminOperations } = await import('./supabase-admin');
    return await adminOperations.deleteProduct(id, category);
  } catch (adminError) {
    console.warn('Admin operations not available, using regular client:', adminError);
    
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
};

// Helper function to get public URL for an image in a bucket
export const getImageUrl = (bucketName: string, path: string) => {
  if (!bucketName || !path) {
    return '';
  }

  try {
    // Get the public URL directly from Supabase
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      return '';
    }

    // Ensure the URL is properly encoded and add cache-busting parameter
    const url = new URL(data.publicUrl);
    url.searchParams.set('t', Date.now().toString());
    return url.toString();
  } catch (error) {
    return '';
  }
};

// Helper function to get founder image URL
export const getFounderImageUrl = (founderName: string, imageName?: string) => {
  if (imageName) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, `${imageName}.jpg`);
  }
  // Special case for Manish Jha
  if (founderName.toLowerCase().includes('manish')) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, 'manish sir.jpg');
  }
  // Special case for Aly Sayyad
  if (founderName.toLowerCase().includes('aly sayyad')) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, 'Aly Sayyad Sir.jpg');
  }
  // Special case for Sreedeep Saha (or Shreedeep)
  if (founderName.toLowerCase().includes('sreedeep') || founderName.toLowerCase().includes('shreedeep')) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, 'Shreedeep Sir.jpg');
  }
  // Special case for Uttam Kumar Singh
  if (founderName.toLowerCase().includes('uttam')) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, 'Uttam.jpg');
  }
  // Special case for Rahul Pandey
  if (founderName.toLowerCase().includes('rahul')) {
    return getImageUrl(STORAGE_BUCKETS.FOUNDERS, 'Rahul Sir.jpg');
  }
  // Default: normalized name
  const normalizedName = founderName.toLowerCase().replace(/\s+/g, '-');
  return getImageUrl(STORAGE_BUCKETS.FOUNDERS, `${normalizedName}.jpg`);
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

export const getPartnerImageUrl = (partnerName: string, imageName?: string) => {
  // Normalize partner name to create a file name if imageName is not provided
  const fileName = imageName || `${partnerName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
  return getImageUrl('partners-image', fileName);
}; 