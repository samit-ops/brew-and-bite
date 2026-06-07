"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, isLoaded } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide customer navbar on admin pages
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-espresso/80 backdrop-blur-md border-b border-brand-cream/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <span className="text-2xl font-serif font-bold text-brand-cream tracking-wider group-hover:text-brand-amber transition-colors">
              Brew <span className="text-brand-amber">&</span> Bite
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-widest transition-colors ${
                  pathname === link.href
                    ? "text-brand-amber"
                    : "text-brand-cream/70 hover:text-brand-amber"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Cart + Mobile toggle */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-brand-cream hover:text-brand-amber transition-colors group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {isLoaded && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold leading-none text-brand-espresso bg-brand-amber rounded-full translate-x-1/4 -translate-y-1/4 transition-transform hover:scale-110">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>


            <button
  onClick={() => window.open("/admin/login", "_blank")}
  className="p-2 text-brand-cream hover:text-brand-amber transition-colors"
  title="Admin Portal"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21a8 8 0 1 0-16 0"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
</button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-brand-cream hover:text-brand-amber transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-brand-cream/10 bg-brand-espresso/95 backdrop-blur-md"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <nav className="flex flex-col px-4 py-4 gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-widest transition-colors ${
                  pathname === link.href
                    ? "bg-brand-amber/10 text-brand-amber"
                    : "text-brand-cream/70 hover:text-brand-amber hover:bg-brand-coffee/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-widest text-brand-cream/70 hover:text-brand-amber hover:bg-brand-coffee/50 transition-colors flex justify-between items-center"
            >
              <span>Cart</span>
              {isLoaded && cartCount > 0 && (
                <span className="text-xs bg-brand-amber text-brand-espresso px-2 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
