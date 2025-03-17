import React, { forwardRef, ForwardedRef } from 'react';
import Link, { LinkProps } from 'next/link';
import { IconType } from 'react-icons';
import { cva, type VariantProps } from 'class-variance-authority';

// Define cn utility
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Define button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
        outline: "bg-transparent text-indigo-600 hover:bg-indigo-50 border border-indigo-300 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm focus-visible:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        subtle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-500 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900",
        link: "bg-transparent text-indigo-600 underline-offset-4 hover:underline focus-visible:ring-indigo-500 dark:text-indigo-400 p-0 h-auto font-normal",
      },
      size: {
        xs: "text-xs px-2.5 py-1.5 h-7",
        sm: "text-sm px-3 py-1.5 h-8",
        md: "text-sm px-4 py-2 h-10",
        lg: "text-base px-5 py-2.5 h-12",
        xl: "text-lg px-6 py-3 h-14",
        icon: "p-2 aspect-square",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
      },
      elevated: {
        true: "shadow-md hover:shadow-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  tooltip?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  external?: boolean;
  as?: React.ElementType;
  className?: string;
}

interface LinkButtonProps
  extends Omit<LinkProps, 'onClick'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  className?: string;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  loadingText?: string;
  tooltip?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  external?: boolean;
  disabled?: boolean;
  href: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      fullWidth,
      elevated,
      children,
      href,
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      loadingText,
      disabled,
      tooltip,
      badge,
      badgeVariant = 'primary',
      external = false,
      as: Component = 'button',
      ...props
    }: ButtonProps | LinkButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const badgeStyles = {
      primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };

    const LoadingSpinner = () => (
      <svg 
        className="animate-spin h-4 w-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const getIconSize = (): number => {
      // Simplified logic - when size is 'icon', return a default size (18)
      // Other sizes are handled by their respective cases
      switch (size) {
        case 'xs': return 14;
        case 'sm': return 16;
        case 'md': return 18;
        case 'lg': return 20;
        case 'xl': return 22;
        case 'icon': return 18; // Default size for 'icon' variant
        default: return 18; // Fallback for undefined or other values
      }
    };

    const content = (
      <>
        {isLoading && (
          <span className={cn("flex items-center", loadingText ? "mr-2" : "")}>
            <LoadingSpinner />
          </span>
        )}
        
        {!isLoading && Icon && iconPosition === 'left' && (
          <Icon 
            size={getIconSize()} 
            className={cn(
              "flex-shrink-0", 
              children ? "mr-2" : "", 
              size === 'icon' ? 'mr-0' : ''
            )} 
            aria-hidden="true" 
          />
        )}
        
        {isLoading && loadingText ? loadingText : children}
        
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon 
            size={getIconSize()} 
            className={cn("flex-shrink-0", children ? "ml-2" : "")} 
            aria-hidden="true" 
          />
        )}
        
        {badge && (
          <span 
            className={cn(
              "ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
              badgeStyles[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}
      </>
    );

    const buttonClassName = cn(buttonVariants({ variant, size, rounded, fullWidth, elevated }), className);

    if (Component !== 'button' && !href) {
      const CustomComponent = Component as React.ComponentType<any>;
      return (
        <CustomComponent
          className={buttonClassName}
          disabled={disabled || isLoading}
          {...props}
        >
          {content}
        </CustomComponent>
      );
    }

    if (href) {
      const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
      return (
        <Link
          href={href}
          className={buttonClassName}
          aria-disabled={disabled || isLoading}
          tabIndex={disabled || isLoading ? -1 : undefined}
          {...linkProps}
          {...(props as Omit<LinkProps, 'href'>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        className={buttonClassName}
        disabled={disabled || isLoading}
        ref={ref}
        {...(tooltip ? { 'aria-label': tooltip, title: tooltip } : {})}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;