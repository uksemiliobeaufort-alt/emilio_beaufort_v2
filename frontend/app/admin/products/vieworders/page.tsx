"use client";

import { useEffect, useState, useMemo } from "react";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import BootstrapDropdown from '@/components/ui/BootstrapDropdown';
import { Button } from "@/components/ui/button";
import OrderDetailsDialog from "../components/OrderDetailsDialog";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "cancelled", label: "Cancelled" },
];

function badgeClass(type: "order" | "payment", value: string) {
  if (type === "order") {
    if (value === "pending") return "bg-yellow-100 text-yellow-700";
    if (value === "paid") return "bg-green-100 text-green-700";
    if (value === "shipped") return "bg-blue-100 text-blue-700";
    if (value === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  } else {
    if (value === "paid") return "bg-green-100 text-green-700";
    if (value === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  }
}

export default function ViewOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, { id: string; name: string }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => { fetchOrdersAndProducts(); }, []);

  const fetchOrdersAndProducts = async () => {
    setLoading(true);
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .order("created_at", { ascending: false });

    const allProductIds = new Set<string>();
    (purchases || []).forEach((order) => {
      try {
        const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        (items || []).forEach((item: any) => { if (item.id) allProductIds.add(item.id); });
      } catch {}
    });

    let productMap: Record<string, { id: string; name: string }> = {};
    if (allProductIds.size > 0) {
      const { data: productList } = await supabase
        .from("products")
        .select("id, name")
        .in("id", Array.from(allProductIds));
      if (productList) productList.forEach((p) => { productMap[p.id] = p; });
    }

    const parsedOrders = (purchases || []).map((order) => ({
      ...order,
      items: typeof order.items === "string" ? JSON.parse(order.items) : order.items
    }));

    setOrders(parsedOrders);
    setProducts(productMap);
    setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || (order.status && order.status.toLowerCase() === statusFilter);
      const q = searchTerm.toLowerCase();
      const matchesSearch = [
        order.id,
        order.name,
        order.email,
        order.phone,
        (order.business_name || ""),
      ]
        .some((field) => (field || "").toLowerCase().includes(q));
      return matchesStatus && (!searchTerm || matchesSearch);
    });
  }, [orders, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 xl:py-10">
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-500">View and manage all purchase orders</p>
        </div>
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-2 justify-between items-stretch md:items-end bg-white rounded-xl border border-gray-200 p-4 mt-2 mb-4">
          <Input
            placeholder="Search by name, email, business, phone, or order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:max-w-xs"
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

        {/* Orders List */}
        <div className="overflow-x-auto bg-white">
          <div className="w-fit border border-gray-100 rounded-xl">
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-[200px_150px_220px_140px_250px_200px_110px_110px_110px] gap-2 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
              <div>CUSTOMER</div>
              <div>BUSINESS</div>
              <div>EMAIL</div>
              <div>PHONE</div>
              <div>ADDRESS</div>
              <div>ITEMS</div>
              <div className="text-right">TOTAL</div>
              <div className="text-center">PAYMENT</div>
              <div className="text-center">ACTIONS</div>
            </div>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[200px_150px_220px_140px_250px_200px_110px_110px_110px] gap-2 px-6 py-4 items-center border-b last:border-0 text-[15px]"
              >
                <div className="truncate font-medium text-gray-900">{order.name}</div>
                <div className="truncate">{order.business_name || "-"}</div>
                <div className="truncate max-w-[210px] text-gray-700">{order.email}</div>
                <div className="truncate text-gray-700">{order.phone}</div>
                <div className="truncate max-w-[240px] text-gray-700 text-xs">
                  {[order.address, order.city, order.state, order.pincode].filter(Boolean).join(", ")}
                </div>
                <div className="text-sm text-gray-700">
  <ul className="list-disc list-inside">
    {order.items.map((item: any, idx: number) => (
      <li key={item.id + idx}>
        {item.name} ×{item.quantity || 1}
      </li>
    ))}
  </ul>
</div>
                <div className="font-semibold text-right whitespace-nowrap text-gray-900">₹{order.total}</div>
                
                <div className="flex justify-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeClass("payment", order.payment_status?.toLowerCase() || "")}`}>
                    {order.payment_status || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2 justify-center items-center">
                  <Button size="icon" variant="outline"
                    onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="py-10 text-center text-gray-500">No orders found</div>
            )}
          </div>
        </div>
      </div>
      <OrderDetailsDialog
        isOpen={detailsOpen}
        order={selectedOrder}
        onClose={() => setDetailsOpen(false)}
        onDelete={() => {/* handle delete order */}}
      />
    </div>
  );
}
