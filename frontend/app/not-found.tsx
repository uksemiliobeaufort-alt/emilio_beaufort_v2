'use client';

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-gray-700 mb-8">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300"
        >
          <span className="mr-2">←</span>
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 