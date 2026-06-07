"use client";

import { formatPrice } from "@/lib/formatPrice";
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart, isLoaded } = useCart();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  if (isLoaded && items.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center py-20 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-brand-cream mb-4">You have nothing to checkout!</h2>
          <Link href="/menu" className="btn-primary">Return to Menu</Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (items.length === 0) return;

  setIsSubmitting(true);

  const loaded = await loadRazorpay();

  if (!loaded) {
    alert("Razorpay failed to load");
    setIsSubmitting(false);
    return;
  }

  try {
    // Create Razorpay order
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: cartTotal * 1.08,
      }),
    });

    const data = await orderRes.json();

    if (!data.success) {
      throw new Error("Failed to create payment order");
    }

    const options = {
      key: "rzp_test_SfPgs2t5DGcLQ3", // 🔥 PUT YOUR REAL TEST KEY HERE
      amount: data.order.amount,
      currency: "INR",
      name: "Brew & Bite",
      description: "Order Payment",
      order_id: data.order.id,

      handler: async function (response) {
        console.log("Payment success:", response);

        // AFTER PAYMENT → create order
        // 🔐 STEP 1: VERIFY PAYMENT
const verifyRes = await fetch("/api/payment/verify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(response),
});

const verifyData = await verifyRes.json();

if (!verifyData.success) {
  alert("Payment verification failed");
  return;
}

// ✅ STEP 2: CREATE ORDER AFTER VERIFICATION
const orderData = {
  customer: formData,
  items: items.map((i) => ({
    menuItem: i.menuItem || i._id,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  })),
};

const res = await fetch("/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(orderData),
});

const json = await res.json();

if (!res.ok) {
  throw new Error(json.message || "Order creation failed");
}

addToast("Payment successful & order placed!", "success");
clearCart();
router.push(`/order/${json.data.orderNumber}`);
      },

      theme: {
        color: "#d4a36a",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    addToast(error.message, "error");
    setIsSubmitting(false);
  }
};

  const grandTotal = (cartTotal * 1.08).toFixed(2);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-brand-cream mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Checkout Form */}
        <div className="glass-panel p-8 h-fit">
          <h2 className="text-2xl font-medium text-brand-amber mb-6">Delivery Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-muted mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-brand-coffee/40 border border-brand-cream/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                placeholder="enter name"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-muted mb-2">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-brand-coffee/40 border border-brand-cream/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
                placeholder="enter phone number"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-brand-muted mb-2">Full Delivery Address</label>
              <textarea
                id="address"
                name="address"
                required
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-brand-coffee/40 border border-brand-cream/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors resize-none"
                placeholder="enter address"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || cartTotal === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${
                isSubmitting 
                  ? "bg-brand-mocha text-brand-muted cursor-not-allowed" 
                  : "bg-brand-amber text-brand-espresso hover:bg-[#e6b67e] hover:shadow-[0_0_15px_rgba(212,163,106,0.2)] active:scale-95"
              }`}
            >
              {isSubmitting ? (
                <> <div className="animate-spin w-5 h-5 border-2 border-brand-muted border-t-transparent rounded-full" /> Processing... </>
              ) : (
                `Place Order — ${formatPrice(grandTotal)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Map */}
        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-brand-cream mb-6">Order Summary</h2>
          <div className="glass-panel p-6">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 p-3 bg-brand-coffee/30 rounded-xl border border-brand-cream/5">
                  <div className="flex-1">
                    <h3 className="text-brand-cream font-medium">{item.name}</h3>
                    <p className="text-sm text-brand-muted">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-brand-amber font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 text-sm border-t border-brand-cream/10 pt-4 mb-4">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Tax (8%)</span>
                <span>{formatPrice(cartTotal * 0.08)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Delivery</span>
                <span className="text-green-400">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-lg font-serif border-t border-brand-cream/10 pt-4">
              <span className="text-brand-cream">Total</span>
              <span className="text-brand-amber text-2xl">
  {formatPrice(grandTotal)}
</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
