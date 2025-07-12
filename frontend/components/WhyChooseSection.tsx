'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Globe, Shield, BadgePercent } from 'lucide-react';

const initialCards = [
  {
    title: 'Verified Temple Sourcing',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3l7 6v12H5V9l7-6z' />
      </svg>
    ),
    text: 'Single-donor raw hair only',
  },
  {
    title: 'Zero Processing Policy',
    icon: <Leaf className="w-7 h-7 text-black" />,
    text: 'No mixing, no chemical treatment',
  },
  {
    title: 'Global and Domestic Shipping',
    icon: <Globe className="w-7 h-7 text-black" />,
    text: 'Delivered across India and 35+ countries',
  },
  {
    title: 'Payment Security Options',
    icon: <Shield className="w-7 h-7 text-black" />,
    text: 'LC, Escrow, Wise, PayPal, Bank Wire',
  },
  {
    title: 'Buyer Proof Provided',
    icon: (
      <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <rect x='3' y='7' width='18' height='13' rx='2' strokeWidth='2' />
        <circle cx='12' cy='13' r='4' strokeWidth='2' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V5a4 4 0 018 0v2' />
      </svg>
    ),
    text: 'Real-time photo and video before dispatch',
  },
  {
    title: 'Custom Branding Support',
    icon: <BadgePercent className="w-7 h-7 text-black" />,
    text: 'For resellers and private labels',
  },
];

export default function WhyChooseSection() {
  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2500); // Every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="why-choose" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#f8f8f8]"></div>
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.07]"></div>
      <div className="container-premium relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-premium mb-4 sm:mb-6 leading-[1.1] tracking-tight heading-shadow decor-line">
            Why Choose Emilio Beaufort
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-2">
            Discover what sets us apart as India’s most trusted source for premium raw human hair.
          </p>
        </div>

        <div className="relative h-[340px] sm:h-[400px] md:h-[450px] overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false}>
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: index * -20, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute w-[85vw] max-w-xs bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-100 p-6 flex flex-col items-center text-center"
                style={{ zIndex: cards.length - index }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300">
                  {card.icon}
                </div>
                <span className="font-bold text-black text-lg mb-2">{card.title}</span>
                <span className="text-gray-700">{card.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
