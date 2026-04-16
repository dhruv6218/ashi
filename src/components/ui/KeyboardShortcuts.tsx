import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, X } from 'lucide-react';

export const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let keys = '';
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '?') {
        setIsOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
        // Also close any open modals globally by dispatching an event
        window.dispatchEvent(new CustomEvent('close-modals'));
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        window.dispatchEvent(new CustomEvent('open-upload-modal'));
        return;
      }

      keys += e.key.toLowerCase();
      if (keys.length > 2) keys = keys.slice(-2);

      if (keys === 'gh') navigate('/app');
      if (keys === 'gs') navigate('/app/signals');
      if (keys === 'gp') navigate('/app/problems');
      if (keys === 'go') navigate('/app/opportunities');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 w-10 h-10 bg-sidebar-dark text-gray-400 border border-slate-700 rounded-full shadow-lg flex items-center justify-center hover:text-white hover:bg-sidebar-hover transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astrix-teal"
        title="Keyboard Shortcuts (?)"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-heading text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Go to Home</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">G then H</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Go to Signals</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">G then S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Go to Problems</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">G then P</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Go to Opportunities</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">G then O</kbd>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-600 font-bold">Focus Search</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">/</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Upload Signal</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Close Modals</span> 
                <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
