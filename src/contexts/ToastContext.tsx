import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from '../components/ui/Toast';

interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <Toast 
            key={t.id} 
            message={t.message} 
            type={t.type} 
            onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
