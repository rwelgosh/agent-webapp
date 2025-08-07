/**
 * Button component with various styles and states
 * Uses types from types.ts
 */
import React from 'react';
import { BaseComponentProps, LoadingState } from '../../utils/types';
import { isLoading, hasError, isSuccess } from '../../utils/helpers';

// Button variants
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'outline' 
  | 'ghost';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button types
export type ButtonType = 'button' | 'submit' | 'reset';

// Button interface
export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  onClick,
  onFocus,
  onBlur,
  children,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Get button classes
  const getButtonClasses = (): string => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const stateClass = isDisabled ? 'btn-disabled' : '';
    const loadingClass = loading ? 'btn-loading' : '';
    
    return [baseClass, variantClass, sizeClass, stateClass, loadingClass, className]
      .filter(Boolean)
      .join(' ');
  };

  // Get loading text
  const getDisplayText = (): React.ReactNode => {
    if (loading && loadingText) {
      return loadingText;
    }
    return children;
  };

  // Get icon element
  const getIconElement = (): React.ReactNode => {
    if (!icon) return null;
    
    const iconClass = `btn-icon ${iconPosition === 'right' ? 'btn-icon-right' : 'btn-icon-left'}`;
    
    return (
      <span className={iconClass}>
        {icon}
      </span>
    );
  };

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || loading) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={getButtonClasses()}
      onClick={handleClick}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <div className="spinner"></div>
        </span>
      )}
      
      {!loading && iconPosition === 'left' && getIconElement()}
      
      <span className="btn-text">
        {getDisplayText()}
      </span>
      
      {!loading && iconPosition === 'right' && getIconElement()}
    </button>
  );
};

// Button group component
export interface ButtonGroupProps extends BaseComponentProps {
  vertical?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  vertical = false,
  size,
  variant,
  className = '',
  ...props
}) => {
  const groupClass = `btn-group ${vertical ? 'btn-group-vertical' : ''} ${className}`;
  
  return (
    <div className={groupClass} role="group" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            size: size || child.props.size,
            variant: variant || child.props.variant
          });
        }
        return child;
      })}
    </div>
  );
};

// Export button and button group
export default Button;
export { ButtonGroup };
