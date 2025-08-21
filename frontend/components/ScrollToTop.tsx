"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    // Use smooth scrolling for better UX
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}
