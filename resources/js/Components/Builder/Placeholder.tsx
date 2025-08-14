import React from 'react';

type PlaceholderProps = {
  value?: string | number | null;
  placeholder: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

/**
 * Renders value if present; otherwise shows a muted placeholder in the same spot.
 */
const Placeholder: React.FC<PlaceholderProps> = ({ value, placeholder, className = '', as = 'span' }) => {
  const Tag = as as any;
  const hasValue = value !== undefined && value !== null && String(value).trim().length > 0;
  return (
    <Tag className={`${className} ${hasValue ? '' : 'text-gray-400 italic'}`}>
      {hasValue ? value : placeholder}
    </Tag>
  );
};

export default Placeholder;


