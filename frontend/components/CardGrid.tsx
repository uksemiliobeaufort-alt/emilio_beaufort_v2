"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/lib/supabase";
import { useState } from "react";

const cardData = [
  { 
    title: "Emilio Cosmetics",
    subtitle: "Premium Grooming Collection",
    description: "Discover our signature range of luxury grooming essentials, crafted with precision and care.",
    link: "/products/cosmetics",
    image: getImageUrl('the-house', 'Cosmetics Banner.jpeg')
  },
  { 
    title: "Ormi Hear",
    subtitle: "Coming Soon",
    description: "Experience the future of personal care. Join the waitlist for our revolutionary new product line.",
    link: "/products/hear",
    image: getImageUrl('the-house', 'Ormi Hair.webp')
  },
];

export default function CardGrid() {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleClick = (link: string) => {
    if (link === "/products/hear") {
      window.location.href = "https://www.linkedin.com/company/emiliobeaufort/";
    } else {
      window.location.href = link;
    }
  };

  const handleImageError = (title: string) => {
    console.error(`Failed to load image for ${title}`);
    setImageErrors(prev => ({ ...prev, [title]: true }));
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="group cursor-pointer"
            onClick={() => handleClick(card.link)}
          >
            <Card className="relative overflow-hidden bg-white border-0 shadow-lg transition-all duration-500 hover:shadow-xl group-hover:border-2 group-hover:border-[#B7A16C]">
              {/* Image Section */}
              <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                {!imageErrors[card.title] ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                    onError={() => handleImageError(card.title)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <CardContent className="relative z-20 -mt-20 bg-gradient-to-t from-white via-white/95 to-white/80 p-8">
                <div className="space-y-4">
                  {/* Subtitle */}
                  <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                    {card.subtitle}
                  </p>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-serif text-gray-900 group-hover:text-black transition-colors duration-300">
                    {card.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Action */}
                  <div className="pt-4 flex items-center space-x-2 text-gray-600 group-hover:text-black transition-colors duration-300">
                    <span className="text-sm uppercase tracking-wider font-medium">Explore Collection</span>
                    <ArrowRight size={20} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}