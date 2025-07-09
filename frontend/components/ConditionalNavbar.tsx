"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar in admin section
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Navbar />;
} 