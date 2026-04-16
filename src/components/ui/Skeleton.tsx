import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }: { className?: string, rounded?: string }) => (
  <div className={`animate-pulse bg-gray-200 ${rounded} ${className}`}></div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-1/2 h-3" />
        </div>
        <Skeleton className="w-24 h-6 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);
