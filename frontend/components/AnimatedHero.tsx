"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const headline = "Reflections of Strength";

export default function AnimatedHero() {
  return (
    <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-6">
      <motion.h1 
        className="text-6xl md:text-8xl font-heading font-bold mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {headline.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        We are not a cosmetics brand. We are a grooming movement.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
          <Link href="/philosophy">Discover The Philosophy</Link>
        </Button>
      </motion.div>
    </div>
  );
} 