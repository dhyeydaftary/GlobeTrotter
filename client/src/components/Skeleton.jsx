import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-surface-card rounded-card shadow-card border border-borderLight overflow-hidden flex flex-col justify-between h-[380px]">
    <div className="h-[200px] w-full skeleton-shimmer" />
    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        <div className="h-5 w-3/4 skeleton-shimmer rounded-md" />
        <div className="h-3.5 w-full skeleton-shimmer rounded-md" />
        <div className="h-3.5 w-5/6 skeleton-shimmer rounded-md" />
      </div>
      <div className="space-y-2 pt-2 border-t border-borderLight/60">
        <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
        <div className="h-3 w-1/3 skeleton-shimmer rounded-md" />
      </div>
    </div>
  </div>
);

export const RecommendationSkeleton = () => (
  <div className="min-w-[220px] bg-surface-card rounded-card shadow-card border border-borderLight overflow-hidden p-4 space-y-3 shrink-0">
    <div className="h-32 w-full skeleton-shimmer rounded-xl" />
    <div className="h-4 w-3/4 skeleton-shimmer rounded" />
    <div className="h-3 w-1/2 skeleton-shimmer rounded" />
    <div className="h-2 w-full skeleton-shimmer rounded" />
  </div>
);

export const DetailedItinerarySkeleton = () => (
  <div className="space-y-6">
    <div className="h-24 w-full skeleton-shimmer rounded-2xl" />
    <div className="h-48 w-full skeleton-shimmer rounded-2xl" />
    <div className="h-48 w-full skeleton-shimmer rounded-2xl" />
  </div>
);

export default function Skeleton({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'recommendation') {
    return (
      <div className="flex space-x-4 overflow-hidden py-2">
        {items.map((_, i) => (
          <RecommendationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (type === 'itinerary') {
    return <DetailedItinerarySkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
