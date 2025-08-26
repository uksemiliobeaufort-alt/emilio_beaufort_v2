"use client";

import { useState } from "react";
// import Image from "next/image"; // Commented out to avoid Vercel billing
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, getImageUrl } from "@/lib/supabase";

const products = [
  {
    id: 1,
    name: "Signature Beard Oil",
    description: "A luxurious blend of natural oils for beard nourishment",
    price: "₹45",
    image: getImageUrl("the-house", "Cosmetics Banner.jpgp")
  },
  {
    id: 2,
    name: "Premium Hair Pomade",
    description: "Strong hold with natural shine for classic styling",
    price: "₹35",
    image: getImageUrl("the-house", "Cosmetics Banner.jpgp")
  },
  {
    id: 3,
    name: "Facial Moisturizer",
    description: "Hydrating formula with anti-aging properties",
    price: "₹55",
    image: getImageUrl("the-house", "Cosmetics Banner.jpgp")
  },
  {
    id: 4,
    name: "Aftershave Balm",
    description: "Soothing post-shave care with natural ingredients",
    price: "₹40",
    image: getImageUrl("the-house", "Cosmetics Banner.jpgp")
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
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {currentProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 group">
            {/* Responsive Image Container */}
            <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-44 bg-gray-50">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  // Hide the image on error without logging to console
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 lg:p-7 bg-gray-50 sm:bg-gray-100 md:bg-gray-50 lg:bg-gray-100 min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]">
              <div className="flex justify-between items-start mb-3 sm:mb-4 md:mb-5">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-serif text-gray-900 group-hover:text-black transition-colors duration-300 break-words leading-tight flex-1 pr-2 sm:pr-3">
                  {product.name}
                </h3>
                <span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-[#B7A16C] flex-shrink-0">
                  ₹{product.price}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-4 sm:mb-5 md:mb-6 leading-relaxed break-words line-clamp-2">
                {product.description}
              </p>
              <Button 
                className="w-full bg-black hover:bg-gray-900 text-white text-xs sm:text-sm md:text-base lg:text-lg h-9 sm:h-10 md:h-11 lg:h-12 transition-all duration-300 group-hover:scale-105"
                onClick={() => window.open("/products/cosmetics", "_self")}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 sm:space-x-3 pt-3 sm:pt-4">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Prev
          </Button>
          <span className="text-xs sm:text-sm md:text-base text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            Next
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 