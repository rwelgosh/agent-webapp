/**
 * Common utility functions
 * Uses types from types.ts
 */
import { User, Item, SearchParams, PaginatedResponse, AppError, LoadingState } from './types';

// Date and time utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isRecent = (date: string | Date, hours: number = 24): boolean => {
  const d = new Date(date);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  return diffHours <= hours;
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array and object utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Search and filter utilities
export const searchItems = (items: Item[], query: string): Item[] => {
  if (!query.trim()) return items;
  
  const searchTerm = query.toLowerCase();
  return items.filter(item => 
    item.title.toLowerCase().includes(searchTerm) ||
    item.content.toLowerCase().includes(searchTerm)
  );
};

export const filterItems = (items: Item[], filters: Record<string, any>): Item[] => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = item[key as keyof Item];
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    });
  });
};

export const paginateItems = (
  items: Item[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<Item> => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit)
  };
};

// User utilities
export const getUserDisplayName = (user: User): string => {
  return user.username || 'Unknown User';
};

export const getUserInitials = (user: User): string => {
  return user.username
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const hasRole = (user: User, role: string): boolean => {
  return user.role === role;
};

export const canAccess = (user: User, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(user.role);
};

// Error handling utilities
export const createError = (message: string, code: string, statusCode?: number): AppError => {
  return {
    code,
    message,
    statusCode
  };
};

export const isNetworkError = (error: AppError): boolean => {
  return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT';
};

export const isAuthError = (error: AppError): boolean => {
  return error.code === 'AUTH_REQUIRED' || error.code === 'INVALID_TOKEN';
};

export const getErrorMessage = (error: AppError | null): string => {
  if (!error) return '';
  return error.message || 'An unknown error occurred';
};

// Loading state utilities
export const isLoading = (state: LoadingState): boolean => {
  return state === 'loading';
};

export const hasError = (state: LoadingState): boolean => {
  return state === 'error';
};

export const isSuccess = (state: LoadingState): boolean => {
  return state === 'success';
};

// URL and routing utilities
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

export const buildSearchParams = (params: SearchParams): string => {
  return buildQueryString(params);
};

// Storage utilities
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
};

// Export all utilities
export {
  formatDate,
  formatDateTime,
  isRecent,
  truncateText,
  capitalizeFirst,
  generateSlug,
  groupBy,
  sortBy,
  uniqueBy,
  searchItems,
  filterItems,
  paginateItems,
  getUserDisplayName,
  getUserInitials,
  hasRole,
  canAccess,
  createError,
  isNetworkError,
  isAuthError,
  getErrorMessage,
  isLoading,
  hasError,
  isSuccess,
  buildQueryString,
  parseQueryString,
  buildSearchParams,
  safeJsonParse,
  safeJsonStringify
};
