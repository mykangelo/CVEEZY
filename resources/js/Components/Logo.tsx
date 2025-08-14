import React from 'react';
import { Link } from '@inertiajs/react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'lg', 
  showText = true,
  text = 'CVeezy',
  imageSrc = "/images/supsoft-logo.jpg",
  imageAlt = 'Supsoft Tech Logo'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };
  
  return (
    <Link
      href="/"
      className={`flex items-center space-x-3 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 ${className}`}
    >
      {/* Logo Image */}
      <img 
        src={imageSrc}
        alt={imageAlt}
        className={`${sizeClasses[size]} object-contain`}
      />

      {/* Logo Text - Updated with BetterCV-style font */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-heavybold text-gray-800 tracking-tight ${textSizeClasses[size]} font-sans`}>
            {text}
          </span>
          <span className="text-xs text-gray-400 -mt-1.5 ml-2">
            by Certicode
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;