/**
 * Loading spinner component
 * Uses loading state types and helpers
 */
import React from 'react';
import { LoadingState, WithLoadingProps } from '../../utils/types';
import { isLoading, hasError, isSuccess } from '../../utils/helpers';

interface LoadingSpinnerProps extends WithLoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showSuccess?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading = false,
  error = null,
  size = 'medium',
  message,
  showSuccess = false,
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return 'spinner-medium';
    }
  };

  const getMessage = () => {
    if (error) return error.message || 'An error occurred';
    if (loading) return message || 'Loading...';
    if (showSuccess && !loading && !error) return 'Success!';
    return '';
  };

  const getIcon = () => {
    if (error) return '❌';
    if (loading) return '⏳';
    if (showSuccess && !loading && !error) return '✅';
    return '';
  };

  if (!loading && !error && !showSuccess) {
    return null;
  }

  return (
    <div className={`loading-spinner ${getSizeClass()} ${className}`}>
      <div className="spinner-content">
        <div className="spinner-icon">
          {loading ? (
            <div className="spinner-animation">
              <div className="spinner-circle"></div>
            </div>
          ) : (
            <span className="status-icon">{getIcon()}</span>
          )}
        </div>
        {getMessage() && (
          <div className="spinner-message">
            {getMessage()}
          </div>
        )}
      </div>
    </div>
  );
};

// Higher-order component for loading states
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingProp: keyof P = 'loading' as keyof P
) => {
  return React.forwardRef<any, P & WithLoadingProps>((props, ref) => {
    const { loading, error, ...restProps } = props;
    
    if (loading) {
      return <LoadingSpinner loading={loading} error={error} />;
    }
    
    if (error) {
      return <LoadingSpinner loading={false} error={error} />;
    }
    
    return <Component {...(restProps as P)} ref={ref} />;
  });
};

export default LoadingSpinner;
