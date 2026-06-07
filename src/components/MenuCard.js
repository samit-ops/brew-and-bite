"use client";

import { formatPrice } from "@/lib/formatPrice";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function MenuCard({ item }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    // Normalize the item shape for cart — use _id as the menuItem key
    addItem({
      menuItem: item._id,
      name: item.name,
      price: item.price,
      image: item.image || "",
    });
    addToast(`${item.name} added to cart`, "success");
  };

  const showFallback = !item.image || imgError;

  return (
    <div className="glass-panel glass-panel-hover overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-brand-mocha">
        {showFallback ? (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-mocha">
            <span className="text-5xl opacity-30">☕</span>
          </div>
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        )}
        {/* Category tag */}
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-brand-espresso/70 backdrop-blur-sm text-brand-amber border border-brand-amber/20 font-medium">
          {item.category}
        </span>
        {/* Sold out overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-brand-espresso/70 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold tracking-widest uppercase border border-white/20 px-4 py-1 rounded">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg font-serif text-brand-cream leading-tight">{item.name}</h3>
          <span className="text-brand-amber font-bold whitespace-nowrap">
  {formatPrice(item.price)}
</span>
        </div>

        <p className="text-brand-muted text-sm line-clamp-2 mb-5 flex-1 leading-relaxed">
          {item.description}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
            item.isAvailable
              ? "bg-brand-amber text-brand-espresso hover:bg-[#e6b67e] hover:shadow-[0_0_15px_rgba(212,163,106,0.3)] active:scale-[0.97]"
              : "bg-brand-mocha text-brand-muted cursor-not-allowed"
          }`}
        >
          {item.isAvailable ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
