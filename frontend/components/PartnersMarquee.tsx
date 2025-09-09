"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import React from "react";
import { getPartnerImageUrl } from "@/lib/supabase";

const partners = [
  {
    name: "Meliora Milan",
    description: "Better Hair Begins in Milan",
  },
  {
    name: "Pariluxe Extensions",
    description: "Luxury hair extensions for every occasion.",
  },
  {
    name: "Aurélina London",
    description: "2025 - Timeless elegance from London.",
  },
  {
    name: "Caprissa Paris",
    description: "Crowning You in Parisian Radiance",
  },
  {
    name: "Londessa Hair",
    description: "Premium hair solutions from Londessa.",
  },
  {
    name: "Elanora London",
    description: "Effortless élan for every London moment.",
  },
  {
    name: "Milanova Luxe",
    description: "Luxury redefined in Milan.",
  },
  {
    name: "Londonique Melan",
    description: "Since 2024.",
  },
  {
    name: "Pariluxe Extensions",
    description: "Luxury hair extensions for every occasion.",
  },
  {
    name: "Parivelle Extensions",
    description: "Parisian elegance in every strand.",
  },
  {
    name: "Bellore Paris",
    description: "Unveil your French beauty.",
  },
];

function PartnerCard({ name, description }: { name: string; description: string }) {
  const [imageError, setImageError] = React.useState(false);
  const [useWebP, setUseWebP] = React.useState(true);
  
  // Try WebP first, fallback to original format
  const imageUrl = getPartnerImageUrl(name, undefined, useWebP ? 'webp' : 'original');
  
  // Debug logging
  console.log(`Partner: ${name}, Image URL (${useWebP ? 'WebP' : 'Original'}): ${imageUrl}`);
  
  const handleImageError = (e: any) => {
    console.error(`Failed to load ${useWebP ? 'WebP' : 'original'} image for ${name}:`, imageUrl, e);
    
    // If WebP failed, try original format
    if (useWebP) {
      console.log(`Retrying with original format for ${name}`);
      setUseWebP(false);
    } else {
      // Both formats failed
      setImageError(true);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center mx-8 min-w-[240px]">
      <div className="rounded-full border-2 bg-gray-100 p-10 shadow w-48 h-48 flex items-center justify-center mb-6 transition-colors duration-300 border-gray-300 hover:border-yellow-400">
        {!imageError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={200}
            height={200}
            quality={useWebP ? 85 : 100} // Lower quality for WebP since it's already compressed
            className="object-contain"
            onError={handleImageError}
            onLoad={() => {
              console.log(`Successfully loaded ${useWebP ? 'WebP' : 'original'} image for ${name}:`, imageUrl);
            }}
            sizes="(max-width: 640px) 480px,
         (max-width: 768px) 768px,
         (max-width: 1024px) 1024px,
         1920px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏢</div>
              <div className="text-sm font-medium">{name}</div>
            </div>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-semibold text-lg">{name}</div>
        <div className="text-base text-gray-500">{description}</div>
      </div>
    </div>
  );
}

export default function PartnersMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8 bg-white">
      <Marquee pauseOnHover={true} speed={40} gradient={false}>
        {partners.map((partner, idx) => (
          <PartnerCard key={partner.name + '-' + idx} name={partner.name} description={partner.description} />
        ))}
      </Marquee>
      {/* Gradient fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent"></div>
    </div>
  );
} 