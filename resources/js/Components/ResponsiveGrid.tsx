import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
    children: ReactNode;
    className?: string;
    cols?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
        '3xl'?: number;
        '4xl'?: number;
    };
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    autoFit?: boolean;
    autoFill?: boolean;
    minWidth?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
    children,
    className,
    cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6, '3xl': 7, '4xl': 8 },
    gap = 'md',
    autoFit = false,
    autoFill = false,
    minWidth = '280px',
}) => {
    const gapClasses = {
        xs: 'gap-2',
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-10',
    };

    const gridClasses = cn(
        'grid',
        gapClasses[gap],
        // Responsive column classes
        `grid-cols-${cols.xs || 1}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
        cols['3xl'] && `3xl:grid-cols-${cols['3xl']}`,
        cols['4xl'] && `4xl:grid-cols-${cols['4xl']}`,
        // Auto-fit/fill options
        autoFit && 'grid-cols-[repeat(auto-fit,minmax(var(--min-width,280px),1fr))]',
        autoFill && 'grid-cols-[repeat(auto-fill,minmax(var(--min-width,280px),1fr))]',
        className
    );

    const gridStyle = autoFit || autoFill ? {
        '--min-width': minWidth,
    } as React.CSSProperties : {};

    return (
        <div className={gridClasses} style={gridStyle}>
            {children}
        </div>
    );
};

export default ResponsiveGrid;
