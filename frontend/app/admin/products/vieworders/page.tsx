"use client";

import { useEffect, useState, useMemo } from "react";
import { Eye, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import BootstrapDropdown from "@/components/ui/BootstrapDropdown";
import { Button } from "@/components/ui/button";
import OrderDetailsDialog from "../components/OrderDetailsDialog";

// Status options for the UI - "placed" maps to "pending" in database for legacy compatibility
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "placed", label: "Placed" }, // Maps to "pending" in database
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function badgeClass(type: "order" | "payment", value: string) {
  if (type === "order") {
    if (value === "placed") return "bg-yellow-100 text-yellow-700";
    if (value === "shipped") return "bg-blue-100 text-blue-700";
    if (value === "delivered") return "bg-green-100 text-green-700";
    if (value === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  } else {
    if (value === "paid") return "bg-green-100 text-green-700";
    if (value === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  }
}

const ORDERS_PER_PAGE = 10;

export default function ViewOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [savingStatusOrderId, setSavingStatusOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [oldOrdersInfo, setOldOrdersInfo] = useState<any>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    fetchOrdersAndProducts();
    fetchOldOrdersInfo();
  }, []);

  const fetchOrdersAndProducts = async () => {
    setLoading(true);
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

    const parsedOrders = (purchases || []).map((order) => ({
      ...order,
      items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
    }));

    setOrders(parsedOrders);
    setLoading(false);
  };

  const fetchOldOrdersInfo = async () => {
    try {
      const response = await fetch('/api/auto-delete-orders');
      if (response.ok) {
        const data = await response.json();
        setOldOrdersInfo(data);
      }
    } catch (error) {
      console.error('Error fetching old orders info:', error);
    }
  };

  const handleCleanupOldOrders = async () => {
    if (!confirm('Are you sure you want to delete all orders older than 60 days? This action cannot be undone.')) {
      return;
    }

    setCleanupLoading(true);
    try {
      const response = await fetch('/api/auto-delete-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup_old_orders' })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully deleted ${result.deletedCount} old orders`);
        // Refresh the orders list
        fetchOrdersAndProducts();
        // Refresh old orders info
        fetchOldOrdersInfo();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete old orders'}`);
      }
    } catch (error) {
      console.error('Error cleaning up old orders:', error);
      alert('Error cleaning up old orders');
    } finally {
      setCleanupLoading(false);
    }
  };

  const getDaysUntilDeletion = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const deletionDate = new Date(createdDate.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days
    const now = new Date();
    const diffTime = deletionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const rawStatus = (order.order_status || order.status || "").toLowerCase();
      const normalizedStatus = rawStatus === "pending" ? "placed" : rawStatus;
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch = [
        order.id,
        order.name,
        order.email,
        order.phone,
        (order.business_name || ""),
      ].some((field) => (field || "").toLowerCase().includes(q));
      return matchesStatus && (!searchTerm || matchesSearch);
    });
  }, [orders, statusFilter, searchTerm]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, page]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setSavingStatusOrderId(orderId);
    try {
      // Map "placed" back to "pending" for database consistency
      const statusToSave = newStatus === "placed" ? "pending" : newStatus;
      
      let { error } = await supabase
        .from("purchases")
        .update({ order_status: statusToSave })
        .eq("id", orderId);
      if (!error) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: statusToSave } : o))
        );
      }
    } finally {
      setSavingStatusOrderId(null);
    }
  };

  // Convert database status to display status (e.g., "pending" -> "placed")
  function getDisplayOrderStatus(order: any) {
    const val = (order.order_status || order.status || "placed").toLowerCase();
    if (val === "pending") return "placed";
    return val;
  }

  // Get the status value for dropdown selection (handles "pending" -> "placed" mapping)
  function getActualOrderStatus(order: any) {
    const val = (order.order_status || order.status || "placed").toLowerCase();
    // If the stored value is "pending", we want to show "placed" in dropdown
    // but when saving, we need to map "placed" back to "pending" for consistency
    if (val === "pending") return "placed";
    return val;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-0">Orders</h1>
          <p className="text-gray-500 mb-1">View and manage all purchase orders</p>
        </div>

        {/* Auto-deletion Info and Cleanup */}
        {oldOrdersInfo && (
          <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">
                    Auto-deletion Alert
                  </h3>
                  <p className="text-sm text-orange-700">
                    {oldOrdersInfo.oldOrdersCount > 0 ? (
                      <>
                        <span className="font-medium">{oldOrdersInfo.oldOrdersCount} orders</span> will be automatically deleted after 60 days.
                        {oldOrdersInfo.totalValue > 0 && (
                          <span> Total value: ₹{oldOrdersInfo.totalValue}</span>
                        )}
                      </>
                    ) : (
                      "No orders are scheduled for automatic deletion."
                    )}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Cutoff date: {new Date(oldOrdersInfo.cutoffDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {oldOrdersInfo.oldOrdersCount > 0 && (
                <Button
                  onClick={handleCleanupOldOrders}
                  disabled={cleanupLoading}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {cleanupLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Cleanup Now
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-end bg-white rounded-xl border border-gray-200 p-4 mt-2 mb-2 shadow-sm">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:max-w-xs"
          />
          <BootstrapDropdown
            trigger={
              statusOptions.find((opt) => opt.value === statusFilter)?.label || "All Status"
            }
            items={statusOptions.map((opt) => ({
              label: opt.label,
              onClick: () => setStatusFilter(opt.value),
            }))}
          />
        </div>
        {(searchTerm || statusFilter !== "all") && (
          <div className="mb-3 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-gray-800"
              size="sm"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* MOBILE CARD LIST */}
        <div className="block sm:hidden space-y-4">
          {pagedOrders.length === 0 && (
            <div className="py-10 text-center text-gray-500 rounded-xl bg-white shadow">
              No orders found
            </div>
          )}
          {pagedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-base">{order.name}</div>
                  <div className="text-xs text-gray-500 break-words">{order.email}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {/* Order Tracking Status (editable) */}
                  <select
                    className="text-xs border rounded px-2 py-1 capitalize w-fit"
                    value={getActualOrderStatus(order)}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={savingStatusOrderId === order.id}
                  >
                    {statusOptions
                      .filter((opt) => opt.value !== "all")
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                  {/* Payment Status Badge */}
                  <span
                    className={`px-2 py-[2px] rounded-full text-xs font-semibold ${badgeClass(
                      "payment",
                      order.payment_status || ""
                    )}`}
                  >
                    Payment: {order.payment_status || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="text-xs font-semibold text-gray-900 ml-auto">
                  ₹{order.total}
                </span>
              </div>
              
              {/* Deletion countdown */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-500">
                  Order ID: {order.id.slice(0, 8)}...
                </span>
                <span className="text-xs ml-auto">
                  {(() => {
                    const daysLeft = getDaysUntilDeletion(order.created_at);
                    if (daysLeft <= 0) {
                      return <span className="text-red-600 font-medium">Will be deleted soon</span>;
                    } else if (daysLeft <= 7) {
                      return <span className="text-orange-600 font-medium">{daysLeft} days left</span>;
                    } else if (daysLeft <= 30) {
                      return <span className="text-yellow-600 font-medium">{daysLeft} days left</span>;
                    } else {
                      return <span className="text-gray-500">{daysLeft} days left</span>;
                    }
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => {
                    setSelectedOrder(order);
                    setDetailsOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP/LAPTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto bg-white orders-scroll rounded-xl">
          <div className="w-fit border border-gray-100 rounded-xl">
            <div className="grid grid-cols-[200px_150px_220px_140px_250px_240px_140px_110px_110px_110px_120px] gap-2 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
              <div>CUSTOMER</div>
              <div>BUSINESS</div>
              <div>EMAIL</div>
              <div>PHONE</div>
              <div>ADDRESS</div>
              <div>ITEMS</div>
              <div className="text-center">TRACK ORDER</div>
              <div className="text-right">TOTAL</div>
              <div className="text-center">PAYMENT</div>
              <div className="text-center">ACTIONS</div>
              <div className="text-center">AUTO-DELETE</div>
            </div>
            {pagedOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[200px_150px_220px_140px_250px_240px_140px_110px_110px_110px_120px] gap-2 px-6 py-4 items-center border-b last:border-0 text-[15px]"
              >
                <div className="font-medium text-gray-900 whitespace-normal break-words">
                  {order.name}
                </div>
                <div className="truncate">{order.business_name || "-"}</div>
                <div className="truncate max-w-[210px] text-gray-700">{order.email}</div>
                <div className="truncate text-gray-700">{order.phone}</div>
                <div className="truncate max-w-[240px] text-gray-700 text-xs">
                  {[order.address, order.city, order.state, order.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div className="text-sm text-gray-700">
                  <ul className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <li
                        key={item.id ? `item-${item.id}` : `idx-${idx}`}
                        className="flex items-center gap-2"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name || "Item"}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border" />
                        )}
                        <span className="truncate">
                          {item.name} ×{item.quantity || 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">
                  <select
                    className="text-xs border rounded px-2 py-1 capitalize"
                    value={getActualOrderStatus(order)}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    disabled={savingStatusOrderId === order.id}
                  >
                    {statusOptions
                      .filter((opt) => opt.value !== "all")
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="font-semibold text-right whitespace-nowrap text-gray-900">
                  ₹{order.total}
                </div>
                <div className="flex justify-center">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${badgeClass(
                      "payment",
                      order.payment_status?.toLowerCase() || ""
                    )}`}
                  >
                    {order.payment_status || "N/A"}
                  </span>
                </div>
                <div className="flex gap-2 justify-center items-center">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Auto-deletion countdown */}
                <div className="text-center text-xs">
                  {(() => {
                    const daysLeft = getDaysUntilDeletion(order.created_at);
                    if (daysLeft <= 0) {
                      return <span className="text-red-600 font-medium">Soon</span>;
                    } else if (daysLeft <= 7) {
                      return <span className="text-orange-600 font-medium">{daysLeft}d</span>;
                    } else if (daysLeft <= 30) {
                      return <span className="text-yellow-600 font-medium">{daysLeft}d</span>;
                    } else {
                      return <span className="text-gray-500">{daysLeft}d</span>;
                    }
                  })()}
                </div>
              </div>
            ))}
            {pagedOrders.length === 0 && (
              <div className="py-10 text-center text-gray-500">No orders found</div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {filteredOrders.length > ORDERS_PER_PAGE && (
          <div className="flex items-center justify-center py-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <span className="mx-2 text-sm text-gray-600">
              Page {page} of {Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)}
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE))
                )
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <OrderDetailsDialog
        isOpen={detailsOpen}
        order={selectedOrder}
        onClose={() => setDetailsOpen(false)}
        onDelete={() => {
          /* handle delete order */
        }}
      />
    </div>
  );
}
