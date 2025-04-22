import { ApiService } from './ApiService';

// Data service responsible for API communication
export interface DataResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    items: Array<{
      id: number;
      name: string;
      value?: number;
      isActive?: boolean;
    }>;
    timestamp?: string;
    randomFactor?: number;
  };
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  results: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
}

export interface SubmitRequest {
  title: string;
  content: string;
}

export interface SubmitResponse {
  success: boolean;
  message?: string;
  item?: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
  };
  error?: string;
}

// Item interface
export interface Item {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

// Response interfaces
export interface ItemsResponse {
  success: boolean;
  items: Item[];
  error?: string;
}

export interface ItemResponse {
  success: boolean;
  item: Item;
  error?: string;
}

// DataService for managing items
export class DataService {
  private baseUrl: string = '';
  private data: DataResponse | null = null;
  private searchResults: SearchResponse | null = null;
  
  constructor() {
    // Could be configured from environment variables in a real app
    this.baseUrl = '';
  }
  
  /**
   * Fetch data from an API endpoint
   */
  public async fetchData(endpoint: string): Promise<DataResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.success || !data.data) {
        throw new Error('Received invalid data format from server');
      }
      
      this.data = data;
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  
  /**
   * Search for data using the API
   */
  public async searchData(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.success || !data.results) {
        throw new Error('Received invalid data format from server');
      }
      
      this.searchResults = data;
      return data;
    } catch (error) {
      console.error('Error searching data:', error);
      throw error;
    }
  }
  
  /**
   * Submit data to the API
   */
  public async submitData(formData: SubmitRequest): Promise<SubmitResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.success) {
        throw new Error('Received invalid data format from server');
      }
      
      return data;
    } catch (error) {
      console.error('Error submitting data:', error);
      throw error;
    }
  }
  
  /**
   * Get the currently loaded data
   */
  public getCurrentData(): DataResponse | null {
    return this.data;
  }
  
  /**
   * Get the current search results
   */
  public getSearchResults(): SearchResponse | null {
    return this.searchResults;
  }

  /**
   * Get all items
   */
  public static async getItems(): Promise<Item[]> {
    try {
      const response = await ApiService.get<ItemsResponse>('items');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }
  
  /**
   * Get item by ID
   */
  public static async getItemById(id: number): Promise<Item> {
    try {
      const response = await ApiService.get<ItemResponse>(`items/${id}`);
      return response.item;
    } catch (error) {
      console.error(`Error fetching item ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new item
   */
  public static async createItem(data: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
    try {
      const response = await ApiService.post<ItemResponse>('items', data);
      return response.item;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing item
   */
  public static async updateItem(id: number, data: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item> {
    try {
      const response = await ApiService.put<ItemResponse>(`items/${id}`, data);
      return response.item;
    } catch (error) {
      console.error(`Error updating item ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an item
   */
  public static async deleteItem(id: number): Promise<boolean> {
    try {
      const response = await ApiService.delete<{success: boolean}>(`items/${id}`);
      return response.success;
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get API status
   */
  public static async getStatus(): Promise<{status: string, message: string}> {
    try {
      return await ApiService.get<{status: string, message: string}>('status');
    } catch (error) {
      console.error('Error fetching API status:', error);
      throw error;
    }
  }
} 