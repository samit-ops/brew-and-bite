"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

const CATEGORIES = ["coffee", "tea", "bakery", "sandwich", "smoothie", "dessert"];

export default function AdminMenu() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "coffee",
    image: "",
    isAvailable: true
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/menu");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to load menu");
      setItems(json.data || []);
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image: item.image || "",
        isAvailable: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "", description: "", price: "", category: "coffee", image: "", isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      const url = editingItem ? `/api/menu/${editingItem._id}` : "/api/menu";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      
      addToast(`Item successfully ${editingItem ? "updated" : "created"}!`, "success");
      closeModal();
      fetchItems(); // Refresh list
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will hide it from the menu.`)) return;
    if (!token) return;
    
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message);
      }
      
      addToast(`${name} has been removed.`, "info");
      fetchItems();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin text-4xl">☕</div></div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-brand-cream mb-2">Menu Management</h1>
          <p className="text-brand-muted">Add, edit, or remove items from the public menu.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary text-sm flex gap-2 items-center">
          <span>+</span> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item._id} className="glass-panel p-4 flex gap-4 h-32 hover:border-brand-amber/30 transition-colors group">
            <div className="w-24 h-24 relative rounded-lg overflow-hidden shrink-0 bg-brand-coffee">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className={`object-cover ${!item.isAvailable && "grayscale opacity-50"}`} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-amber/30 text-2xl">☕</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-brand-cream truncate pr-2">{item.name}</h3>
              </div>
              <div className="text-brand-amber font-medium text-sm mb-1">₹{item.price.toFixed(2)}</div>
              
              <div className="flex gap-2 mb-auto">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-cream/10 text-brand-muted">
                  {item.category}
                </span>
                {!item.isAvailable && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    Sold Out
                  </span>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openModal(item)}
                  className="text-xs text-brand-muted hover:text-brand-cream transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item._id, item.name)}
                  className="text-xs text-brand-muted hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-espresso/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-8 animate-[slideIn_0.2s_ease-out_forwards] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-brand-cream">{editingItem ? "Edit Item" : "Create New Item"}</h2>
              <button onClick={closeModal} className="text-brand-muted hover:text-brand-cream text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Item Name</label>
                  <input
                    required type="text"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-brand-coffee/50 border border-brand-cream/10 rounded-lg px-4 py-2 text-brand-cream focus:border-brand-amber outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-brand-coffee/50 border border-brand-cream/10 rounded-lg px-4 py-2 text-brand-cream focus:border-brand-amber outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-brand-coffee/50 border border-brand-cream/10 rounded-lg px-4 py-2 text-brand-cream focus:border-brand-amber outline-none appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    required rows="2"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-brand-coffee/50 border border-brand-cream/10 rounded-lg px-4 py-2 text-brand-cream focus:border-brand-amber outline-none resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-brand-coffee/50 border border-brand-cream/10 rounded-lg px-4 py-2 text-brand-cream focus:border-brand-amber outline-none text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.isAvailable} 
                        onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-brand-amber' : 'bg-brand-coffee border border-brand-cream/20'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isAvailable ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-brand-cream group-hover:text-brand-amber transition-colors">
                      Available for Order
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-brand-cream/10 text-brand-cream hover:bg-brand-coffee transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-brand-amber text-brand-espresso font-bold hover:bg-[#e6b67e] transition-colors disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
