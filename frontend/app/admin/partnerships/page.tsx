"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Check, Trash2, Eye, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import InquiryDetailsDialog from './InquiryDetailsDialog';

interface PartnershipInquiry {
  id: string;
  full_name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
  status: string;
}

export default function Partnerships() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<PartnershipInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; inquiry: PartnershipInquiry | null }>({
    open: false,
    inquiry: null
  });
  const [acceptDialog, setAcceptDialog] = useState<{ open: boolean; inquiry: PartnershipInquiry | null; notes: string }>({
    open: false,
    inquiry: null,
    notes: ''
  });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; inquiry: PartnershipInquiry | null }>({
    open: false,
    inquiry: null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initial data fetch
    fetchPartnershipInquiries();

    // Set up real-time subscription
    let subscription: RealtimeChannel;
    
    const setupSubscription = async () => {
      subscription = supabase
        .channel('partnership_inquiries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'partnership_inquiries'
          },
          async () => {
            await fetchPartnershipInquiries();
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

  const fetchPartnershipInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching partnership inquiries:', error);
    }
  };

  const handleAcceptClick = (inquiry: PartnershipInquiry) => {
    setAcceptDialog({ open: true, inquiry, notes: '' });
  };

  const acceptInquiry = async () => {
    if (!acceptDialog.inquiry) return;
    
    setIsProcessing(true);
    try {
      // Get current user for tracking who accepted the inquiry
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the accept_partnership_inquiry function
      const { data, error } = await supabase.rpc('accept_partnership_inquiry', {
        inquiry_id: acceptDialog.inquiry.id,
        admin_user_id: user?.id || null,
        notes: acceptDialog.notes || null
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Inquiry accepted successfully!');
        await fetchPartnershipInquiries();
        setAcceptDialog({ open: false, inquiry: null, notes: '' });
        setDetailsDialog({ open: false, inquiry: null });
      } else {
        throw new Error(data.error || 'Failed to accept inquiry');
      }
    } catch (error) {
      console.error('Error accepting inquiry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept inquiry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (inquiry: PartnershipInquiry) => {
    setDeleteDialog({ open: true, inquiry });
  };

  const deleteInquiry = async () => {
    if (!deleteDialog.inquiry) return;
    
    setIsProcessing(true);
    try {
      const inquiry = deleteDialog.inquiry;

      // First verify the inquiry still exists
      const { data: checkData, error: checkError } = await supabase
        .from('partnership_inquiries')
        .select('*')
        .eq('id', inquiry.id)
        .single();

      if (checkError) {
        throw new Error('Could not verify inquiry status');
      }

      if (!checkData) {
        console.log('Inquiry already deleted, proceeding with temporary data insertion');
      } else {
        // Delete from partnership_inquiries if it exists
        const { error: deleteError } = await supabase
          .from('partnership_inquiries')
          .delete()
          .eq('id', inquiry.id);

        if (deleteError) {
          throw new Error(`Failed to delete from partnership_inquiries: ${deleteError.message}`);
        }
      }

      // Insert into temporary_data
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
        if (checkData) {
          const { error: restoreError } = await supabase
            .from('partnership_inquiries')
            .insert([inquiry]);
            
          if (restoreError) {
            throw new Error('Failed to move data and could not restore original inquiry. Please contact support.');
          }
        }
        throw new Error(`Failed to insert into temporary_data: ${insertError.message}`);
      }
      
      await fetchPartnershipInquiries();
      setDeleteDialog({ open: false, inquiry: null });
      setDetailsDialog({ open: false, inquiry: null });
    } catch (error) {
      console.error('Error in deleteInquiry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process the inquiry');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Partnership Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and respond to partnership requests</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, company, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0 sm:min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg border shadow-sm">
            {filteredInquiries.length === 0 ? (
          <div className="p-8 lg:p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Partnership inquiries will appear here when received'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : inquiry.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(inquiry.created_at)}
                  </div>
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
                                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcceptClick(inquiry)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(inquiry)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center">
                  <div className="col-span-3">
                    <h3 className="font-semibold text-gray-900">{inquiry.full_name}</h3>
                    <p className="text-sm text-gray-600">{inquiry.company}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 break-all">{inquiry.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(inquiry.created_at)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      inquiry.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : inquiry.status === 'contacted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inquiry.status}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcceptClick(inquiry)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Accept Inquiry"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(inquiry)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={acceptDialog.open} onOpenChange={(open) => !isProcessing && setAcceptDialog({ open, inquiry: null, notes: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Partnership Inquiry</DialogTitle>
            <DialogDescription>
              This will move the inquiry to the accepted inquiries table and remove it from the pending list. You can add optional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this acceptance..."
                value={acceptDialog.notes}
                onChange={(e) => setAcceptDialog(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcceptDialog({ open: false, inquiry: null, notes: '' })}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={acceptInquiry}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
                              ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Inquiry
                  </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !isProcessing && setDeleteDialog({ open, inquiry: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Partnership Inquiry</DialogTitle>
            <DialogDescription>
              This action will move the inquiry to temporary storage and delete it after 15 days. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, inquiry: null })}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteInquiry}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <InquiryDetailsDialog
        inquiry={detailsDialog.inquiry}
        isOpen={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, inquiry: null })}
        onAccept={handleAcceptClick}
        onDelete={handleDeleteClick}
        isProcessing={isProcessing}
      />
    </div>
  );
} 