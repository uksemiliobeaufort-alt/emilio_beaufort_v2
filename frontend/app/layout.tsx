import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import PageTransitionProgressBar from "@/components/PageTransitionProgressBar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
// import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import { BagProvider } from '@/components/BagContext';
import { Toaster as ReactHotToastToaster } from 'react-hot-toast';
import ConditionalAutoFeedback from '@/components/ConditionalAutoFeedback';
import GoogleAnalytics from '@/components/GoogleAnalytics';


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Construct favicon URL from Supabase bucket
const faviconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/favicon.ico`;

export const metadata = {
  title: "Emilio Beaufort | Luxury Temple Hair Extensions & Grooming",
  description: "Discover Emilio Beaufort's luxury temple hair extensions and grooming products. Learn what is temple hair, explore our hair extension blog, and shop premium hair from India.",
  keywords: "temple hair, hair extension, emilio beaufort, temple hair blog, what is temple hair, luxury grooming, indian hair extensions, premium hair, hair extension blog, luxury hair care",
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
  openGraph: {
    title: "Emilio Beaufort | Luxury Temple Hair Extensions & Grooming",
    description: "Discover Emilio Beaufort's luxury temple hair extensions and grooming products. Learn what is temple hair, explore our hair extension blog, and shop premium hair from India.",
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
    title: "Emilio Beaufort | Luxury Temple Hair Extensions & Grooming",
    description: "Discover Emilio Beaufort's luxury temple hair extensions and grooming products. Learn what is temple hair, explore our hair extension blog, and shop premium hair from India.",
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
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-white text-gray-900 font-sans`}>
        
        <BagProvider>
          <ConditionalNavbar />
          <main>
            {children}
          </main>
        </BagProvider>
        <ConditionalAutoFeedback />
        <ReactHotToastToaster position="top-center" reverseOrder={false} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}