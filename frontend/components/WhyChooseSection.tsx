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
    <section className="py-16 bg-white section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-premium mb-6 leading-tight">
            Why Choose Emilio Beaufort?
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed break-words">
            Discover the Emilio Beaufort difference—where temple hair meets trust, style, and a vibrant community. We make confidence easy.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          <div className="text-center px-4 min-w-0">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Ethical Temple Hair</h3>
            <p className="text-gray-600 break-words">
              Sourced with care, always pure. 100% real temple hair—traceable, ethical, and beautiful.
            </p>
          </div>
          <div className="text-center px-4 min-w-0">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Real Results</h3>
            <p className="text-gray-600 break-words">
              See the change. Our hair extensions deliver natural volume and shine—loved by real people, worldwide.
            </p>
          </div>
          <div className="text-center px-4 min-w-0">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2 text-premium">Confident Community</h3>
            <p className="text-gray-600 break-words">
              Join a global family. Share your look, get inspired, and feel your best—every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

