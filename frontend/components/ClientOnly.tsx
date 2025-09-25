"use client";

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Always return the same structure to prevent hydration mismatches
  if (!hasMounted) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
}
