"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('brewAdminToken');
      
      if (!storedToken) {
        setIsLoading(false);
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        const json = await res.json();
        
        if (res.ok) {
          setToken(storedToken);
          setUser(json.data.admin);
        } else {
          localStorage.removeItem('brewAdminToken');
          if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (err) {
        console.error('Auth verification failed', err);
        localStorage.removeItem('brewAdminToken');
      } finally {
        setIsLoading(false);
      }
    }
    
    initAuth();
  }, [pathname, router]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || 'Login failed');
      }
      
      const newToken = json.data.token;
      localStorage.setItem('brewAdminToken', newToken);
      setToken(newToken);
      setUser(json.data.admin);
      addToast('Welcome back!', 'success');
      router.push('/admin/dashboard');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('brewAdminToken');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully', 'info');
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
