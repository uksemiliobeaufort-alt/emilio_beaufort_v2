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
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarSubItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SidebarSubItem[];
}

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    name: 'Partnerships',
    href: '/admin/partnerships',
    icon: <Users className="h-4 w-4" />,
    subItems: [
      {
        name: 'Pending Inquiries',
        href: '/admin/partnerships',
        icon: <Users className="h-4 w-4" />
      },
      {
        name: 'Accepted Inquiries',
        href: '/admin/partnerships/accepted',
        icon: <CheckCircle className="h-4 w-4" />
      }
    ]
  },
  {
    name: 'Purchase Details',
    href: '/admin/purchases',
    icon: <ShoppingBag className="h-4 w-4" />,
    subItems: [
      {
        name: 'Orders',
        href: '/admin/purchases',
        icon: <FileText className="h-4 w-4" />
      }
    ]
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  {
    name: 'Blog Posts',
    href: '/admin/blogs',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    name: 'Admin Users',
    href: '/admin/users',
    icon: <Settings className="h-4 w-4" />
  },
  {
    name: 'Founders',
    href: '/admin/founders',
    icon: <UserCheck className="h-4 w-4" />
  },
];

export default function Sidebar({ isSidebarOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Partnerships']);

  const handleLogout = async () => {
    auth.logout();
    router.replace('/admin/login');
  };

  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
    // Always close sidebar on navigation for mobile/tablet
    if (isMobile) {
      onClose();
    }
  };

  // Handle expand/collapse
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Parent is only active if pathname matches its href exactly and no sub-item is active
  const isParentActive = (item: SidebarItem) => {
    if (!pathname) return false;
    if (!item.subItems) return pathname === item.href;
    // If any sub-item is active, parent should not be active
    const anySubActive = item.subItems.some((sub: SidebarSubItem) => isItemActive(sub.href));
    return pathname === item.href && !anySubActive;
  };

  const isItemActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isPartnershipActive = () => {
    return pathname && pathname.startsWith('/admin/partnerships');
  };

  // Sub-item active logic: exact match for pending, exact or subpage for accepted
  const isSubItemActive = (subItem: SidebarSubItem) => {
    if (!pathname) return false;
    if (subItem.href === '/admin/partnerships') {
      return pathname === '/admin/partnerships';
    }
    return pathname === subItem.href || pathname.startsWith(subItem.href + '/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40
          h-full w-80 sm:w-72 lg:w-64 bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'top-14' : 'top-0'}
          lg:translate-x-0
          shadow-xl lg:shadow-none
          flex flex-col
        `}
      >
        {/* Logo - Hidden on Mobile since it's in the header */}
        <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-200 bg-white">
          <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 bg-white">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.name);
              const isActive = hasSubItems ? isParentActive(item) : isItemActive(item.href);

              return (
                <div key={item.href}>
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpanded(item.name);
                      } else {
                        handleNavigation(item.href);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-sm
                      rounded-lg transition-all duration-200
                      hover:bg-gray-100 active:bg-gray-200
                      touch-manipulation
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {hasSubItems && (
                      <span className={`transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    )}
                  </button>

                  {/* Sub-items */}
                  {hasSubItems && isExpanded && item.subItems && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subItemActive = isSubItemActive(subItem);
                        return (
                          <button
                            key={subItem.href}
                            onClick={() => handleNavigation(subItem.href)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2 text-sm
                              rounded-lg transition-all duration-200
                              hover:bg-gray-100 active:bg-gray-200
                              touch-manipulation
                              ${subItemActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900'
                              }
                            `}
                          >
                            <span className={`flex items-center justify-center w-5 ${
                              subItemActive ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {subItem.icon}
                            </span>
                            <span className="font-medium">{subItem.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Info Section (Mobile) */}
        {isMobile && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <Button
            variant="ghost"
            className={`
              w-full justify-start gap-3 px-4 py-3 text-red-600 
              hover:text-red-700 hover:bg-red-50 rounded-lg
              touch-manipulation
              ${isMobile ? 'text-base' : 'text-sm'}
            `}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
} 