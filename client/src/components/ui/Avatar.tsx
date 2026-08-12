import React from 'react';

export interface AvatarProps {
  initials?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials = 'LU',
  src,
  alt = 'User Avatar',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-grayscale-900 dark:text-grayscale-100 font-serif font-medium tracking-tight overflow-hidden select-none shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <svg className="w-1/2 h-1/2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )}
    </div>
  );
};
