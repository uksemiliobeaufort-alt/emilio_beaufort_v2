'use client';

import { Leaf, Globe, Shield, BadgePercent, Award, CheckCircle } from 'lucide-react';

const cards = [
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
    title: 'ISO Certified',
    icon: <CheckCircle className="w-7 h-7 text-black" />,
    text: 'International quality standards compliance',
  },
  {
    title: 'Cruelty Free',
    icon: (
      <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Heart shape as base */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        {/* Bunny silhouette inside heart */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M10 12c0-1 0.5-1.5 1.5-1.5S13 11 13 12"/>
        {/* Bunny ears */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M11 10l0.5-1 0.5 1"/>
        {/* Bunny face */}
        <circle cx="12" cy="13" r="0.8" strokeWidth="1.2"/>
        {/* Bunny eyes */}
        <circle cx="11.5" cy="12.5" r="0.2" fill="currentColor"/>
        <circle cx="12.5" cy="12.5" r="0.2" fill="currentColor"/>
        {/* Small paw print */}
        <circle cx="16" cy="16" r="0.3" fill="currentColor"/>
        <circle cx="15.5" cy="17" r="0.3" fill="currentColor"/>
        <circle cx="16.5" cy="17" r="0.3" fill="currentColor"/>
        <circle cx="16" cy="18" r="0.3" fill="currentColor"/>
      </svg>
    ),
    text: 'Ethical sourcing with no animal testing',
  },
  {
    title: 'Global and Domestic Shipping',
    icon: <Globe className="w-7 h-7 text-black" />,
    text: 'Delivered across India and 35+ countries',
    badge: 'Trusted by 100+ Salons',
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
  {
    title: '100% MoneyBack Guarantee',
    icon: <Award className="w-7 h-7 text-black" />,
    text: 'Full refund within 15 days',
  },
];

export default function WhyChooseSection() {
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
            Discover what sets us apart as India's most trusted source for premium raw human hair.
          </p>
        </div>

        {/* Grid layout for 8 cards - 2 columns with last card centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.slice(0, 8).map((card, idx) => (
            <div key={card.title} className="bg-gradient-to-br from-[#B7A16C] to-[#fffbe6] p-[2px] rounded-2xl">
              <div
                className="relative bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center min-h-[180px] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(183,161,108,0.25),0_1.5px_8px_0_rgba(0,0,0,0.10)] hover:scale-105 hover:-translate-y-1"
              >
                {/* Badge for the fifth card */}
                {card.badge && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#B7A16C] text-xs font-semibold text-black px-4 py-1 rounded-full shadow z-10">
                    {card.badge}
                  </div>
                )}
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#B7A16C] to-[#fffbe6] mb-4 shadow">
                  {card.icon}
                </div>
                <span className="font-extrabold text-xl text-black mb-2">{card.title}</span>
                <span className="text-gray-700">{card.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 9th card centered */}
        <div className="flex justify-center mt-8">
          <div className="bg-gradient-to-br from-[#B7A16C] to-[#fffbe6] p-[2px] rounded-2xl w-full md:w-1/2">
            <div
              className="relative bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center min-h-[180px] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(183,161,108,0.25),0_1.5px_8px_0_rgba(0,0,0,0.10)] hover:scale-105 hover:-translate-y-1 w-full"
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#B7A16C] to-[#fffbe6] mb-4 shadow">
                {cards[8].icon}
              </div>
              <span className="font-extrabold text-xl text-black mb-2">{cards[8].title}</span>
              <span className="text-gray-700">{cards[8].text}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}