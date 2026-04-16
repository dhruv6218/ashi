import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFound = () => {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-gray-200">
          <Compass className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="font-heading text-6xl md:text-8xl font-black text-gray-900 mb-4 tracking-tight">
          404
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Page not found
        </h2>
        <p className="text-lg text-gray-500 font-medium max-w-md mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link 
          to="/" 
          className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all duration-300 shadow-glow-blue flex items-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </div>
    </MainLayout>
  );
};
