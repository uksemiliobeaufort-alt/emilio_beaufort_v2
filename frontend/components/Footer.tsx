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
    <footer className="bg-premium-dark border-t border-premium py-16">
      <div className="container-premium">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="heading-premium text-2xl text-white mb-4">Emilio Beaufort</h3>
            <p className="body-premium text-gray-300 leading-relaxed mb-6">
              Where luxury meets precision. Crafting exceptional grooming experiences for the discerning gentleman.
            </p>
            
            {/* Domestic Supply Section */}
            <div className="border-t border-gray-700 pt-6">
              <h4 className="font-sans-semibold text-white mb-4">Domestic Supply (India)</h4>
              <p className="body-premium text-gray-300 leading-relaxed text-sm">
                We supply raw human hair and wigs within India to Salons, Wig makers, Beauty retailers, Online store owners, and Cosmetic brands. Fast delivery across major Indian cities. Payment via UPI, NEFT or advance invoice.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-sans-semibold text-white mb-6">Quick Links</h4>
            <div className="space-y-3">
              {[
                { name: 'Philosophy', href: '#philosophy', isExternal: false },
                { name: 'The House', href: '#house', isExternal: false },
                { name: 'Journal', href: '#journal', isExternal: false },
                { name: 'Give Feedback', href: '#feedback', isExternal: false, isFeedback: true },
                { name: 'Admin Login', href: '/admin/login', isExternal: true }
              ].map((link: any) => (
                link.isExternal ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-gray-300 hover:text-gold transition-premium font-sans-medium"
                  >
                    {link.name}
                  </Link>
                ) : link.isFeedback ? (
                  <button
                    key={link.name}
                    onClick={() => setIsFeedbackFormOpen(true)}
                    className="block text-gray-300 hover:text-gold transition-premium font-sans-medium flex items-center"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    {link.name}
                  </button>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                    className="block text-gray-300 hover:text-gold transition-premium font-sans-medium"
                  >
                    {link.name}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="font-sans-semibold text-white mb-6">Connect</h4>
            <p className="body-premium text-gray-300 mb-6">
              Follow us for the latest updates and insights into luxury grooming.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              {[
                { icon: Instagram, href: 'https://www.linkedin.com/company/emiliobeaufort', label: 'Instagram' },
                { icon: Twitter, href: 'https://www.linkedin.com/company/emiliobeaufort', label: 'Twitter' },
                { icon: Facebook, href: 'https://www.linkedin.com/company/emiliobeaufort', label: 'Facebook' },
                { icon: Linkedin, href: 'https://www.linkedin.com/company/emiliobeaufort', label: 'LinkedIn' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-300 hover:text-gold transition-premium p-2 hover:bg-white/10 rounded-full"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
            
            {/* Contact Information */}
            <div className="mt-6 space-y-2">
              <h5 className="font-sans-semibold text-white text-sm mb-3">Contact</h5>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-sans-medium">WhatsApp:</span>
                  <a 
                    href="https://wa.me/918962648358" 
                    className="ml-2 hover:text-gold transition-premium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +91-8962648358
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-sans-medium">Email:</span>
                  <a 
                    href="mailto:hello@emiliobeaufort.com" 
                    className="ml-2 hover:text-gold transition-premium"
                  >
                    hello@emiliobeaufort.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="body-premium text-gray-400 mb-4 md:mb-0">
            © 2023 Emilio Beaufort. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta">
              Privacy Policy
            </Link>
            <a href="#" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta">
              Terms of Service
            </a>
            <Link href="/cookie-policy" className="text-gray-400 hover:text-gold transition-premium font-plus-jakarta">
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
  );
} 