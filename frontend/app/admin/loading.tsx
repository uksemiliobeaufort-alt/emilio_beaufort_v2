import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
    </div>
  );
} 