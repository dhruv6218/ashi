import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />
  };
  
  const bgs = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-[fadeIn_0.3s_ease-out] ${bgs[type]}`}>
      {icons[type]}
      <span className="text-sm font-bold flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity focus-visible:outline-none">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
