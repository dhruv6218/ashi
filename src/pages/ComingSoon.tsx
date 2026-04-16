import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Hammer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComingSoon = () => {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-blue-100">
          <Hammer className="w-10 h-10 text-brand-blue" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
          Coming Soon
        </h1>
        <p className="text-lg text-gray-500 font-medium max-w-md mb-10 leading-relaxed">
          We are currently building out this section of the Astrix platform. Check back soon for updates.
        </p>
        <Link 
          to="/" 
          className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-blue transition-all duration-300 shadow-apple flex items-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </div>
    </MainLayout>
  );
};
