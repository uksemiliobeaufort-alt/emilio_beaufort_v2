'use client';

import { Suspense } from 'react';
import PageTransitionProgressBarInner from './PageTransitionProgressBarInner';

export default function PageTransitionProgressBar() {
  return (
    <Suspense fallback={null}>
      <PageTransitionProgressBarInner />
    </Suspense>
  );
} 