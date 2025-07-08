"use client";

import { useState } from "react";
import { Instagram, Twitter, Facebook, Linkedin, ArrowLeft } from "lucide-react";
import AdminPannel from './AdminPannel/AdminPannel';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <footer className="bg-premium-dark border-t border-premium py-16 relative">
        <div className="container-premium">
          {/* Footer content... (unchanged) */}
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
                  { icon: Instagram, href: 'https://www.instagram.com/emiliobeaufort', label: 'Instagram' },
                  { icon: Twitter, href: 'https://twitter.com/emiliobeaufort', label: 'Twitter' },
                  { icon: Facebook, href: 'https://facebook.com/emiliobeaufort', label: 'Facebook' },
                  { icon: Linkedin, href: 'https://linkedin.com/company/emiliobeaufort', label: 'LinkedIn' }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-gray-300 hover:text-gold transition-premium p-2 hover:bg-white/10 rounded-full"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
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

          {/* Admin Panel Trigger Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAdmin(true)}
              className="text-xs text-gray-500 hover:text-white transition"
            >
              adminpannel
            </button>
          </div>
        </div>
      </footer>

      {/* 🪟 Fullscreen Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
          <div className="bg-white w-full h-full flex flex-col relative overflow-hidden border border-gray-300">
            {/* Mac-style top bar */}
            <div className="bg-[#e5e5e5] px-4 py-2 flex items-center space-x-2">
              {/* MacOS traffic lights */}
              <div
                className="w-3 h-3 bg-red-500 rounded-full cursor-pointer"
                onClick={() => setShowAdmin(false)}
              />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div className="flex-1" />
              {/* Back button */}
              <button className="text-gray-700 hover:text-black text-sm flex items-center space-x-1">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>

            {/* Admin Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <AdminPannel />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
