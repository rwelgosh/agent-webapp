import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthProvider';

const Register: React.FC = () => {
  const { register, state } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Simple validation
    if (!username || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      await register({ username, email, password });
      // Redirect to the home page after successful registration
      window.navigate('/');
    } catch (error) {
      // Error will be stored in the auth state, but we can add local error handling if needed
      console.error('Registration error:', error);
    }
  };

  // Handle navigation to login page
  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.navigate('/login');
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={state.isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={state.isLoading}
        >
          {state.isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          Already have an account? <a href="#" onClick={goToLogin}>Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register; 