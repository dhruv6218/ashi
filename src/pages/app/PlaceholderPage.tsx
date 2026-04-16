import React from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Hammer } from 'lucide-react';

export const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <AppLayout title={title}>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Hammer className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">{title} is under construction.</h2>
        <p className="text-gray-500 font-medium max-w-md">
          This page is part of the Group 3 architecture and will be fully implemented in the upcoming batches.
        </p>
      </div>
    </AppLayout>
  );
};
