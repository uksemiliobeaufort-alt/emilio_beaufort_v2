/*"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Purchase {
  id: number; // or string if your DB uses uuid
  razorpay_order_id: string;
  razorpay_payment_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  order_status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase.from("purchases").select("*");
      if (error) {
        setError(error.message);
      } else if (data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>View Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1">Order ID</th>
              <th className="border border-gray-300 px-2 py-1">Payment ID</th>
              <th className="border border-gray-300 px-2 py-1">Name</th>
              <th className="border border-gray-300 px-2 py-1">Email</th>
              <th className="border border-gray-300 px-2 py-1">Phone</th>
              <th className="border border-gray-300 px-2 py-1">City</th>
              <th className="border border-gray-300 px-2 py-1">Order Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border border-gray-300 px-2 py-1">{order.razorpay_order_id}</td>
                <td className="border border-gray-300 px-2 py-1">{order.razorpay_payment_id}</td>
                <td className="border border-gray-300 px-2 py-1">{order.name}</td>
                <td className="border border-gray-300 px-2 py-1">{order.email}</td>
                <td className="border border-gray-300 px-2 py-1">{order.phone}</td>
                <td className="border border-gray-300 px-2 py-1">{order.city}</td>
                <td className="border border-gray-300 px-2 py-1">{order.order_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
*/

/*"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Type for an individual item inside the `items` array
interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Type for a purchase record
interface Purchase {
  id: number; // or string if your DB uses uuid
  razorpay_order_id: string;
  razorpay_payment_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  order_status: string;
  items: Item[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase.from("purchases").select("*");
      if (error) {
        setError(error.message);
      } else if (data) {
        // Parse items if necessary (in case it's stored as JSON string)
        const parsedData = data.map((order: any) => ({
          ...order,
          items: typeof order.items === "string" ? JSON.parse(order.items) : order.items,
        }));
        setOrders(parsedData);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1">Order ID</th>
              <th className="border border-gray-300 px-2 py-1">Payment ID</th>
              <th className="border border-gray-300 px-2 py-1">Name</th>
              <th className="border border-gray-300 px-2 py-1">Email</th>
              <th className="border border-gray-300 px-2 py-1">Phone</th>
              <th className="border border-gray-300 px-2 py-1">City</th>
              <th className="border border-gray-300 px-2 py-1">Order Status</th>
              <th className="border border-gray-300 px-2 py-1">Image</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border border-gray-300 px-2 py-1">{order.razorpay_order_id}</td>
                <td className="border border-gray-300 px-2 py-1">{order.razorpay_payment_id}</td>
                <td className="border border-gray-300 px-2 py-1">{order.name}</td>
                <td className="border border-gray-300 px-2 py-1">{order.email}</td>
                <td className="border border-gray-300 px-2 py-1">{order.phone}</td>
                <td className="border border-gray-300 px-2 py-1">{order.city}</td>
                <td className="border border-gray-300 px-2 py-1">{order.order_status}</td>
                <td className="border border-gray-300 px-2 py-1">
                  {order.items && order.items.length > 0 && order.items[0].imageUrl ? (
                    <img
                      src={order.items[0].imageUrl}
                      alt={order.items[0].name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "No image"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
*/


"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Purchase {
  id: number | string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  order_status: string;
  items: Item[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase.from("purchases").select("*");

      if (error) {
        setError(error.message);
      } else if (data) {
        const parsedData = data.map((order: any) => ({
          ...order,
          items:
            typeof order.items === "string"
              ? JSON.parse(order.items)
              : order.items || [],
        }));

        setOrders(parsedData);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1">Order ID</th>
              <th className="border border-gray-300 px-2 py-1">Payment ID</th>
              <th className="border border-gray-300 px-2 py-1">Name</th>
              <th className="border border-gray-300 px-2 py-1">Email</th>
              <th className="border border-gray-300 px-2 py-1">Phone</th>
              <th className="border border-gray-300 px-2 py-1">City</th>
              <th className="border border-gray-300 px-2 py-1">Order Status</th>
              <th className="border border-gray-300 px-2 py-1">Image</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              return (
                <tr key={order.id}>
                  <td className="border border-gray-300 px-2 py-1">{order.razorpay_order_id}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.razorpay_payment_id}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.name}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.email}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.phone}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.city}</td>
                  <td className="border border-gray-300 px-2 py-1">{order.order_status}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {firstItem?.imageUrl ? (
                      <img
                        src={firstItem.imageUrl}
                        alt={firstItem.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}


