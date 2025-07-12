"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cookie Consent Component
 * 
 * Behavior:
 * - Shows only ONCE per user (persistent across browser sessions)
 * - Uses localStorage to remember user's choice
 * - On localhost: Can be reset using window.resetCookieConsent()
 * - On production: Only shows if user hasn't made a choice before
 * 
 * Testing:
 * - In browser console on localhost: window.resetCookieConsent()
 * - Or set window.__FORCE_COOKIE_CONSENT__ = true before page load
 */

interface CookieConsentProps {
  className?: string;
}

export default function CookieConsent({ className }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if we're on localhost for development/testing
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '0.0.0.0');

    // Check if user has already made a choice (persistent across sessions)
    const hasConsented = localStorage.getItem("emilio-beaufort-cookies-consent");
    const consentDate = localStorage.getItem("emilio-beaufort-consent-date");
    
    // Debug logging
    if (isLocalhost) {
      console.log('Cookie Consent Debug:', {
        hasConsented,
        consentDate,
        isLocalhost,
        willShow: !hasConsented
      });
    }
    
    // For development/testing: Add a way to reset consent
    if (isLocalhost && typeof window !== 'undefined') {
      // Add a global function to reset consent for testing
      (window as any).resetCookieConsent = () => {
        localStorage.removeItem("emilio-beaufort-cookies-consent");
        localStorage.removeItem("emilio-beaufort-consent-date");
        console.log('Cookie consent reset for testing');
        setShowConsent(true);
      };
      
      // Check if we should show consent (either no consent or forced reset)
      const shouldShow = !hasConsented || (window as any).__FORCE_COOKIE_CONSENT__;
      if (shouldShow) {
        setTimeout(() => {
          setShowConsent(true);
          setIsLoaded(true);
        }, 1000);
      } else {
        setIsLoaded(true);
      }
    } else {
      // Production behavior - only show if no consent has been given
      if (!hasConsented) {
        setTimeout(() => {
          setShowConsent(true);
          setIsLoaded(true);
        }, 1000);
      } else {
        setIsLoaded(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("emilio-beaufort-cookies-consent", "accepted");
    localStorage.setItem("emilio-beaufort-consent-date", new Date().toISOString());
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("emilio-beaufort-cookies-consent", "declined");
    localStorage.setItem("emilio-beaufort-consent-date", new Date().toISOString());
    setShowConsent(false);
  };

  const handleCustomize = () => {
    // For now, just show a simple alert. You can replace with a detailed modal later
    alert("Cookie customization will be available soon. For now, you can accept or decline all cookies.");
  };

  if (!isLoaded || !showConsent) {
    return null;
  }

  return (
    <AnimatePresence>
      {showConsent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Consent Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
          >
            <div className="bg-white border-t border-gray-200 shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Cookie Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-lg font-space-grotesk font-semibold text-gray-900 mb-2">
                          Your Privacy Matters
                        </h3>
                        <p className="text-sm font-plus-jakarta text-gray-600 leading-relaxed">
                          We use cookies and similar technologies to enhance your browsing experience, 
                          analyze website traffic, and provide personalized content. This helps us deliver 
                          the best possible service for our luxury grooming products.{" "}
                          <a 
                            href="/privacy-policy" 
                            className="text-blue-600 hover:text-blue-700 underline font-medium"
                          >
                            Privacy Policy
                          </a>
                          {" & "}
                          <a 
                            href="/cookie-policy" 
                            className="text-blue-600 hover:text-blue-700 underline font-medium"
                          >
                            Cookie Policy
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                    <Button
                      onClick={handleCustomize}
                      variant="outline"
                      className="font-plus-jakarta border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5"
                    >
                      Customize
                    </Button>
                    <Button
                      onClick={handleDecline}
                      variant="outline" 
                      className="font-plus-jakarta border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5"
                    >
                      Decline All
                    </Button>
                    <Button
                      onClick={handleAccept}
                      className="font-space-grotesk font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 