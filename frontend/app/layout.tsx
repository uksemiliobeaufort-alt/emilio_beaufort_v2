import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import InitialLoading from "@/components/InitialLoading";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Suspense } from "react";
import { BagProvider } from '@/components/BagContext';
import { Toaster as ReactHotToastToaster } from 'react-hot-toast';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ScrollToTop from '@/components/ScrollToTop';
import PerformanceMonitor from '@/components/PerformaceMonitor';
 


const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: 'swap'
});

// Updated favicon URL
const faviconUrl = "https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/the-house/favicon.ico";

export const metadata = {
  title: "Luxury Temple Hair Extensions | Emilio Beaufort | Shop Premium Indian Hair",
  description: "Explore Emilio Beaufort's collection of ethically sourced, luxury temple hair extensions. Discover the difference with our premium Indian hair and grooming products. Shop now.",
  keywords: "luxury temple hair extensions, premium indian hair, ethically sourced hair, temple hair, hair extension, emilio beaufort, indian hair extensions, luxury grooming, hair extension blog, natural hair extensions, premium hair care, virgin hair extensions, authentic temple hair",
  other: {
    
  },
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
  openGraph: {
    title: "Luxury Temple Hair Extensions | Emilio Beaufort | Shop Premium Indian Hair",
    description: "Explore Emilio Beaufort's collection of ethically sourced, luxury temple hair extensions. Discover the difference with our premium Indian hair and grooming products. Shop now.",
    url: "https://emiliobeaufort.com/",
    type: "website",
    images: [
      {
        url: faviconUrl,
        width: 512,
        height: 512,
        alt: "Emilio Beaufort Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Temple Hair Extensions | Emilio Beaufort | Shop Premium Indian Hair",
    description: "Explore Emilio Beaufort's collection of ethically sourced, luxury temple hair extensions. Discover the difference with our premium Indian hair and grooming products. Shop now.",
    images: [faviconUrl],
    creator: "@emiliobeaufort"
  },
  robots: "index, follow"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Preconnect to Supabase storage (favicon + assets) */}
        <link
          rel="preconnect"
          href="https://mzvuuvtckcimzemivltz.supabase.co"
          crossOrigin=""
        />

        {/* Preconnect to analytics domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Preconnect to Firebase Storage */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="" />
        
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://sheets.googleapis.com" />
        <link rel="dns-prefetch" href="https://encrypted-tbn0.gstatic.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        
        {/* Fonts are handled by Next.js font optimization */}
        
        {/* Critical CSS for hero section to reduce render delay */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-section {
              position: relative;
              width: 100%;
              min-height: 100svh;
              overflow: hidden;
              padding-top: 0;
            }
            @media (min-width: 768px) {
              .hero-section {
                padding-top: 5rem;
              }
            }
            .hero-image-container {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 0;
              top: 4rem;
            }
            @media (min-width: 768px) {
              .hero-image-container {
                top: 5rem;
              }
            }
            @media (min-width: 1024px) {
              .hero-image-container {
                top: 3rem;
              }
            }
            .hero-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: left;
              transform-origin: left;
              transform: scale(1.25);
            }
            @media (min-width: 640px) {
              .hero-image {
                transform: scale(1.25);
              }
            }
            @media (min-width: 768px) {
              .hero-image {
                transform: scale(1.15);
              }
            }
            @media (min-width: 1024px) {
              .hero-image {
                object-position: center;
                transform: scale(1);
              }
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-white text-gray-900 font-sans`}>
        {/* Production Security: Comprehensive data protection and console suppression */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                'use strict';
                try {
                  // Only apply security in production
                  if (typeof window !== 'undefined' && (process?.env?.NODE_ENV === 'production' || window.location.hostname !== 'localhost')) {
                    
                    // 1. Safe console suppression that doesn't conflict with Next.js
                    if (window.console && !window.console._securityPatched) {
                      var noop = function(){};
                      var originalConsole = window.console;
                      
                      // Store original methods for debugging if needed
                      var originalMethods = {
                        log: originalConsole.log,
                        info: originalConsole.info,
                        warn: originalConsole.warn,
                        error: originalConsole.error,
                        debug: originalConsole.debug
                      };
                      
                      // Override console methods safely
                      try {
                        originalConsole.log = noop;
                        originalConsole.info = noop;
                        originalConsole.warn = noop;
                        originalConsole.error = noop;
                        originalConsole.debug = noop;
                        originalConsole._securityPatched = true;
                      } catch(e) {
                        originalConsole._securityPatched = true;
                      }
                    }
                    
                    // 2. Network tab protection - Hide sensitive data from network requests
                    function protectNetworkData() {
                      try {
                        // Override fetch to sanitize sensitive data
                        if (window.fetch && !window.fetch._protected) {
                          var originalFetch = window.fetch;
                          window.fetch = function() {
                            var args = Array.prototype.slice.call(arguments);
                            // Sanitize URLs and request data
                            if (args[0] && typeof args[0] === 'string') {
                              args[0] = args[0].replace(/token=[^&]*/gi, 'token=***');
                              args[0] = args[0].replace(/key=[^&]*/gi, 'key=***');
                              args[0] = args[0].replace(/secret=[^&]*/gi, 'secret=***');
                              args[0] = args[0].replace(/password=[^&]*/gi, 'password=***');
                            }
                            return originalFetch.apply(this, args);
                          };
                          window.fetch._protected = true;
                        }
                        
                        // Override XMLHttpRequest to sanitize sensitive data
                        if (window.XMLHttpRequest && !window.XMLHttpRequest._protected) {
                          var originalXHR = window.XMLHttpRequest;
                          window.XMLHttpRequest = function() {
                            var xhr = new originalXHR();
                            var originalOpen = xhr.open;
                            xhr.open = function(method, url) {
                              if (url) {
                                url = url.replace(/token=[^&]*/gi, 'token=***');
                                url = url.replace(/key=[^&]*/gi, 'key=***');
                                url = url.replace(/secret=[^&]*/gi, 'secret=***');
                                url = url.replace(/password=[^&]*/gi, 'password=***');
                              }
                              return originalOpen.apply(this, arguments);
                            };
                            return xhr;
                          };
                          window.XMLHttpRequest._protected = true;
                        }
                      } catch(e) {
                        // Silently ignore errors
                      }
                    }
                    
                    // 3. DOM protection - Hide sensitive elements
                    function protectDOMData() {
                      try {
                        var sensitiveSelectors = [
                          '[data-token]', '[data-key]', '[data-secret]', '[data-api]', 
                          '[data-auth]', '[data-password]', '[data-email]', '[data-phone]',
                          '.token', '.key', '.secret', '.api-key', '.auth-token', 
                          '.password', '.email', '.phone', '.sensitive'
                        ];
                        
                        sensitiveSelectors.forEach(function(selector) {
                          var elements = document.querySelectorAll(selector);
                          elements.forEach(function(el) {
                            if (el && el.style) {
                              el.style.display = 'none';
                              el.style.visibility = 'hidden';
                              el.style.opacity = '0';
                              el.style.position = 'absolute';
                              el.style.left = '-9999px';
                            }
                          });
                        });
                      } catch(e) {
                        // Silently ignore errors
                      }
                    }
                    
                    // 4. Developer tools protection
                    function protectDeveloperTools() {
                      try {
                        // Disable right-click context menu
                        document.addEventListener('contextmenu', function(e) {
                          e.preventDefault();
                          return false;
                        });
                        
                        // Disable common developer shortcuts
                        document.addEventListener('keydown', function(e) {
                          if (e.key === 'F12' || 
                              (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                              (e.ctrlKey && e.key === 'U') ||
                              (e.ctrlKey && e.shiftKey && e.key === 'K')) {
                            e.preventDefault();
                            return false;
                          }
                        });
                        
                        // Detect and warn about developer tools
                        var devtools = {
                          open: false,
                          orientation: null
                        };
                        
                        setInterval(function() {
                          if (window.outerHeight - window.innerHeight > 200 || 
                              window.outerWidth - window.innerWidth > 200) {
                            if (!devtools.open) {
                              devtools.open = true;
                              // Optionally redirect or show warning
                              // window.location.href = '/security-warning';
                            }
                          } else {
                            devtools.open = false;
                          }
                        }, 500);
                      } catch(e) {
                        // Silently ignore errors
                      }
                    }
                    
                    // 5. Local storage protection
                    function protectLocalStorage() {
                      try {
                        // Clear sensitive data from localStorage
                        var sensitiveKeys = ['token', 'key', 'secret', 'auth', 'password', 'email'];
                        sensitiveKeys.forEach(function(key) {
                          try {
                            localStorage.removeItem(key);
                            sessionStorage.removeItem(key);
                          } catch(e) {
                            // Silently ignore errors
                          }
                        });
                      } catch(e) {
                        // Silently ignore errors
                      }
                    }
                    
                    // Initialize all protection measures
                    protectNetworkData();
                    protectDOMData();
                    protectDeveloperTools();
                    protectLocalStorage();
                    
                    // Run DOM protection periodically
                    setInterval(protectDOMData, 2000);
                    
                    // Run localStorage protection periodically
                    setInterval(protectLocalStorage, 5000);
                  }
                } catch(e) {
                  // Silently ignore any errors
                }
              })();
            `,
          }}
        />
        <InitialLoading />
        <PerformanceMonitor />
        <BagProvider>
          <ScrollToTop />
          <ConditionalNavbar />
          <main>
            {children}
          </main>
        </BagProvider>
        <Toaster position="top-center" richColors />
        <ReactHotToastToaster position="top-center" reverseOrder={false} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}