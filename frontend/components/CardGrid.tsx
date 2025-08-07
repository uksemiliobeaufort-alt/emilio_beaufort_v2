"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
// import Image from "next/image"; // Commented out to avoid Vercel billing
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductDetailDialog } from "@/components/ui/ProductDetailDialog";
import CosmeticsCollectionGrid from "./CosmeticsCollectionGrid";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/supabase";

interface CardData {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  image: string;
}

const cardData: CardData[] = [
  {
    title: "EMILIO Cosmetics",
    subtitle: "Premium Grooming Collection",
    description: "Discover our signature range of luxury grooming essentials, crafted with precision and care.",
    link: "/products",
    image: getImageUrl('the-house', 'Cosmetics Banner.webp')
  },
  {
    title: "ORMÉE Hair",
    subtitle: "Coming Soon",
    description:
      "Experience the future of personal care. Join the waitlist for our revolutionary new product line.",
    link: "/products/hear",
    image: getImageUrl('the-house', 'Ormi Hair.webp')
  },
];

export default function CardGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (link: string, title: string) => {
    if (title === "Emilio Cosmetics") {
      setIsModalOpen(true);
    } else if (link === "/products/hear") {
      window.open("https://www.linkedin.com/company/emiliobeaufort/", "_blank");
    } else {
      window.location.href = link;
    }
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {cardData.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => handleClick(card.link, card.title)}
            >
              <Card className="relative overflow-hidden bg-white border-0 shadow-lg transition-all duration-500 hover:shadow-xl group-hover:border-2 group-hover:border-[#B7A16C] h-full">
                {/* Responsive Image Container */}
                <div className="responsive-image-container">
                  {/* Mobile: Improved square aspect ratio with better height */}
                  <div className="block md:hidden">
                    <div className="relative w-full h-40 sm:h-48">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Hide the image on error without logging to console
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Tablet: Medium height for better visibility */}
                  <div className="hidden md:block lg:hidden">
                    <div className="relative w-full h-56 md:h-64">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Hide the image on error without logging to console
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Desktop: Larger height */}
                  <div className="hidden lg:block">
                    <div className="relative w-full h-72 lg:h-80 xl:h-96">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Hide the image on error without logging to console
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="relative z-20 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-16 bg-gray-50 sm:bg-gray-100 md:bg-gray-50 lg:bg-gray-100 p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-3">
                    <div className="inline-block">
                      <p className="text-xs sm:text-sm md:text-xs lg:text-sm uppercase tracking-wider text-gray-500 font-medium leading-tight bg-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-2 md:py-1 lg:px-3 lg:py-1.5 rounded-md shadow-sm border border-gray-200">
                        {card.subtitle}
                      </p>
                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-serif text-gray-900 group-hover:text-black transition-colors duration-300 leading-tight">
                      {card.title}
                    </h3>

                    <p className="text-xs sm:text-sm md:text-xs lg:text-base text-gray-600 leading-relaxed break-words">
                      {card.description}
                    </p>

                    <div className="pt-1 sm:pt-2 md:pt-2 lg:pt-3 flex items-center space-x-1.5 sm:space-x-2 text-gray-600 group-hover:text-black transition-colors duration-300">
                      <span className="text-xs sm:text-sm md:text-xs lg:text-sm uppercase tracking-wider font-medium">
                        Explore Collection
                      </span>
                      <ArrowRight
                        size={12}
                        className="sm:w-3 sm:h-3 md:w-3 md:h-3 lg:w-4 lg:h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal for Emilio Cosmetics */}
      {/* <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-2xl font-serif text-center">
              Cosmetics Collection
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          {/* Cosmetics Product Grid }
          <div className="mt-2">
            <Cards />
          </div>
        </DialogContent>
      </Dialog> */}
    </section>
  );
}
