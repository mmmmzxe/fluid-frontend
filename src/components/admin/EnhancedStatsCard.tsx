import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan';
    loading?: boolean;
    subtitle?: string;
}

const gradientClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-rose-500',
    pink: 'from-pink-500 to-rose-500',
    cyan: 'from-cyan-500 to-blue-500',
};

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    gradient = 'purple',
    loading = false,
    subtitle,
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;

    // Animated counter effect
    useEffect(() => {
        if (loading || typeof value !== 'number') return;

        const duration = 1000;
        const steps = 60;
        const increment = numericValue / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                setDisplayValue(numericValue);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, loading, numericValue]);

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 ease-in-out",
                "hover:shadow-xl hover:-translate-y-1",
                "border-t-4 border-transparent",
                "group"
            )}
            style={{
                borderTopColor: `hsl(var(--${gradient === 'purple' ? 'purple' : gradient === 'blue' ? 'blue' : gradient === 'green' ? 'green' : gradient === 'orange' ? 'orange' : gradient === 'pink' ? 'pink' : 'cyan'}-500))`,
            }}
        >
            {/* Gradient background on hover */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                `bg-gradient-to-br ${gradientClasses[gradient]}`
            )} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    `bg-gradient-to-br ${gradientClasses[gradient]}`,
                    "group-hover:scale-110 group-hover:rotate-3"
                )}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="space-y-1">
                    {loading ? (
                        <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                    ) : (
                        <div className={cn(
                            "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                            `${gradientClasses[gradient]}`
                        )}>
                            {typeof value === 'number' ? displayValue.toLocaleString() : value}
                        </div>
                    )}

                    {trend && (
                        <div className="flex items-center gap-1 text-xs">
                            {trend.isPositive ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-muted-foreground ml-1">
                                {subtitle || 'vs last period'}
                            </span>
                        </div>
                    )}

                    {subtitle && !trend && (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EnhancedStatsCard;
