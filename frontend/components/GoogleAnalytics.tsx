"use client";

import { Suspense } from 'react';
import GoogleAnalyticsInner from './GoogleAnalyticsInner';

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
} 