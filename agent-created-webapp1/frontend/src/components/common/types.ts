/**
 * Types for common components
 * Extends main types from utils/types.ts
 */
import { FormFieldProps as BaseFormFieldProps } from '../../utils/types';

// FormField component types
export interface FormFieldProps extends BaseFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'textarea';
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// LoadingSpinner component types
export interface LoadingSpinnerProps {
  loading?: boolean;
  error?: any;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showSuccess?: boolean;
  className?: string;
}

// ErrorBoundary component types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: any; errorInfo: any }>;
  onError?: (error: any, errorInfo: any) => void;
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: any;
}
