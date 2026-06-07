"use client";

import { formatPrice } from "@/lib/formatPrice";
import { use } from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default function OrderConfirmationPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  let interval;

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch order');
      }

      setOrder((prev) => {
        if (!prev || prev.status !== json.data.status) {
          console.log("🔄 Status updated:", json.data.status);
          return json.data;
        }
        return prev;
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    fetchOrder();

    interval = setInterval(fetchOrder, 3000); // 🔁 every 3 sec
  }

  return () => clearInterval(interval);
}, [orderId]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center"><div className="animate-spin text-4xl">☕</div></div>;
  }

  if (error || !order) {
    return (
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-12 border-red-500/30">
          <h1 className="text-3xl font-serif text-brand-amber mb-4">Order Not Found</h1>
          <p className="text-brand-muted mb-8">{error || "We couldn't locate this order."}</p>
          <Link href="/menu" className="btn-secondary">Return to Menu</Link>
        </div>
      </div>
    );
  }

  const steps = ['received', 'preparing', 'out-for-delivery', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-4xl font-serif text-brand-cream mb-2">Order Confirmed</h1>
        <p className="text-brand-muted text-lg mb-4">Thank you for your order, {order.customer.name}!</p>
        <div className="inline-flex items-center gap-4 bg-brand-coffee/50 px-6 py-3 rounded-2xl border border-brand-cream/5">
          <span className="text-brand-muted font-medium text-sm tracking-wider uppercase">Order #</span>
          <span className="text-xl font-bold tracking-widest text-brand-amber">{order.orderNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Status Tracker */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-serif text-brand-cream mb-8 flex justify-between items-center">
              Tracking Status
              <OrderStatusBadge status={order.status} />
            </h2>
            
            <div className="relative border-l border-brand-cream/10 ml-4 space-y-8">
              {[
                { id: 'received', title: 'Order Received', desc: 'We have received your order.' },
                { id: 'preparing', title: 'Preparing', desc: 'Our team is preparing your items.' },
                { id: 'out-for-delivery', title: 'Out for Delivery', desc: 'Your order is on the way!' },
                { id: 'delivered', title: 'Delivered', desc: 'Enjoy your Brew & Bite.' }
              ].map((step, idx) => {
                const isComplete = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div key={step.id} className="relative pl-8">
                    <div className={`absolute -left-3 top-1 w-6 h-6 rounded-full border-4 border-brand-espresso flex items-center justify-center ${
                      isComplete ? 'bg-brand-amber' : 'bg-brand-coffee'
                    }`}>
                      {isComplete && <div className="w-2 h-2 bg-brand-espresso rounded-full" />}
                    </div>
                    <h3 className={`text-lg font-medium ${isComplete ? 'text-brand-cream' : 'text-brand-muted/50'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isCurrent ? 'text-brand-amber' : 'text-brand-muted/50'}`}>
                      {isCurrent ? 'Currently ' + step.desc.toLowerCase() : step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="glass-panel p-8">
            <h2 className="text-xl font-serif text-brand-cream mb-6">Delivery Details</h2>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-4">
                <dt className="text-brand-muted w-24">Name</dt>
                <dd className="text-brand-cream">{order.customer.name}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-brand-muted w-24">Phone</dt>
                <dd className="text-brand-cream">{order.customer.phone}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-brand-muted w-24">Address</dt>
                <dd className="text-brand-cream leading-relaxed">{order.customer.address}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-panel p-8 h-fit">
          <h2 className="text-xl font-serif text-brand-cream mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 border-b border-brand-cream/10 pb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start gap-4 text-sm">
                <div className="flex gap-2">
                  <span className="text-brand-amber/80 font-medium">{item.quantity}x</span>
                  <span className="text-brand-cream">{item.name}</span>
                </div>
                <span className="text-brand-muted">
  {formatPrice(item.price * item.quantity)}
</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm text-brand-muted mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span>{formatPrice(order.totalAmount * 0.08)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-brand-cream/10">
            <span className="text-lg font-medium text-brand-cream">Total Paid</span>
            <span className="text-xl font-serif text-brand-amber">
  {formatPrice(order.totalAmount * 1.08)}
</span>
          </div>
        </div>
      </div>
    </div>
  );
}
