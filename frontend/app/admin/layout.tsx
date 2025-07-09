"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, Home } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Start as mobile to prevent flash

  useEffect(() => {
    // Initialize auth state
    auth.init();
    
    // Check if user is authenticated
    if (!auth.isAdmin()) {
      router.replace('/admin/login');
      return;
    }

    // Handle responsive sidebar
    const handleResize = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 1024; // 1024px breakpoint for better tablet experience
      
      // Only update if the mobile state actually changed
      setIsMobile(prevIsMobile => {
        if (prevIsMobile !== newIsMobile) {
          // Auto-close sidebar on mobile/tablet, auto-open on desktop
          if (newIsMobile) {
            setIsSidebarOpen(false);
          } else {
            setIsSidebarOpen(true);
          }
          return newIsMobile;
        }
        return prevIsMobile;
      });
    };

    // Initial check after mount to get actual window size
    const initialCheck = () => {
      if (typeof window !== 'undefined') {
        handleResize();
      }
    };

    // Use setTimeout to ensure this runs after the component is mounted
    const timeoutId = setTimeout(initialCheck, 0);
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  // Additional effect to handle screen size changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const newIsMobile = e.matches;
      setIsMobile(newIsMobile);
      
      // Force sidebar state based on screen size
      if (newIsMobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    const isCurrentlyMobile = mediaQuery.matches;
    setIsMobile(isCurrentlyMobile);
    setIsSidebarOpen(!isCurrentlyMobile);

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Close sidebar when clicking on main content on mobile
  const handleMainContentClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    auth.logout();
    router.replace('/admin/login');
  };

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-3 p-2"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <span className="font-semibold text-gray-900">Admin Panel</span>
        </div>
        
        {/* Quick actions on mobile header */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm transition-all duration-200 text-gray-700 hover:text-gray-900"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        </div>
      </div>

      {/* Desktop Back to Home Button */}
      <div className="hidden lg:block fixed top-6 left-6 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
          className="bg-white/90 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:translate-y-[-1px] text-gray-700 hover:text-gray-900"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Mobile/Tablet Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          min-h-screen bg-gray-50
          ${isSidebarOpen && !isMobile ? 'lg:pl-64' : ''}
          ${isMobile ? 'pt-14' : ''}
        `}
        onClick={handleMainContentClick}
      >
        <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Page content wrapper with responsive padding */}
          <div className="w-full">
            {children}
            <Analytics />
          </div>
        </div>
      </main>
    </div>
  );
} 