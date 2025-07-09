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
import ExclusiveProductsMarquee from '@/components/ExclusiveProductsMarquee';

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
        }, 500);
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
    console.log('Feedback form check - current pathname:', pathname);
    if (pathname !== '/') {
      console.log('FEEDBACK FORM DISABLED - Not on home page. Current path:', pathname);
      return;
    }
    
    console.log('FEEDBACK FORM ENABLED - On home page');
    
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      const footerElement = document.querySelector('footer');
      const alliancesSection = document.getElementById('alliances');
      
      if (!footerElement) {
        console.log('Footer not found on home page');
        return;
      }

      let isInView = false;
      let targetElement = null;

      const footerRect = footerElement.getBoundingClientRect();
      const footerInView = footerRect.top <= window.innerHeight && footerRect.bottom >= 0;
      
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
        
        timeoutId = setTimeout(() => {
          let stillInView = false;
          
          if (targetElement) {
            const currentRect = targetElement.getBoundingClientRect();
            stillInView = currentRect.top <= window.innerHeight && currentRect.bottom >= 0;
          }
          
          const stillNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
          
          if (!stillInView && !stillNearBottom) {
            stillInView = false;
          } else {
            stillInView = true;
          }
          
          const now = Date.now();
          const cooldownPeriod = 10000;
          
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
            
            if (pathname === '/' && targetElement) {
              setTimeout(() => {
                toast.success('💭 We\\'d love to hear your thoughts on your Emilio Beaufort experience', {
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
        }, 1500);
      } else if (!isInView && hasScrolledToFooter) {
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

    if (!loading && pathname === '/') {
      console.log('Adding scroll listener - On home page');
      window.addEventListener('scroll', handleScroll, { passive: true });
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
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-premium">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/images/heroVideo.mp4"
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
            className="text-xl md:text-2xl body-premium mb-6 max-w-3xl leading-relaxed text-center mx-auto text-white"
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
              embodying the essence of sophistication and timeless elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Exclusive Products Marquee Section */}
      <ExclusiveProductsMarquee />

      {/* The House Section */}
      <section id="house" className="py-8 sm:py-10 md:py-12 lg:py-16 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f8f8] to-[#f5f5f5]"></div>
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              The House
            </h2>
            <CardGrid />
          </motion.div>
        </div>
      </section>

      {/* Journal Section */}
      <section id="journal" className="py-8 sm:py-10 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f5] via-white to-[#f8f8f8]"></div>
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              Journal
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12">
              Discover stories of craftsmanship, tradition, and innovation. Our journal chronicles 
              the intersection of style, culture, and the pursuit of excellence.
            </p>
            <Journal />
          </motion.div>
        </div>
      </section>

      {/* Alliances Section */}
      <section id="alliances" className="py-8 sm:py-10 md:py-16 lg:py-20 relative overflow-hidden section-premium">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f8f8] to-[#f5f5f5]"></div>
        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              Alliances
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-12">
              We forge partnerships with visionaries who share our commitment to excellence. 
              Together, we create experiences that transcend the ordinary.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="w-full flex justify-center"
            >
              <Button
                size="lg"
                className="text-lg px-12 py-6 text-base font-sans-medium transition-colors duration-200 bg-black text-white hover:bg-white hover:text-black border border-black"
                onClick={() => setIsPartnershipFormOpen(true)}
              >
                Become a Partner
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partnership Form Dialog */}
      {isPartnershipFormOpen && (
        <PartnershipFormDialog
          isOpen={isPartnershipFormOpen}
          onClose={() => setIsPartnershipFormOpen(false)}
        />
      )}

      {/* Feedback Form Dialog */}
      {isFeedbackFormOpen && (
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