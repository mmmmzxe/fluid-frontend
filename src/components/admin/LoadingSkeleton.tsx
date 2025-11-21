import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
    count?: number;
    height?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    className,
    count = 1,
    height = 'h-4',
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        height,
                        'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
                        'rounded animate-pulse',
                        'bg-[length:200%_100%]',
                        className
                    )}
                    style={{
                        animation: 'shimmer 2s infinite',
                        backgroundSize: '200% 100%',
                    }}
                />
            ))}
            <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
        </>
    );
};

export default LoadingSkeleton;
