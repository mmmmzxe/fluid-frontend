import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedBadgeProps extends Omit<BadgeProps, 'variant'> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'purple' | 'default';
    glow?: boolean;
}

const variantClasses = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500/20',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500/20',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-500/20',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-500/20',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500/20',
    default: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-500/20',
};

const glowClasses = {
    success: 'shadow-lg shadow-green-500/50',
    warning: 'shadow-lg shadow-amber-500/50',
    error: 'shadow-lg shadow-red-500/50',
    info: 'shadow-lg shadow-cyan-500/50',
    purple: 'shadow-lg shadow-purple-500/50',
    default: 'shadow-lg shadow-gray-500/50',
};

const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
    variant = 'default',
    glow = false,
    className,
    children,
    ...props
}) => {
    return (
        <Badge
            className={cn(
                variantClasses[variant],
                glow && glowClasses[variant],
                'transition-all duration-300 ease-in-out',
                'hover:scale-105',
                className
            )}
            {...props}
        >
            {children}
        </Badge>
    );
};

export default EnhancedBadge;
