import { authReducer, AuthState, AuthActionType } from '../AuthContext';

describe('AuthContext', () => {
  // Initial state for testing
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };
  
  // Mock user data
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com'
  };
  
  // Mock token
  const mockToken = 'mock-jwt-token';
  
  describe('authReducer', () => {
    test('should handle AUTH_START action', () => {
      const action = { type: AuthActionType.AUTH_START };
      const newState = authReducer(initialState, action);
      
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });
    
    test('should handle AUTH_SUCCESS action', () => {
      const action = { 
        type: AuthActionType.AUTH_SUCCESS, 
        payload: { user: mockUser, token: mockToken }
      };
      const newState = authReducer(initialState, action);
      
      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe(mockToken);
      expect(newState.error).toBeNull();
    });
    
    test('should handle AUTH_FAILURE action', () => {
      const errorMessage = 'Authentication failed';
      const action = { 
        type: AuthActionType.AUTH_FAILURE, 
        payload: errorMessage
      };
      const newState = authReducer(initialState, action);
      
      expect(newState.isLoading).toBe(false);
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
    
    test('should handle LOGOUT action', () => {
      // First set authenticated state
      const authenticatedState: AuthState = {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
      const action = { type: AuthActionType.LOGOUT };
      const newState = authReducer(authenticatedState, action);
      
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
    });
    
    test('should handle CLEAR_ERROR action', () => {
      // First set a state with an error
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Some error message'
      };
      
      const action = { type: AuthActionType.CLEAR_ERROR };
      const newState = authReducer(stateWithError, action);
      
      expect(newState.error).toBeNull();
    });
    
    test('should return the current state for unknown action types', () => {
      // @ts-ignore - Deliberately testing with unknown action type
      const action = { type: 'UNKNOWN_ACTION' };
      const newState = authReducer(initialState, action);
      
      // State should not change
      expect(newState).toEqual(initialState);
    });
  });
}); 