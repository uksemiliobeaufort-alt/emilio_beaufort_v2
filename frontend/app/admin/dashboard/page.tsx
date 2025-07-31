"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, AuthUser } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PermissionGuard from '@/components/PermissionGuard';
import {
  Package,
  FileText,
  Users,
  Check,
  Trash2,
  ExternalLink,
  TrendingUp,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import { supabase } from '@/lib/supabase';
import { getProducts } from '@/lib/supabase';

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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
}

// --- Google Analytics Section ---
interface AnalyticsRow {
  date: string;
  pageViews: number;
}

function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json.data || []);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <Card className="border-0 shadow-md mb-6">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Google Analytics (Daily Page Views)</h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading analytics...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No analytics data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-blue-700">{row.date}</td>
                    <td className="py-2 px-4">{row.pageViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

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
    fetchRecentPosts();

    // Set up real-time subscription
    let subscription: RealtimeChannel;
    
    const setupSubscription = async () => {
      // Subscribe to partnership_inquiries, blog_posts, and product tables
      subscription = supabase
        .channel('dashboard_updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'partnership_inquiries'
          },
          async (payload) => {
            console.log('Partnership inquiries update received:', payload);
            
            // Refresh data when changes occur
            await fetchPartnershipInquiries();
            await fetchDashboardStats();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'blog_posts'
          },
          async (payload) => {
            console.log('Blog posts update received:', payload);
            
            // Refresh stats and recent posts when blog posts change
            await fetchDashboardStats();
            await fetchRecentPosts();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cosmetics'
          },
          async (payload) => {
            console.log('Cosmetics products update received:', payload);
            
            // Refresh stats when cosmetics products change
            await fetchDashboardStats();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'hair_extensions'
          },
          async (payload) => {
            console.log('Hair extensions products update received:', payload);
            
            // Refresh stats when hair extensions products change
            await fetchDashboardStats();
          }
        )
        .subscribe();

      console.log('Real-time subscriptions established for all dashboard data');
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
        .limit(5); // Show 5 most recent inquiries

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

  const fetchRecentPosts = async () => {
    try {
      const q = query(collection(firestore, 'blog_posts'));
      const querySnapshot = await getDocs(q);
      let firebasePosts: BlogPost[] = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || '',
          slug: d.slug || '',
          content: d.content || '',
          featured_image_url: d.featured_image_url || '',
          gallery_urls: d.gallery_urls || [],
          created_at: d.created_at && d.created_at.toDate ? d.created_at.toDate().toISOString() : (d.created_at || new Date().toISOString()),
        };
      });
      // Sort by created_at descending and limit to 3
      firebasePosts = firebasePosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
      setRecentPosts(firebasePosts);
    } catch (error) {
      console.error('Error in fetchRecentPosts:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch partnership inquiries count from Supabase
      const { count: inquiriesCount, error: inquiriesError } = await supabase
        .from('partnership_inquiries')
        .select('*', { count: 'exact', head: true });
      if (inquiriesError) {
        console.error('Error fetching partnership inquiries count:', inquiriesError);
        throw inquiriesError;
      }

      // Fetch blog posts count from Firebase
      const postsSnapshot = await getDocs(collection(firestore, 'blog_posts'));
      const postsCount = postsSnapshot.size;

      // Fetch products count from Firebase (cosmetics + hair_extensions)
      const [cosmeticsSnapshot, hairExtensionsSnapshot] = await Promise.all([
        getDocs(collection(firestore, 'cosmetics')),
        getDocs(collection(firestore, 'hair_extensions')),
      ]);
      const totalProductsCount = cosmeticsSnapshot.size + hairExtensionsSnapshot.size;

      setStats({
        totalProducts: totalProductsCount,
        totalPosts: postsCount,
        totalPartnershipInquiries: inquiriesCount
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

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const approveInquiry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partnership_inquiries')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) {
        console.error('Error approving inquiry:', error);
        throw error;
      }
      
      toast.success('Inquiry approved successfully');
      // Refresh the inquiries list to reflect changes
      await fetchPartnershipInquiries();
      
    } catch (error) {
      console.error('Error approving inquiry:', error);
      toast.error('Failed to approve inquiry');
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const inquiry = inquiries.find(i => i.id === id);
      if (!inquiry) {
        toast.error('Inquiry not found in current list');
        return;
      }

      // First verify the inquiry still exists in database
      const { data: checkData, error: checkError } = await supabase
        .from('partnership_inquiries')
        .select('*')
        .eq('id', id);

      if (checkError) {
        console.error('Error checking inquiry:', checkError);
        throw new Error('Failed to verify inquiry exists in database');
      }

      if (!checkData || checkData.length === 0) {
        console.log('Inquiry already deleted from database');
        toast.info('Inquiry was already deleted');
        // Refresh the list to update UI
        await fetchPartnershipInquiries();
        return;
      }

      // Delete from partnership_inquiries
      const { error: deleteError } = await supabase
        .from('partnership_inquiries')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to delete inquiry: ${deleteError.message}`);
      }

      // Insert into temporary_data for archival
      const tempData = {
        full_name: inquiry.full_name,
        email: inquiry.email,
        company: inquiry.company,
        message: inquiry.message
      };

      const { error: insertError } = await supabase
        .from('temporary_data')
        .insert([tempData]);

      if (insertError) {
        console.error('Archive error:', insertError);
        // Don't restore if archival fails, just log it
        console.warn('Failed to archive inquiry data, but deletion was successful');
      }

      toast.success('Inquiry deleted successfully');
      // Refresh the inquiries list
      await fetchPartnershipInquiries();
      
    } catch (error) {
      console.error('Error in deleteInquiry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete inquiry');
    }
  };

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/admin/products",
      permission: "manage_products"
    },
    {
      title: "Blog Posts",
      value: stats.totalPosts,
      icon: FileText,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/admin/blogs",
      permission: "manage_blog"
    },
    {
      title: "Partnership Inquiries",
      value: stats.totalPartnershipInquiries,
      icon: Users,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      href: "/admin/partnerships",
      permission: "manage_partnerships"
    }
  ];

  const quickActions = [
    {
      title: "Add New Product",
      icon: Package,
      href: "/admin/products",
      description: "Create a new product listing",
      permission: "manage_products"
    },
    {
      title: "Create Blog Post",
      icon: FileText,
      href: "/admin/blogs",
      description: "Write a new blog article",
      permission: "manage_blog"
    },
    {
      title: "View Website",
      icon: ExternalLink,
      href: "/",
      description: "Open the public website",
      external: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your website.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>View details</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Partnership Inquiries */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Partnership Inquiries</h2>
            <Link href="/admin/partnerships">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View All
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
              <p className="text-gray-500">Partnership inquiries will appear here when received.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDateShort(inquiry.created_at)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{inquiry.full_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{inquiry.company}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{inquiry.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant={inquiry.status === 'completed' ? 'secondary' : 'outline'}
                              onClick={() => approveInquiry(inquiry.id)}
                              disabled={inquiry.status === 'completed'}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteInquiry(inquiry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {inquiries.slice(0, 3).map((inquiry) => (
                  <Card key={inquiry.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{inquiry.full_name}</h3>
                          <p className="text-sm text-gray-600">{inquiry.company}</p>
                          <p className="text-sm text-gray-500">{inquiry.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatDateShort(inquiry.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant={inquiry.status === 'completed' ? 'secondary' : 'outline'}
                          onClick={() => approveInquiry(inquiry.id)}
                          disabled={inquiry.status === 'completed'}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {inquiry.status === 'completed' ? 'Approved' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteInquiry(inquiry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Blog Posts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blog Posts */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Blog Posts</h2>
              <Link href="/admin/blogs">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  View All
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-gray-500 mb-4">Create your first blog post to get started.</p>
                <Link href="/admin/blogs">
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                    Create Blog Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateShort(post.created_at)}
                      </p>
                    </div>
                    <Link href="/admin/blogs">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                >
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <action.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 