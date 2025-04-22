import { getAuthHeader } from '../contexts/AuthContext';

// Environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Backend error response interface
export interface ApiError {
  message: string;
  code?: string;
  details?: any[];
}

// Interface for API response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  items?: T[];
  item?: T;
  error?: ApiError;
}

// Generic API Service
export class ApiService {
  /**
   * Make a GET request
   */
  public static async get<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    return this.handleResponse<T>(response);
  }
  
  /**
   * Make a POST request
   */
  public static async post<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    
    return this.handleResponse<T>(response);
  }
  
  /**
   * Make a PUT request
   */
  public static async put<T>(endpoint: string, data: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    
    return this.handleResponse<T>(response);
  }
  
  /**
   * Make a DELETE request
   */
  public static async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    
    return this.handleResponse<T>(response);
  }
  
  /**
   * Build URL with API base
   */
  private static buildUrl(endpoint: string): string {
    // Remove leading slash if present
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    
    // Remove API_URL trailing slash if present
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    return `${baseUrl}/${endpoint}`;
  }
  
  /**
   * Handle API response
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json() as ApiResponse<T>;
    
    if (!response.ok || data.success === false) {
      const errorMessage = data.error?.message || `HTTP error ${response.status}`;
      const error = new Error(errorMessage);
      
      // Add error details to the error object
      if (data.error) {
        (error as any).code = data.error.code;
        (error as any).details = data.error.details;
      }
      
      throw error;
    }
    
    // Return the data, items, or item property if it exists
    return (data.data || data.items || data.item || data) as T;
  }
} 