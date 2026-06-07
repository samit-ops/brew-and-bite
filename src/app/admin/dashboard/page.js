"use client";

import { formatPrice } from "@/lib/formatPrice";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token) return;
      try {
        const [ordersRes, menuRes] = await Promise.all([
          fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/menu")
        ]);
        
        if (!ordersRes.ok || !menuRes.ok) throw new Error("Failed to load data");
        
        const ordersJson = await ordersRes.json();
        const orders = ordersJson.data || [];
        
        // Calculate basic stats
        const totalOrders = orders.length;
        const revenue = orders.reduce((sum, ord) => sum + ord.totalAmount * 1.08, 0); // Include 8% tax
        const pendingOrders = orders.filter(ord => ["received", "preparing"].includes(ord.status)).length;
        const recentOrders = orders.slice(0, 5); // Assuming already sorted descending
        
        setStats({ totalOrders, revenue, pendingOrders, recentOrders });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [token]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin text-4xl">☕</div></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-brand-cream mb-2">Dashboard overview</h1>
        <p className="text-brand-muted">Welcome back, {user?.name}. Here's what's happening at Brew & Bite today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border-brand-amber/20">
          <div className="text-brand-amber text-4xl mb-2">💵</div>
          <p className="text-brand-muted text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-serif text-brand-cream">
  {formatPrice(stats.revenue)}
</p>
        </div>
        
        <div className="glass-panel p-6 border-blue-500/20">
          <div className="text-blue-400 text-4xl mb-2">📦</div>
          <p className="text-brand-muted text-sm font-medium uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-serif text-brand-cream">{stats.totalOrders}</p>
        </div>
        
        <div className="glass-panel p-6 border-brand-amber/20 bg-brand-amber/5">
          <div className="text-brand-amber text-4xl mb-2">🔥</div>
          <p className="text-brand-amber/80 text-sm font-medium uppercase tracking-wider mb-1">Pending Orders</p>
          <p className="text-3xl font-serif text-brand-amber">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-brand-cream/10 flex justify-between items-center">
          <h2 className="text-xl font-serif text-brand-cream">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-amber hover:underline">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-brand-coffee/50 text-brand-muted text-sm uppercase tracking-wider border-b border-brand-cream/10">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream/5 text-brand-cream text-sm">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-brand-muted">No orders found.</td>
                </tr>
              ) : (
                stats.recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-brand-coffee/30 transition-colors">
                    <td className="p-4 font-medium text-brand-amber">{order.orderNumber}</td>
                    <td className="p-4">
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-brand-muted">{order.customer.phone}</div>
                    </td>
                    <td className="p-4 text-brand-muted truncate max-w-[200px]">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="p-4 text-right">
  {formatPrice(order.totalAmount * 1.08)}
</td>
                    <td className="p-4 text-center">
                      <OrderStatusBadge status={order.status} />
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
