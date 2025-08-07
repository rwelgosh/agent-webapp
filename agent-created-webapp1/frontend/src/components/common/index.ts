/**
 * Common components index
 * Exports all reusable components
 */

// Form components
export { default as FormField } from './FormField';

// Loading and error components
export { default as LoadingSpinner, withLoading } from './LoadingSpinner';
export { default as ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary';

// Re-export types for convenience
export type {
  FormFieldProps,
  LoadingSpinnerProps,
  ErrorBoundaryProps,
  ErrorBoundaryState
} from './types';
