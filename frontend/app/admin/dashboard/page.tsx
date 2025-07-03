"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, AuthUser } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Eye,
  Loader2,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-gray-100 text-gray-900' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
  </Link>
);

interface DashboardStats {
  totalProducts: number;
  totalPosts: number;
  totalPartnershipInquiries: number;
}

interface PartnershipInquiry {
  id: string;
  full_name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalPosts: 0,
    totalPartnershipInquiries: 0
  });
  const [inquiries, setInquiries] = useState<PartnershipInquiry[]>([]);

  useEffect(() => {
    // Initialize auth state
    auth.init();
    
    // Check if user is authenticated
    if (!auth.isAdmin()) {
      console.log('Not authenticated, redirecting to login...');
      router.replace('/admin/login');
      return;
    }

    setUser(auth.user);
    
    // Initial data fetch
    fetchDashboardStats();
    fetchPartnershipInquiries();

    // Set up real-time subscription
    let subscription: RealtimeChannel;
    
    const setupSubscription = async () => {
      // Subscribe to partnership_inquiries table
      subscription = supabase
        .channel('partnership_inquiries_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'partnership_inquiries'
          },
          async (payload) => {
            console.log('Real-time update received:', payload);
            
            // Refresh data when changes occur
            await fetchPartnershipInquiries();
            await fetchDashboardStats();
          }
        )
        .subscribe();

      console.log('Real-time subscription established');
    };

    setupSubscription();
    setLoading(false);

    // Cleanup subscription when component unmounts
    return () => {
      if (subscription) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(subscription);
      }
    };
  }, [router]);

  const fetchPartnershipInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4); // Only fetch 4 most recent inquiries

      if (error) {
        console.error('Error fetching inquiries:', error);
        throw error;
      }

      console.log('Fetched inquiries:', data?.length || 0);
      setInquiries(data || []);
    } catch (error) {
      console.error('Error in fetchPartnershipInquiries:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { count: inquiriesCount, error } = await supabase
        .from('partnership_inquiries')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }

      setStats({
        totalProducts: 5, // Replace with actual count when products table is ready
        totalPosts: 10, // Replace with actual count when posts table is ready
        totalPartnershipInquiries: inquiriesCount || 0
      });
    } catch (error) {
      console.error('Error in fetchDashboardStats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      router.replace('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {/* <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            href="/admin/dashboard"
            isActive
          />
          <SidebarItem 
            icon={ShoppingBag} 
            label="Products" 
            href="/admin/products"
          />
          <SidebarItem 
            icon={FileText} 
            label="Blog Posts" 
            href="/admin/posts"
          />
          <SidebarItem 
            icon={Users} 
            label="Partnerships" 
            href="/admin/partnerships"
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href="/admin/settings"
          />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back, Admin</h1>
            <p className="text-gray-600">Here's an overview of your website's current status</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Products</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Partnership Inquiries</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{stats.totalPartnershipInquiries}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Partnership Inquiries Preview */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Partnership Inquiries</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Auto-updates in real-time
                </div>
                <a 
                  href="/admin/partnerships" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  View All Inquiries
                </a>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No partnership inquiries yet
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(inquiry.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inquiry.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inquiry.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inquiry.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            inquiry.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">No recent activity to display.</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Blog Post
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 