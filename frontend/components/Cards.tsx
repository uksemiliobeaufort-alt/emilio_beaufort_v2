"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const products = [
  {
    id: 1,
    name: "Signature Beard Oil",
    description: "A luxurious blend of natural oils for beard nourishment",
    price: "$45",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`
  },
  {
    id: 2,
    name: "Premium Hair Pomade",
    description: "Strong hold with natural shine for classic styling",
    price: "$35",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`
  },
  {
    id: 3,
    name: "Facial Moisturizer",
    description: "Hydrating formula with anti-aging properties",
    price: "$55",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`
  },
  {
    id: 4,
    name: "Aftershave Balm",
    description: "Soothing post-shave care with natural ingredients",
    price: "$40",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`
  }
];

export function Cards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-serif">{product.name}</h3>
              <span className="text-lg font-medium text-[#B7A16C]">{product.price}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <Button 
              className="w-full bg-black hover:bg-gray-900 text-white"
              onClick={() => window.open("/products/cosmetics", "_self")}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 