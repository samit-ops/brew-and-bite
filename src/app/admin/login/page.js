"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await login(email, password);
    
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 z-10 relative">
      <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-amber/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-amber/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-serif text-brand-cream mb-2">Admin Portal</h1>
          <p className="text-brand-muted">Sign in to manage Brew & Bite</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-espresso/80 border border-brand-cream/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
              placeholder="Enter email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-espresso/80 border border-brand-cream/10 rounded-xl px-4 py-3 text-brand-cream placeholder-brand-muted/50 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-bold transition-all mt-4 flex justify-center items-center gap-2 ${
              isSubmitting 
                ? "bg-brand-mocha text-brand-muted cursor-not-allowed" 
                : "bg-brand-amber text-brand-espresso hover:bg-[#e6b67e] shadow-lg shadow-brand-amber/20 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <><div className="animate-spin w-5 h-5 border-2 border-brand-espresso border-t-transparent rounded-full" /> Signing in...</>
            ) : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 relative z-10">
          <Link href="/" className="text-sm text-brand-muted hover:text-brand-cream transition-colors border-b border-transparent hover:border-brand-cream">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
