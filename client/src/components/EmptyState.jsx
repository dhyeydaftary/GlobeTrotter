import React from 'react';

const EmptyState = ({
  title = 'No trips planned yet',
  description = 'Build your multi-city travel itinerary, map daily stops, and stay within your budget.',
  action,
}) => {
  return (
    <div className="bg-surface-card border-2 border-dashed border-borderLight rounded-card p-10 text-center flex flex-col items-center justify-center my-6 shadow-card">
      {/* Custom Inline SVG Illustration: Compass & Map */}
      <div className="w-24 h-24 mb-4 text-primary/80 flex items-center justify-center bg-surface p-4 rounded-full border border-borderLight">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16"
        >
          <circle cx="32" cy="32" r="28" stroke="#1E3A5F" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="32" cy="32" r="22" fill="#F8F9FA" stroke="#1E3A5F" strokeWidth="2" />
          <polygon points="32,16 37,29 32,48 27,29" fill="#FF6B6B" />
          <polygon points="32,48 37,35 32,16 27,35" fill="#1E3A5F" opacity="0.3" />
          <circle cx="32" cy="32" r="3" fill="#1E3A5F" />
        </svg>
      </div>

      <h3 className="text-xl font-extrabold text-textMain tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-textMuted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
