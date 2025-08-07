"use client";

import { usePathname } from 'next/navigation';
import SaleBanner from './SaleBanner';

export default function ConditionalSaleBanner() {
  const pathname = usePathname();
  
  // Don't show sale banner in admin section or certain pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  // You can add more conditions here to control when the banner shows
  // For example, you might want to hide it on certain pages or based on user preferences
  
  return <SaleBanner />;
} 