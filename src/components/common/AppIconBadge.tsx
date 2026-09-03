import React from 'react';

interface AppIconBadgeProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showShadow?: boolean;
}

export const AppIconBadge: React.FC<AppIconBadgeProps> = ({
  className = '',
  size = 'md',
  rounded = 'xl',
  showShadow = true,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  }[size];

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-white ${sizeClasses} ${roundedClasses} ${
        showShadow ? 'shadow-md shadow-sky-900/20 ring-1 ring-slate-200/80 dark:ring-slate-700' : ''
      } ${className}`}
    >
      <img
        src="/app-icon.jpg"
        alt="Pressing - Logiciel de Gestion"
        className="w-full h-full object-cover select-none pointer-events-none"
        referrerPolicy="no-referrer"
        loading="eager"
        onError={(e) => {
          // fallback to icon-192 or favicon if needed
          const target = e.currentTarget;
          if (target.src.indexOf('app-icon.jpg') !== -1) {
            target.src = '/icon-192.png';
          }
        }}
      />
    </div>
  );
};
