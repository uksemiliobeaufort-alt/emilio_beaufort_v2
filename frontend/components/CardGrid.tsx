"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from "framer-motion";
import HearModal from "@/components/HearModal";

const cardData = [
  { title: "Emilio Cosmetics", link: "/products/cosmetics" },
  { title: "Ormi Hear", link: "/products/hear" },
];

export default function CardGrid() {
  const [showHearModal, setShowHearModal] = useState(false);

  const handleClick = (link: string) => {
    if (link === "/products/hear") {
      setShowHearModal(true);
    } else {
      window.location.href = link;
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-5 text-center">Welcome to the House!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cardData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group transition-transform duration-300 transform hover:scale-105 border border-grey hover:border-yellow-500 rounded-xl overflow-hidden min-h-[300px] hover:shadow-lg hover:shadow-yellow-500/30"
          >
            <Card className="bg-transparent shadow-none h-full flex flex-col">
              
              {/* Golden Top Section */}
              <div className="h-1/4 w-full" style={{ backgroundColor: '#FFD700' }} />

              {/* Title Section */}
              <CardContent className="flex flex-col justify-between items-center h-full py-6 px-4 text-center">
                <Typography
                  variant="h5"
                  className="font-semibold text-3xl text-gray-800 tracking-wide mb-6"
                >
                  {card.title}
                </Typography>
                <Typography className="text-base text-gray-500 mt-2">
                  Explore our signature collection
                </Typography>


                <div
                  onClick={() => handleClick(card.link)}
                  className="transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-yellow-500 hover:text-yellow-600 text-5xl"
                >
                  <ArrowForwardIcon fontSize="inherit" />
                </div>
              </CardContent>

            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal for Ormi Hear */}
      <HearModal isOpen={showHearModal} onClose={() => setShowHearModal(false)} />
    </>
  );
}
