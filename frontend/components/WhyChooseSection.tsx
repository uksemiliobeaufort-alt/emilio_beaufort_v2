// 'use client';

// import { Leaf, Globe, Shield, BadgePercent } from 'lucide-react';

// const cards = [
//   {
//     title: 'Verified Temple Sourcing',
//     icon: (
//       <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
//         <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3l7 6v12H5V9l7-6z' />
//       </svg>
//     ),
//     text: 'Single-donor raw hair only',
//   },
//   {
//     title: 'Zero Processing Policy',
//     icon: <Leaf className="w-7 h-7 text-black" />,
//     text: 'No mixing, no chemical treatment',
//   },
//   {
//     title: 'Global and Domestic Shipping',
//     icon: <Globe className="w-7 h-7 text-black" />,
//     text: 'Delivered across India and 35+ countries',
//     badge: 'Trusted by 100+ Salons',
//   },
//   {
//     title: 'Payment Security Options',
//     icon: <Shield className="w-7 h-7 text-black" />,
//     text: 'LC, Escrow, Wise, PayPal, Bank Wire',
//   },
//   {
//     title: 'Buyer Proof Provided',
//     icon: (
//       <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
//         <rect x='3' y='7' width='18' height='13' rx='2' strokeWidth='2' />
//         <circle cx='12' cy='13' r='4' strokeWidth='2' />
//         <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V5a4 4 0 018 0v2' />
//       </svg>
//     ),
//     text: 'Real-time photo and video before dispatch',
//   },
//   {
//     title: 'Custom Branding Support',
//     icon: <BadgePercent className="w-7 h-7 text-black" />,
//     text: 'For resellers and private labels',
//   },
// ];

// export default function WhyChooseSection() {
//   return (
//     <section id="why-choose" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium">
//       <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#f8f8f8]"></div>
//       <div className="absolute inset-0 bg-pattern-dots opacity-[0.07]"></div>
//       <div className="container-premium relative z-10">
//         <div className="text-center mb-8 sm:mb-12">
//           <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-premium mb-4 sm:mb-6 leading-[1.1] tracking-tight heading-shadow decor-line">
//             Why Choose Emilio Beaufort
//           </h2>
//           <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-2">
//             Discover what sets us apart as India's most trusted source for premium raw human hair.
//           </p>
//         </div>

//         {/* 2-column grid, each card is a direct child */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {cards.map((card, idx) => (
//             <div
//               key={card.title}
//               className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center text-center min-h-[180px] transition-all duration-300 hover:border-[#B7A16C]"
//             >
//               {/* Badge for the third card */}
//               {card.badge && (
//                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#B7A16C] text-xs font-semibold text-black px-4 py-1 rounded-full shadow z-10">
//                   {card.badge}
//                 </div>
//               )}
//               <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#B7A16C] to-[#fffbe6] mb-4 shadow">
//                 {card.icon}
//               </div>
//               <span className="font-extrabold text-xl text-black mb-2">{card.title}</span>
//               <span className="text-gray-700">{card.text}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



'use client';

import { Carousel, Card as AppleCard } from "@/components/ui/apple-cards-carusel";
import { getImageUrl } from '@/lib/supabase';

const cards = [
  {
    title: 'Verified Temple Sourcing',
    category: 'Sourcing',
    src: getImageUrl('feature', 'sourcing.jpg'),
    content: <span>Single-donor raw hair only</span>,
    details: `At Emilio Beaufort, we source our hair exclusively from verified temples, ensuring every strand is ethically obtained and fully traceable. Our single-donor policy guarantees that each bundle is pure, unblended, and maintains its natural integrity. This commitment to authentic temple sourcing not only preserves the unique quality of Indian hair but also supports the communities and traditions behind every donation.`,
  },
  {
    title: 'Zero Processing Policy',
    category: 'Policy',
    src: getImageUrl('feature', 'policy.jpg'),
    content: <span>No mixing, no chemical treatment</span>,
    details: `We believe true luxury lies in purity. That’s why our hair undergoes absolutely no chemical processing, mixing, or artificial treatment. Each bundle retains its original texture, strength, and luster, just as nature intended. Our zero processing policy means you receive hair that is untouched, unaltered, and ready to be styled, colored, or treated according to your needs—without compromise.`,
  },
  {
    title: 'Global and Domestic Shipping',
    category: 'Shipping',
    src: getImageUrl('feature', 'global-business.jpg'),
    content: <span>Delivered across India and 35+ countries</span>,
    badge: 'Trusted by 100+ Salons',
    details: `Emilio Beaufort delivers premium hair solutions across India and to over 35 countries worldwide. Our robust logistics network ensures that your order arrives safely, securely, and on time, no matter where you are. Trusted by more than 100 salons globally, we pride ourselves on reliability, transparency, and a seamless shipping experience from our door to yours.`,
  },
  {
    title: 'Payment Security Options',
    category: 'Payments',
    src: getImageUrl('feature', 'payment.jpg'),
    content: <span>LC, Escrow, Wise, PayPal, Bank Wire</span>,
    details: `Your peace of mind is our priority. We offer a range of secure payment options, including Letters of Credit (LC), Escrow, Wise, PayPal, and direct bank wire transfers. These trusted methods protect both buyers and sellers, ensuring every transaction is safe, transparent, and tailored to your preferences—whether you’re purchasing locally or internationally.`,
  },
  {
    title: 'Buyer Proof Provided',
    category: 'Proof',
    src: getImageUrl('feature', 'proof.jpg'),
    content: <span>Real-time photo and video before dispatch</span>,
    details: `We believe in complete transparency. Before dispatching your order, we provide real-time photos and videos of your actual hair bundles, so you can verify quality, texture, and length firsthand. This commitment to buyer proof eliminates uncertainty and builds trust, ensuring you receive exactly what you expect—every single time.`,
  },
  {
    title: 'Custom Branding Support',
    category: 'Branding',
    src: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    content: <span>For resellers and private labels</span>,
    details: `Stand out in the market with our custom branding solutions. Whether you’re a reseller or a private label, we offer tailored packaging, labeling, and brand support to help you create a unique identity for your business. Our team works closely with you to ensure your brand vision is realized, from concept to delivery, with the same premium quality that defines Emilio Beaufort.`,
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
        <Carousel
          items={cards.map((card, idx) => (
            <AppleCard key={card.title} card={card} index={idx} />
          ))}
        />
      </div>
    </section>
  );
}