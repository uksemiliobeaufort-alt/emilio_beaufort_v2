"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { getImageUrl, getProducts } from "@/lib/supabase";
import { getHairExtensionsFromFirebase } from "@/lib/firebase";

interface DisplayProduct {
  title: string;
  description: string;
  image: string;
  price?: number;
  id: string;
  category: "COSMETICS" | "HAIR";
  in_stock: boolean;
}

export default function ExclusiveProductsMarquee() {
  const [exclusiveProducts, setExclusiveProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paused, setPaused] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      const [firebaseProducts, supabaseProducts] = await Promise.all([
        getHairExtensionsFromFirebase().catch(() => []),
        getProducts().catch(() => []),
      ]);

      const firebaseFeatured = firebaseProducts
        .filter((p: any) => p.featured && p.id)
        .map((p: any) => ({
          id: p.id,
          title: p.name || "Untitled Product",
          description: p.description || p.detailed_description || "Premium hair extension product",
          image: p.main_image_url || getImageUrl("product-images", "cosmetics1.jpg"),
          price: p.price || 0,
          category: "HAIR" as const,
          in_stock: p.in_stock !== false,
        }));

      const supabaseFeatured = supabaseProducts
        .filter((p) => p.featured && p.category === "cosmetics" && p.id)
        .map((p) => ({
          id: p.id,
          title: p.name || "Untitled Product",
          description: p.description || "Premium cosmetic product",
          image: p.main_image_url || getImageUrl("product-images", "cosmetics1.jpg"),
          price: p.price || 0,
          category: "COSMETICS" as const,
          in_stock: p.in_stock !== false,
        }));

      setExclusiveProducts([...firebaseFeatured, ...supabaseFeatured]);
    } catch {
      setExclusiveProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fallbackImage = getImageUrl("product-images", "cosmetics1.jpg");

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      setPaused(true); // pause marquee
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(() => setPaused(false), 2000); // resume after 2s
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 bg-white">
        <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
          Most Exclusive Collection
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium"></div>
        </div>
      </div>
    );
  }

  if (!loading && exclusiveProducts.length === 0) {
    return (
      <div className="w-full py-20 bg-white">
        <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
          Most Exclusive Collection
        </h2>
        <div className="flex justify-center items-center h-32 text-premium text-lg font-medium">
          No featured products available at the moment.
        </div>
      </div>
    );
  }

  const marqueeProducts = [...exclusiveProducts, ...exclusiveProducts]; // duplicate for seamless loop

  return (
    <div className="w-full py-20 bg-white relative">
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
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-premium rounded-full p-2 shadow-md hover:shadow-lg"
          onClick={() => scrollByAmount(-320)}
        >
          <ArrowLeft className="w-5 h-5 text-premium" />
        </button>

        {/* Right Arrow */}
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-premium rounded-full p-2 shadow-md hover:shadow-lg"
          onClick={() => scrollByAmount(320)}
        >
          <ArrowRight className="w-5 h-5 text-premium" />
        </button>

        {/* Marquee wrapper */}
        <div ref={scrollRef} className="overflow-hidden no-scrollbar">
          <div
            className={`flex gap-6 min-w-max ${
              paused ? "" : "animate-marquee"
            }`}
          >
            {marqueeProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="min-w-[320px] max-w-sm flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
              >
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.title,
                    description: product.description,
                    price: product.price || 0,
                    category: product.category,
                    imageUrl: product.image || fallbackImage,
                    gallery: [],
                    isSoldOut: !product.in_stock,
                    tags: [],
                    createdAt: "",
                    updatedAt: "",
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
