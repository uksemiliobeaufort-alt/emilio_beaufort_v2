"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ui/ProductCard';
import { getImageUrl } from '@/lib/supabase';

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
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      
      // For now, we'll use mock data since the supabase connection isn't set up
      const mockProducts: DisplayProduct[] = [
        {
          id: '1',
          title: 'Emilio Beaufort Luxe Ponytail/Wrap Ponytail',
          description: 'Premium hair extension with dark grey floral accent',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 74250,
          category: 'HAIR',
          in_stock: false
        },
        {
          id: '2',
          title: 'Emilio Beaufort Luxe Mono Base Topper',
          description: 'Dark brown hair topper for natural coverage',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 54000,
          category: 'HAIR',
          in_stock: false
        },
        {
          id: '3',
          title: 'Emilio Beaufort Luxe I-tip Hair Extension',
          description: 'I-tip hair extensions in various shades',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 54000,
          category: 'HAIR',
          in_stock: false
        },
        {
          id: '4',
          title: 'Emilio Beaufort Luxe Swiss Full Lace',
          description: 'Dark, wavy full lace wig with lace base',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 114750,
          category: 'HAIR',
          in_stock: false
        },
        {
          id: '5',
          title: 'Emilio Beaufort Luxe Swiss Closure Wig',
          description: 'Dark, wavy hair closure with lace base',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 87750,
          category: 'HAIR',
          in_stock: false
        },
        {
          id: '6',
          title: 'Emilio Beaufort Luxe Braiding Loose Hair',
          description: 'Long, dark, wavy braiding hair with gold bands',
          image: getImageUrl("product-images", "cosmetics1.jpg"),
          price: 54000,
          category: 'HAIR',
          in_stock: false
        }
      ];

      setExclusiveProducts(mockProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
  const fallbackImage = getImageUrl("product-images", "cosmetics1.jpg");
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Function to handle image load error
  const handleImageError = (idx: number, productTitle: string) => {
    console.error(`Failed to load image for product: ${productTitle}`);
    setImageErrors(prev => ({ ...prev, [idx]: true }));
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
      <div className="w-full py-16 overflow-hidden relative">
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
      <div className="w-full py-16 overflow-hidden relative">
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
    <div className="w-full py-16 overflow-hidden relative">
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-premium rounded-full p-2 shadow transition-all"
          onClick={() => scrollByAmount(-350)}
          aria-label="Scroll left"
        >
          <ArrowLeft className="w-6 h-6 text-premium" />
        </button>
        {/* Right Arrow */}
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-premium rounded-full p-2 shadow transition-all"
          onClick={() => scrollByAmount(350)}
          aria-label="Scroll right"
        >
          <ArrowRight className="w-6 h-6 text-premium" />
        </button>
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide w-full px-12"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-8 min-w-max">
            {marqueeProducts.filter(product => product.id).map((product, idx) => (
              <div key={`${product.id}-${product.category}-${idx}`} className="min-w-[300px] max-w-xs flex-shrink-0">
                <ProductCard 
                  product={{
                    id: product.id,
                    name: product.title,
                    description: product.description,
                    price: product.price || 0,
                    category: product.category,
                    imageUrl: product.image,
                    gallery: [],
                    isSoldOut: !product.in_stock, // Use in_stock status for isSoldOut
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