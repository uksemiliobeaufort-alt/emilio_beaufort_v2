"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getImageUrl, getProducts, Product as SupabaseProduct } from "@/lib/supabase";

interface DisplayProduct {
  title: string;
  description: string;
  image: string;
  price?: number;
  id: string;
}

export default function ExclusiveProductsMarquee() {
  const [exclusiveProducts, setExclusiveProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        // Filter for featured products or take the first few
        const featuredProducts = products
          .filter(product => product.featured || product.in_stock)
          .slice(0, 6)
          .map(product => ({
            id: product.id,
            title: product.name,
            description: product.description || '',
            image: product.main_image_url || getImageUrl("product-images", "cosmetics1.jpg"),
            price: product.price
          }));

        // If we don't have enough featured products, use any available products
        if (featuredProducts.length < 4) {
          const additionalProducts = products
            .filter(product => !featuredProducts.find(fp => fp.id === product.id))
            .slice(0, 4 - featuredProducts.length)
            .map(product => ({
              id: product.id,
              title: product.name,
              description: product.description || '',
              image: product.main_image_url || getImageUrl("product-images", "cosmetics1.jpg"),
              price: product.price
            }));
          
          setExclusiveProducts([...featuredProducts, ...additionalProducts]);
        } else {
          setExclusiveProducts(featuredProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to empty array or show error message
        setExclusiveProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const marqueeProducts = [...exclusiveProducts, ...exclusiveProducts]; // repeat twice for seamless loop
  const fallbackImage = getImageUrl("product-images", "cosmetics1.jpg");
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);

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
    // Pause auto-scroll for 3 seconds after manual interaction
    setIsAutoScrollPaused(true);
    setTimeout(() => setIsAutoScrollPaused(false), 3000);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current) return;
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    if (!isAutoScrollPaused) {
      autoScrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollBy({ left: 2, behavior: 'smooth' });
          // Loop back to start if near the end
          if (
            scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
            scrollRef.current.scrollWidth - 10
          ) {
            scrollRef.current.scrollLeft = 0;
          }
        }
      }, 16); // ~60fps
    }
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isAutoScrollPaused]);

  // Track hover state to pause auto-scroll
  const handleCardMouseEnter = () => setIsAutoScrollPaused(true);
  const handleCardMouseLeave = () => setIsAutoScrollPaused(false);

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

  // Don't render if no products
  if (exclusiveProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 bg-premium overflow-hidden relative">
      <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
        Most Exclusive Collection
      </h2>
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
              <div
                key={idx}
                className="min-w-[300px] max-w-xs bg-white rounded-xl shadow-lg overflow-hidden flex-shrink-0 border border-premium flex flex-col transition-transform duration-300 hover:scale-105 cursor-pointer"
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="relative h-56 w-full bg-gray-100">
                  {!imageErrors[idx] ? (
                    <Image
                      src={product.image || fallbackImage}
                      alt={product.title}
                      fill
                      className="object-cover transition-opacity duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={idx < 5}
                      quality={85}
                      onError={() => handleImageError(idx, product.title)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                      <p className="text-sm">Image not available</p>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1 justify-between">
                  <h3 className="text-2xl font-serif font-bold text-premium mb-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-700 text-base">{product.description}</p>
                  {product.price && (
                    <p className="text-xl font-semibold text-premium">₹{product.price.toFixed(2)}</p>
                  )}
                  <div className="flex-1" />
                  <button className="mt-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-black border border-black transition-colors duration-200">
                    Add To Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}