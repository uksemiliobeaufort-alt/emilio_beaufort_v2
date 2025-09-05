"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ui/ProductCard';
import { getImageUrl, getProducts, UnifiedProduct as SupabaseProduct } from '@/lib/supabase';
import { getHairExtensionsFromFirebase } from '@/lib/firebase';
import { imageService } from '@/lib/imageService';
import OptimizedImage from '@/components/OptimizedImage';

// Advanced image processing using the new image service
const processImageUrl = (originalUrl: string | undefined, isFirebase: boolean = false): string => {
  if (!originalUrl) {
    console.log('⚠️ No original URL provided for image processing');
    return '';
  }
  
  if (isFirebase) {
    console.log('🔥 Processing Firebase image for WebP conversion:', {
      originalUrl,
      isFirebase,
      hasProcessorUrl: !!process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL
    });
    
    // Use the advanced image service for Firebase images
    const webpUrl = imageService.generateOptimizedUrl(originalUrl, {
      format: 'webp',
      quality: 85,
      force: true
    });
    
    console.log('✅ Firebase WebP conversion result:', {
      original: originalUrl,
      webp: webpUrl,
      converted: originalUrl !== webpUrl,
      isWebP: webpUrl.includes('format=webp')
    });
    
    return webpUrl;
  }
  
  // For Supabase images, use the existing WebP format
  const supabaseWebpUrl = getImageUrl("product-images", originalUrl, 'webp');
  console.log('🗄️ Supabase WebP URL generated:', {
    original: originalUrl,
    webp: supabaseWebpUrl
  });
  
  return supabaseWebpUrl;
};

interface DisplayProduct {
  title: string;
  description: string;
  image: string;
  price?: number;
  id: string;
  category: 'COSMETICS' | 'HAIR';
  in_stock: boolean;
}

export default function ExclusiveProductsMarquee() {
  const [exclusiveProducts, setExclusiveProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      
      // Verify environment configuration
      console.log('🔧 Environment Configuration Check:', {
        hasImageProcessorUrl: !!process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL,
        processorUrl: process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL,
        isProduction: process.env.NODE_ENV === 'production'
      });
      
      // Fetch from both Firebase and Supabase
      const [firebaseProducts, supabaseProducts] = await Promise.all([
        getHairExtensionsFromFirebase().catch((error) => {
          console.error('❌ Failed to fetch Firebase products:', error);
          return [];
        }),
        getProducts().catch((error) => {
          console.error('❌ Failed to fetch Supabase products:', error);
          return [];
        })
      ]);

      console.log('📊 Raw Data Fetch Results:', {
        firebaseProductsCount: firebaseProducts.length,
        supabaseProductsCount: supabaseProducts.length,
        firebaseProducts: firebaseProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          featured: p.featured,
          hasImage: !!(p.main_image_url || p.image_url || p.image || p.thumbnail_url)
        })),
        supabaseProducts: supabaseProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          featured: p.featured,
          category: p.category,
          hasImage: !!p.main_image_url
        }))
      });

      // Process Firebase hair extension products
      console.log('🔍 Filtering Firebase products for featured items...');
      const firebaseFeaturedProducts = firebaseProducts
        .filter((product: any) => {
          const isFeatured = product.featured === true;
          const hasId = !!product.id;
          console.log(`🔍 Firebase product "${product.name}":`, {
            id: product.id,
            featured: product.featured,
            isFeatured,
            hasId,
            willInclude: isFeatured && hasId
          });
          return isFeatured && hasId;
        })
        .map((product: any) => {
          // Get the first available image URL (main_image_url, image_url, or any other image field)
          const imageUrl = product.main_image_url || product.image_url || product.image || product.thumbnail_url;
          
          console.log('🛍️ Processing Firebase product:', {
            id: product.id,
            name: product.name,
            originalImageUrl: imageUrl,
            hasImageUrl: !!imageUrl,
            imageFields: {
              main_image_url: product.main_image_url,
              image_url: product.image_url,
              image: product.image,
              thumbnail_url: product.thumbnail_url
            }
          });
          
          // Use advanced image processing with proper type checking
          const processedImageUrl = imageUrl ? processImageUrl(imageUrl, true) : getImageUrl("product-images", "cosmetics1.jpg", 'webp');
          
          console.log('🛍️ Firebase product processed:', {
            id: product.id,
            name: product.name,
            originalImageUrl: imageUrl,
            processedImageUrl: processedImageUrl,
            urlChanged: imageUrl !== processedImageUrl,
            isWebP: processedImageUrl.includes('format=webp'),
            isProcessed: processedImageUrl.includes('ext-image-processing-api-handler')
          });
          
          return {
            id: product.id || `firebase-${Date.now()}-${Math.random()}`,
            title: product.name || 'Untitled Product',
            description: product.description || product.detailed_description || 'Premium hair extension product',
            image: processedImageUrl,
            price: product.price || 0,
            category: 'HAIR' as 'COSMETICS' | 'HAIR',
            in_stock: product.in_stock !== false // Default to true if not specified
          };
        });

      // Process Supabase cosmetics products
      console.log('🔍 Filtering Supabase products for featured cosmetics...');
      const supabaseFeaturedProducts = supabaseProducts
        .filter(product => {
          const isFeatured = product.featured === true;
          const isCosmetics = product.category === 'cosmetics';
          const hasId = !!product.id;
          console.log(`🔍 Supabase product "${product.name}":`, {
            id: product.id,
            featured: product.featured,
            category: product.category,
            isFeatured,
            isCosmetics,
            hasId,
            willInclude: isFeatured && isCosmetics && hasId
          });
          return isFeatured && isCosmetics && hasId;
        })
        .map(product => ({
          id: product.id || `supabase-${Date.now()}-${Math.random()}`,
          title: product.name || 'Untitled Product',
          description: product.description || 'Premium cosmetic product',
          image: product.main_image_url ? processImageUrl(product.main_image_url, false) : getImageUrl("product-images", "cosmetics1.jpg", 'webp'),
          price: product.price || 0,
          category: 'COSMETICS' as 'COSMETICS' | 'HAIR',
          in_stock: product.in_stock !== false // Default to true if not specified
        }));

      // Combine and sort by featured status
      const allFeaturedProducts = [...firebaseFeaturedProducts, ...supabaseFeaturedProducts];
      setExclusiveProducts(allFeaturedProducts);
      
      // Log summary of image processing
      console.log('🖼️ Advanced Image Processing Summary:', {
        totalProducts: allFeaturedProducts.length,
        firebaseProducts: firebaseFeaturedProducts.length,
        supabaseProducts: supabaseFeaturedProducts.length,
        webpImages: allFeaturedProducts.filter(p => p.image.includes('format=webp')).length,
        processedImages: allFeaturedProducts.filter(p => p.image.includes('ext-image-processing-api-handler')).length,
        firebaseWebPImages: firebaseFeaturedProducts.filter(p => p.image.includes('format=webp')).length,
        firebaseProcessedImages: firebaseFeaturedProducts.filter(p => p.image.includes('ext-image-processing-api-handler')).length,
        environmentCheck: {
          hasProcessorUrl: !!process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL,
          processorUrl: process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL
        }
      });

      // Preload images for better performance
      const imageUrls = allFeaturedProducts.map(p => p.image).filter(Boolean);
      if (imageUrls.length > 0) {
        imageService.preloadImages(imageUrls, {
          format: 'webp',
          quality: 85,
          force: true
        }).then(() => {
          console.log('🚀 Image preloading completed for', imageUrls.length, 'images');
        }).catch(error => {
          console.log('⚠️ Image preloading failed:', error);
        });
      }
    } catch (error) {
      // Silent error handling - remove console.error to prevent errors from appearing
      setExclusiveProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchProducts();
  }, []);
  
  const marqueeProducts = exclusiveProducts; // Use products without repetition
  const fallbackImage = getImageUrl("product-images", "cosmetics1.jpg", 'webp');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Function to handle image load error
  const handleImageError = (idx: number, productTitle: string) => {
    // Remove console.error to prevent the error from appearing
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  };

  // Function to handle successful image load and verify format
  const handleImageLoad = (idx: number, productTitle: string, imageUrl: string) => {
    console.log(`✅ Image loaded successfully for ${productTitle}:`, {
      index: idx,
      url: imageUrl,
      isWebP: imageUrl.includes('format=webp'),
      isFirebase: imageUrl.includes('firebasestorage.googleapis.com'),
      isProcessed: imageUrl.includes('ext-image-processing-api-handler')
    });
  };

  // Scroll handler
  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };





  // Show loading state
  if (loading) {
    return (
      <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden relative bg-white">
        <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
          Most Exclusive Collection
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium"></div>
        </div>
      </div>
    );
  }

  // If there are no featured products, show a message or nothing
  if (!loading && exclusiveProducts.length === 0) {
    return (
      <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden relative bg-white">
        <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
          Most Exclusive Collection
        </h2>
        <div className="flex justify-center items-center h-32 text-premium text-lg font-medium">
          No featured products available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden relative bg-white">
      <div className="flex items-center justify-center gap-3 mb-10">
        <h2 className="text-4xl font-serif font-bold text-premium text-center">
          Most Exclusive Collection
        </h2>
        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-premium">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-premium"></div>
            <span>Updating...</span>
          </div>
        )}
      </div>
      <div className="relative overflow-hidden">
        {/* Left Arrow */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-premium rounded-full p-2 shadow-lg transition-all hover:shadow-xl"
          onClick={() => scrollByAmount(-280)}
          aria-label="Scroll left"
        >
          <ArrowLeft className="w-5 h-5 text-premium" />
        </button>
        {/* Right Arrow */}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-premium rounded-full p-2 shadow-lg transition-all hover:shadow-xl"
          onClick={() => scrollByAmount(280)}
          aria-label="Scroll right"
        >
          <ArrowRight className="w-5 h-5 text-premium" />
        </button>
                <div className="w-full overflow-hidden">
                      <div
              ref={scrollRef}
              className="flex gap-6 min-w-max animate-marquee"
              style={{
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                WebkitPerspective: '1000px'
              }}
            >
            {/* First set of items */}
            {marqueeProducts.filter(product => product.id).map((product, idx) => (
                                <div 
                    key={`first-${product.id}-${product.category}-${idx}`} 
                    className="min-w-[320px] max-w-sm flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
                    style={{
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                <ProductCard 
                  product={{
                    id: product.id,
                    name: product.title || 'Untitled Product',
                    description: product.description || 'No description available',
                    price: product.price || 0,
                    category: product.category,
                    imageUrl: product.image || fallbackImage,
                    gallery: [],
                    isSoldOut: !product.in_stock,
                    tags: [],
                    createdAt: '',
                    updatedAt: ''
                  }}
                  onViewDetails={() => router.push(`/products?id=${product.id}`)}
                />
              </div>
            ))}
            {/* Duplicate set for seamless continuation */}
            {marqueeProducts.filter(product => product.id).map((product, idx) => (
              <div 
                key={`duplicate-${product.id}-${product.category}-${idx}`} 
                className="min-w-[320px] max-w-sm flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
                style={{
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <ProductCard 
                  product={{
                    id: product.id,
                    name: product.title || 'Untitled Product',
                    description: product.description || 'No description available',
                    price: product.price || 0,
                    category: product.category,
                    imageUrl: product.image || fallbackImage,
                    gallery: [],
                    isSoldOut: !product.in_stock,
                    tags: [],
                    createdAt: '',
                    updatedAt: ''
                  }}
                  onViewDetails={() => router.push(`/products?id=${product.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}