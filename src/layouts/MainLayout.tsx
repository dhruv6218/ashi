import React from 'react';
import { Navigation } from '../components/sections/Navigation';
import { EmpireSection } from '../components/sections/EmpireSection';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSmoothScroll();

  return (
    <div className="relative bg-white text-gray-900 min-h-screen font-sans selection:bg-brand-blue selection:text-white">
      <ScrollProgress />
      <div className="bg-noise"></div>
      <Navigation />
      <main className="pt-20"> {/* Offset for fixed nav */}
        {children}
      </main>
      <EmpireSection />
    </div>
  );
};
