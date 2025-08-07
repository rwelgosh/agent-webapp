/**
 * Error boundary component
 * Uses error types and helpers
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorType } from '../../utils/types';
import { createError, getErrorMessage } from '../../utils/helpers';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: AppError; errorInfo: ErrorInfo | null }>;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const appError: AppError = createError(
      error.message,
      'COMPONENT_ERROR',
      500
    );

    return {
      hasError: true,
      error: appError,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError: AppError = createError(
      error.message,
      'COMPONENT_ERROR',
      500,
      {
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    );

    this.setState({
      error: appError,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: FallbackComponent, className = '' } = this.props;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} errorInfo={errorInfo} />;
      }

      // Default error UI
      return (
        <div className={`error-boundary ${className}`}>
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              {getErrorMessage(error)}
            </p>
            
            {process.env.NODE_ENV === 'development' && errorInfo && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button 
              className="error-retry-btn"
              onClick={this.handleRetry}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((error: Error, context?: string) => {
    const appError: AppError = createError(
      error.message,
      'HOOK_ERROR',
      500,
      { context, stack: error.stack }
    );
    setError(appError);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

// Higher-order component for error handling
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });
};

export default ErrorBoundary;
