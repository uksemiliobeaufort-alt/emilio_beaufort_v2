"use client";

import { CheckCircle, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name?: string;
  quantity?: number;
}

interface OrderDetails {
  id: string;
  name: string;
  business_name?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment_status?: string; 
  created_at: string;
}

interface OrderDetailsDialogProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (order: OrderDetails) => void;
  onMarkPaid?: (order: OrderDetails) => void; // optional
  isProcessing?: boolean;
}

export default function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
  onDelete,
  onMarkPaid,
  isProcessing = false,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Name</h4>
            <p>{order.name}</p>
          </div>
          {order.business_name && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Business Name</h4>
              <p>{order.business_name}</p>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Email</h4>
            <p className="break-all">{order.email}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Phone</h4>
            <p>{order.phone}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Address</h4>
            <p>
              {order.address}
              {order.city && `, ${order.city}`}
              {order.state && `, ${order.state}`}
              {order.pincode && `, ${order.pincode}`}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Items</h4>
            <ul className="list-disc ml-4">
              {order.items.map((item, idx) => (
                <li key={item.id + idx}>
                  {item.name || "Item"} {item.quantity ? `×${item.quantity}` : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Total</h4>
            <p>₹{order.total}</p>
          </div>
          
          {order.payment_status && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Payment Status</h4>
              <p className="capitalize">{order.payment_status}</p>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Placed On</h4>
            <p>{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          {onMarkPaid && (
            <Button
              variant="outline"
              onClick={() => onMarkPaid(order)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Paid
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onDelete(order)}
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
