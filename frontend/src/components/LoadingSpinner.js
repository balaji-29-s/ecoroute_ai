import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="d-flex align-center justify-center gap-2">
      <div 
        className={`spinner ${sizeClasses[size] || sizeClasses.md}`}
        style={{
          width: sizeClasses[size]?.split(' ')[0]?.replace('w-', '') + 'px',
          height: sizeClasses[size]?.split(' ')[1]?.replace('h-', '') + 'px'
        }}
      ></div>
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
} 