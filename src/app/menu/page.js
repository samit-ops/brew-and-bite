"use client";

import { useState, useEffect } from "react";
import MenuCard from "@/components/MenuCard";
import { useToast } from "@/context/ToastContext";

const CATEGORIES = [
  "all", "coffee", "tea", "bakery", "sandwich", "smoothie", "dessert"
];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchMenu() {
      try {
        setError(null);
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Unable to load menu. Please try again.");
        const json = await res.json();
        setItems(json.data || []);
      } catch (err) {
        setError(err.message);
        addToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter(item => item.category === activeCategory);

  // Count items per category for the filter badges
  const getCategoryCount = (cat) => {
    if (cat === "all") return items.length;
    return items.filter(item => item.category === cat).length;
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-12" style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <h1 className="text-4xl md:text-5xl font-serif text-brand-cream mb-4">Our Menu</h1>
        <p className="text-brand-muted max-w-2xl mx-auto leading-relaxed">
          Freshly roasted coffee, handcrafted artisan breads, and savory midday treats.
          Everything is made from scratch daily.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all uppercase tracking-widest text-xs flex items-center gap-2 ${
              activeCategory === category
                ? "bg-brand-amber text-brand-espresso shadow-[0_0_15px_rgba(212,163,106,0.3)]"
                : "bg-brand-coffee/50 text-brand-cream/70 hover:bg-brand-amber/20 hover:text-brand-amber border border-brand-cream/5"
            }`}
          >
            {category}
            {!loading && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === category
                  ? "bg-brand-espresso/20 text-brand-espresso"
                  : "bg-brand-cream/10 text-brand-muted"
              }`}>
                {getCategoryCount(category)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content States */}
      {loading ? (
        /* Loading skeleton grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-panel overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-brand-mocha/50" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-brand-mocha/50 rounded w-3/4" />
                <div className="h-3 bg-brand-mocha/30 rounded w-full" />
                <div className="h-3 bg-brand-mocha/30 rounded w-2/3" />
                <div className="h-10 bg-brand-mocha/40 rounded-xl w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error state */
        <div className="text-center py-20 glass-panel max-w-lg mx-auto">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-serif text-brand-cream mb-2">Something went wrong</h2>
          <p className="text-brand-muted mb-6">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); location.reload(); }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty state for filtered category */
        <div className="text-center py-20 glass-panel max-w-lg mx-auto">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-lg text-brand-muted">No items found in <span className="text-brand-amber capitalize">{activeCategory}</span>.</p>
          <button
            onClick={() => setActiveCategory("all")}
            className="mt-4 text-sm text-brand-amber underline hover:no-underline"
          >
            Show all items
          </button>
        </div>
      ) : (
        /* Menu Grid */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {filteredItems.map(item => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
