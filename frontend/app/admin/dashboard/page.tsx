"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, AuthUser } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { supabase } from '@/lib/supabase';
import { getProducts } from '@/lib/supabase';
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
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_image_base64?: string;
  gallery_base64?: string[];
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

function DailyActivityChart() {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/activity/daily');
        if (!res.ok) throw new Error('Failed to fetch activity data');
        const json = await res.json();
        setData(json.data || []);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading activity chart...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!data.length) return <div className="text-center py-8 text-gray-500">No activity data available.</div>;

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Daily Active Events',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Daily Activity Events' },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Events' }, beginAtZero: true },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Daily Activity (Custom Analytics)</h2>
      <Bar data={chartData} options={options} height={120} />
    </div>
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
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, featured_image_base64, created_at')
        .order('created_at', { ascending: false })
        .limit(3); // Show 3 most recent posts

      if (error) {
        console.error('Error fetching recent posts:', error);
        throw error;
      }

      console.log('Fetched recent posts:', data?.length || 0);
      setRecentPosts(data || []);
    } catch (error) {
      console.error('Error in fetchRecentPosts:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch partnership inquiries count
      const { count: inquiriesCount, error: inquiriesError } = await supabase
        .from('partnership_inquiries')
        .select('*', { count: 'exact', head: true });

      if (inquiriesError) {
        console.error('Error fetching partnership inquiries count:', inquiriesError);
        throw inquiriesError;
      }

      // Fetch blog posts count
      const { count: postsCount, error: postsError } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      if (postsError) {
        console.error('Error fetching blog posts count:', postsError);
        throw postsError;
      }

      // Fetch actual products count from both tables
      let totalProductsCount = 0;
      try {
        const products = await getProducts();
        totalProductsCount = products.length;
        console.log('Fetched products count:', totalProductsCount);
      } catch (error) {
        console.error('Error fetching products count:', error);
        // Fallback to direct table queries if getProducts fails
        try {
          const [cosmeticsResult, hairExtensionsResult] = await Promise.all([
            supabase.from('cosmetics').select('*', { count: 'exact', head: true }),
            supabase.from('hair_extensions').select('*', { count: 'exact', head: true })
          ]);
          
          const cosmeticsCount = cosmeticsResult.count || 0;
          const hairExtensionsCount = hairExtensionsResult.count || 0;
          totalProductsCount = cosmeticsCount + hairExtensionsCount;
          
          console.log('Fetched products count (fallback):', totalProductsCount);
        } catch (fallbackError) {
          console.error('Error in fallback product count:', fallbackError);
        }
      }

      setStats({
        totalProducts: totalProductsCount,
        totalPosts: postsCount || 0,
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
      href: "/admin/products"
    },
    {
      title: "Blog Posts",
      value: stats.totalPosts,
      icon: FileText,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/admin/blogs"
    },
    {
      title: "Partnership Inquiries",
      value: stats.totalPartnershipInquiries,
      icon: Users,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      href: "/admin/partnerships"
    }
  ];

  const quickActions = [
    {
      title: "Add New Product",
      icon: Package,
      href: "/admin/products",
      description: "Create a new product listing"
    },
    {
      title: "Create Blog Post",
      icon: FileText,
      href: "/admin/blogs",
      description: "Write a new blog article"
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

      {/* Daily Activity Chart */}
      <DailyActivityChart />

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
                    {inquiries.map((inquiry) => (
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
                {inquiries.map((inquiry) => (
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
                      {post.featured_image_base64 ? (
                        <img
                          src={post.featured_image_base64}
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