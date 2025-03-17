import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'away' | 'busy' | 'offline';
  statusPosition?: 'top-right' | 'bottom-right';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };
  
  // Shape classes
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-md',
  };
  
  // Status color classes
  const statusColorClasses = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500',
  };
  
  // Status position classes
  const statusPositionClasses = {
    'top-right': '-top-1 -right-1',
    'bottom-right': '-bottom-1 -right-1',
  };
  
  // Combined classes
  const combinedClasses = `relative flex items-center justify-center ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`;
  
  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return '';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Background color based on name (consistent for the same name)
  const getColorFromName = (name?: string) => {
    if (!name) return 'bg-gray-200';
    
    const colors = [
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
    ];
    
    // Simple hash function to get consistent color for same name
    const hash = Array.from(name).reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0
    );
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <div className={combinedClasses}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={100}
          height={100}
          className={`w-full h-full object-cover ${shapeClasses[shape]}`}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${getColorFromName(name)}`}>
          {name ? getInitials(name) : '?'}
        </div>
      )}
      
      {status && (
        <span 
          className={`absolute block h-3 w-3 ${statusColorClasses[status]} ${statusPositionClasses[statusPosition]} rounded-full ring-2 ring-white`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;