"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 500,
  trickleSpeed: 200,
});

export default function PageTransitionProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    // Complete the progress bar after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
} 