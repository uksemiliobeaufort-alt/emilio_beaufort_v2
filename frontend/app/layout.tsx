"use client";

import "./globals.css";
import { Inter, Playfair_Display, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import PageTransitionProgressBar from "@/components/PageTransitionProgressBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FloatingFeedbackButton from "@/components/FloatingFeedbackButton";
import { Suspense } from "react";
import { BagProvider } from '@/components/BagContext';
import CookieConsent from '@/components/CookieConsent';
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} bg-white text-gray-900 font-sans`}>
        <BagProvider>
          {/* <Navbar /> */}
          <main>
            {children}
          </main>
          {!isAdminPage && <Footer />}
        </BagProvider>
        <Toaster 
          position="bottom-right" 
          richColors 
          toastOptions={{
            style: {
              zIndex: 99999,
            },
            className: 'custom-toast',
          }}
        />
        <CookieConsent />
        {!isAdminPage && <FloatingFeedbackButton />}
      </body>
    </html>
  );
}
