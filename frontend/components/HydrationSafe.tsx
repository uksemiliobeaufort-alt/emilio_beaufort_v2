"use client";

import { useState, useEffect, ReactNode } from 'react';

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that ensures hydration safety by only rendering children after mount.
 * This prevents hydration mismatches between server and client rendering.
 */
export default function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
