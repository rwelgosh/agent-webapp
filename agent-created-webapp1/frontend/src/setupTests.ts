// Jest DOM setup
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    }
  };
})();

// Assign mocked localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch API
global.fetch = jest.fn();

// Mock window.location methods
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn()
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.clear();
  
  // Reset pathname
  mockLocation.pathname = '/';
  
  // Reset fetch mock
  (fetch as jest.Mock).mockReset();
}); 