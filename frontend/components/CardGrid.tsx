"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Modal, Box, Typography } from "@mui/material";
import Cards from "@/components/Cards";



const cardData = [
  {
    title: "Emilio Cosmetics",
    subtitle: "Premium Grooming Collection",
    description:
      "Discover our signature range of luxury grooming essentials, crafted with precision and care.",
    link: "/products/cosmetics",
    image: "/images/Cosmetics Banner.jpeg",
  },
  {
    title: "Ormi Hear",
    subtitle: "Coming Soon",
    description:
      "Experience the future of personal care. Join the waitlist for our revolutionary new product line.",
    link: "/products/hear",
    image: "/images/Ormi Hair.webp",
  },
];

export default function CardGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (link: string, title: string) => {
    if (title === "Emilio Cosmetics") {
      setIsModalOpen(true);
    } else if (link === "/products/hear") {
      window.location.href =
        "https://www.linkedin.com/company/emiliobeaufort/";
    } else {
      window.location.href = link;
    }
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

                  <div
                    className="pt-4 flex items-center space-x-2 text-gray-600 group-hover:text-black transition-colors duration-300"
                    onClick={() => handleClick(card.link, card.title)}
                  >
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

      {/* Modal for Emilio Cosmetics */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            width: "90vw",
            maxHeight: "90vh",
            overflowY: "auto",
            margin: "5vh auto",
            backgroundColor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: 24,
          }}
        >
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                  cursor: "pointer",
                }}
                onClick={() => setIsModalOpen(false)}
              />
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ffbd2e",
                }}
              />
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#28ca41",
                }}
              />
            </Box>
            <Typography variant="h4" align="center">
              Cosmetics Collection
            </Typography>
          </Box>

          {/* Cosmetics Product Grid */}
          <Cards />
        </Box>
      </Modal>
    </>
  );
}
