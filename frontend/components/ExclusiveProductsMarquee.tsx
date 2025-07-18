"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getImageUrl, getProducts, Product as SupabaseProduct } from "@/lib/supabase";
import Link from "next/link";
import { ProductCard } from '@/components/ui/ProductCard';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  // Fetch real products from Supabase
  const fetchProducts = async () => {
    try {
      const products = await getProducts();
      // Only show products that are featured
      const featuredProducts = products
        .filter(product => product.featured === true)
        .map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || '',
          image: product.main_image_url || getImageUrl("product-images", "cosmetics1.jpg"),
          price: product.price,
          category: (product.category === 'cosmetics' ? 'COSMETICS' : 'HAIR') as 'COSMETICS' | 'HAIR',
          in_stock: product.in_stock // Add the stock status
        }));
      setExclusiveProducts(featuredProducts);
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

    // Set up real-time subscription for product updates
    let subscription: RealtimeChannel;
    
    const setupSubscription = async () => {
      subscription = supabase
        .channel('exclusive_products_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cosmetics'
          },
          async (payload) => {
            console.log('Cosmetics products update received in marquee:', payload);
            // Show refreshing state and refresh products when cosmetics table changes
            setRefreshing(true);
            await fetchProducts();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'hair_extensions'
          },
          async (payload) => {
            console.log('Hair extensions products update received in marquee:', payload);
            // Show refreshing state and refresh products when hair_extensions table changes
            setRefreshing(true);
            await fetchProducts();
          }
        )
        .subscribe();

      console.log('Real-time subscription established for exclusive products marquee');
    };

    setupSubscription();

    // Cleanup subscription when component unmounts
    return () => {
      if (subscription) {
        console.log('Cleaning up exclusive products marquee real-time subscription');
        supabase.removeChannel(subscription);
      }
    };
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
      <div className="w-full py-16 bg-premium overflow-hidden relative">
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
      <div className="w-full py-16 bg-premium overflow-hidden relative">
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
    <div className="w-full py-16 bg-premium overflow-hidden relative">
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
            {marqueeProducts.map((product, idx) => (
              <div key={product.id} className="min-w-[300px] max-w-xs flex-shrink-0">
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