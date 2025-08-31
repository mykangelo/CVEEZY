import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTextProps {
    children: ReactNode;
    className?: string;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
    responsive?: boolean;
    clamp?: boolean;
    lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
    children,
    className,
    variant = 'div',
    size = 'base',
    weight = 'normal',
    responsive = true,
    clamp = false,
    lineHeight = 'normal',
}) => {
    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
        '7xl': 'text-7xl',
        '8xl': 'text-8xl',
        '9xl': 'text-9xl',
    };

    const weightClasses = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
    };

    const lineHeightClasses = {
        none: 'leading-none',
        tight: 'leading-tight',
        snug: 'leading-snug',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose',
    };

    const responsiveClasses = responsive ? [
        // Responsive text sizing
        'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl',
        // Responsive line heights
        'leading-tight sm:leading-normal md:leading-relaxed lg:leading-loose',
        // Responsive letter spacing
        'tracking-tight sm:tracking-normal md:tracking-wide',
    ] : [];

    const textClasses = cn(
        sizeClasses[size],
        weightClasses[weight],
        lineHeightClasses[lineHeight],
        responsive && responsiveClasses,
        clamp && 'text-responsive-base',
        className
    );

    const Component = variant as keyof JSX.IntrinsicElements;

    return (
        <Component className={textClasses}>
            {children}
        </Component>
    );
};

export default ResponsiveText;
