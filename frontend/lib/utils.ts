import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function for merging class names
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Product Card Text Utilities
export const productCardUtils = {
  // Truncate text by word count for consistent display
  truncateText: (text: string, maxWords: number): string => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  },

  // Format price consistently across all components
  formatPrice: (price: number): string => {
    console.log('formatPrice input:', price, typeof price);
    const formatted = `₹${price.toLocaleString('en-IN')}`;
    console.log('formatPrice output:', formatted);
    return formatted;
  },

  // Truncate product name for cards (2 lines worth)
  truncateProductName: (name: string): string => {
    return productCardUtils.truncateText(name, 6); // Reduced from 8 to 6 words
  },

  // Truncate product description for cards (2-3 lines worth)
  truncateProductDescription: (description: string): string => {
    return productCardUtils.truncateText(description, 8); // Reduced from 15 to 8 words
  },

  // Common CSS classes for text wrapping
  textWrapClasses: 'break-words overflow-wrap-break-word',

  // Get display price with discount logic
  getDisplayPrice: (product: any, detailedProduct: any) => {
    // Get prices from Firebase data or fallback to product data
    const originalPrice = Number(detailedProduct?.original_price || product.price || 0);
    const discountedPrice = Number(detailedProduct?.price || product.price || 0);
    
    console.log('Price debugging:', {
      productPrice: product.price,
      detailedProductPrice: detailedProduct?.price,
      detailedProductOriginalPrice: detailedProduct?.original_price,
      originalPrice,
      discountedPrice
    });
    
    // If discounted price exists and is less than original, show discounted
    // Otherwise show original price
    const displayPrice = (discountedPrice > 0 && discountedPrice < originalPrice) 
      ? discountedPrice 
      : originalPrice;
    
    const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
    
    console.log('Final price calculation:', {
      displayPrice,
      hasDiscount,
      originalPrice,
      savings: hasDiscount ? originalPrice - discountedPrice : 0
    });
    
    return {
      displayPrice,
      hasDiscount,
      originalPrice,
      savings: hasDiscount ? originalPrice - discountedPrice : 0
    };
  }
}; 

export function safeMap<T, U>(arr: T[] | undefined | null, fn: (item: T, idx: number) => U): U[] {
  return Array.isArray(arr) ? arr.map(fn) : [];
} 