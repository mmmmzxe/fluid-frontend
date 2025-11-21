import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends ButtonProps {
    gradient?: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';
}

const gradientClasses = {
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    orange: 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
    red: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
};

const GradientButton: React.FC<GradientButtonProps> = ({
    gradient = 'purple',
    className,
    children,
    ...props
}) => {
    return (
        <Button
            className={cn(
                gradientClasses[gradient],
                'text-white border-0 shadow-lg hover:shadow-xl',
                'transition-all duration-300 ease-in-out',
                'hover:scale-105',
                className
            )}
            {...props}
        >
            {children}
        </Button>
    );
};

export default GradientButton;
