'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalProducts: number;
  totalPosts: number;
  totalPartnershipInquiries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalPosts: 0,
    totalPartnershipInquiries: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: productsCount },
          { count: postsCount },
          { count: inquiriesCount },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact' }),
          supabase.from('posts').select('*', { count: 'exact' }),
          supabase.from('partnership_inquiries').select('*', { count: 'exact' }),
        ]);

        setStats({
          totalProducts: productsCount || 0,
          totalPosts: postsCount || 0,
          totalPartnershipInquiries: inquiriesCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Journal Posts</h3>
          <p className="text-3xl font-bold">{stats.totalPosts}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Partnership Inquiries</h3>
          <p className="text-3xl font-bold">{stats.totalPartnershipInquiries}</p>
        </Card>
      </div>
    </div>
  );
} 