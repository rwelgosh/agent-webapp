import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterData,
  initialAuthState,
  authReducer,
  AuthActionType,
  loginUser,
  registerUser,
  logoutUser
} from './AuthContext';

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props type
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: AuthActionType.AUTH_START });
    
    try {
      const result = await loginUser(credentials);
      dispatch({
        type: AuthActionType.AUTH_SUCCESS,
        payload: result
      });
    } catch (error) {
      dispatch({
        type: AuthActionType.AUTH_FAILURE,
        payload: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: AuthActionType.AUTH_START });
    
    try {
      const result = await registerUser(data);
      dispatch({
        type: AuthActionType.AUTH_SUCCESS,
        payload: result
      });
    } catch (error) {
      dispatch({
        type: AuthActionType.AUTH_FAILURE,
        payload: error instanceof Error ? error.message : 'Registration failed'
      });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    logoutUser();
    dispatch({ type: AuthActionType.LOGOUT });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: AuthActionType.CLEAR_ERROR });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider; 