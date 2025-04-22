// Authentication context for managing user state
import { ApiResponse, ApiError } from '../services/ApiService';

export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Auth response interfaces
export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  error?: ApiError;
}

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null
};

// Action types
export enum AuthActionType {
  AUTH_START = 'AUTH_START',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  LOGOUT = 'LOGOUT',
  CLEAR_ERROR = 'CLEAR_ERROR'
}

export type AuthAction =
  | { type: AuthActionType.AUTH_START }
  | { type: AuthActionType.AUTH_SUCCESS; payload: { user: User; token: string } }
  | { type: AuthActionType.AUTH_FAILURE; payload: string }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.CLEAR_ERROR };

// Auth reducer
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AuthActionType.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case AuthActionType.AUTH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload
      };
    case AuthActionType.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case AuthActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// Auth provider functions
export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json() as AuthResponse;
    
    if (!response.ok || !data.success) {
      const errorMessage = data.error?.message || 'Login failed';
      throw new Error(errorMessage);
    }

    // Store token in localStorage
    localStorage.setItem('auth_token', data.token);
    
    return {
      user: data.user,
      token: data.token
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error during login');
  }
}

export async function registerUser(data: RegisterData): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json() as AuthResponse;
    
    if (!response.ok || !responseData.success) {
      const errorMessage = responseData.error?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
    
    // Store token in localStorage
    localStorage.setItem('auth_token', responseData.token);
    
    return {
      user: responseData.user,
      token: responseData.token
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error during registration');
  }
}

export function logoutUser(): void {
  // Remove token from localStorage
  localStorage.removeItem('auth_token');
}

// Helper function to get the auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper function to add auth header to requests
export function getAuthHeader(): { Authorization: string } | Record<string, never> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
} 