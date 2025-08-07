/**
 * Storage utilities for localStorage and sessionStorage
 * Uses types from types.ts
 */
import { User, AuthState, Item, AppError } from './types';
import { safeJsonParse, safeJsonStringify, createError } from './helpers';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  ITEMS_CACHE: 'items_cache',
  SEARCH_HISTORY: 'search_history',
  USER_PREFERENCES: 'user_preferences'
} as const;

// Storage types
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Base storage interface
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Storage wrapper class
class StorageManager {
  private storage: StorageInterface;

  constructor(storage: StorageInterface) {
    this.storage = storage;
  }

  // Generic get method
  get<T>(key: string, fallback: T): T {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return fallback;
      return safeJsonParse<T>(item, fallback);
    } catch (error) {
      console.warn(`Failed to get item from storage: ${key}`, error);
      return fallback;
    }
  }

  // Generic set method
  set<T>(key: string, value: T): void {
    try {
      const serialized = safeJsonStringify(value);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error);
      throw createError(
        `Failed to save to storage: ${key}`,
        'STORAGE_ERROR',
        500
      );
    }
  }

  // Remove item
  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from storage: ${key}`, error);
    }
  }

  // Clear all items
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn('Failed to clear storage', error);
    }
  }

  // Check if key exists
  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }
}

// Create storage instances
export const localStorage = new StorageManager(window.localStorage);
export const sessionStorage = new StorageManager(window.sessionStorage);

// Auth storage utilities
export const authStorage = {
  // Token management
  getToken(): string | null {
    return localStorage.get<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  },

  setToken(token: string): void {
    localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken(): void {
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User data management
  getUser(): User | null {
    return localStorage.get<User | null>(STORAGE_KEYS.USER_DATA, null);
  },

  setUser(user: User): void {
    localStorage.set(STORAGE_KEYS.USER_DATA, user);
  },

  removeUser(): void {
    localStorage.remove(STORAGE_KEYS.USER_DATA);
  },

  // Auth state management
  getAuthState(): AuthState {
    return localStorage.get<AuthState>(STORAGE_KEYS.AUTH_STATE, {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  },

  setAuthState(state: AuthState): void {
    localStorage.set(STORAGE_KEYS.AUTH_STATE, state);
  },

  clearAuth(): void {
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.remove(STORAGE_KEYS.USER_DATA);
    localStorage.remove(STORAGE_KEYS.AUTH_STATE);
  }
};

// Items cache utilities
export const itemsStorage = {
  // Cache items
  getCachedItems(): Item[] {
    return localStorage.get<Item[]>(STORAGE_KEYS.ITEMS_CACHE, []);
  },

  setCachedItems(items: Item[]): void {
    localStorage.set(STORAGE_KEYS.ITEMS_CACHE, items);
  },

  addCachedItem(item: Item): void {
    const items = this.getCachedItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    
    this.setCachedItems(items);
  },

  removeCachedItem(itemId: string): void {
    const items = this.getCachedItems();
    const filteredItems = items.filter(item => item.id !== itemId);
    this.setCachedItems(filteredItems);
  },

  clearCache(): void {
    localStorage.remove(STORAGE_KEYS.ITEMS_CACHE);
  }
};

// Search history utilities
export const searchStorage = {
  getSearchHistory(): string[] {
    return localStorage.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
  },

  addSearchTerm(term: string): void {
    const history = this.getSearchHistory();
    const filteredHistory = history.filter(item => item !== term);
    const newHistory = [term, ...filteredHistory].slice(0, 10); // Keep last 10
    localStorage.set(STORAGE_KEYS.SEARCH_HISTORY, newHistory);
  },

  clearSearchHistory(): void {
    localStorage.remove(STORAGE_KEYS.SEARCH_HISTORY);
  }
};

// User preferences utilities
export const preferencesStorage = {
  getUserPreferences(): Record<string, any> {
    return localStorage.get<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES, {});
  },

  setUserPreference(key: string, value: any): void {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    localStorage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  getUserPreference<T>(key: string, fallback: T): T {
    const preferences = this.getUserPreferences();
    return preferences[key] ?? fallback;
  },

  clearPreferences(): void {
    localStorage.remove(STORAGE_KEYS.USER_PREFERENCES);
  }
};

// Export all storage utilities
export {
  StorageManager,
  authStorage,
  itemsStorage,
  searchStorage,
  preferencesStorage
};
