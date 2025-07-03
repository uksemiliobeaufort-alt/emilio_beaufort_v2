"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state
    auth.init();
    
    // Redirect to dashboard if authenticated, otherwise to login
    if (auth.isAdmin()) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return null; // This page just handles redirection
} 