"use client";

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
import { Leaf, Globe, Shield, BadgePercent, Crown, Award, ChevronUp } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import CookieConsent from '@/components/CookieConsent';
import FeedbackFormDialog from '@/components/ui/FeedbackFormDialog';
import { safeMap } from "@/lib/utils";
import WhyChooseSection from '@/components/WhyChooseSection'; 
import { trackEngagement, trackUserBehavior } from '@/lib/analytics';
import TeamMemberSocialLinks from '@/components/TeamMemberSocialLinks';
import PartnersMarquee from "@/components/PartnersMarquee";
import Chatbot from "@/components/Chatbot";
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

// Mouse Tracking Component for Interactive Effects
function MouseTracker() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position to -1 to 1
      const normalizedX = (clientX / innerWidth) * 2 - 1;
      const normalizedY = (clientY / innerHeight) * 2 - 1;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseXSpring, mouseYSpring };
}

// Interactive Background Element
function InteractiveBackground() {
  const { mouseXSpring, mouseYSpring } = MouseTracker();

  const rotateX = useTransform(mouseYSpring, [-1, 1], [45, -45]);
  const rotateY = useTransform(mouseXSpring, [-1, 1], [-45, 45]);

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#B7A16C]/5" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#B7A16C]/10 rounded-full blur-xl" />
    </motion.div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isPartnershipFormOpen, setIsPartnershipFormOpen] = useState(false);
  const router = useRouter();
  // const analytics = useAnalytics();
    const [showFullPhilosophy, setShowFullPhilosophy] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  



  useEffect(() => {
    // No need to fetch home data as components handle their own data fetching
    setLoading(false);
  }, []);

  // Handle hash navigation with accurate target and single smooth scroll
  useEffect(() => {
    const NAVBAR_HEIGHT = 64;

    const findTeamTarget = (): HTMLElement | null => {
      // Prefer first founder card if available
      const card = document.querySelector('#team .founder-card') as HTMLElement | null;
      if (card) return card;
      // Fallback to section itself
      return document.querySelector('#team') as HTMLElement | null;
    };

    const scrollToHash = (attempt = 0) => {
      const { hash } = window.location;
      if (!hash) return;

      // Open partnership form directly
      if (hash === '#partnership-form') {
        setIsPartnershipFormOpen(true);
        return;
      }

      let target: HTMLElement | null = null;
      if (hash === '#team') {
        target = findTeamTarget();
      } else {
        target = document.querySelector(hash) as HTMLElement | null;
      }

      if (!target) {
        // Try again a few times while content renders
        if (attempt < 8) setTimeout(() => scrollToHash(attempt + 1), 150);
        return;
      }

      const rect = target.getBoundingClientRect();
      const absoluteTop = rect.top + window.pageYOffset - NAVBAR_HEIGHT - 12; // small padding
      window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' });
    };

    // Initial navigation after small delay to allow mount
    const timer = setTimeout(() => scrollToHash(0), 300);

    const onHashChange = () => scrollToHash(0);
    window.addEventListener('hashchange', onHashChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Handle scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const philosophySection = document.getElementById('philosophy');
      if (philosophySection) {
        const philosophyTop = philosophySection.offsetTop;
        const scrollPosition = window.scrollY + window.innerHeight;
        
        // Show scroll-to-top button when user scrolls past philosophy section
        if (scrollPosition > philosophyTop + 100) {
          setShowScrollToTop(true);
        } else {
          setShowScrollToTop(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
      description: "L&D| Training| Consulting| Banking| Startups",
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
      description: "Junior Founding Member | Multi Faceted Entrepreneur | Product Manager",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      linkedin: "https://www.linkedin.com/in/uttam-kumar-singh-uks/",
      twitter: "/",
      instagram: "/"
    },
    
    // New founder card for Rahul Pandey
    {
      name: "Rahul Pandey",
      role: "Tech Lead and Project Coordinator",
      description: "AI Automation Consultant | Technical Coordinator @ Emilio Beaufort | Co-Founder, Anteratic Solutions | Certified Web Developer",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      linkedin: "https://www.linkedin.com/in/rahulpandey187/",
      twitter: "https://x.com/rahulpandey187",
      instagram: "/",
      imageName: "Rahul Sir"
    },
      {
       name: "Pratibha Sharma",
      role: "HR Lead",
      description: "HR Lead @ Emilio Beaufort | Certifications in Talent Acquisition, HR Analytics",
     gradient: "from-gray-600 via-slate-600 to-zinc-600",
     linkedin: "https://www.linkedin.com/in/pratibha-sharma-7771a6215//",
    twitter: "/",
     instagram: "https://www.instagram.com/aashii2509?igsh=MTg0NDNja3NqMnpmcw==/",
     imageName: "Pratibha Mam"
    },
  ];
  //const firstRow = founders.slice(0, 3);
  //const secondRow = founders.slice(3, 6);
  //const thirdRow = founders.slice(6, 7); // Rahul Pandey

  const firstRow = founders.slice(0, 3); // First 3 founders
const secondRow = founders.slice(3, 6); // Next 3 founders (Sreedeep, Uttam, Rahul)
const thirdRow = founders.slice(6, 7); // Last founder (Pratibha)
const allFounders = [...firstRow, ...secondRow, ...thirdRow] as Founder[];
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
        {/* Fallback background in case video fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B7A16C] to-[#9a8a5a] z-0" />
        
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/product-images/heroVideo.mp4"
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
            Discover the beauty of ethical temple hair and luxury hair extensions—crafted for confidence, trusted by a global community. Your transformation starts here.
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
        className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden section-premium min-h-screen"
        onMouseEnter={() => trackUserBehavior.sectionView('philosophy')}
      >
        {/* Interactive Background */}
        <InteractiveBackground />

        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100"></div>

        {/* Floating Particles - Reduced count and faster animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#D4AF37]/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 1,
                repeat: Infinity,
                delay: Math.random() * 1,
              }}
            />
          ))}
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Glowing Orbs - Faster animation */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#D4AF37]/10 to-[#B7A16C]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-[#B7A16C]/10 to-[#D4AF37]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        {/* Interactive Cursor Trail - Reduced count and faster */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
              animate={{
                x: [0, 200, 400, 600, 800, 1000],
                y: [0, 100, 200, 300, 400, 500],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i * 1,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <div className="container-premium relative z-10">
          {/* Main Heading - Single Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            {/* Elegant Decorative Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-32 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-black text-premium mb-6 sm:mb-8 leading-tight sm:leading-[0.9] tracking-tight relative">
              <span className="relative inline-block">
                {/* Main Title */}
                <span className="block gradient-text-animate">
                  Philosophy
                </span>

                {/* Subtitle */}
                <span className="block text-premium font-bold">
                  & About Us
                </span>

                {/* Underline */}
                <div className="absolute -bottom-2 sm:-bottom-4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-6 font-light">
              Discover what sets us apart as India's most trusted source for premium raw human hair.
            </p>
          </motion.div>

          {/* Main Content - Single Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mb-12"
          >
            <div className="body-premium text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-gray-800 relative text-justify">
              <div className={`${!showFullPhilosophy ? 'line-clamp-6 lg:line-clamp-none' : ''} space-y-4`}>
                {/* Paragraphs - Ready to Display */}
                <div className="relative magnetic-hover">
                  <span className="inline">
                    They say he arrived quietly, carrying nothing but the single belief that luxury should not belong to a select few but to all who value it. That belief became{' '}
                  </span>
                  <strong className="text-premium font-bold relative ripple-effect inline">
                    Emilio Beaufort
                  </strong>
                  <span className="inline">
                    . He built not just a company, but a philosophy.
                  </span>
                </div>

                <div className="relative magnetic-hover">
                  <strong className="text-gold font-bold relative ripple-effect inline">
                    Slow Beauty
                  </strong>
                  <span className="inline">
                    . The art of creating products with patience and precision. From premium hair extensions to refined grooming essentials, every Emilio Beaufort creation begins with the finest ethically sourced materials.
                  </span>
                </div>

                <div className="relative magnetic-hover">
                  <span className="inline">
                    Every product is shaped by skilled hands to endure beyond passing trends into something{' '}
                  </span>
                  <span className="text-gold font-bold inline relative ripple-effect">
                    timeless
                  </span>
                  <span className="inline">
                    . He removed the barriers that kept excellence out of reach, ensuring that salons, retailers, and grooming houses, whether boutique or global, could offer their clients uncompromising quality without prohibitive barriers.
                  </span>
                </div>

                <div className="relative magnetic-hover">
                  <span className="inline">
                    Today,{' '}
                  </span>
                  <strong className="text-premium font-bold relative ripple-effect inline">
                    Emilio Beaufort
                  </strong>
                  <span className="inline">
                    {' '}is more than a name. It is a movement, bringing the principles of craftsmanship, sustainability, and accessible luxury to every corner of the world.
                  </span>
                </div>
              </div>

              {/* Read More Button - Ready to Display */}
              <button
                onClick={() => setShowFullPhilosophy(!showFullPhilosophy)}
                className="mt-6 lg:hidden inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#8B4513] via-[#A0522D] to-[#D4AF37] text-white rounded-full transition-all duration-300 text-xs sm:text-sm md:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px] sm:min-w-[140px] border border-[#D4AF37]/30 hover:border-[#D4AF37]/50"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3), 0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <span className="whitespace-nowrap">
                  {showFullPhilosophy ? 'Read Less' : 'Read More'}
                </span>
                <svg
                  className={`ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 flex-shrink-0`}
                  style={{ transform: showFullPhilosophy ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Three Pillars - Single Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 sm:gap-8 md:gap-12"
          >
            {safeMap([
              {
                title: 'Timeless Elegance',
                description: 'Our creations are designed to outlast fleeting trends, embodying a classic beauty and sophistication that endures for generations. Each bundle reflects a legacy of refinement and grace.',
                icon: <Crown className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-premium" />,
                gradient: 'from-[#D4AF37] to-[#B7A16C]'
              },
              {
                title: 'Sustainable Luxury',
                description: 'We believe true luxury honors the earth. Our hair is sourced with respect for both people and planet, ensuring ethical practices and sustainability at every step.',
                icon: <Leaf className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-premium" />,
                gradient: 'from-[#B7A16C] to-[#D4AF37]'
              },
              {
                title: 'Uncompromising Quality',
                description: 'Excellence is our standard. Every strand is meticulously selected and handled with care, guaranteeing purity, authenticity, and unmatched craftsmanship in every product.',
                icon: <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-premium" />,
                gradient: 'from-[#D4AF37] to-[#B7A16C]'
              }
            ], (item, index) => (
              <div
                key={index}
                className="group relative perspective-1000"
              >
                {/* 3D Card Container */}
                <div className="relative h-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:rotate-y-2 group-hover:scale-105 border border-gray-100 card-3d">
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

                  {/* Floating Icon */}
                  <motion.div
                    className="flex justify-center mb-4 sm:mb-6 relative z-10"
                    whileHover={{
                      scale: 1.2,
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                  >
                    <div className={`p-3 sm:p-4 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 glow-premium`}>
                      {item.icon}
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <motion.h3
                      className="heading-premium text-base sm:text-lg md:text-xl lg:text-2xl text-premium mb-3 sm:mb-4 font-bold"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                    </motion.h3>
                    <p className="body-premium text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>

                  {/* Animated Background Elements */}
                  <div
                    className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                  />
                  <div
                    className={`absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                  />
                </div>
              </div>
            ))}
          </motion.div>
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
            <h2 className="text-2xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
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
      <section
        id="team"
        className="py-6 sm:py-8 md:py-12 relative overflow-hidden"
        onMouseEnter={() => trackUserBehavior.sectionView('team')}
      >
        <div className="absolute inset-0 bg-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-black text-premium mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Meet The Brains
            </h2>
            <p className="body-premium text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-2xl mx-auto leading-relaxed">
              Global artisans and innovators crafting the future of luxury grooming
            </p>
          </motion.div>

          <motion.div
            className="mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 gap-y-8 md:gap-y-10 lg:gap-y-12 justify-items-center">
                {safeMap(allFounders, (founder: Founder, index: number) => (
                  <motion.div
                    key={index}
                    className={`founder-card group relative w-full max-w-sm mx-auto transition-all duration-700 ease-out cursor-pointer ${index === allFounders.length - 1 ? 'lg:col-start-2' : ''}`}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 0.25, 0, 1] }}
                    viewport={{ once: true }}
                    whileHover={{ y: -20, scale: 1.05, zIndex: 10, transition: { duration: 0.4, ease: [0.25, 0.25, 0, 1] } }}
                  >
                    <div className="relative h-[420px] sm:h-[440px] md:h-[460px] lg:h-[480px] xl:h-[500px] bg-white rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-700">
                      <div className={`absolute inset-0 bg-gradient-to-br ${founder.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl p-1`}>
                        <div className="w-full h-full bg-white rounded-3xl"></div>
                      </div>
                      <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 h-full flex flex-col justify-between">
                        <div className="text-center flex-1">
                          <FounderAvatar founder={founder} />
                          <h4 className="font-serif font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-premium mb-2 sm:mb-3 group-hover:text-[#B7A16C] transition-colors duration-300">
                            {founder.name}
                          </h4>
                          <p className="text-[#B7A16C] font-semibold text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300">
                            {founder.role}
                          </p>
                          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 group-hover:text-gray-700 transition-colors duration-300 line-clamp-4">
                            {founder.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-auto">
                          {founder.linkedin && (
                            <a
                              href={founder.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </a>
                          )}
                          {founder.twitter && (
                            <a
                              href={founder.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </a>
                          )}
                          {founder.instagram && (
                            <a
                              href={founder.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/social p-2 rounded-full bg-gray-100 hover:bg-[#B7A16C] hover:text-white transition-all duration-300 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                      <div className={`absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br ${founder.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>


            </div>
          </motion.div>


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

      {/* Partnership Section */}
      <section
        id="partnership"
        className="py-16 sm:py-20 md:py-24 relative overflow-hidden"
        onMouseEnter={() => trackUserBehavior.sectionView('partnership')}
      >
        <div className="absolute inset-0 bg-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-black text-premium mb-6 sm:mb-8 leading-[1.1] tracking-tight heading-shadow decor-line">
              Emilio Beaufort Global
            </h2>
            <p className="body-premium text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
              We're more than a luxury grooming brand—we're a global leader in ethical temple hair and hair extensions. Trusted by salons and clients in 35+ countries, we deliver premium, single-donor hair and innovative grooming solutions. Our mission: empower confidence, celebrate culture, and set new standards for quality and sustainability.
            </p>
            <p className="body-premium text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto leading-relaxed">
              Ready to create something extraordinary? Let's partner for impact and growth—locally and worldwide.
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
              className="bg-black hover:bg-gray-800 text-white text-sm sm:text-sm md:text-base lg:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 font-sans-medium transition-colors duration-300"
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
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Our Partners</h2>
          <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-600">We proudly collaborate with these distinguished brands.</p>
        </div>
        <PartnersMarquee />
      </section>

      {/* Inspirational Quote Above Footer */}
      <div className="relative w-full flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 overflow-hidden" style={{ background: 'linear-gradient(90deg, #f5e9c6 0%, #fffbe6 40%, #fffbe6 60%, #f5e9c6 100%)' }}>
        <span className="relative z-10 text-center font-serif italic text-base sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#4b2e1e] leading-relaxed px-4 sm:px-6 md:px-8 max-w-6xl mx-auto lg:whitespace-nowrap flex justify-center items-center" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.01em', textShadow: '0 2px 8px rgba(212,175,55,0.08)' }}>
          ~ We built trust when others chased profits. Now the world wants what we've perfected.
        </span>
      </div>
      {/* Author signature - separate white background */}
      {/* <div className="w-full flex flex-col items-center justify-center bg-white py-2">
        <span className="block font-semibold text-xl md:text-2xl text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Emilio Beaufort</span>
      </div> */}

      <Footer />

      <PartnershipFormDialog
        isOpen={isPartnershipFormOpen}
        onClose={() => setIsPartnershipFormOpen(false)}
      />

      {/* Floating Action Button - Scroll to Top */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Support System */}
      <Chatbot />
    </div>
  );
}