"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Journal from './journal/page';
import CardGrid from '@/components/CardGrid';
import PartnershipFormDialog from '@/components/ui/PartnershipFormDialog';
import FeedbackFormDialog from "@/components/ui/FeedbackFormDialog";
import { VideoText } from "@/components/magicui/video-text";

export default function Home() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isPartnershipFormOpen, setIsPartnershipFormOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [hasScrolledToFooter, setHasScrolledToFooter] = useState(false);
  const [isAutoTriggeredFeedback, setIsAutoTriggeredFeedback] = useState(false);
  const [lastPopupTime, setLastPopupTime] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.getHomeData();
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Cleanup feedback form state when leaving home page
  useEffect(() => {
    if (pathname !== '/') {
      console.log('CLEANING UP FEEDBACK STATE - Left home page. Current path:', pathname);
      setIsFeedbackFormOpen(false);
      setIsAutoTriggeredFeedback(false);
      setHasScrolledToFooter(false);
    }
  }, [pathname]);

  // Auto-popup feedback form when user reaches footer area (HOME PAGE ONLY)
  useEffect(() => {
    // STRICT RESTRICTION: Only enable feedback form on home page
    console.log('Feedback form check - current pathname:', pathname);
    if (pathname !== '/') {
      console.log('FEEDBACK FORM DISABLED - Not on home page. Current path:', pathname);
      return;
    }
    
    console.log('FEEDBACK FORM ENABLED - On home page');
    
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Only check footer on home page
      const footerElement = document.querySelector('footer');
      const alliancesSection = document.getElementById('alliances');
      
              if (!footerElement) {
        console.log('Footer not found on home page');
        return;
      }

      let isInView = false;
      let targetElement = null;

      // Check footer visibility
      const footerRect = footerElement.getBoundingClientRect();
      const footerInView = footerRect.top <= window.innerHeight && footerRect.bottom >= 0;
      
      // Also check alliances section if it exists
      if (alliancesSection) {
        const alliancesRect = alliancesSection.getBoundingClientRect();
        const alliancesInView = alliancesRect.top <= window.innerHeight && alliancesRect.bottom >= 0;
        if (alliancesInView) {
          isInView = true;
          targetElement = alliancesSection;
        }
      }
      
      if (footerInView) {
        isInView = true;
        targetElement = footerElement;
      }

      // Check if user is near the bottom of the HOME PAGE (within 300px)
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;
      if (nearBottom) {
        isInView = true;
        targetElement = footerElement;
      }

      console.log('Scroll check:', { 
        isInView, 
        hasScrolledToFooter, 
        isFeedbackFormOpen, 
        isPartnershipFormOpen, 
        nearBottom 
      });

      if (isInView && !hasScrolledToFooter) {
        setHasScrolledToFooter(true);
        console.log('Setting hasScrolledToFooter to true, starting timer...');
        
        // Add a subtle delay to make it feel natural
        timeoutId = setTimeout(() => {
          // Double-check user is still in the area and hasn't already opened it
          let stillInView = false;
          
          if (targetElement) {
            const currentRect = targetElement.getBoundingClientRect();
            stillInView = currentRect.top <= window.innerHeight && currentRect.bottom >= 0;
          }
          
          // Also check if near bottom again
          const stillNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
          
          if (!stillInView && !stillNearBottom) {
            stillInView = false;
          } else {
            stillInView = true;
          }
          
          // Check cooldown period (reduced to 10 seconds for better UX)
          const now = Date.now();
          const cooldownPeriod = 10000; // 10 seconds
          
          console.log('Timer expired, checking conditions:', {
            stillInView,
            stillNearBottom,
            isFeedbackFormOpen,
            isPartnershipFormOpen,
            timeSinceLastPopup: now - lastPopupTime,
            cooldownPeriod
          });
          
          if ((stillInView || stillNearBottom) && !isFeedbackFormOpen && !isPartnershipFormOpen && 
              (now - lastPopupTime > cooldownPeriod) && pathname === '/') {
            console.log('All conditions met, showing feedback form on HOME PAGE!');
            setIsAutoTriggeredFeedback(true);
            setIsFeedbackFormOpen(true);
            setLastPopupTime(now);
            
            // Subtle success toast ONLY in footer area of home page
            if (pathname === '/' && targetElement) {
              setTimeout(() => {
                toast.success('💭 We\'d love to hear your thoughts on your Emilio Beaufort experience', {
                  duration: 4000,
                  style: {
                    background: 'white',
                    color: 'black',
                    border: '2px solid #D4AF37',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
                    zIndex: 99999,
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    padding: '12px 16px',
                  },
                });
              }, 500);
            }
          } else {
            console.log('Conditions not met for showing feedback form');
          }
        }, 1500); // Reduced to 1.5 second delay for quicker response
      } else if (!isInView && hasScrolledToFooter) {
        // Reset when user scrolls away from footer area
        const notNearBottom = window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 400;
        if (notNearBottom) {
          console.log('User scrolled away, resetting hasScrolledToFooter');
          setHasScrolledToFooter(false);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      }
    };

    // Only add scroll listener if loading is complete AND on home page
    if (!loading && pathname === '/') {
      console.log('Adding scroll listener - On home page');
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Also check on mount in case user is already at bottom
      handleScroll();
    } else {
      console.log('Scroll listener NOT added - Not on home page or still loading');
    }

    return () => {
      console.log('Cleaning up scroll listener');
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, loading, hasScrolledToFooter, isFeedbackFormOpen, isPartnershipFormOpen, lastPopupTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-premium">
        <motion.div 
          className="relative z-10 flex flex-col items-center px-6 max-w-5xl mx-auto w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-4 w-full"
          >
            <h1 className="text-7xl md:text-9xl font-serif font-bold text-black mb-4 leading-tight tracking-tight text-center w-full">
              Emilio Beaufort
            </h1>
          </motion.div>
          <motion.p 
            className="text-xl md:text-2xl body-premium mb-8 max-w-3xl leading-relaxed text-center mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Where luxury meets precision. A curated collection of grooming essentials for the discerning gentleman.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="w-full flex justify-center"
          >
            <Button
              size="lg"
              className="text-lg px-12 py-6 text-base font-sans-medium transition-colors duration-200 bg-black text-white hover:bg-white hover:text-black border border-white"
              onClick={() => document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' })}
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
      

      <PartnershipFormDialog 
        isOpen={isPartnershipFormOpen}
        onClose={() => setIsPartnershipFormOpen(false)}
      />

      {/* Only render FeedbackFormDialog on home page */}
      {pathname === '/' && (
        <FeedbackFormDialog 
          isOpen={isFeedbackFormOpen}
          onClose={() => {
            setIsFeedbackFormOpen(false);
            setIsAutoTriggeredFeedback(false);
          }}
          isAutoTriggered={isAutoTriggeredFeedback}
        />
      )}

      
    </div>
  );
} 