import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-accent/20 border-t-accent rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
