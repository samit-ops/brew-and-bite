"use client";

import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, isLoaded, updateQuantity, removeItem, cartTotal } = useCart();

  if (!isLoaded) {
    return <div className="flex-1 flex justify-center items-center"><div className="animate-spin text-4xl">☕</div></div>;
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-brand-cream mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-serif text-brand-cream mb-4">Your cart is empty</h2>
          <p className="text-brand-muted mb-8">Looks like you haven't added anything to your order yet.</p>
          <Link href="/menu" className="btn-primary inline-flex items-center gap-2">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 shrink-0 lg:w-2/3 space-y-6">
            {items.map((item) => (
              <div key={item.menuItem} className="glass-panel p-4 flex gap-4 items-center">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden shrink-0 bg-brand-mocha">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-brand-amber/30 text-2xl">☕</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-brand-cream font-serif text-lg">{item.name}</h3>
                    <button 
                      onClick={() => removeItem(item.menuItem)}
                      className="text-brand-muted hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-brand-amber font-medium mb-4">{formatPrice(item.price)}</div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-brand-coffee rounded-full border border-brand-cream/10">
                      <button 
                        onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-brand-cream hover:text-brand-amber transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-brand-cream font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-brand-cream hover:text-brand-amber transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Header */}
          <div className="lg:w-1/3">
            <div className="glass-panel p-6 sticky top-24">
              <h2 className="text-xl font-serif text-brand-cream mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-brand-muted border-b border-brand-cream/10 pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-brand-cream">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-brand-cream">{formatPrice(cartTotal * 0.08)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-brand-cream border border-brand-amber/30 text-brand-amber text-xs px-2 py-0.5 rounded-full">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-medium text-brand-cream">Total</span>
                <span className="text-2xl font-serif text-brand-amber">{formatPrice(cartTotal * 1.08)}</span>
              </div>
              
              <Link href="/checkout" className="btn-primary w-full block text-center py-3 text-lg">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
