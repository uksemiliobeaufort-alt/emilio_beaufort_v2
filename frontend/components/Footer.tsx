"use client";

import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-premium-dark border-t border-premium py-16">
      <div className="container-premium">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="heading-premium text-2xl text-white mb-4">Emilio Beaufort</h3>
            <p className="body-premium text-gray-300 leading-relaxed">
              Where luxury meets precision. Crafting exceptional grooming experiences for the discerning gentleman.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-sans-semibold text-white mb-6">Quick Links</h4>
            <div className="space-y-3">
              {[
                { name: 'Philosophy', href: '#philosophy' },
                { name: 'The House', href: '#house' },
                { name: 'Journal', href: '#journal' },
                { name: 'Alliances', href: '#alliances' }
              ].map((link) => (
                <button
                  key={link.name}
                  onClick={() => document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-gray-300 hover:text-gold transition-premium font-sans-medium"
                >
                  {link.name}
                </button>
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
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="border-t border-premium pt-8"> */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="body-premium text-gray-400 mb-4 md:mb-0">
              © {currentYear} Emilio Beaufort. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-gold transition-premium">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gold transition-premium">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-gold transition-premium">Cookie Policy</a>
            </div>
          </div>
        {/* </div> */}
      </div>
    </footer>
  );
} 