"use client";

import { CheckCircle, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PartnershipInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  inquiry_type: string;
  created_at: string;
  status: string;
}

interface InquiryDetailsDialogProps {
  inquiry: PartnershipInquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (inquiry: PartnershipInquiry) => void;
  onDelete: (inquiry: PartnershipInquiry) => void;
  isProcessing?: boolean;
}

export default function InquiryDetailsDialog({
  inquiry,
  isOpen,
  onClose,
  onAccept,
  onDelete,
  isProcessing = false
}: InquiryDetailsDialogProps) {
  if (!inquiry) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partnership Inquiry Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Full Name</h4>
            <p>{inquiry.name}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Company</h4>
            <p>{inquiry.company}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Email</h4>
            <p className="break-all">{inquiry.email}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Message</h4>
            <p className="whitespace-pre-wrap">{inquiry.message}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Submitted On</h4>
            <p>{formatDate(inquiry.created_at)}</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Status</h4>
            <p className="capitalize">{inquiry.status}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onClose()}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onAccept(inquiry)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onDelete(inquiry)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 