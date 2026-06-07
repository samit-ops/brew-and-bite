"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The internal layout component that accesses the auth context
function AdminLayoutInner({ children }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <div className="flex-1 min-h-screen bg-brand-espresso flex items-center justify-center -mt-16">{children}</div>;
  }

  // Show nothing while verifying token to prevent flash of content
  if (isLoading) {
    return <div className="flex-1 bg-brand-espresso flex items-center justify-center min-h-[50vh]"><div className="animate-spin text-4xl">☕</div></div>;
  }

  // If not loading and no user, AuthContext will handle redirect
  if (!user) return null;

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/menu", label: "Menu Items", icon: "📋" },
    { href: "/admin/orders", label: "Orders", icon: "🛵" },
    { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-64px)] w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-coffee border-r border-brand-cream/10 shrink-0 flex flex-col">
        <div className="p-6 border-b border-brand-cream/10">
          <p className="text-brand-muted text-xs uppercase tracking-widest font-bold mb-1">Signed in as</p>
          <p className="text-brand-cream font-medium truncate">{user.name}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-brand-amber text-brand-espresso font-bold shadow-lg shadow-[0_0_15px_rgba(212,163,106,0.2)]"
                    : "text-brand-cream hover:bg-brand-amber/10 hover:text-brand-amber"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-brand-cream/10">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <span>🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 bg-brand-espresso overflow-x-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// The exported layout that provides the context wrapper
export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
