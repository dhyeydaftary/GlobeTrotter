import React from 'react';

const EmptyState = ({
  title = 'No trips planned yet',
  description = 'Build your multi-city travel itinerary, map daily stops, and stay within your budget.',
  action,
}) => {
  return (
    <div className="bg-surface-card border border-border-light rounded-card p-10 text-center flex flex-col items-center justify-center my-6 shadow-card">
      {/* Compass Illustration in New Color Tokens */}
      <div className="w-20 h-20 mb-4 flex items-center justify-center bg-accent-light p-4 rounded-full border border-accent/20 shadow-sm">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
        >
          <circle cx="32" cy="32" r="28" stroke="#5B5BF6" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="32" cy="32" r="22" fill="#FAFAFC" stroke="#5B5BF6" strokeWidth="2" />
          <polygon points="32,16 37,29 32,48 27,29" fill="#5B5BF6" />
          <polygon points="32,48 37,35 32,16 27,35" fill="#15161F" opacity="0.3" />
          <circle cx="32" cy="32" r="3" fill="#15161F" />
        </svg>
      </div>

      <h3 className="text-display-md text-xl font-bold text-text-main mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-text-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
