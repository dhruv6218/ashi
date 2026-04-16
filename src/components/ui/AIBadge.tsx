import React from 'react';
import { Sparkles } from 'lucide-react';

export const AIBadge = ({ className = '' }: { className?: string }) => (
  <div className={`group relative inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-widest cursor-help ${className}`}>
    <Sparkles className="w-3 h-3" /> AI-Generated
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50 normal-case tracking-normal">
      AI-generated content. Review before acting.
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);
