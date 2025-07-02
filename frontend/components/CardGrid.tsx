"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Cards } from "./Cards";
import { supabase } from "@/lib/supabase";

interface CardData {
  title: string;
  subtitle: string;
  description: string;
  link: string;
  image: string;
}

const cardData: CardData[] = [
  {
    title: "Emilio Cosmetics",
    subtitle: "Premium Grooming Collection",
    description:
      "Discover our signature range of luxury grooming essentials, crafted with precision and care.",
    link: "/products/cosmetics",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`
  },
  {
    title: "ORMÉE Hair",
    subtitle: "Coming Soon",
    description:
      "Experience the future of personal care. Join the waitlist for our revolutionary new product line.",
    link: "/products/hear",
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Ormi Hair.webp`
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
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Card className="relative overflow-hidden bg-white border-0 shadow-lg transition-all duration-500 hover:shadow-xl group-hover:border-2 group-hover:border-[#B7A16C]">
                {/* Image */}
                <div className="relative h-[300px] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Content */}
                <CardContent className="relative z-20 -mt-20 bg-gradient-to-t from-white via-white/95 to-white/80 p-8">
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                      {card.subtitle}
                    </p>

                    <h3 className="text-3xl font-serif text-gray-900 group-hover:text-black transition-colors duration-300">
                      {card.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="pt-4 flex items-center space-x-2 text-gray-600 group-hover:text-black transition-colors duration-300">
                      <span className="text-sm uppercase tracking-wider font-medium">
                        Explore Collection
                      </span>
                      <ArrowRight
                        size={20}
                        className="transform transition-transform duration-300 group-hover:translate-x-1"
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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

          {/* Cosmetics Product Grid */}
          <div className="mt-2">
            <Cards />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
