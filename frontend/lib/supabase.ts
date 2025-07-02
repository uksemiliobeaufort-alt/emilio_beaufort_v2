import { createClient } from '@supabase/supabase-js';

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

// Helper function to get public URL for an image in a bucket
export const getImageUrl = (bucketName: string, path: string) => {
  // Encode bucket name and path to handle spaces and special characters
  const encodedBucketName = encodeURIComponent(bucketName);
  const encodedPath = encodeURIComponent(path);
  
  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    // If the URL contains spaces, encode them properly
    if (data.publicUrl) {
      // Replace any unencoded spaces in the final URL
      return data.publicUrl.replace(/ /g, '%20');
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
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

// Helper function to save partnership inquiry
export const savePartnershipInquiry = async (data: {
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
}) => {
  try {
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
      console.error('Supabase error:', error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}; 