import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import PageTransitionProgressBar from "@/components/PageTransitionProgressBar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Suspense } from "react";
import { BagProvider } from '@/components/BagContext';
import { Toaster as ReactHotToastToaster } from 'react-hot-toast';
import ConditionalAutoFeedback from '@/components/ConditionalAutoFeedback';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ScrollToTop from '@/components/ScrollToTop';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Updated favicon URL
const faviconUrl = "https://mzvuuvtckcimzemivltz.supabase.co/storage/v1/object/public/the-house/favicon.ico";

export const metadata = {
  title: "Luxury Temple Hair Extensions | Emilio Beaufort | Shop Premium Indian Hair",
  description: "Explore Emilio Beaufort's collection of ethically sourced, luxury temple hair extensions. Discover the difference with our premium Indian hair and grooming products. Shop now.",
  keywords: "luxury temple hair extensions, premium indian hair, ethically sourced hair, temple hair, hair extension, emilio beaufort, indian hair extensions, luxury grooming, hair extension blog, natural hair extensions, premium hair care, virgin hair extensions, authentic temple hair",
  other: {
    "google-adsense-account": "ca-pub-5512739027608050"
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5512739027608050"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-white text-gray-900 font-sans`}>
        <BagProvider>
          <ScrollToTop />
          <ConditionalNavbar />
          <main>
            {children}
          </main>
        </BagProvider>
        <ConditionalAutoFeedback />
        <Toaster position="top-center" richColors />
        <ReactHotToastToaster position="top-center" reverseOrder={false} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}