"use client";

import { usePathname } from 'next/navigation';
import AutoFeedbackTrigger from '@/components/AutoFeedbackTrigger';

export default function ConditionalAutoFeedback() {
  const pathname = usePathname();
  
  // Don't show auto feedback in admin section
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <AutoFeedbackTrigger />;
} 