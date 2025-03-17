import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  dot = false,
  className = '',
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  
  // Rounded classes
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Combined classes
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${roundedClasses} ${className}`;
  
  return (
    <span className={combinedClasses}>
      {dot && (
        <span
          className={`mr-1.5 h-2 w-2 rounded-full inline-block bg-current`}
          style={{ opacity: 0.7 }}
        ></span>
      )}
      {children}
    </span>
  );
};

export default Badge;