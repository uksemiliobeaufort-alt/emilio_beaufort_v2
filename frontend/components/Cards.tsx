"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 4;

export function Cards() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="relative h-40 w-full bg-gray-50">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-serif">{product.name}</h3>
                <span className="text-sm font-medium text-[#B7A16C]">{product.price}</span>
              </div>
              <p className="text-gray-600 text-xs mb-2">{product.description}</p>
              <Button 
                className="w-full bg-black hover:bg-gray-900 text-white text-xs h-8"
                onClick={() => window.open("/products/cosmetics", "_self")}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-3">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-7 px-2 text-xs"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Prev
          </Button>
          <span className="text-xs text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-7 px-2 text-xs"
          >
            Next
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 