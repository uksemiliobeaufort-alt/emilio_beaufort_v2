"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AcceptedInquiry {
  id: string;
  original_id: string;
  full_name: string;
  email: string;
  company: string;
  message: string;
  inquiry_type: string;
  accepted_at: string;
  accepted_by: string;
  notes: string;
  created_at: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function AcceptedInquiries() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<AcceptedInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; inquiry: AcceptedInquiry | null }>({
    open: false,
    inquiry: null
  });

  useEffect(() => {
    fetchAcceptedInquiries();
    let subscription: RealtimeChannel;
    const setupSubscription = async () => {
      subscription = supabase
        .channel('accepted_inquiries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accepted_inquiries'
          },
          async () => {
            await fetchAcceptedInquiries();
          }
        )
        .subscribe();
    };
    setupSubscription();
    setLoading(false);
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const fetchAcceptedInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('accepted_inquiries')
        .select('*')
        .order('accepted_at', { ascending: false });
      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching accepted inquiries:', error);
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

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.notes && inquiry.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Accepted Inquiries</h1>
          <p className="text-gray-600 mt-1">View all accepted partnership requests</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border shadow-sm p-4 lg:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, company, message, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg border shadow-sm">
        {filteredInquiries.length === 0 ? (
          <div className="p-8 lg:p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted inquiries found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Accepted inquiries will appear here'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile View */}
                <div className="lg:hidden space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{inquiry.full_name}</h3>
                      <p className="text-sm text-gray-600 truncate">{inquiry.company}</p>
                      <p className="text-sm text-gray-500 truncate">{inquiry.email}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Accepted
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Accepted: {formatDate(inquiry.accepted_at)}
                  </div>
                  {inquiry.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {inquiry.notes}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsDialog({ open: true, inquiry })}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center">
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-900">{inquiry.full_name}</h3>
                    <p className="text-sm text-gray-600">{inquiry.company}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 break-all">{inquiry.email}</p>
                    <p className="text-sm text-gray-600 break-all">{inquiry.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 break-all">{inquiry.razorpay_order_id}</p>
                    <p className="text-sm text-gray-600 break-all">{inquiry.razorpay_payment_id}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600">{inquiry.address}, {inquiry.city}, {inquiry.state} {inquiry.pincode}</p>
                  </div>
                  <div className="col-span-1">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Accepted
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsDialog({ open: true, inquiry })}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={() => setDetailsDialog({ open: false, inquiry: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accepted Inquiry Details</DialogTitle>
          </DialogHeader>
          
          {detailsDialog.inquiry && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Full Name</h4>
                <p>{detailsDialog.inquiry.full_name}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Name</h4>
                <p>{detailsDialog.inquiry.name}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Email</h4>
                <p className="break-all">{detailsDialog.inquiry.email}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Phone</h4>
                <p>{detailsDialog.inquiry.phone}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Razorpay Order ID</h4>
                <p className="break-all">{detailsDialog.inquiry.razorpay_order_id}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Razorpay Payment ID</h4>
                <p className="break-all">{detailsDialog.inquiry.razorpay_payment_id}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Address</h4>
                <p>{detailsDialog.inquiry.address}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">City</h4>
                <p>{detailsDialog.inquiry.city}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">State</h4>
                <p>{detailsDialog.inquiry.state}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Pincode</h4>
                <p>{detailsDialog.inquiry.pincode}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Message</h4>
                <p className="whitespace-pre-wrap">{detailsDialog.inquiry.message}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Accepted On</h4>
                <p>{formatDate(detailsDialog.inquiry.accepted_at)}</p>
              </div>
              
              {detailsDialog.inquiry.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500">Notes</h4>
                  <p className="whitespace-pre-wrap bg-gray-50 p-2 rounded">{detailsDialog.inquiry.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setDetailsDialog({ open: false, inquiry: null })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 