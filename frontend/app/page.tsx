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
import { safeMap } from "@/lib/utils";
import WhyChooseSection from '@/components/WhyChooseSection';
import { trackEngagement, trackUserBehavior } from '@/lib/analytics';
import TeamMemberSocialLinks from '@/components/TeamMemberSocialLinks';
import Image from "next/image";
import PartnersMarquee from "@/components/PartnersMarquee";

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
  linkedin?: string; // now full URL
  twitter?: string;  // now full URL
  instagram?: string; // now full URL
  imageName?: string; // Added for specific image loading
}

function FounderAvatar({ founder }: { founder: Founder }) {
  const [imgError, setImgError] = useState(false);
  // Get founder initials for fallback
  const initials = (founder.name || '').split(' ').map(n => n[0]).join('');
  return (
    <div className="relative mb-6">
      <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${founder.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl overflow-hidden`}>
        {/* Founder Image from Supabase */}
        {!imgError ? (
          <img
            src={getFounderImageUrl(founder.name, founder.imageName)}
            alt={`${founder.name} - ${founder.role}`}
            className="w-full h-full object-cover rounded-full"
            onLoad={() => {
              // Optionally log success
              // console.log(`Image loaded successfully for ${founder.name}`);
            }}
            onError={() => {
              setImgError(true);
            }}
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600 bg-gradient-to-br from-gray-200 to-gray-300">
            {initials}
          </span>
        )}
      </div>
      {/* Animated Ring */}
      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${founder.gradient} rounded-full opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`}></div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isPartnershipFormOpen, setIsPartnershipFormOpen] = useState(false);
  const router = useRouter();
  // const analytics = useAnalytics();

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
      role: "CoFounder & CEO",
      description: "CEO | Director & Head of Strategy & Innovation | Emilio Beaufort – Luxury Personal Care Brand | 13 Years in Business Building",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      linkedin: "https://www.linkedin.com/in/manish-jha-786a87257",
      twitter: "https://x.com/manishXplore?t=WINq2Q-fqSjS-1WBF0K76g&s=09",
      instagram: "https://www.instagram.com/manish_jha_emilio?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
    },
    {
      name: "Emilio Beaufort",
      role: "Founder ",
      description: "Personal Care Product Manufacturer",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      linkedin: "https://www.linkedin.com/company/emiliobeaufort/",
      twitter: "https://x.com/Emilio_Beaufort?t=0p7UVvP0DjaMiqT50ydDEg&s=09",
      instagram: "https://www.instagram.com/emiliobeaufort_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      imageName: "EM Avatar"
    },
    {
      name: "Aly Sayyad",
      role: "CoFounder & CSO",
      description: "L&D| Training|Consulting|Banking|Startups",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      linkedin: "https://www.linkedin.com/in/aly-sayyad-40501a20/",
      twitter: "/",
      instagram: "/"
    },
    {
      name: "Sreedeep Saha",
      role: "Junior Founder",
      description: "Junior Founder | EMILIO BEAUFORT Steering Emilio Beaufort Pvt. Ltd. towards excellence",
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      linkedin: "https://www.linkedin.com/in/sreedeep-saha-fm-eb",
      twitter: "https://x.com/SahaSreede48415?t=yDKm6CvOxpC_s9iCU73MDw&s=09",
      instagram: "https://www.instagram.com/sreedeep_eb/"
    },
    {
      name: "Uttam Kumar Singh",
      role: "Junior Founder",
      description: "Junior Founder @Emilio Beaufort | Co-Founder @Anteratic Solution | Aspiring Product Manager",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      linkedin: "https://www.linkedin.com/in/uttam-kumar-singh-uks/",
      twitter: "/",
      instagram: "/"
    },
    {
      name: "Rahul Pandey",
      role: "Junior Founder and Technical Project Coordinator",
      description: "AI Automation Consultant || Project Technical Coordinator @Emilio Beaufort || CoFounder - Anteratic Solutions ||",
      gradient: "from-gray-600 via-slate-600 to-zinc-600",
      linkedin: "https://www.linkedin.com/in/rahulpandey187/",
      twitter: "https://x.com/rahulpandey187",
      instagram: "/"
    }
  ];
  const firstRow = founders.slice(0, 3);
  const secondRow = founders.slice(3, 6);

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
              onClick={() => {
                document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' });
                trackEngagement.buttonClick('Discover Our Philosophy', 'hero-section');
              }}
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
      <section 
        id="philosophy" 
        className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium"
        onMouseEnter={() => trackUserBehavior.sectionView('philosophy')}
      >
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
              Philosophy & About Us
            </h2>
            <p className="body-premium text-lg sm:text-xl max-w-4xl mx-auto leading-relaxed">
              Emilio Beaufort is a leading manufacturer and exporter of premium, ethically sourced raw Indian human hair, collected exclusively from verified South Indian temples. Serving both international and domestic clients—including top salons and wholesalers in over 35 countries—we deliver high-volume, single-donor hair bundles and custom wigs that are always unprocessed and natural. We believe hair is deeply personal, and our business is built on clean practices, ethical sourcing, and lasting partnerships. Every bundle is natural, pure, and traceable to a single donor, with no acid washing or steam processing. We stand for quality over quantity, value long-term relationships over quick profits, and are committed to refinement in every detail. Our philosophy centers on timeless elegance, sustainable luxury, and the belief that true sophistication lies in simplicity and integrity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            {safeMap([
              {
                title: 'Timeless Elegance',
                description: 'Our creations are designed to outlast fleeting trends, embodying a classic beauty and sophistication that endures for generations. Each bundle reflects a legacy of refinement and grace.',
                icon: '✨',
                delay: 0.2
              },
              {
                title: 'Sustainable Luxury',
                description: 'We believe true luxury honors the earth. Our hair is sourced with respect for both people and planet, ensuring ethical practices and sustainability at every step.',
                icon: '🌿',
                delay: 0.4
              },
              {
                title: 'Uncompromising Quality',
                description: 'Excellence is our standard. Every strand is meticulously selected and handled with care, guaranteeing purity, authenticity, and unmatched craftsmanship in every product.',
                icon: '⚡',
                delay: 0.6
              }
            ], (item, index) => (
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
      <WhyChooseSection />


      {/* Exclusive Products Marquee Section */}
      <ExclusiveProductsMarquee />

      {/* The House Section */}
      <section 
        id="house" 
        className="py-8 sm:py-10 md:py-12 lg:py-16 relative overflow-hidden section-premium"
        onMouseEnter={() => trackUserBehavior.sectionView('house')}
      >
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

      {/* Partnership Section */}
      <section 
        id="partnership" 
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        onMouseEnter={() => trackUserBehavior.sectionView('partnership')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7A16C]/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
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
              onClick={() => {
                setIsPartnershipFormOpen(true);
                trackEngagement.buttonClick('Fill Partnership Form', 'partnership-section');
              }}
            >
              Fill Partnership Form
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Partners Section (marquee) */}
      <section id="partners" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Partners</h2>
          <p className="text-lg text-gray-600">We proudly collaborate with these distinguished brands.</p>
        </div>
        <PartnersMarquee />
      </section>

      <Footer />

      <PartnershipFormDialog
        isOpen={isPartnershipFormOpen}
        onClose={() => setIsPartnershipFormOpen(false)}
      />
    </div>
  );
}