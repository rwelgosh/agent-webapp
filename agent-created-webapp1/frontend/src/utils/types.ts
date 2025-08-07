/**
 * Type definitions for the application
 * Used by multiple components and services
 */

// User-related types
export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

// Item-related types
export interface Item {
  id: string;
  title: string;
  content: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemRequest {
  title: string;
  content: string;
  user?: string;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  id: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface SearchResults<T> {
  results: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

// Socket event types
export interface SocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface SocketConfig {
  url: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
}

// Form validation types
export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
  required: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Route and navigation types
export interface RouteConfig {
  path: string;
  component: string;
  protected: boolean;
  roles?: string[];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  protected?: boolean;
  roles?: string[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
}

export type ErrorType = 'validation' | 'authentication' | 'authorization' | 'network' | 'server';

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface WithLoadingProps {
  loading?: boolean;
  error?: AppError | null;
}

export interface WithPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Export all types for easy importing
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  ApiResponse,
  ValidationError,
  PaginatedResponse,
  SearchParams,
  SearchResults,
  SocketEvent,
  SocketConfig,
  FormField,
  FormState,
  RouteConfig,
  NavigationItem,
  AppError,
  LoadingState,
  AsyncState,
  EventHandler,
  AsyncEventHandler,
  BaseComponentProps,
  WithLoadingProps,
  WithPaginationProps
};
