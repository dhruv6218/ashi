import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Sentry } from './lib/instrument';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW error:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<div className="p-8 text-center font-mono text-sm text-gray-500">A critical application error occurred. Our team has been notified.</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
