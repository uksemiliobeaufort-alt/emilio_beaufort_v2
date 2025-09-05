"use client";

import { useState, useEffect } from 'react';

export default function InitialLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading for a minimum time to ensure smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second minimum loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        <div className="text-black text-lg font-medium mb-4">
          Loading...
        </div>
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
