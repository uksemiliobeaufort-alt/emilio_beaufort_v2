"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Journal from './journal/page';
import CardGrid from '@/components/CardGrid';
import PartnershipFormDialog from '@/components/ui/PartnershipFormDialog';
import ExclusiveProductsMarquee from '@/components/ExclusiveProductsMarquee';
import { getImageUrl, getFounderImageUrl } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Leaf, Globe, Shield, BadgePercent } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import CookieConsent from '@/components/CookieConsent';
import FeedbackFormDialog from '@/components/ui/FeedbackFormDialog';

// Auto Feedback Trigger Component
function AutoFeedbackTrigger() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Check if feedback form was already shown in this session
    const feedbackShown = sessionStorage.getItem('auto-feedback-shown');
    if (feedbackShown) {
      setHasTriggered(true);
    }
  }, []);

  const triggerFeedback = () => {
    if (!hasTriggered && !showFeedbackForm) {
      setShowFeedbackForm(true);
      setHasTriggered(true);
      sessionStorage.setItem('auto-feedback-shown', 'true');
    }
  };

  useEffect(() => {
    if (hasTriggered) return;

    // Intersection Observer for footer visibility
    const footerElement = document.querySelector('footer');
    let footerObserver: IntersectionObserver | null = null;

    if (footerElement) {
      footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Trigger when footer is 30% visible
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              triggerFeedback();
            }
          });
        },
        {
          threshold: [0.3, 0.5], // Trigger when 30% or 50% of footer is visible
          rootMargin: '0px 0px -10% 0px' // Slightly reduce the trigger area
        }
      );

      footerObserver.observe(footerElement);
    }

    // Scroll position detection (fallback)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;

        // Trigger when user is 85% down the page or within 200px of bottom
        if (scrollPercentage >= 0.85 || (documentHeight - scrollPosition) <= 200) {
          triggerFeedback();
        }
      }, 100); // Debounce scroll events
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      if (footerObserver) {
        footerObserver.disconnect();
      }
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [hasTriggered]);

  return (
    <FeedbackFormDialog 
      isOpen={showFeedbackForm}
      onClose={() => setShowFeedbackForm(false)}
      isAutoTriggered={true}
    />
  );
}

interface Founder {
  name: string;
  role: string;
  description: string;
  gradient: string;
}

function FounderAvatar({ founder }: { founder: Founder }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="relative mb-6">
      <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${founder.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl overflow-hidden`}>
        {/* Founder Image from Supabase */}
        <img
          src={getFounderImageUrl(founder.name)}
          alt={`${founder.name} - ${founder.role}`}
          className="w-full h-full object-cover rounded-full"
          onLoad={() => {
            console.log(`Image loaded successfully for ${founder.name}`);
          }}
          onError={(e) => {
            console.error(`Image failed to load for ${founder.name}:`, e);
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center';
              fallback.innerHTML = `<span class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">${founder.name.split(' ').map(n => n[0]).join('')}</span>`;
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
      {/* Animated Ring */}
      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${founder.gradient} rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`}></div>
      {/* Founder Badge */}
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
        FOUNDER
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isPartnershipFormOpen, setIsPartnershipFormOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // No need to fetch home data as components handle their own data fetching
    setLoading(false);
  }, []);

  // Handle initial hash navigation
  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500); // Wait for page load
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  // Define founders, firstRow, and secondRow safely
  const founders = [
    {
      name: "Manish Jha",
      role: "Founder & CEO",
      description: "CEO | Director & Head of Strategy & Innovation | Emilio Beaufort – Luxury Personal Care Brand | 13 Years in Business Building",
      gradient: "from-amber-500 via-orange-500 to-red-500"
    },
    {
      name: "Aly Sayyad",
      role: "CoFounder & Director Professional Trainer",
      description: "L&D| Training|Consulting|Banking|Startups",
      gradient: "from-purple-500 via-pink-500 to-rose-500"
    },
    {
      name: "Sreedeep Saha",
      role: "Founding Member",
      description: "Founding Partner | EMILIO BEAUFORT Steering Emilio Beaufort Pvt. Ltd. towards excellence",
      gradient: "from-blue-500 via-indigo-500 to-purple-500"
    },
    {
      name: "Uttam Kumar Singh",
      role: "Founding Member",
      description: "Founding Member @Emilio Beaufort | Co-Founder @Anteratic Solution | Aspiring Product Manager",
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    },
    {
      name: "Rahul Pandey",
      role: "Technical Project Coordinator",
      description: "AI Automation Consultant || Project Technical Coordinator @Emilio Beaufort || CoFounder - Anteratic Solutions ||",
      gradient: "from-gray-600 via-slate-600 to-zinc-600"
    }
  ];
  const firstRow = founders.slice(0, 2);
  const secondRow = founders.slice(2, 5);

  return (
    <div className="min-h-screen bg-premium">
      <AnimatedBackground />
      {/* <Navbar /> */}
      
      {/* Cookie Consent Popup */}
      <CookieConsent />
      
      {/* Auto Feedback Trigger */}
      <AutoFeedbackTrigger />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-premium">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={getImageUrl("product-images", "heroVideo.mp4")}
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Optional overlay for readability */}
        <div className="absolute inset-0 bg-black/30 z-10" />
        {/* Content */}
        <motion.div 
          className="relative z-20 flex flex-col items-center px-6 max-w-5xl mx-auto w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-6 w-full"
          >
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-white mb-2 leading-tight tracking-tight text-center w-full">
              Emilio Beaufort
            </h1>
          </motion.div>
          <motion.p 
            className="text-xl md:text-2xl body-premium mb-6 max-w-3xl leading-relaxed text-center mx-auto text-white relative z-40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.2)',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))'
            }}
          >
            Where luxury meets precision. A curated collection of grooming essentials for the discerning gentleman.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="w-full flex justify-center relative z-40"
          >
            <Button
              size="lg"
              className="text-lg px-12 py-6 text-base font-sans-medium transition-all duration-300 bg-black/80 text-white hover:bg-white hover:text-black border border-white backdrop-blur-sm hover:backdrop-blur-md hover:shadow-2xl hover:shadow-white/20 relative z-50"
              onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)'
              }}
            >
              Discover Our Philosophy
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#f8f8f8]"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-[0.1]"></div>
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              Philosophy
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed">
              We believe in the art of refinement. Every product is crafted with uncompromising attention to detail, 
              using only the finest ingredients and materials. Our philosophy centers on timeless elegance, 
              sustainable luxury, and the belief that true sophistication lies in simplicity.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            {[
              {
                title: 'Timeless Elegance',
                description: 'Designs that transcend trends, creating pieces that remain relevant and beautiful for generations.',
                icon: '✨',
                delay: 0.2
              },
              {
                title: 'Sustainable Luxury',
                description: 'Luxury that respects our planet, using ethically sourced materials and sustainable practices.',
                icon: '🌿',
                delay: 0.4
              },
              {
                title: 'Uncompromising Quality',
                description: 'Every detail matters. From the finest ingredients to the most precise craftsmanship.',
                icon: '⚡',
                delay: 0.6
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: item.delay, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-center group mb-8 sm:mb-0"
              >
                <div className="text-5xl sm:text-6xl mb-6 sm:mb-8 group-hover:scale-110 transition-premium">{item.icon}</div>
                <h3 className="heading-premium text-xl sm:text-2xl text-premium mb-4 sm:mb-6">{item.title}</h3>
                <p className="body-premium leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Emilio Beaufort Section */}
      { <section id="why-choose" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#f8f8f8]"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-[0.07]"></div>
        <div className="container-premium relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-premium mb-4 sm:mb-6 leading-[1.1] tracking-tight heading-shadow decor-line">
              Why Choose Emilio Beaufort
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-2">Discover what sets us apart as India’s most trusted source for premium raw human hair.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex md:grid md:grid-cols-2 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-100 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300 group-hover:scale-110">
                  
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3l7 6v12H5V9l7-6z' /></svg>
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Verified Temple Sourcing</span>
                <span className="text-gray-700 text-center">Single-donor raw hair only</span>
              </div>
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-200 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300 group-hover:scale-110">
                  
                  <Leaf className="w-7 h-7 text-black" />
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Zero Processing Policy</span>
                <span className="text-black text-center">No mixing, no chemical treatment</span>
              </div>
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-200 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] text-black font-bold text-xs px-4 py-1 rounded-full shadow-md border border-[#B7A16C] z-10">
                  Trusted by 100+ Salons
                </span>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 mt-2 transition-transform duration-300 group-hover:scale-110">
                  
                  <Globe className="w-7 h-7 text-black" />
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Global and Domestic Shipping</span>
                <span className="text-black text-center">Delivered across India and 35+ countries</span>
              </div>
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-200 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300 group-hover:scale-110">
                 
                  <Shield className="w-7 h-7 text-black" />
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Payment Security Options</span>
                <span className="text-black text-center">LC, Escrow, Wise, PayPal, Bank Wire</span>
              </div>
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-200 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300 group-hover:scale-110">
                  
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7 text-black' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <rect x='3' y='7' width='18' height='13' rx='2' strokeWidth='2' />
                    <circle cx='12' cy='13' r='4' strokeWidth='2' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V5a4 4 0 018 0v2' />
                  </svg>
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Buyer Proof Provided</span>
                <span className="text-black text-center">Real-time photo and video before dispatch</span>
              </div>
              
              <div className="min-w-[85vw] max-w-xs md:min-w-0 md:max-w-none bg-gray-100 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-gray-200 p-6 flex flex-col items-center transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),0_10px_20px_-5px_rgba(0,0,0,0.08)] hover:border-[#B7A16C] hover:-translate-y-2 relative snap-center mx-2 md:mx-0 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#B7A16C] to-[#fffbe6] mb-4 transition-transform duration-300 group-hover:scale-110">
                  
                  <BadgePercent className="w-7 h-7 text-black" />
                </div>
                <span className="font-bold text-black text-lg mb-2 text-center">Custom Branding Support</span>
                <span className="text-black text-center">For resellers and private labels</span>
              </div>
            </div>
          </div>
        </div>
      </section>}

     

      {/* Exclusive Products Marquee Section */}
      <ExclusiveProductsMarquee />

      {/* The House Section */}
      <section id="house" className="py-8 sm:py-10 md:py-12 lg:py-16 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f8f8] via-white to-[#f5f5f5]"></div>
        <div className="absolute inset-0 bg-pattern-grid opacity-[0.07]"></div>
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              The House
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed">
              Our curated collection represents the pinnacle of grooming excellence. 
              Each product is designed to elevate your daily ritual.
            </p>
          </motion.div>
          <CardGrid />
        </div>
      </section>

      {/* Journal Section */}
      <section id="journal" className="py-8 sm:py-10 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#fafafa]"></div>
        <div className="absolute inset-0 bg-pattern-diagonal opacity-[0.1] rotate-180"></div>
        <div className="container-premium relative z-10">
          {/* <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              Journal
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed">
              Insights, stories, and the art of living well. Our journal explores 
              the intersection of style, culture, and the pursuit of excellence.
            </p>
          </motion.div> */}
          <Journal />
        </div>
      </section>

      {/* Meet My Team Section */}
      <section id="team" className="py-6 sm:py-8 md:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7A16C]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Compact Header */}
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-premium mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Meet The Brains
            </h2>
            <p className="body-premium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Global artisans and innovators crafting the future of luxury grooming
            </p>
          </motion.div>

          {/* Founders Section */}
          <motion.div
            className="mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Founders Header */}
            {/* <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-premium mb-3">
                Our Founders
              </h3>
              <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
                The visionary minds behind Emilio Beaufort's luxury grooming revolution
              </p>
            </div> */}

            {/* Founders Grid with Uniform Spacing */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
              {/* First row: 2 cards, centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 justify-center mb-8">
                {firstRow.map((founder: Founder, index: number) => (
                  <motion.div
                    key={index}
                    className={`founder-card group relative w-full transition-all duration-700 ease-out cursor-pointer`}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.25, 0, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ y: -20, scale: 1.05, zIndex: 10, transition: { duration: 0.4, ease: [0.25, 0.25, 0, 1] } }}
                  >
                    {/* Card Background with Gradient Border */}
                    <div className="relative h-[420px] bg-white rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-700">
                      {/* Animated Gradient Border */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${founder.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl p-1`}>
                        <div className="w-full h-full bg-white rounded-3xl"></div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                        {/* Top Section */}
                        <div className="text-center">
                          {/* Founder Avatar with Animated Ring */}
                          <FounderAvatar founder={founder} />
                          
                          {/* Name and Role */}
                          <h4 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-premium mb-2 group-hover:text-[#B7A16C] transition-colors duration-300">
                            {founder.name}
                          </h4>
                          <p className="text-[#B7A16C] font-semibold text-sm sm:text-base mb-3 group-hover:scale-105 transition-transform duration-300">
                            {founder.role}
                          </p>
                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                            {founder.description}
                          </p>
                          {/* Social Icons for all team members */}
                          <div className="flex items-center justify-center space-x-3">
                            {/* LinkedIn */}
                            <a 
                              href={`https://linkedin.com/in/${founder.name.toLowerCase().replace(/\s+/g, '-')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                            {/* X (Twitter) */}
                            <a 
                              href={`https://x.com/${founder.name.toLowerCase().replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </a>
                            {/* Instagram */}
                            <a 
                              href={`https://instagram.com/${founder.name.toLowerCase().replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating Background Elements */}
                      <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                      <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Second row: 3 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                {secondRow.map((founder: Founder, index: number) => (
                  <motion.div
                    key={index + 2}
                    className={`founder-card group relative w-full transition-all duration-700 ease-out cursor-pointer`}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: (index + 2) * 0.15, ease: [0.25, 0.25, 0, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ y: -20, scale: 1.05, zIndex: 10, transition: { duration: 0.4, ease: [0.25, 0.25, 0, 1] } }}
                  >
                    {/* Card Background with Gradient Border */}
                    <div className="relative h-[420px] bg-white rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-700">
                      {/* Animated Gradient Border */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${founder.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl p-1`}>
                        <div className="w-full h-full bg-white rounded-3xl"></div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col">
                        {/* Top Section */}
                        <div className="text-center">
                          {/* Founder Avatar with Animated Ring */}
                          <FounderAvatar founder={founder} />
                          
                          {/* Name and Role */}
                          <h4 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-premium mb-2 group-hover:text-[#B7A16C] transition-colors duration-300">
                            {founder.name}
                          </h4>
                          <p className="text-[#B7A16C] font-semibold text-sm sm:text-base mb-3 group-hover:scale-105 transition-transform duration-300">
                            {founder.role}
                          </p>
                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
                            {founder.description}
                          </p>
                          {/* Social Icons for all team members */}
                          <div className="flex items-center justify-center space-x-3">
                            {/* LinkedIn */}
                            <a 
                              href={`https://linkedin.com/in/${founder.name.toLowerCase().replace(/\s+/g, '-')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                            {/* X (Twitter) */}
                            <a 
                              href={`https://x.com/${founder.name.toLowerCase().replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </a>
                            {/* Instagram */}
                            <a 
                              href={`https://instagram.com/${founder.name.toLowerCase().replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating Background Elements */}
                      <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                      <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>



          {/* Compact Stats */}
          {/* <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              { number: "30+", label: "Global Experts" },
              { number: "12", label: "Countries" },
              { number: "50+", label: "Years Experience" },
              { number: "100%", label: "Passion Driven" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#B7A16C] mb-1">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div> */}

          {/* Call to Action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Button
              className="px-14 py-5 rounded-full font-bold text-lg sm:text-2xl flex items-center justify-center gap-3 bg-gradient-to-r from-gray-200 via-gray-100 to-white text-gray-900 shadow-lg border-0 transition-all duration-200 hover:from-gray-300 hover:via-gray-200 hover:to-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-300 group"
              style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.10)' }}
              onClick={() => router.push('/team-members')}
            >
              <span className="text-gray-900 font-bold">View More Team Members</span>
              <svg
                className="w-6 h-6 text-gray-500 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>


      </section>

      {/* Alliances Section */}
      <section id="alliances" className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa] via-white to-[#f8f8f8]"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-[0.08]"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              Emilio Beaufort Global
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              At Emilio Beaufort Global, we are more than just a luxury grooming brand. We are pioneers in crafting 
              exceptional experiences that transcend traditional boundaries. Our commitment to innovation, sustainability, 
              and unparalleled quality has established us as a global leader in premium grooming solutions. With a presence 
              spanning multiple continents, we continue to redefine excellence in the luxury personal care industry.
            </p>
            <p className="body-premium text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              We believe in the power of collaboration. Let&apos;s explore how we can create something extraordinary together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <Button 
              size="lg"
              className="btn-primary-premium text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 font-sans-medium"
              onClick={() => setIsPartnershipFormOpen(true)}
            >
              Fill Partnership Form
            </Button>
          </motion.div>
        </div>
      </section>
      

      <Footer />

      <PartnershipFormDialog 
        isOpen={isPartnershipFormOpen}
        onClose={() => setIsPartnershipFormOpen(false)}
      />
    </div>
  );
} 