"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Purchase {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  items: { id: string; quantity?: number }[];
  total: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    fetchOrdersAndProducts();
  }, []);

  const fetchOrdersAndProducts = async () => {
    setLoading(true);
    // 1. Fetch all purchases
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    // 2. Collect all unique product IDs from items
    const allProductIds = new Set<string>();
    (purchases || []).forEach((order) => {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        (items || []).forEach((item: any) => {
          if (item.id) allProductIds.add(item.id);
        });
      } catch {}
    });
    // 3. Fetch product details
    let productMap: Record<string, Product> = {};
    if (allProductIds.size > 0) {
      const { data: productList } = await supabase
        .from('products')
        .select('id, name')
        .in('id', Array.from(allProductIds));
      if (productList) {
        productList.forEach((p) => {
          productMap[p.id] = p;
        });
      }
    }
    // 4. Parse items for each order
    const parsedOrders = (purchases || []).map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    setOrders(parsedOrders);
    setProducts(productMap);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">View all purchase orders</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No orders found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border">Order ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">Products</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2 border font-mono">{order.id}</td>
                  <td className="px-4 py-2 border">{order.name}</td>
                  <td className="px-4 py-2 border">{order.email}</td>
                  <td className="px-4 py-2 border">{order.phone}</td>
                  <td className="px-4 py-2 border">
                    {order.address}, {order.city}, {order.state} {order.pincode}
                  </td>
                  <td className="align-top">
                    <ul className="list-disc list-inside space-y-1">
                      {order.items.map((item, idx) => {
                        const product = products[item.id];
                        return (
                          <li key={item.id + idx}>
                            {product ? (
                              <a
                                href={`/products?id=${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {product.name}
                              </a>
                            ) : (
                              <span className="text-gray-500">{item.id}</span>
                            )}
                            {item.quantity ? ` ×${item.quantity}` : ''}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="px-4 py-2 border">₹{order.total}</td>
                  <td className="px-4 py-2 border">{order.status}</td>
                  <td className="px-4 py-2 border">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 