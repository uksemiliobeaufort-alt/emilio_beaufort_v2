"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'The House', href: '#house' },
  { name: 'Journal', href: '#journal' },
  // { name: 'Alliances', href: '#alliances' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to handle scrolling when redirected with a hash
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isHomePage]);

  const handleNavigation = async (href: string) => {
    setIsOpen(false);
    
    if (isHomePage) {
      // If on home page, scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home page with hash and scroll
      await router.push(`/${href}`);
    }
  };

  const handleLogoClick = async () => {
    if (isHomePage) {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      await router.push('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePartnerClick = async () => {
    setIsOpen(false);
    
    if (isHomePage) {
      const alliancesSection = document.querySelector('#alliances');
      if (alliancesSection) {
        alliancesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      await router.push('/#alliances');
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-premium ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-premium shadow-premium' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="heading-premium text-2xl text-premium cursor-pointer"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Emilio Beaufort
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                className="font-sans-medium text-premium hover:text-gold transition-premium relative group"
                onClick={() => handleNavigation(item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -2 }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-premium group-hover:w-full"></span>
              </motion.button>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="hidden md:block"
          >
            <Button
              onClick={handlePartnerClick}
              className="btn-primary-premium"
              size="sm"
            >
              Partner With Us
            </Button>
          </motion.div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-premium hover:text-gold transition-premium">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[400px] bg-white border-l border-premium p-0"
                hideCloseButton
              >
                <SheetHeader className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-serif text-xl">Menu</SheetTitle>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-900 transition-premium rounded-full hover:bg-gray-100 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col p-6" aria-label="Mobile Navigation">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="font-sans-medium text-lg text-premium hover:text-gold transition-premium text-left py-4 border-b border-gray-100 last:border-none"
                    >
                      {item.name}
                    </button>
                  ))}
                  <Button
                    onClick={handlePartnerClick}
                    className="btn-primary-premium w-full mt-8 py-6"
                  >
                    Partner With Us
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 