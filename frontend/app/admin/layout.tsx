'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user?.email?.endsWith('@emiliobeaufort.com')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user?.email?.endsWith('@emiliobeaufort.com')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            <a href="/admin" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
              Dashboard
            </a>
            <a href="/admin/products" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
              Products
            </a>
            <a href="/admin/posts" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
              Journal Posts
            </a>
            <a href="/admin/partnerships" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">
              Partnerships
            </a>
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 