"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getImageUrl } from "@/lib/supabase";

// ... existing code ...
const exclusiveProducts = [
    {
      title: "Luminous Silk Foundation",
      description: "A weightless, buildable foundation for a radiant, flawless finish.",
      image: getImageUrl("product-images", "cosmetics1.jpg"),
    },
    {
      title: "Velvet Matte Lipstick",
      description: "Intense color payoff with a soft, hydrating matte finish.",
      image: getImageUrl("product-images", "cosmetics2.jpg"),
    },
    {
      title: "Radiance Glow Serum",
      description: "Revitalize your skin with our luxurious, illuminating serum.",
      image: getImageUrl("product-images", "cosmetics3.jpg"),
    },
    {
      title: "Opulent Eyeshadow Palette",
      description: "A curated palette of rich, blendable shades for every occasion.",
      image: getImageUrl("product-images", "cosmetics4.jpg"),
    },
    {
      title: "Silk Touch Setting Powder",
      description: "Lock in your look with a silky, translucent powder for all-day perfection.",
      image: getImageUrl("product-images", "cosmetics5.jpg"),
    },
  ];
  // ... existing code ...

export default function ExclusiveProductsMarquee() {
  const marqueeProducts = [...exclusiveProducts, ...exclusiveProducts]; // repeat twice for seamless loop
  const fallbackImage = getImageUrl("product-images", "cosmetics1.jpg");
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  // Function to handle image load error
  const handleImageError = (idx: number, productTitle: string) => {
    console.error(`Failed to load image for product: ${productTitle}`);
    setImageErrors(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="w-full py-16 bg-premium overflow-hidden relative">
      <h2 className="text-4xl font-serif font-bold text-premium mb-10 text-center">
        Most Exclusive Collection
      </h2>
      <div className="relative overflow-hidden">
        <div className="marquee flex gap-8 w-max animate-marquee">
          {marqueeProducts.map((product, idx) => (
            <div
              key={idx}
              className="min-w-[300px] max-w-xs bg-white rounded-xl shadow-lg overflow-hidden flex-shrink-0 border border-premium flex flex-col"
            >
              <div className="relative h-56 w-full bg-gray-100">
                {!imageErrors[idx] ? (
                  <Image
                    src={product.image || fallbackImage}
                    alt={product.title}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={idx < 5} // Prioritize loading first 5 images
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
                <div className="flex-1" />
                <button className="mt-2 bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-black border border-black transition-colors duration-200">
                  Add To Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
