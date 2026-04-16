import React from 'react';
import { Link } from 'react-router-dom';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 selection:bg-brand-blue selection:text-white overflow-hidden p-6">
      <div className="bg-noise"></div>
      
      {/* Subtle Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-brand-blue rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[30vw] h-[30vw] bg-brand-yellow rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.03] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Logo - Centered on Mobile, Top Left on Desktop */}
      <Link to="/" className="absolute top-8 md:left-8 flex items-center justify-center md:justify-start gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg p-1 z-20 w-full md:w-auto">
        <img 
          src="https://images.dualite.app/102e86e1-720e-45cc-9e4e-55e865135e96/asset-b9a7a63e-c65a-4fa8-9433-c13564a7364e.webp" 
          alt="Astrix Logo" 
          className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <span className="font-heading text-xl font-black tracking-tighter text-gray-900">ASTRIX</span>
      </Link>

      <div className="relative z-10 w-full max-w-md mt-12 md:mt-0">
        {children}
      </div>
    </div>
  );
};
