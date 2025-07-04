import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import PageTransitionProgressBar from "@/components/PageTransitionProgressBar";
import { Navbar } from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import { BagProvider } from '@/components/BagContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
  title: "Emilio Beaufort - Luxury Grooming",
  description: "Luxury grooming products and philosophy by Emilio Beaufort.",
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
          <main>
            {children}
          </main>
        </BagProvider>
        <Toaster />
      </body>
    </html>
  );
}
