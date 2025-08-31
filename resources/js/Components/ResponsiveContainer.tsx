import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
    children: ReactNode;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    maxWidth?: boolean;
    center?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    className,
    size = 'lg',
    padding = 'md',
    maxWidth = true,
    center = true,
}) => {
    const sizeClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'max-w-full',
    };

    const paddingClasses = {
        none: '',
        xs: 'px-2 py-2',
        sm: 'px-3 py-3',
        md: 'px-4 py-4',
        lg: 'px-6 py-6',
        xl: 'px-8 py-8',
    };

    const containerClasses = cn(
        'w-full',
        maxWidth && sizeClasses[size],
        center && 'mx-auto',
        paddingClasses[padding],
        // Responsive padding adjustments
        'sm:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20',
        'sm:py-6 lg:py-8 xl:py-10 2xl:py-12 3xl:py-16 4xl:py-20',
        className
    );

    return (
        <div className={containerClasses}>
            {children}
        </div>
    );
};

export default ResponsiveContainer;
