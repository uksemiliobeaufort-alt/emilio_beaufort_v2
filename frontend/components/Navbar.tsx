"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navItems = [
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'The House', href: '#house' },
  { name: 'Journal', href: '#journal' },
  { name: 'Alliances', href: '#alliances' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
            onClick={() => scrollToSection('#hero')}
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
                onClick={() => scrollToSection(item.href)}
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
              onClick={() => scrollToSection('#alliances')}
              className="btn-primary-premium"
              size="sm"
            >
              Partner With Us
            </Button>
          </motion.div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-premium hover:text-gold transition-premium">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-premium border-l border-premium">
                <div className="flex flex-col gap-8 mt-12">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className="font-sans-medium text-xl text-premium hover:text-gold transition-premium text-left"
                    >
                      {item.name}
                    </button>
                  ))}
                  <Button
                    onClick={() => scrollToSection('#alliances')}
                    className="btn-primary-premium mt-4"
                  >
                    Partner With Us
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 