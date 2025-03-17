import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'hover' | 'bordered' | 'flat';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

// Card Component
const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className = '', noPadding = false, variant = 'default' }) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  
  const variantClasses = {
    default: 'shadow-sm',
    hover: 'shadow-sm hover:shadow-md transition-shadow duration-300',
    bordered: 'border border-gray-200',
    flat: '',
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return <div className={combinedClasses}>{children}</div>;
};

// Card Header Component
const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', actions }) => {
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${className}`}>
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

// Card Body Component
const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

// Card Footer Component
const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', bordered = true }) => {
  const borderClass = bordered ? 'border-t border-gray-200' : '';
  return <div className={`px-6 py-4 ${borderClass} ${className}`}>{children}</div>;
};

// Assign sub-components to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;