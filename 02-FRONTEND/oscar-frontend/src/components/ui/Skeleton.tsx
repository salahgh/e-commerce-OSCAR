import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  ...props
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
    none: '',
  };

  return (
    <div
      className={cn('bg-gray-200', variantClasses[variant], animationClasses[animation], className)}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
      {...props}
    />
  );
};

const SkeletonCard: React.FC = () => (
  <div className="card p-4 space-y-4">
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <Skeleton variant="text" className="w-3/4" />
    <Skeleton variant="text" className="w-1/2" />
    <div className="flex justify-between items-center">
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="rectangular" height={36} className="w-24" />
    </div>
  </div>
);

const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonList };
