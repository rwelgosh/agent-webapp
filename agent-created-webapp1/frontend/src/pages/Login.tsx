import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthProvider';

const Login: React.FC = () => {
  const { login, state } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Simple validation
    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }

    try {
      await login({ username, password });
      // Redirect to the home page after successful login
      window.navigate('/');
    } catch (error) {
      // Error will be stored in the auth state, but we can add local error handling if needed
      console.error('Login error:', error);
    }
  };

  // Handle navigation to register page
  const goToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    window.navigate('/register');
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {state.error && (
        <div className="error-message">
          {state.error}
        </div>
      )}
      
      {localError && (
        <div className="error-message">
          {localError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={state.isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={state.isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={state.isLoading}
        >
          {state.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          Don't have an account? <a href="#" onClick={goToRegister}>Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login; 