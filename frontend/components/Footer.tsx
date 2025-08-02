"use client";

import { Instagram, Twitter, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import FeedbackFormDialog from "@/components/ui/FeedbackFormDialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  
  return (
    <>
      <footer 
        className="bg-black border-t border-gray-700 py-8 sm:py-12 lg:py-16"
        style={{ 
          background: '#000000 !important',
          position: 'relative'
        }}
      >
        <div className="container-premium">
          {/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
            {/* Brand Section */}
            <div className="text-center sm:text-left">
              <h3 className="heading-premium text-xl sm:text-2xl lg:text-2xl text-white mb-6">Emilio Beaufort</h3>
              <p className="body-premium text-gray-300 leading-relaxed mb-8 text-sm sm:text-base">
                Where luxury meets precision. Crafting exceptional grooming experiences for the discerning gentleman.
              </p>
              {/* Divider for mobile only */}
              <div className="block sm:hidden border-t border-gray-700 my-8"></div>
              {/* Domestic Supply Section */}
              <div className="border-t border-gray-700 pt-8">
                <h4 className="font-sans-semibold text-white mb-6 text-base sm:text-lg">Domestic Supply (India)</h4>
                <p className="body-premium text-gray-300 leading-relaxed text-xs sm:text-sm">
                  We supply raw human hair and wigs within India to Salons, Wig makers, Beauty retailers, Online store owners, and Cosmetic brands. Fast delivery across major Indian cities. Payment via UPI, NEFT or advance invoice.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-center lg:text-center">
              <h4 className="font-sans-semibold text-white mb-8 text-base sm:text-lg">Quick Links</h4>
              <nav className="flex flex-col space-y-4 items-center">
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
                        className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-2 px-0 min-h-[44px] flex items-center"
                      >
                        {link.name}
                      </Link>
                    ) : link.isFeedback ? (
                      <button
                        onClick={() => setIsFeedbackFormOpen(true)}
                        className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-2 px-0 min-h-[44px] flex items-center"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <button
                        onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-gray-300 hover:text-gold transition-premium font-sans-medium text-sm sm:text-base py-2 px-0 min-h-[44px] flex items-center"
                      >
                        {link.name}
                      </button>
                    )}
                  </div>
                ))}
              </nav>
              {/* Divider for mobile only */}
              <div className="block sm:hidden border-t border-gray-700 my-8"></div>
            </div>

            {/* Contact */}
            <div className="text-center sm:text-left lg:col-span-1 sm:col-span-2 lg:col-span-1">
              <h4 className="font-sans-semibold text-white mb-8 text-base sm:text-lg">Connect</h4>
              <p className="body-premium text-gray-300 mb-8 text-sm sm:text-base">
                Follow us for the latest updates and insights into luxury grooming.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-8">
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
              <div className="space-y-6">
                <h5 className="font-sans-semibold text-white text-sm mb-6">Contact</h5>
                <div className="space-y-4 text-gray-300 text-sm">
                  <div>
                    <span className="font-sans-medium">WhatsApp: </span>
                    <a 
                      href="https://wa.me/918962648358" 
                      className="hover:text-gold transition-premium"
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
                      className="hover:text-gold transition-premium"
                    >
                      hello@emiliobeaufort.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 pt-8 mt-8 gap-4 sm:gap-0">
            <p className="body-premium text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} Emilio Beaufort. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0">
                Privacy Policy
              </Link>
              <a href="#" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0">
                Terms of Service
              </a>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta py-2 sm:py-0">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Form Dialog */}
        <FeedbackFormDialog 
          isOpen={isFeedbackFormOpen}
          onClose={() => setIsFeedbackFormOpen(false)}
          isAutoTriggered={false}
        />
      </footer>

    </>
  );
} 