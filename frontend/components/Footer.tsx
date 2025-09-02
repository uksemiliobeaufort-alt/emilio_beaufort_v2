"use client";

import { Instagram, Twitter, Facebook, Linkedin, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import FeedbackFormDialog from "@/components/ui/FeedbackFormDialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <>
      <footer className="bg-gradient-to-r from-gray-800 to-black border-t border-gray-700 py-8 sm:py-12 lg:py-16">
        <div className="container-premium">
          {/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-12 mb-6 sm:mb-10 lg:mb-12">
            {/* Brand Section */}
            <div className="text-center sm:text-left">
              <h3 className="heading-premium text-xl sm:text-2xl lg:text-2xl text-white mb-6">Emilio Beaufort</h3>
              <p className="body-premium text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
                Where luxury meets precision. Crafting exceptional grooming experiences for the discerning gentleman. We supply raw human hair and wigs within India to Salons, Wig makers, Beauty retailers, Online store owners, and Cosmetic brands. Fast delivery across major Indian cities. Payment via UPI, NEFT or advance invoice.
              </p>
             
              <div>
  <a href="/locations" className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-500 text-white font-semibold rounded-md hover:from-gray-600 hover:to-gray-700 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 mb-6 text-xs sm:text-sm relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    Explore Our Locations
  </a>
  </div>
            </div>

            

{/*Our Offices*/}

            

            {/* Quick Links - Dropdown on mobile */}
            <div className="text-center">
              {/* Mobile Dropdown Header */}
              <div className="sm:hidden">
                                 <button
                   onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
                   className="flex items-center justify-center w-full py-3 px-4 text-white transition-all duration-300"
                 >
                  <h4 className="font-sans-semibold text-white text-base">Quick Links</h4>
                  {isQuickLinksOpen ? (
                    <ChevronUp className="ml-2 h-5 w-5 text-gray-300" />
                  ) : (
                    <ChevronDown className="ml-2 h-5 w-5 text-gray-300" />
                  )}
                </button>
                
                {/* Mobile Dropdown Content */}
                {isQuickLinksOpen && (
                  <div className="mt-3 bg-gray-700/30 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                    <nav className="flex flex-col space-y-3">
                      {[
                        { name: 'Philosophy', href: '#philosophy', isExternal: false },
                        { name: 'The House', href: '#house', isExternal: false },
                        { name: 'Journal', href: '#journal', isExternal: false },
                        { name: 'Track Order', href: '/track-order', isExternal: true },
                        { name: 'Give Feedback', href: '#feedback', isExternal: false, isFeedback: true },
                        { name: 'Admin Login', href: '/admin/login', isExternal: true }
                      ].map((link: any) => (
                        <div key={link.name} className="flex justify-center">
                          {link.isExternal ? (
                                                         <Link
                               href={link.href}
                               className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm py-2 px-3 min-h-[44px] flex items-center justify-center w-full"
                             >
                               {link.name}
                             </Link>
                          ) : link.isFeedback ? (
                                                         <button
                               onClick={() => {
                                 setIsFeedbackFormOpen(true);
                                 setIsQuickLinksOpen(false);
                               }}
                               className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm py-2 px-3 min-h-[44px] flex items-center justify-center w-full"
                             >
                               {link.name}
                             </button>
                          ) : (
                                                         <button
                               onClick={() => {
                                 document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                 setIsQuickLinksOpen(false);
                               }}
                               className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm py-2 px-3 min-h-[44px] flex items-center justify-center w-full"
                             >
                               {link.name}
                             </button>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>
                )}
              </div>

              {/* Desktop/Tablet Regular Layout */}
              <div className="hidden sm:block">
                <h4 className="font-sans-semibold text-white mb-4 sm:mb-8 text-base sm:text-lg">Quick Links</h4>
                <nav className="flex flex-col space-y-1 sm:space-y-2 items-center">
                  {[
                    { name: 'Philosophy', href: '#philosophy', isExternal: false },
                    { name: 'The House', href: '#house', isExternal: false },
                    { name: 'Journal', href: '#journal', isExternal: false },
                    { name: 'Track Order', href: '/track-order', isExternal: true },
                    { name: 'Give Feedback', href: '#feedback', isExternal: false, isFeedback: true },
                    { name: 'Admin Login', href: '/admin/login', isExternal: true }
                  ].map((link: any) => (
                    <div key={link.name} className="flex justify-center">
                      {link.isExternal ? (
                        <Link
                          href={link.href}
                          className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-1 sm:py-2 px-0 min-h-[44px] flex items-center footer-link-underline"
                        >
                          {link.name}
                        </Link>
                      ) : link.isFeedback ? (
                        <button
                          onClick={() => setIsFeedbackFormOpen(true)}
                          className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-1 sm:py-2 px-0 min-h-[44px] flex items-center footer-link-underline"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <button
                          onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                          className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-1 sm:py-2 px-0 min-h-[44px] flex items-center footer-link-underline"
                        >
                          {link.name}
                        </button>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center sm:text-left lg:col-span-1 sm:col-span-2 lg:col-span-1">
              <h4 className="font-sans-semibold text-white mb-4 sm:mb-8 text-base sm:text-lg">Connect</h4>
              <p className="body-premium text-gray-300 mb-4 sm:mb-8 text-sm sm:text-base">
                Follow us for the latest updates and insights into luxury grooming.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4 sm:mb-8">
                {[
                  { icon: Instagram, href: 'https://www.instagram.com/emiliobeaufort_official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', label: 'Instagram' },
                  { icon: Twitter, href: 'https://x.com/Emilio_Beaufort?t=0p7UVvP0DjaMiqT50ydDEg&s=09', label: 'Twitter' },
                  { icon: Linkedin, href: 'https://www.linkedin.com/company/emiliobeaufort', label: 'LinkedIn' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-300 hover:text-gold transition-premium p-3 hover:bg-white/10 rounded-full flex items-center justify-center"
                    aria-label={social.label}
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                <h5 className="font-sans-semibold text-white text-sm mb-3 sm:mb-6">Contact</h5>
                <div className="space-y-2 sm:space-y-4 text-gray-300 text-sm">
                  <div>
                    <span className="font-sans-medium">WhatsApp: </span>
                    <a 
                      href="https://wa.me/918962648358" 
                      className="hover:text-gold transition-premium footer-link-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +91-8962648358
                    </a>
                  </div>
                  <div>
                    <span className="font-sans-medium">Email: </span>
                    <a 
                      href="mailto:hello@emiliobeaufort.com" 
                      className="hover:text-gold transition-premium footer-link-underline"
                    >
                      hello@emiliobeaufort.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 pt-4 sm:pt-8 mt-4 sm:mt-8 gap-4 sm:gap-0">
            <p className="body-premium text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} Emilio Beaufort.Pvt.Ltd. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0 footer-link-underline">
                Privacy Policy
              </Link>
              <a href="#" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0 footer-link-underline">
                Terms of Service
              </a>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0 footer-link-underline">
                Cookie Policy
              </Link>
            </div>
          </div>
          
          {/* Brand Name at the End */}
          <div className="border-t border-gray-700 pt-4 sm:pt-6 mt-4 sm:mt-6 text-center">
            <h2 className="heading-premium text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-wider">
              EMILIO BEAUFORT
            </h2>
          </div>
        </div>

        {/* Feedback Form Dialog */}
        <FeedbackFormDialog 
          isOpen={isFeedbackFormOpen}
          onClose={() => setIsFeedbackFormOpen(false)}
          isAutoTriggered={false}
        />
      </footer>
      {/* Back to Top Button - Left Bottom */}

    </>
  );
} 
