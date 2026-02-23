import React from 'react';

/**
 * Skeleton loading placeholder component.
 * Replaces raw "Loading..." text with animated shimmer effects.
 * 
 * Usage:
 *   <Skeleton width="200px" height="20px" />
 *   <Skeleton variant="circle" width="40px" height="40px" />
 *   <Skeleton variant="text" lines={3} />
 */
export function Skeleton({ 
  width = '100%', 
  height = '16px', 
  variant = 'rect', 
  lines = 1, 
  className = '',
  rounded = true 
}) {
  const baseClass = `animate-pulse bg-gray-700/30 dark:bg-gray-600/30 ${rounded ? 'rounded' : ''} ${className}`;

  if (variant === 'circle') {
    return (
      <div
        className={`${baseClass} rounded-full`}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={baseClass}
            style={{ 
              width: i === lines - 1 ? '75%' : '100%', 
              height 
            }}
          />
        ))}
      </div>
    );
  }

  // rect (default)
  return (
    <div
      className={baseClass}
      style={{ width, height }}
    />
  );
}

/**
 * Card skeleton — mimics a loading card with title, subtitle, and content lines.
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`p-4 rounded-xl bg-gray-800/20 dark:bg-gray-800/40 space-y-3 ${className}`}>
      <Skeleton width="60%" height="20px" />
      <Skeleton width="40%" height="14px" />
      <div className="pt-2">
        <Skeleton variant="text" lines={3} height="12px" />
      </div>
    </div>
  );
}

/**
 * Table row skeleton — mimics a loading table row.
 */
export function TableRowSkeleton({ columns = 4, className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-3 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === 0 ? '30%' : `${Math.floor(70 / (columns - 1))}%`} 
          height="14px" 
        />
      ))}
    </div>
  );
}

/**
 * Full page loading skeleton with multiple card skeletons.
 */
export function PageSkeleton({ cards = 3 }) {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <Skeleton width="200px" height="28px" className="mb-6" />
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
