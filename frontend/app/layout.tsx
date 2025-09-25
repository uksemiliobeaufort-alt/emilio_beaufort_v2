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
              height: 100vh;
              height: 100dvh; /* Dynamic viewport height for mobile */
              overflow: hidden;
              padding: 0;
              margin: 0;
            }
            
            /* Reduce hero section height on mobile and tablet devices */
            @media (max-width: 1024px) {
              .hero-section {
                height: 60vh;
                height: 60dvh; /* Dynamic viewport height for mobile and tablets */
              }
            }
            
            @media (max-width: 768px) {
              .hero-section {
                height: 50vh;
                height: 50dvh; /* Dynamic viewport height for mobile */
              }
            }
            
            /* Apply mobile logic for ultra-wide screens (1400px+) */
            @media (min-width: 1400px) {
              .hero-section {
                height: 60vh;
                height: 60dvh; /* Dynamic viewport height for ultra-wide screens */
              }
              /* Dimmed background for ultra-wide screens */
              .hero-section .bg-black\/40 {
                background-color: rgba(0, 0, 0, 0.4) !important;
              }
            }
            .hero-image-container {
              position: absolute;
              top: 48px; /* Start exactly after mobile navbar (h-12 = 48px) */
              left: 0;
              right: 0;
              bottom: 0;
              width: 100vw;
              height: calc(100vh - 48px); /* Full height minus navbar height */
            }
            /* Responsive navbar height adjustments - exact navbar heights */
            @media (min-width: 480px) {
              .hero-image-container {
                top: 56px; /* Start exactly after small screen navbar (h-14 = 56px) */
                height: calc(100vh - 56px);
              }
            }
            @media (min-width: 640px) {
              .hero-image-container {
                top: 64px; /* Start exactly after large screen navbar (h-16 = 64px) */
                height: calc(100vh - 64px);
              }
            }
            .hero-image {
              width: 100vw;
              height: 100vh;
              object-fit: cover;
              object-position: center center;
              transform: scale(1);
              transition: transform 0.3s ease;
            }
            
            /* Ultra-small mobile devices (320px - 375px) */
            @media (max-width: 375px) {
              .hero-image {
                width: 100vw;
                height: 50vh;
                object-position: center 30%;
                object-fit: cover;
                transform: scale(1);
              }
            }
            
            /* Small mobile devices (376px - 480px) */
            @media (min-width: 376px) and (max-width: 480px) {
              .hero-image {
                width: 100vw;
                height: 50vh;
                object-position: center 25%;
                object-fit: cover;
                transform: scale(1);
              }
            }
            
            /* Medium mobile devices (481px - 640px) */
            @media (min-width: 481px) and (max-width: 640px) {
              .hero-image {
                width: 100vw;
                height: 60vh;
                object-position: center 20%;
                transform: scale(1.05);
              }
            }
            
            /* Large mobile / Small tablet (641px - 768px) */
            @media (min-width: 641px) and (max-width: 768px) {
              .hero-image {
                width: 100vw;
                height: 60vh;
                object-position: center 15%;
                transform: scale(1.02);
              }
            }
            
            /* Tablet portrait (769px - 1024px) */
            @media (min-width: 769px) and (max-width: 1024px) {
              .hero-image {
                width: 100vw;
                height: 100vh;
                object-position: center 10%;
                transform: scale(1);
              }
            }
            
            /* Small desktop (1025px - 1280px) */
            @media (min-width: 1025px) and (max-width: 1280px) {
              .hero-image {
                width: 100vw;
                height: 100vh;
                object-position: center center;
                transform: scale(1);
              }
            }
            
            /* Medium desktop (1281px - 1440px) */
            @media (min-width: 1281px) and (max-width: 1440px) {
              .hero-image {
                width: 100vw;
                height: 100vh;
                object-position: center center;
                transform: scale(1);
              }
            }
            
            /* Large desktop (1441px - 1920px) */
            @media (min-width: 1441px) and (max-width: 1920px) {
              .hero-image {
                width: 100vw;
                height: 100vh;
                object-position: center center;
                transform: scale(1);
              }
            }
            
            /* Ultra-wide screens (1921px+) */
            @media (min-width: 1921px) {
              .hero-image {
                width: 100vw;
                height: 100vh;
                object-position: center center;
                transform: scale(1.05);
              }
            }
            
            /* High DPI / Retina displays */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
              .hero-image {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
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