import React from 'react';
// No Link here; parent decides whether logo is clickable

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  showText?: boolean;
  text?: string;
  imageSrc?: string;
  imageAlt?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'xl', 
  showText = false,
  text = 'CVeezy',
  imageSrc = "/images/cveezyLOGO_C.png",
  imageAlt = 'CVeezy Logo'
}) => {
  // Container sizes tuned for a wide horizontal logo. These crop extra transparent margins.
  const containerSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'h-10 w-32',
    md: 'h-12 w-40',
    lg: 'h-14 w-48',
    xl: 'h-16 w-60',
    xxl: 'h-20 w-72'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  } as const;
  
  return (
    <div
      className={`flex items-center space-x-3 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${className}`}
    >
      <div className={`${containerSizeClasses[size]} overflow-hidden rounded-none`}> 
        <img 
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-heavybold text-gray-800 tracking-tight ${textSizeClasses[size as 'sm'|'md'|'lg'|'xl']} font-sans`}>
            {text}
          </span>
          <span className="text-xs text-gray-400 -mt-1.5 ml-2">
            by Certicode
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;