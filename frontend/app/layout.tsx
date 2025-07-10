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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Construct favicon URL from Supabase bucket
const faviconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/favicon.ico`;

export const metadata = {
  title: "Emilio Beaufort - Luxury Grooming",
  description: "Emilio Beaufort - Luxury grooming products and philosophy by Emilio Beaufort.",
  icons: {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
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
      </body>
    </html>
  );
}