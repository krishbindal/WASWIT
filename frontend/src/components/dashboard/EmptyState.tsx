import React from 'react';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 bg-gray-50">
      <p>{message}</p>
    </div>
  );
}
