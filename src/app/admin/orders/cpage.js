"use client";

import { useEffect, useState } from "react";

export default function OrderPage({ params }) {
  const { id } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
  cache: "no-store",
});
      const json = await res.json();

      if (json.success) {
        setOrder((prev) => {
          if (!prev || prev.status !== json.data.status) {
            console.log("🔄 Status updated:", json.data.status);
            return json.data;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(fetchOrder, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Order Confirmed</h1>

      <h2>Order #: {order.orderNumber}</h2>
      <p>Status: <b>{order.status}</b></p>

      <h3>Customer</h3>
      <p>{order.customer.name}</p>

      <h3>Items</h3>
      <ul>
        {order.items.map((item, i) => (
          <li key={i}>
            {item.quantity}x {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}