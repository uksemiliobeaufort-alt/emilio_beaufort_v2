"use client";

import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    name: 'Partnerships',
    href: '/admin/partnerships',
    icon: <Users className="h-4 w-4" />
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  {
    name: 'Blog Posts',
    href: '/admin/journal',
    icon: <FileText className="h-4 w-4" />
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="h-4 w-4" />
  }
];

export default function Sidebar({ isSidebarOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    auth.logout();
    router.replace('/admin/login');
  };

  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-20
          h-full w-64 bg-white border-r
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b">
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm
                  rounded-md transition-colors
                  ${pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
} 