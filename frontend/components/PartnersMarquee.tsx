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
  const imageUrl = getPartnerImageUrl(name);
  return (
    <div className="flex flex-col items-center justify-center mx-8 min-w-[240px]">
      <div className="rounded-full border-2 bg-gray-100 p-10 shadow w-48 h-48 flex items-center justify-center mb-6 transition-colors duration-300 border-gray-300 hover:border-yellow-400">
        <Image
          src={imageUrl}
          alt={name}
          width={200}
          height={200}
          quality={100}
          className="object-contain"
        />
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