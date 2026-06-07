"use client";

import { formatPrice } from "@/lib/formatPrice";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default function AdminOrders() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to load orders");
      setOrders(json.data || []);
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Use interval to poll for new orders or auto-refresh could be standard but we'll stick to basic fetch for now
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      addToast(`Order updated to ${newStatus}`, "success");
      
      // Update local state instead of full refetch for speed
      setOrders(prev => prev.map(o => o.orderNumber === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin text-4xl">☕</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-brand-cream mb-2">Order Management</h1>
          <p className="text-brand-muted">View, process, and update customer deliveries.</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm flex gap-2 items-center">
          <span>🔄</span> Refresh
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
              <tr className="bg-brand-coffee/50 text-brand-muted text-sm uppercase tracking-wider border-b border-brand-cream/10">
                <th className="p-4 font-medium w-24">Order #</th>
                <th className="p-4 font-medium w-48">Customer</th>
                <th className="p-4 font-medium w-64">Order Details</th>
                <th className="p-4 font-medium text-right w-24">Total</th>
                <th className="p-4 font-medium text-center w-32">Status</th>
                <th className="p-4 font-medium text-center w-40">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream/5 text-brand-cream text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-brand-muted text-lg">No orders found.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-brand-coffee/30 transition-colors">
                    <td className="p-4 font-medium text-brand-amber align-top">{order.orderNumber}</td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-brand-cream">{order.customer.name}</div>
                      <div className="text-xs text-brand-muted mt-1">{order.customer.phone}</div>
                      <div className="text-xs text-brand-muted mt-1 line-clamp-2">{order.customer.address}</div>
                    </td>
                    <td className="p-4 align-top">
                      <ul className="text-xs text-brand-cream space-y-1">
                        {order.items.map((item, i) => (
                          <li key={i}><span className="text-brand-amber font-medium">{item.quantity}x</span> {item.name}</li>
                        ))}
                      </ul>
                      <div className="text-xs text-brand-muted mt-2">
                        Placed: {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}
                      </div>
                    </td>
                    <td className="p-4 text-right align-top font-medium">
  {formatPrice(order.totalAmount * 1.08)}
</td>
                    <td className="p-4 text-center align-top">
                      <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
                    </td>
                    <td className="p-4 align-top text-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderNumber, e.target.value)}
                        disabled={updatingId === order.orderNumber}
                        className="bg-brand-espresso border border-brand-cream/10 rounded-lg px-2 py-1.5 text-xs text-brand-cream focus:outline-none focus:border-brand-amber w-full max-w-[140px]"
                      >
                        <option value="received">Received</option>
                        <option value="preparing">Preparing</option>
                        <option value="out-for-delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {updatingId === order.orderNumber && (
                        <div className="text-xs text-brand-muted mt-2 animate-pulse">updating...</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
