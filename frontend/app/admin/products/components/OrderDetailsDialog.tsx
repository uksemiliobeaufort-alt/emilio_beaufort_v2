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
  imageUrl?: string; // added since you check item.imageUrl below
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
  order_status?: string;
  gst_number?: string;
  company_type?: string;
  notes?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4 sm:p-6 overflow-y-auto max-h-[70vh] max-w-full sm:max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Order ID</h4>
              <p className="font-mono text-sm break-all">{order.id}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Track Order</h4>
              <p className="capitalize">{order.order_status || order.status || "placed"}</p>
            </div>
          </div>

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

          {order.gst_number && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">GST Number</h4>
              <p className="break-all">{order.gst_number}</p>
            </div>
          )}

          {order.company_type && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Company Type</h4>
              <p>{order.company_type}</p>
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

          {order.notes && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Notes</h4>
              <p className="whitespace-pre-wrap break-words">{order.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Items</h4>
            <ul className="space-y-4">
              {order.items.map((item, idx) => (
                <li
                  key={item.id ? `item-${item.id}` : `idx-${idx}`}
                  className="flex items-start gap-4"
                >
                  {item.imageUrl ? (
                    <img
                      srcSet={item.imageUrl}
                      alt={item.name || "Item"}
                      className="w-28 h-28 (max-width: 480px) 320px, (max-width: 640px) 480px, (max-width: 768px) 600px, (max-width: 1024px) 900px, 1600px rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-lg bg-gray-100 border" />
                  )}
                  <div className="pt-1">
                    <div className="font-medium">{item.name || "Item"}</div>
                    {item.quantity ? (
                      <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                    ) : null}
                  </div>
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

          {order.razorpay_order_id && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Razorpay Order ID</h4>
              <p className="font-mono text-sm break-all">{order.razorpay_order_id}</p>
            </div>
          )}

          {order.razorpay_payment_id && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Razorpay Payment ID</h4>
              <p className="font-mono text-sm break-all">{order.razorpay_payment_id}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Placed On</h4>
            <p>{formatDate(order.created_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
