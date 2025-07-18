"use client";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import Image from 'next/image';
import { getImageUrl } from '@/lib/supabase';

export default function PhilosophyPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <SectionWrapper>
        <div className="py-20 flex flex-col md:flex-row items-center gap-12 md:gap-20 max-w-6xl mx-auto">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-premium">
              PHILOSOPHY
            </h1>
            <div className="space-y-6 text-lg md:text-xl text-gray-800">
              <p className="font-serif text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">
                UNCOMPROMISING HAIR. UNAPOLOGETIC STANDARDS.
              </p>
              <p>
                At Emilio Beaufort, we believe that authenticity is the new luxury. In a world flooded with synthetic blends and mass-market vendors, we stand firm on our core principle — only real, raw Indian hair makes the cut.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>We don't chase volume.</li>
                <li>We build legacy.</li>
              </ul>
              <p>
                We partner only with those who share our obsession with quality, ethics, and originality.
              </p>
              <p className="italic text-premium font-medium">
                This is more than product. It’s principle.<br/>
                And our clients don’t just buy hair. They inherit trust.
              </p>
            </div>
          </motion.div>
          {/* Right: Image(s) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex flex-col md:flex-row justify-center gap-6"
          >
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="relative w-[220px] h-[300px] md:w-[140px] md:h-[180px] lg:w-[120px] lg:h-[160px] xl:w-[120px] xl:h-[160px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={getImageUrl('philosophy', `philosophy${num}.jpg`)}
                  alt={`Philosophy ${num}`}
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-700"
                  priority={num === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
} 