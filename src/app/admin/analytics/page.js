"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    const res = await fetch("/api/admin/analytics", {
      cache: "no-store",
    });
    const json = await res.json();

    if (json.success) {
      setData(json.data);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  // 📅 Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // 📊 Existing Trend (today vs yesterday)
  const todayRevenue =
    data.salesLast7Days[data.salesLast7Days.length - 1]?.revenue || 0;

  const yesterdayRevenue =
    data.salesLast7Days[data.salesLast7Days.length - 2]?.revenue || 0;

  const trend =
    yesterdayRevenue === 0
      ? 100
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <h1 className="text-3xl font-serif text-brand-cream">Analytics</h1>

      {/* 🔥 CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">Revenue</p>
          <h2 className="text-xl font-bold text-brand-cream">
            ₹{data.revenue}
          </h2>
        </div>

        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">Orders</p>
          <h2 className="text-xl font-bold text-brand-cream">
            {data.totalOrders}
          </h2>
        </div>

        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">AOV</p>
          <h2 className="text-xl font-bold text-brand-cream">
            ₹{data.avgOrderValue.toFixed(2)}
          </h2>
        </div>

        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">New Customers</p>
          <h2 className="text-xl font-bold text-brand-cream">
            {data.newCustomers}
          </h2>
        </div>

        {/* 🆕 Avg Items */}
        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">Items / Order</p>
          <h2 className="text-xl font-bold text-brand-cream">
            {data.avgItemsPerOrder?.toFixed(2)}
          </h2>
        </div>

        {/* 🆕 Best Day */}
        <div className="p-4 bg-brand-coffee rounded-xl hover:scale-105 transition">
          <p className="text-sm text-brand-muted">Best Day</p>
          <h2 className="text-xl font-bold text-brand-cream">
            {formatDate(data.bestDay?.date)} (₹{data.bestDay?.revenue})
          </h2>
        </div>
      </div>

      {/* 📈 GRAPH */}
      <div className="bg-brand-coffee p-6 rounded-xl">
        <h2 className="text-lg text-brand-cream mb-2">
          Sales (Last 7 Days)
        </h2>

        {/* Existing trend */}
        <p className="text-sm text-brand-muted mb-1">
          Daily Trend: {trend.toFixed(1)}% {trend >= 0 ? "↑" : "↓"}
        </p>

        {/* 🆕 Weekly trend */}
        <p
          className={`text-sm mb-4 ${
            data.weeklyTrend >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          Weekly Trend: {data.weeklyTrend?.toFixed(1)}%{" "}
          {data.weeklyTrend >= 0 ? "↑" : "↓"}
        </p>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data.salesLast7Days}>
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#d4a36a"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔥 TOP ITEMS + PEAK HOURS */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Top Items */}
        <div className="bg-brand-coffee p-6 rounded-xl">
          <h2 className="text-lg text-brand-cream mb-4">Top Items</h2>

          <ul className="space-y-2">
            {data.topItems.map((item, i) => (
              <li key={i} className="flex justify-between text-brand-cream">
                <span>{item.name}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Peak Hours */}
        <div className="bg-brand-coffee p-6 rounded-xl">
          <h2 className="text-lg text-brand-cream mb-4">Peak Hours</h2>

          <ul className="space-y-2">
            {data.peakHours.map((h, i) => (
              <li key={i} className="flex justify-between text-brand-cream">
                <span>{h.hour}:00</span>
                <span>{h.count} orders</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🆕 STATUS BREAKDOWN */}
      <div className="bg-brand-coffee p-6 rounded-xl">
        <h2 className="text-lg text-brand-cream mb-4">Order Status</h2>

        {Object.entries(data.statusCounts || {}).map(([status, count]) => (
          <div key={status} className="flex justify-between text-brand-cream">
            <span>{status}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}