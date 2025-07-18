"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";
import { getPartnerImageUrl } from "@/lib/supabase";

const partners = [
  {
    name: "meliora milan",
    description: "Better Hair Begins in Milan",
  },
  {
    name: "pariluxe extensions",
    description: "Luxury hair extensions for every occasion.",
  },
  {
    name: "aurelina london",
    description: "2025 - Timeless elegance from London.",
  },
  {
    name: "caprissa paris",
    description: "Crowning You in Parisian Radiance",
  },
  {
    name: "londessa hair",
    description: "Premium hair solutions from Londessa.",
  },
  {
    name: "elanora london",
    description: "Effortless élan for every London moment.",
  },
  {
    name: "milanova luxe",
    description: "Luxury redefined in Milan.",
  },
  {
    name: "londonique melan",
    description: "Since 2024.",
  },
  {
    name: "pariluxe extensions",
    description: "Luxury hair extensions for every occasion.",
  },
  {
    name: "parivelle extensions",
    description: "Parisian elegance in every strand.",
  },
  {
    name: "bellore paris",
    description: "Unveil your French beauty.",
  },
];

function PartnerCard({ name, description }: { name: string; description: string }) {
  const imageUrl = getPartnerImageUrl(name);
  return (
    <div className="flex flex-col items-center justify-start h-full w-28 sm:w-48 group cursor-pointer">
      <Image
        src={imageUrl}
        alt={name}
        width={100}
        height={100}
        quality={100}
        className="object-contain w-24 h-24 sm:w-48 sm:h-48 mb-2 sm:mb-6" // Increased from w-20 h-20 to w-24 h-24 for mobile
      />
      <div className="text-center">
        <div className="font-semibold text-xs sm:text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">{name}</div>
        <div className="text-[10px] sm:text-base text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          {description}
        </div>
      </div>
    </div>
  );
}

// Custom hook to detect if screen is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

export default function PartnersMarquee() {
  const isMobile = useIsMobile();
  // Blur logic for images sliding in/out
  const marqueeOuterRef = useRef<HTMLDivElement>(null);
  const flexRowRef = useRef<HTMLDivElement>(null); // New: ref for the flex row
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [blurIndexes, setBlurIndexes] = useState<number[]>([]);

  useEffect(() => {
    if (isMobile) return;
    let animationFrame: number;
    const updateBlur = () => {
      if (!flexRowRef.current) return;
      const visibleRect = flexRowRef.current.getBoundingClientRect();
      const newBlurIndexes: number[] = [];
      cardRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        // If any part of the image is outside the visible flex row, blur it
        if (rect.right > visibleRect.right || rect.left < visibleRect.left) {
          newBlurIndexes.push(idx);
        }
      });
      setBlurIndexes(newBlurIndexes);
      animationFrame = requestAnimationFrame(updateBlur);
    };
    animationFrame = requestAnimationFrame(updateBlur);
    window.addEventListener("resize", updateBlur);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updateBlur);
    };
  }, [isMobile, partners.length]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8 bg-white">
      {/* Mobile grid */}
      {isMobile ? (
        <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto w-full items-stretch">
          {partners.slice(0, 5).map((partner, idx) => (
            <PartnerCard key={partner.name} name={partner.name} description={partner.description} />
          ))}
          {Array.from({ length: (3 - (partners.slice(0, 5).length % 3)) % 3 }).map((_, i) => (
            <div key={`empty-${i}`} className="h-full" />
          ))}
        </div>
      ) : (
        <>
          <div ref={marqueeOuterRef} className="w-full overflow-x-hidden">
            <Marquee pauseOnHover={true} speed={40} gradient={false} className="flex items-center">
              <div className="flex flex-row items-center w-full" ref={flexRowRef}>
                {partners.map((partner, idx) => (
                  <div
                    className={
                      `flex flex-col items-center justify-center mx-4 transition-all duration-300 group blur-sm opacity-60 hover:blur-none hover:opacity-100` +
                      (blurIndexes.includes(idx) ? "" : "")
                    }
                    key={partner.name + '-' + idx}
                    ref={el => { cardRefs.current[idx] = el; }}
                    style={{ transition: "filter 0.3s, opacity 0.3s" }}
                  >
                    <PartnerCard name={partner.name} description={partner.description} />
                  </div>
                ))}
              </div>
            </Marquee>
          </div>
          {/* Gradient fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent"></div>
        </>
      )}
    </div>
  );
} 