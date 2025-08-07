"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaleBannerProps {
  isVisible?: boolean;
}

export default function SaleBanner({ isVisible = true }: SaleBannerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  if (!isVisible) return null;

  const saleMessages = [
    "SALE SALE SALE - Up to 50% OFF on Premium Temple Hair Extensions",
    "SALE SALE SALE - New Collection Now Available"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === saleMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [saleMessages.length]);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-black overflow-hidden"
    >
      {/* Main banner container */}
      <div className="relative h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-sm font-medium text-white text-center"
          >
            {saleMessages[currentMessageIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 