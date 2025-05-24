import React from 'react';
import { Theme } from '../../../types';

interface SkeletonLoaderProps {
  theme: Theme;
  variant?: 'logEntry' | 'stats' | 'header' | 'controls';
  count?: number;
}

/**
 * Beautiful skeleton loader with shimmer animation
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  theme,
  variant = 'logEntry',
  count = 5
}) => {
  const isDark = theme === 'dark';
  
  const baseClasses = `animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`;
  const shimmerClasses = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent ${isDark ? 'before:via-gray-600/40' : 'before:via-white/60'} before:to-transparent before:animate-[shimmer_2s_infinite]`;

  const LogEntrySkeleton = () => (
    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-6 rounded ${baseClasses} ${shimmerClasses}`} />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-5 rounded-full ${baseClasses} ${shimmerClasses}`} />
            <div className={`w-32 h-4 rounded ${baseClasses} ${shimmerClasses}`} />
            <div className={`w-20 h-4 rounded ${baseClasses} ${shimmerClasses}`} />
          </div>
          <div className="space-y-2">
            <div className={`w-full h-4 rounded ${baseClasses} ${shimmerClasses}`} />
            <div className={`w-3/4 h-4 rounded ${baseClasses} ${shimmerClasses}`} />
          </div>
        </div>
      </div>
    </div>
  );

  const StatsSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg ${baseClasses} ${shimmerClasses}`} />
            <div className={`w-12 h-8 rounded ${baseClasses} ${shimmerClasses}`} />
          </div>
          <div className="flex items-center justify-between">
            <div className={`w-16 h-4 rounded ${baseClasses} ${shimmerClasses}`} />
            <div className={`w-12 h-5 rounded-full ${baseClasses} ${shimmerClasses}`} />
          </div>
        </div>
      ))}
    </div>
  );

  const HeaderSkeleton = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className="space-y-2">
          <div className={`w-32 h-8 rounded ${baseClasses} ${shimmerClasses}`} />
          <div className={`w-48 h-4 rounded ${baseClasses} ${shimmerClasses}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`w-10 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        ))}
      </div>
    </div>
  );

  const ControlsSkeleton = () => (
    <div className={`p-6 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} mb-8`}>
      <div className="flex items-center gap-4">
        <div className={`w-32 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className={`w-24 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className={`flex-1 max-w-md h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className={`w-32 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className={`w-24 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
        <div className={`w-32 h-10 rounded-lg ${baseClasses} ${shimmerClasses}`} />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return <StatsSkeleton />;
      case 'header':
        return <HeaderSkeleton />;
      case 'controls':
        return <ControlsSkeleton />;
      case 'logEntry':
      default:
        return (
          <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`w-48 h-6 rounded ${baseClasses} ${shimmerClasses}`} />
            </div>
            <div>
              {Array.from({ length: count }).map((_, i) => (
                <LogEntrySkeleton key={i} />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      {renderSkeleton()}
    </>
  );
}; 