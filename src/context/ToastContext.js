"use client";

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
            className={`
              pointer-events-auto glass-panel px-5 py-3.5 min-w-[300px] max-w-[400px]
              shadow-2xl flex items-center gap-3
              ${toast.type === 'success' ? 'border-green-500/40' :
                toast.type === 'error' ? 'border-red-500/40' :
                'border-brand-amber/40'}
            `}
          >
            <span className="text-lg shrink-0">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'info' && '☕'}
            </span>
            <p className="text-sm font-medium text-brand-cream flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-brand-muted hover:text-white transition-colors text-sm ml-2 shrink-0"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
